import express from "express";
import {
  createRequest,
  getEmployeeRequests,
  getManagerPendingRequests,
  approveRequest,
  rejectRequest,
  fulfillRequest,
  getRequestDetails,
  getApprovedRequests
} from "../controllers/EmployeeRequestController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/laundry/api/employee-requests/create", protect, authorize("employee"), createRequest);
router.get("/laundry/api/employee-requests/employee/:id", protect, authorize("employee"), getEmployeeRequests);

router.get("/laundry/api/employee-requests/pending", protect, authorize("manager"), getManagerPendingRequests);
router.put("/laundry/api/employee-requests/:id/approve", protect, authorize("manager"), approveRequest);
router.put("/laundry/api/employee-requests/:id/reject", protect, authorize("manager"), rejectRequest);

router.get("/laundry/api/employee-requests/all", protect, authorize("admin"), getApprovedRequests);
router.get("/laundry/api/employee-requests/:id", protect, authorize("admin"), getRequestDetails);
router.put("/laundry/api/employee-requests/:id/fulfill", protect, authorize("admin"), fulfillRequest);

export default router;