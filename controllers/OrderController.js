import OrderModel from "../models/OrderModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

import mongoose from "mongoose";

async function createOrder(req, res) {
  try {
    const { payment_type, total_price, items } = req.body;
    let stripe_payment_id = null;
    let clientSecret = null;

    if (payment_type === 'card') {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: total_price,
          currency: 'usd',
          metadata: {
            order_details: JSON.stringify(items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))),
            user_id: req.body.user_id
          },
          description: `Laundry order for user ${req.body.user_id}`
        });
        
        stripe_payment_id = paymentIntent.id;
        clientSecret = paymentIntent.client_secret;
      } catch (stripeError) {
        return res.status(400).json({
          success: false,
          message: "Payment processing error",
          error: stripeError.message,
          errorType: stripeError.type
        });
      }
    }

    const orderData = {
      branch_id: req.body.branch_id,
      user_id: req.body.user_id,
      assigned_employee_id: null,
      items: req.body.items.map(item => ({
        service_id: item.service_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })),
      total_price: req.body.total_price,
      payment_type: req.body.payment_type,
      is_paid: payment_type === 'cash' ? false : true,
      stripe_payment_id,
      delivery_option: req.body.delivery_option,
      pickup_date: req.body.pickup_date ? new Date(req.body.pickup_date) : null,
      pickup_time: req.body.pickup_time,
      delivery_date: req.body.delivery_date ? new Date(req.body.delivery_date) : null,
      delivery_time: req.body.delivery_time,
      address: req.body.address,
      special_requests: req.body.special_requests,
      order_notes: req.body.order_notes,
      status: req.body.status || 'not_started'
    };

    if (!orderData.branch_id || !orderData.user_id || !orderData.items || orderData.items.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields (branch_id, user_id, or items)"
      });
    }

    for (const item of orderData.items) {
      if (!item.service_id || !item.quantity || !item.price || !item.name) {
        return res.status(400).send({
          success: false,
          message: "Invalid item data - missing required fields"
        });
      }
    }

    const newOrder = await new OrderModel(orderData).save();
    
    const populatedOrder = await OrderModel.findById(newOrder._id)
      .populate('user', 'first_name last_name email phone')
      .populate('branch', 'branch_name address phone')
      .exec();

    res.status(201).send({
      success: true,
      message: "Order Created Successfully",
      data: populatedOrder,
      ...(payment_type === 'card' && { clientSecret })
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).send({
        success: false,
        message: "Payment processing error",
        errorMsg: error.message
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).send({
        success: false,
        message: "Validation error",
        errorMsg: messages.join(', ')
      });
    }

    res.status(500).send({
      success: false,
      message: "Failed to create order",
      errorMsg: error.message
    });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await OrderModel.find({}, { __v: 0 })
      // .populate("branch", "branch_name address phone")
      .populate("user", "first_name last_name email phone")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All Orders Retrieved",
      data: orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to get orders",
      errorMsg: error.message,
    });
  }
}

async function getOrdersByBranch(req, res) {
  try {
    const branchId = req.params.branchId;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid branch ID format",
      });
    }

    const orders = await OrderModel.find({ branch_id: branchId }, { __v: 0 })
      .populate("user", "first_name last_name email phone")
      // .populate('employee', 'first_name last_name email')
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Branch orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to get branch orders",
      errorMsg: error.message,
    });
  }
}

async function getOrdersByUser(req, res) {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const orders = await OrderModel.find({ user_id: userId }, { __v: 0 })
      .populate("branch", "branch_name address phone")
      .populate("user", "first_name last_name email phone")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "User orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to get user orders",
      errorMsg: error.message,
    });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await OrderModel.findById(req.params.id)
      .populate("branch", "branch_name address phone")
      .populate("user", "first_name last_name email")
      .populate("employee", "full_name");

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Order Retrieved",
      data: order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to get order",
      errorMsg: error.message,
    });
  }
}

async function getOrdersByEmployee(req, res) {
  try {
    const employeeId = req.params.employeeId;
    const orders = await OrderModel.find(
      { assigned_employee_id: employeeId },
      { __v: 0 }
    )
      .populate("branch", "branch_name address phone")
      .populate("user", "first_name last_name email")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "Employee orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to get employee orders",
      errorMsg: error.message,
    });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status, assigned_employee_id } = req.body;
    const validStatuses = ["not_started", "processing", "finished"];

    if (!validStatuses.includes(status)) {
      return res.status(400).send({
        success: false,
        message: "Invalid status value",
      });
    }

    const updateFields = { status };
    if (assigned_employee_id) updateFields.assigned_employee_id = assigned_employee_id;

    const updatedOrder = await OrderModel.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!updatedOrder) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Order status and assignment updated",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).send({
      success: false,
      message: "Failed to update order status",
      errorMsg: error.message,
    });
  }
}


async function markPaymentAsPaid(req, res) {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }

    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.payment_type !== 'cash') {
      return res.status(400).json({
        success: false,
        message: "Only card payments can be marked as paid"
      });
    }

    if (order.is_paid) {
      return res.status(400).json({
        success: false,
        message: "Payment is already marked as paid"
      });
    }


    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { 
        is_paid: true,
      },
      { new: true }
    ).populate('user', 'first_name last_name email phone');

    res.status(200).json({
      success: true,
      message: "Payment successfully marked as paid",
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error marking payment as paid:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      errorMsg: error.message
    });
  }
}

export {
  createOrder,
  getAllOrders,
  getOrdersByBranch,
  getOrdersByUser,
  getOrdersByEmployee,
  getOrderById,
  updateOrderStatus,
  markPaymentAsPaid,
};
