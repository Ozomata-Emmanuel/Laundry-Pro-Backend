import jwt from 'jsonwebtoken';
import UserModel from "../models/UserModel.js";

export const protect = async (req, res, next) => { 
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not Authenticated." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token. Please login to access this page" });
  }
};



export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied. Only an admin can access this information" });
    }
    next();
  };
};