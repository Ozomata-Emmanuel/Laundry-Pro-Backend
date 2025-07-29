import InventoryModel from '../models/InventoryModel.js';

export const getAllInventoryItems = async (req, res) => {
  try {
    const items = await InventoryModel.find().populate('supplier', 'companyName');
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createInventoryItem = async (req, res) => {
  try {
    const { name, category, currentStock, reorderLevel, unit, supplier } = req.body;
    
    if (!name || !category || currentStock === undefined || !reorderLevel || !unit) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const existingItem = await InventoryModel.findOne({ name });
    if (existingItem) {
      return res.status(400).json({ 
        success: false, 
        error: 'Item with this name already exists' 
      });
    }

    const newItem = await InventoryModel.create({
      name,
      category,
      currentStock,
      reorderLevel,
      unit,
      supplier: supplier || undefined,
      status: calculateStatus(currentStock, reorderLevel)
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

function calculateStatus(currentStock, reorderLevel) {
  if (currentStock <= 0) return 'Critical';
  if (currentStock <= reorderLevel) return 'Low';
  if (currentStock > reorderLevel * 2) return 'High';
  return 'Adequate';
}
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.currentStock !== undefined) {
      const item = await InventoryModel.findById(id);
      const stock = updates.currentStock;
      const reorderLevel = updates.reorderLevel || item.reorderLevel;

      if (stock <= 0) {
        updates.status = 'Critical';
      } else if (stock <= reorderLevel) {
        updates.status = 'Low';
      } else if (stock > reorderLevel * 2) {
        updates.status = 'High';
      } else {
        updates.status = 'Adequate';
      }
    }

    const updatedItem = await InventoryModel.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await InventoryModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};