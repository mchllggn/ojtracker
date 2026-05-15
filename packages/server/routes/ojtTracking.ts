import { Router } from "express";
import {
  getOjtTracking,
  startOjtTracking,
  addDutyHours,
  updateDutyLog,
  deleteDutyLog,
  resetOjtTracking,
} from "../controllers/ojtTrackingController";
import { authenticateToken } from "../middleware/auth";

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get OJT tracking data
router.get("/", getOjtTracking);

// Start OJT tracking
router.post("/start", startOjtTracking);

// Add duty hours
router.post("/duty", addDutyHours);

// Update duty log
router.put("/duty/:id", updateDutyLog);

// Delete duty log
router.delete("/duty/:id", deleteDutyLog);

// Reset OJT tracking
router.delete("/reset", resetOjtTracking);

export default router;
