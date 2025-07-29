import SupplierOrderModel from '../models/SupplierOrderModel.js';
import InventoryModel from '../models/InventoryModel.js';
import SupplierModel from '../models/SupplierModel.js';

export const createRequest = async (req, res) => {
  try {
    const { supplier, items } = req.body;
    
    if (!supplier || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Supplier and items are required' 
      });
    }

    const supplierExists = await SupplierModel.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Supplier not found' 
      });
    }

    const newRequest = new SupplierOrderModel({
      supplier,
      items,
      requestedBy: req.user.id,
      status: 'pending'
    });

    await newRequest.save();

    const populatedRequest = await SupplierOrderModel.findById(newRequest._id)
      .populate('supplier', 'companyName contactPerson')
      .populate('requestedBy', 'name email');

    res.status(201).json({ 
      success: true, 
      message: 'Reorder request created successfully',
      data: populatedRequest
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await SupplierOrderModel.find()
      .populate('supplier', 'companyName contactPerson')
      .populate('requestedBy', 'name email');
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getRequestsBySupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const requests = await SupplierOrderModel.find({ supplier: id })
      .populate('supplier', 'companyName contactPerson')
      .populate('requestedBy', 'first_name email');

    if (!requests || requests.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No requests found for this supplier' 
      });
    }

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await SupplierOrderModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const fulfillRequest = async (req, res) => {
  try {
    const request = await SupplierOrderModel.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    for (const item of request.items) {
      let inventoryItem = await InventoryModel.findOne({ name: item.name });
      
      if (inventoryItem) {
        inventoryItem.currentStock += item.quantity;
        inventoryItem.lastRestocked = new Date();
        
        if (inventoryItem.currentStock <= 0) {
          inventoryItem.status = 'Critical';
        } else if (inventoryItem.currentStock <= inventoryItem.reorderLevel) {
          inventoryItem.status = 'Low';
        } else if (inventoryItem.currentStock <= inventoryItem.reorderLevel * 2) {
          inventoryItem.status = 'Adequate';
        } else {
          inventoryItem.status = 'High';
        }
        
        await inventoryItem.save();
      } else {
        inventoryItem = new InventoryModel({
          name: item.name,
          category: item.category,
          currentStock: item.quantity,
          reorderLevel: Math.ceil(item.quantity * 0.3),
          unit: item.unit,
          supplier: request.supplier,
          lastRestocked: new Date(),
          status: 'Adequate'
        });
        await inventoryItem.save();
      }
    }

    request.status = 'fulfilled';
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const fulfillSupplierRequest = async (req, res) => {
  try {
    const request = await SupplierOrderModel.findById(req.params.id);
    
    if (!request) throw new Error('Request not found');
    
    await InventoryModel.findByIdAndUpdate(
      request.inventoryItem,
      { 
        $inc: { currentStock: request.quantity },
        lastRestocked: new Date(),
        status: calculateStatus(
          request.currentStock + request.quantity,
          request.reorderLevel
        )
      }
    );
    
    request.status = 'fulfilled';
    await request.save();
    
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};