import express from 'express';
import { 
  createUser, 
  getUsers, 
  getSingleUser, 
  deleteUser, 
  loginUser, 
  getNonAdmins, 
  updateUser, 
  getEmployeesByBranch,
  getCusomersByBranch,
  forgotPassword,
  resetPassword,
  verifyUser,
  resendVerification,
  getAllCustomers,
  updateEmployee,
} from "../controllers/UserController.js";
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/laundry/api/users/login", loginUser);
router.post("/laundry/api/users/register", createUser);
router.post("/laundry/api/users/verify-account", verifyUser);
router.post("/laundry/api/users/resend-verification", resendVerification);
router.patch("/laundry/api/employee-update/:id",protect , authorize("admin"), updateEmployee);
router.put("/laundry/api/user-update/:id", updateUser);
router.get("/laundry/api/users/all",protect , authorize("admin", "manager"), getUsers);
router.get("/laundry/api/users/allcustomers",protect , authorize("admin", "manager"), getAllCustomers);
router.get("/laundry/api/users/allusers",protect , authorize("admin", "manager"), getNonAdmins);
router.get("/laundry/api/users/branch/:branchId/employees",protect , authorize("admin", "manager"), getEmployeesByBranch);
router.get("/laundry/api/users/branch/:branchId/customers",protect , authorize("admin", "manager"), getCusomersByBranch);
router.get("/laundry/api/user/:id", getSingleUser);
router.delete("/laundry/api/deleteUser/:id",protect , authorize("admin", "manager"), deleteUser);
router.post("/laundry/api/users/forgot-password", forgotPassword);
router.post("/laundry/api/users/reset-password/:token", resetPassword);

export default router;