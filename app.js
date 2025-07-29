import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';


import AllUserRoutes from "./routes/UserRoutes.js";
import AllSupplierRoutes from "./routes/SupplierRoutes.js";
import AllBranchRoutes from "./routes/BranchRoutes.js";
import AllOrderRoutes from "./routes/OrderRoutes.js";
import AllLeaveRoutes from "./routes/LeaveRoutes.js"; 
import AllSupplierOrderRoutes from "./routes/SupplierOrderRoutes.js";
import AllInventoryRoutes from './routes/InventoryRoutes.js';
import AllIssueRoutes from './routes/IssueRoutes.js';
import AllEmployeeRequestRoutes from './routes/EmployeeRequestRoutes.js';
import connect_db from './DBConnection.js';

config();

const app = express();
const PORT = 5002;

connect_db();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {  
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
};

app.use(cors(corsOptions));


app.use(AllUserRoutes);
app.use(AllSupplierRoutes);
app.use(AllBranchRoutes);
app.use(AllOrderRoutes);
app.use(AllLeaveRoutes);
app.use(AllIssueRoutes);
app.use(AllSupplierOrderRoutes);
app.use(AllInventoryRoutes);
app.use(AllEmployeeRequestRoutes);

app.listen(PORT, () => console.log("Server running successfully"));