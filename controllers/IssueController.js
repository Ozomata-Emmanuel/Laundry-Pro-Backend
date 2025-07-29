import IssueModel from "../models/IssueModel.js";
import OrderModel from "../models/OrderModel.js";
import mongoose from "mongoose";

export async function createIssue(req, res) {
  try {
    const { order_id, description, branch_id } = req.body;
    const reported_by = req.user.id;

    const order = await OrderModel.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const newIssue = await IssueModel.create({
      order_id,
      branch_id,
      reported_by,
      description
    });

    const populatedIssue = await IssueModel.findById(newIssue._id)
      .populate('order', '_id status')
      .populate('reporter', 'first_name last_name')
      .populate('branch', 'branch_name ');

    res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      data: populatedIssue
    });

  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: "Failed to report issue",
      error: error.message
    });
  }
}

export const getAllIssues = async (req, res) => {
  try {
    const issues = await IssueModel.find({}, { __v: 0 })
      .populate('order', 'status total_price')
      .populate('reporter', 'first_name last_name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All issues gottten successfully",
      data: issues
    });
  } catch (error) {
    console.error("Error fetching branch issues:", error);
    res.status(400).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message
    });
  }
};

export async function getIssuesByOrder(req, res) {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }

    const issues = await IssueModel.find({ order_id: orderId })
      .populate('reporter', 'first_name last_name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: issues
    });

  } catch (error) {
    console.error('Error getting issues:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get issues",
      error: error.message
    });
  }
}

export const getBranchIssues = async (req, res) => {
  try {
    const { branchId } = req.params; 

    
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID"
      });
    }

    const issues = await IssueModel.find({ branch_id: branchId })
      .populate('order', 'status total_price')
      .populate('reporter', 'first_name last_name')
      .sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        data: issues,
        message: "Issues Under branch gotten successfully",
    });
  } catch (error) {
    console.error("Error fetching branch issues:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message
    });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;
    const managerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID"
      });
    }

    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const updateData = { status };
    if (status === 'resolved') {
      updateData.resolved_at = new Date();
    }

    const updatedIssue = await IssueModel.findByIdAndUpdate(
      issueId,
      updateData,
      { new: true }
    )
      .populate('order', 'status total_price')
      .populate('reporter', 'first_name last_name');

    if (!updatedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue status updated",
      data: updatedIssue
    });
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update issue status",
      error: error.message
    });
  }
};