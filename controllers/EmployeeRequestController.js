import EmployeeRequest from "../models/EmployeeRequest.js";
import InventoryModel from "../models/InventoryModel.js";
import OrderModel from "../models/OrderModel.js";
import mongoose from "mongoose";


export const createRequest = async (req, res) => {
  try {
    const { orderId, items } = req.body;

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
      });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      assigned_employee_id: req.user.id,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found or not assigned to you",
      });
    }

    const inventoryChecks = items.map(async (item) => {
      const inventoryItem = await InventoryModel.findById(item.inventoryItem);
      if (!inventoryItem) {
        throw new Error(`Inventory item ${item.inventoryItem} not found`);
      }
      if (inventoryItem.currentStock < item.quantity) {
        throw new Error(`Not enough stock for ${inventoryItem.name}`);
      }
      return {
        inventoryItem: item.inventoryItem,
        quantity: item.quantity,
        name: inventoryItem.name,
      };
    });

    const validatedItems = await Promise.all(inventoryChecks);

    const request = await EmployeeRequest.create({
      employee: req.user.id,
      order: orderId,
      items: validatedItems.map((item) => ({
        inventoryItem: item.inventoryItem,
        quantity: item.quantity,
      })),
      status: "pending",
    });

    const populatedRequest = await EmployeeRequest.findById(request._id)
      .populate({
        path: "items.inventoryItem",
        select: "name category unit currentStock",
      })
      .populate("employee", "first_name last_name email")
      .populate({
        path: "order",
        select: "order_number",
      });

    res.status(201).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getEmployeeRequests = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const filter = {};
    if (employeeId !== "all") {
      filter.employee = employeeId;
    }

    const requests = await EmployeeRequest.find(filter)
      .populate({
        path: "items.inventoryItem",
        select: "name category unit currentStock",
      })
      .populate({
        path: "order",
        select: "order_number status",
      })
      .populate("employee", "first_name last_name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const getManagerPendingRequests = async (req, res) => {
  try {
    const requests = await EmployeeRequest.find({ status: "pending" })
      .populate("employee", "first_name last_name email branch")
      .populate({
        path: "order",
        select: "order_number status",
      })
      .populate({
        path: "items.inventoryItem",
        select: "name currentStock unit",
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const request = await EmployeeRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        managerApproval: {
          approved: true,
          approvedBy: req.user.id,
          approvedAt: new Date(),
          notes: req.body.notes || "",
        },
      },
      { new: true }
    )
      .populate({
        path: "items.inventoryItem",
        select: "name currentStock unit",
      })
      .populate("order")
      .populate("employee", "first_name last_name email")
      .populate("managerApproval.approvedBy", "first_name last_name");

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const request = await EmployeeRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        managerApproval: {
          approved: false,
          approvedBy: req.user.id,
          approvedAt: new Date(),
          notes: req.body.notes || "Request rejected",
        },
      },
      { new: true }
    )
      .populate("employee", "first_name last_name email")
      .populate("managerApproval.approvedBy", "first_name last_name");

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const fulfillRequest = async (req, res) => {
  try {
    const request = await EmployeeRequest.findById(req.params.id)
      .populate({
        path: "items.inventoryItem",
        select: "name currentStock reorderLevel unit",
      })
      .populate("order")
      .populate("employee", "first_name last_name email");

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    if (request.status !== "approved") {
      return res.status(400).json({
        success: false,
        error: "Only approved requests can be fulfilled",
      });
    }

    for (const item of request.items) {
      if (item.inventoryItem.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Not enough stock for ${item.inventoryItem.name} (Requested: ${item.quantity}, Available: ${item.inventoryItem.currentStock})`,
        });
      }
    }

    const bulkOps = request.items.map((item) => ({
      updateOne: {
        filter: { _id: item.inventoryItem._id },
        update: {
          $inc: { currentStock: -item.quantity },
          $set: {
            status: calculateStatus(
              item.inventoryItem.currentStock - item.quantity,
              item.inventoryItem.reorderLevel
            ),
          },
        },
      },
    }));

    await InventoryModel.bulkWrite(bulkOps);

    const updatedRequest = await EmployeeRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "fulfilled",
        fulfilledAt: new Date(),
        fulfilledBy: req.user.id,
      },
      { new: true }
    )
      .populate({
        path: "items.inventoryItem",
        select: "name currentStock unit",
      })
      .populate("order")
      .populate("employee", "first_name last_name email")
      .populate("fulfillment.fulfilledBy", "first_name last_name");

    res.status(200).json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    

    if (id === "all") {
      const allRequests = await EmployeeRequest.find({})
        .populate("employee", "first_name last_name email branch")
        .populate({
          path: "order",
          select: "order_number status",
        })
        .populate({
          path: "items.inventoryItem",
          select: "name currentStock unit",
        })
        .populate("managerApproval.approvedBy", "first_name last_name")
        .populate("fulfillment.fulfilledBy", "first_name last_name");

      return res.status(200).json({
        success: true,
        data: allRequests,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid request ID",
      });
    }

    const request = await EmployeeRequest.findById(id)
      .populate("employee", "first_name last_name email branch")
      .populate({
        path: "order",
        select: "order_number status",
      })
      .populate({
        path: "items.inventoryItem",
        select: "name currentStock unit",
      })
      .populate("managerApproval.approvedBy", "first_name last_name")
      .populate("fulfillment.fulfilledBy", "first_name last_name");

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const getApprovedRequests = async (req, res) => {
  try {
    const approvedRequests = await EmployeeRequest.find({ status: { $in: ["approved", "fulfilled"] } })
      .populate("employee", "first_name last_name email branch")
      .populate({
        path: "order",
        select: "order_number status",
      })
      .populate({
        path: "items.inventoryItem",
        select: "name category unit currentStock",
      })
      .populate("managerApproval.approvedBy", "first_name last_name")
      .populate("fulfillment.fulfilledBy", "first_name last_name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: approvedRequests,
    });
  } catch (error) {
    console.error("Error fetching approved requests:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


function calculateStatus(currentStock, reorderLevel) {
  if (currentStock <= 0) return "Critical";
  if (currentStock <= reorderLevel) return "Low";
  if (currentStock > reorderLevel * 2) return "High";
  return "Adequate";
}