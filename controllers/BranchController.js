import BranchModel from '../models/BranchModel.js';

async function createBranch(req, res) {
  try {    
    const branch_data = {
      branch_name: req.body.branch_name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      phone: req.body.phone,
    }
    const findAdress = await BranchModel.findOne({ address: req.body.address });
    if (findAdress) return res.status(401).send({ success: false, message: "Branch already exists" });
    const resp = await new BranchModel(branch_data).save();
    res.status(200).send({
      success: true,
      message: "Branch Created",
      data: resp
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Cannot create branch",
      errorMsg: error,
    });
  }
}

async function getAllBranches(req, res) {
  try {
    BranchModel.find({}, { __v: 0 }).sort({ createdAt: -1 }).then((resp) => {
      res.status(200).send({
        success: true,
        message: "All branches",
        data: resp
      });
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Cannot get branches",
      errorMsg: error,
    });
  }
}

async function getSingleBranch(req, res) {
  try {
    const branch = await BranchModel.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: 'branch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: branch
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}

async function deleteBranch(req, res) {
  try {
    const branch = await BranchModel.findByIdAndDelete(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: 'branch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
      message: "Branch deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}

async function updateBranchStatus(req, res) {
  try {
    const branch = await BranchModel.findById(req.params.id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        error: 'Branch not found'
      });
    }

    const newStatus = branch.status === 'active' ? 'inactive' : 'active';
    branch.status = newStatus;
    await branch.save();

    res.status(200).json({
      success: true,
      data: branch,
      message: `Branch ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}

export { createBranch, getAllBranches, getSingleBranch, deleteBranch, updateBranchStatus };