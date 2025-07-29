import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { config } from "dotenv";
import UserModel from "../models/UserModel.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/email.js";

config();

async function createUser(req, res) {
  try {
    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "password",
      "branch",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });

    if (existingUser) {
      const conflictField =
        existingUser.email === req.body.email ? "email" : "phone";
      return res.status(409).json({
        success: false,
        message: `User with this ${conflictField} already exists`,
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = new UserModel({
      first_name: req.body.first_name.trim(),
      last_name: req.body.last_name.trim(),
      email: req.body.email.toLowerCase().trim(),
      phone: req.body.phone.trim(),
      password: req.body.password,
      branch: req.body.branch,
      role: req.body.role,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    const savedUser = await newUser.save();

    await sendVerificationEmail(savedUser.email, verificationToken);

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
      token,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

async function resendVerification(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified. Please log in.",
      });
    }

    const newVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    await sendVerificationEmail(user.email, newVerificationToken);

    return res.status(200).json({
      success: true,
      message: "Verification email resent successfully.",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

async function verifyUser(req, res) {
  const { code } = req.body;
  try {
    const user = await UserModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification code",
        });
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    await sendWelcomeEmail(user.email);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in verification code: ", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

function getUsers(req, res) {
  UserModel.find({}, { password: 0, __v: 0 })
    .then((resp) => {
      res.status(200).send({
        success: true,
        message: "All users",
        data: resp,
      });
    })
    .catch((error) => {
      res.status(404).send({
        success: false,
        message: "Cannot get users",
        errorMsg: error,
      });
    });
}

function getNonAdmins(req, res) {
  UserModel.find(
    { role: { $in: ["manager", "employee", "supplier", "customer"] } },
    { password: 0, __v: 0 }
  )
    .then((resp) => {
      res.status(200).send({
        success: true,
        message: "All users",
        data: resp,
      });
    })
    .catch((error) => {
      res.status(404).send({
        success: false,
        message: "Cannot get users",
        errorMsg: error,
      });
    });
}

function getAllCustomers(req, res) {
  UserModel.find(
    { role: { $in: ["customer"] } },
    { password: 0, __v: 0 }
  )
    .then((resp) => {
      res.status(200).json({
        success: true,
        message: "All customers",
        data: resp,
      });
    })
    .catch((error) => {
      res.status(500).send({
        success: false,
        message: "Cannot get customers",
        errorMsg: error.message || error,
      });
    });
}

async function getEmployeesByBranch(req, res) {
  try {
    const { branchId } = req.params;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: "Branch ID is required",
      });
    }

    const employees = await UserModel.find(
      {
        branch: branchId,
        role: "employee",
        isActive: true,
      },
      {
        password: 0,
        __v: 0,
      }
    ).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees by branch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get employees",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

const getSingleUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id);
    const user_details = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      branch: user.branch,
      createdAt: user.createdAt,
    };
    res.status(200).send({
      success: true,
      message: "User gotten successfully",
      data: user_details,
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Cannot get user",
      errMsg: error,
    });
  }
};

async function updateUser(req, res) {
  const update_values = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone: req.body.phone,
    branch: req.body.branch,
  };

  if (req.body.password) {
    update_values.password = req.body.password;
  }

  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      update_values,
      { new: true }
    );

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to update user",
      errorMsg: error.message,
    });
  }
}

async function updateEmployee(req, res) {
  const allowedUpdates = {
    branch: req.body.branch,
    role: req.body.role,
    isActive: req.body.isActive
  };

  const updateValues = Object.fromEntries(
    Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
  );

  if (updateValues.role && !['employee', 'manager'].includes(updateValues.role)) {
    return res.status(400).send({
      success: false,
      message: "Invalid role value. Must be 'employee' or 'manager'"
    });
  }

  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      updateValues,
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Employee not found",
      });
    }

    if (!['employee', 'manager'].includes(user.role)) {
      return res.status(400).send({
        success: false,
        message: "Can only update employees and managers"
      });
    }

    res.status(200).send({
      success: true,
      message: "Employee updated successfully",
      data: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        branch: user.branch,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).send({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).send({
      success: false,
      message: "Failed to update employee",
      errorMsg: error.message
    });
  }
}

function updateUserRole(req, res) {
  const update_values = {
    role: req.body.role,
  };
  try {
    UserModel.findByIdAndUpdate(req.params.id, update_values, {
      new: true,
    }).then((user) => {
      res.status(200).send({
        success: true,
        message: "User status updated successfully",
        data: user,
      });
    });
  } catch (error) {
    res.status(404).send({
      success: fales,
      message: "Failed to update user status",
      errorMsg: error,
    });
  }
}

function deleteUser(req, res) {
  try {
    UserModel.findByIdAndDelete(req.params.id).then((user) => {
      res.status(200).send({
        success: true,
        message: "User deleted successfully",
        data: user,
      });
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "Error deleteing user",
      data: error,
    });
  }
}

async function loginUser(req, res) {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(404)
        .send({ success: false, message: "Invalid email or password" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    if (!user.isVerified) {
      return res.status(400).send({
        success: false,
        message:"Your email is not verified. Please verify your email to login",
      });
    }
    const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, { expiresIn: '2d' })


    res.status(200).send({
      success: true,
      message: "Login successful",
      data: { id: user._id, role: user.role, status: user.status },
      token
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occured",
      data: error,
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiry;

    const savedUser = await user.save();
    console.log("Updated user:", {
      resetToken: savedUser.resetPasswordToken,
      expiresAt: savedUser.resetPasswordExpiresAt,
    });

    const dbUser = await UserModel.findById(user._id);
    console.log("Database verification:", {
      dbToken: dbUser.resetPasswordToken,
      dbExpires: dbUser.resetPasswordExpiresAt,
    });

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log(`[DEBUG] Token received: ${token}`);
    console.log(`[DEBUG] Current server time: ${new Date()}`);

    const user = await UserModel.findOne({ resetPasswordToken: token });

    if (!user) {
      console.log("[DEBUG] No user found with this token");
      return res.status(400).json({ message: "Invalid reset token" });
    }

    console.log(
      `[DEBUG] Token expiration time in DB: ${user.resetPasswordExpiresAt}`
    );
    console.log(
      `[DEBUG] Time remaining: ${user.resetPasswordExpiresAt - Date.now()}ms`
    );

    if (user.resetPasswordExpiresAt < Date.now()) {
      console.log("[DEBUG] Token expired");
      return res.status(400).json({ message: "Reset token has expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();


    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export {
  createUser,
  verifyUser,
  getUsers,
  getSingleUser,
  updateUser,
  getAllCustomers,
  updateUserRole,
  deleteUser,
  loginUser,
  getNonAdmins,
  getEmployeesByBranch,
  forgotPassword,
  resetPassword,
  resendVerification,
  updateEmployee,
};
