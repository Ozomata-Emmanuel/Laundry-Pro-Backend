import express from "express";
import { 
  createRequest, 
  getAllRequests, 
  updateRequestStatus,
  fulfillRequest,
  getRequestsBySupplier 
} from "../controllers/SupplierOrderController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/laundry/api/reorder/requests", protect, authorize("admin"), createRequest);


router.get("/laundry/api/reorder/requests", getAllRequests);
router.get("/laundry/api/reorder/requests/all/:id", getRequestsBySupplier);
router.put("/laundry/api/reorder/requests/:id/status", updateRequestStatus);
router.put("/laundry/api/reorder/requests/:id/fulfill", fulfillRequest);

export default router;