import express from "express";
import { createIssue, getIssuesByOrder, getBranchIssues, updateIssueStatus, getAllIssues } from "../controllers/IssueController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/laundry/api/issue", protect, authorize("employee", "admin"), createIssue);
router.get("/laundry/api/issues/all", getAllIssues);
router.get("/laundry/api/issues/:orderId", protect, authorize("employee", "admin", "manager"), getIssuesByOrder);
router.get("/laundry/api/issues/branch/:branchId", protect, authorize("admin", "manager"), getBranchIssues);
router.patch("/laundry/api/issues/:issueId/status", protect, authorize("manager"), updateIssueStatus);

export default router;