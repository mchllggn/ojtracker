import express, { Request, Response, Application } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import ojtTrackingRoutes from "./routes/ojtTracking";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const PORT: string | number = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ojt", ojtTrackingRoutes);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Backend API Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      ojt: "/api/ojt",
      health: "/api/health",
    },
  });
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ success: true, message: "Server is running" });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
