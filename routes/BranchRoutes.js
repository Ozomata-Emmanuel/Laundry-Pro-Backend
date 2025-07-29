import express from "express";
import { createBranch, getAllBranches, getSingleBranch } from "../controllers/BranchController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/laundry/api/branch/create",protect ,authorize("admin"), createBranch);
router.get("/laundry/api/branch/all", getAllBranches);
router.get("/laundry/api/branch/:id",protect , authorize("admin", "manager", "employee"), getSingleBranch);

export default router;