import LeaveModel from '../models/LeaveModel.js';


async function createLeave(req, res) {
  try {
    const leaveData = {
      employeeId: req.body.employeeId,
      leaveType: req.body.leaveType,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      reason: req.body.reason || '',
      status: 'pending'
    };

    if (leaveData.startDate >= leaveData.endDate) {
      return res.status(400).send({
        success: false,
        message: "End date must be after start date"
      });
    }

    const overlappingLeave = await LeaveModel.findOne({
      employeeId: leaveData.employeeId,
      $or: [
        { 
          startDate: { $lte: leaveData.endDate },
          endDate: { $gte: leaveData.startDate }
        },
        {
          startDate: { $gte: leaveData.startDate, $lte: leaveData.endDate }
        }
      ],
      status: { $in: ['pending', 'approved'] }
    });

    if (overlappingLeave) {
      return res.status(400).send({
        success: false,
        message: "You already have a leave request for this period"
      });
    }

    const resp = await new LeaveModel(leaveData).save();
    res.status(200).send({
      success: true,
      message: "Leave request submitted successfully",
      data: resp
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to create leave request",
      errorMsg: error.message
    });
  }
}

async function getAllLeaves(req, res) {
  try {
    const leaves = await LeaveModel.find({})
      .populate('employeeId', 'first_name last_name')
      .populate('approvedBy', 'first_name last_name')
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All leave requests",
      data: leaves
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch leave requests",
      errorMsg: error.message
    });
  }
}

async function getEmployeeLeaves(req, res) {
  try {
    const empoyeeId = req.params.empoyeeId;

    const leaves = await LeaveModel.find({ employeeId: empoyeeId }, { __v: 0 })
      .sort({ createdAt: -1 });


    res.status(200).send({
      success: true,
      message: "Employee leave requests",
      data: leaves
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch employee leave requests",
      errorMsg: error.message
    });
  }
}

async function getSingleLeave(req, res) {
  try {
    const leave = await LeaveModel.findById(req.params.id)
      .populate('employeeId', 'first_name last_name')
      .populate('approvedBy', 'first_name last_name');

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}

async function updateLeaveStatus(req, res) {
  try {
    const { status } = req.body;
    const approverId = req.user._id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).send({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'"
      });
    }

    const leave = await LeaveModel.findById(req.params.id);
    if (!leave) {
      return res.status(404).send({
        success: false,
        message: "Leave request not found"
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).send({
        success: false,
        message: "Leave request has already been processed"
      });
    }

    const updatedLeave = await LeaveModel.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy: approverId,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('approvedBy', 'first_name last_name');

    res.status(200).send({
      success: true,
      message: `Leave request ${status}`,
      data: updatedLeave
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to update leave status",
      errorMsg: error.message
    });
  }
}

async function deleteLeave(req, res) {
  try {
    const leave = await LeaveModel.findByIdAndDelete(req.params.id);

    if (!leave) {
      return res.status(404).send({
        success: false,
        message: "Leave request not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "Leave request deleted successfully"
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to delete leave request",
      errorMsg: error.message
    });
  }
}

export { createLeave, getAllLeaves, getEmployeeLeaves, getSingleLeave, updateLeaveStatus, deleteLeave };