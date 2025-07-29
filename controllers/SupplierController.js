import SupplierModel from "../models/SupplierModel.js";

async function registerSupplier(req, res) {
  try {
    const supplier_data = {
      companyName: req.body.companyName,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      suppliedItems: req.body.suppliedItems,
    };

    const findEmail = await SupplierModel.findOne({ email: req.body.email });
    if (findEmail) return res.status(401).send({ 
      success: false, 
      message: "Supplier email already exists" 
    });

    const response = await new SupplierModel(supplier_data).save();
    res.status(200).send({
      success: true,
      message: "Supplier Registered successfully",
      data: response
    });

  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Cannot register supplier",
      errorMsg: error,
    });
  }
}

async function getAllSuppliers (req, res) {
  try {
    const suppliers = await SupplierModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

async function getSingleSupplier (req, res) {
  try {
    const supplier = await SupplierModel.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

async function updateSupplier (req, res) {
  try {
    const supplier = await SupplierModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

async function deleteSupplier (req, res){
  try {
    const supplier = await SupplierModel.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

async function loginSupplier(req, res) {
  try {
    const { email, password } = req.body;

    const supplier = await SupplierModel.findOne({ email });
    if (!supplier) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await supplier.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (supplier.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Supplier account is inactive' 
      });
    }

    const token = supplier.generateAuthToken();

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: supplier._id,
        companyName: supplier.companyName,
        email: supplier.email,
        contactPerson: supplier.contactPerson,
        suppliedItems: supplier.suppliedItems
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}


export { registerSupplier, getSingleSupplier, getAllSuppliers, updateSupplier, deleteSupplier, loginSupplier }