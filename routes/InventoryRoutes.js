import express from 'express';
import { 
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} from '../controllers/InventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/laundry/api/inventory', protect, authorize('admin', 'manager', 'employee'), getAllInventoryItems);
router.post('/laundry/api/inventory', protect, authorize('admin', 'manager'), createInventoryItem);
router.put('/laundry/api/inventory/:id', protect, authorize('admin', 'manager'), updateInventoryItem);
router.delete('/laundry/api/inventory/:id', protect, authorize('admin'), deleteInventoryItem);

export default router;