import express from "express";
import { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  getOrdersByUser, 
  getOrdersByBranch, 
  getOrdersByEmployee, 
  markPaymentAsPaid
} from "../controllers/OrderController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/laundry/api/order/create", createOrder);
router.get("/laundry/api/order/all",protect , authorize("admin"), getAllOrders);
router.get("/laundry/api/order/all/:branchId",protect , authorize("admin", "manager"), getOrdersByBranch);
router.get("/laundry/api/order/:id", getOrderById);
router.patch("/laundry/api/order/update-status/:id", updateOrderStatus);
router.put("/laundry/api/order/mark-paid/:orderId", protect, authorize("admin", "manager"), markPaymentAsPaid);
router.get("/laundry/api/orders/user/:userId", getOrdersByUser);
router.get("/laundry/api/orders/employee/:employeeId",protect , authorize("admin", "manager", "employee"), getOrdersByEmployee);

export default router;