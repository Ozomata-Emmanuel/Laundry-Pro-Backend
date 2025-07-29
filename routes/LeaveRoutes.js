import express from "express";
import { 
  createLeave, 
  getAllLeaves, 
  getEmployeeLeaves, 
  getSingleLeave, 
  updateLeaveStatus, 
  deleteLeave 
} from "../controllers/LeaveController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/laundry/api/leave/apply",protect ,authorize("employee"), createLeave);
router.get("/laundry/api/leave/all",protect ,authorize("admin", "manager"), getAllLeaves);
router.get("/laundry/api/leave/all/:empoyeeId",protect ,authorize("admin", "manager", "employee"), getEmployeeLeaves);
router.get("/laundry/api/leave/:id",protect , authorize("admin", "manager", "employee"), getSingleLeave);
router.patch("/laundry/api/leave/update-status/:id",protect ,authorize("admin", "manager"), updateLeaveStatus);
router.delete("/laundry/api/leave/:id",protect , authorize("admin", "manager", "employee"), deleteLeave);

export default router;