import express from "express";
import { 
  getSingleSupplier, 
  updateSupplier, 
  deleteSupplier, 
  registerSupplier, 
  getAllSuppliers,
  loginSupplier
} from "../controllers/SupplierController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/laundry/api/suppliers/register",protect , authorize("admin"), registerSupplier);
router.post("/laundry/api/suppliers/login", loginSupplier);
router.get("/laundry/api/suppliers/all",protect , authorize("admin"), getAllSuppliers);
router.get("/laundry/api/supplier/:id", getSingleSupplier);
router.put("/laundry/api/updateSupplier/:id", updateSupplier);
router.delete("/laundry/api/deleteSupplier/:id",protect , authorize("admin"), deleteSupplier);

export default router;