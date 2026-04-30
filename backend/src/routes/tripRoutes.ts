import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
  optimizeMood,
  addActivity,
  updateActivity,
  deleteActivity,
} from "../controllers/tripController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/", getTrips);
router.post("/", createTrip);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

router.post("/:id/regenerate-day", regenerateDay);
router.post("/:id/optimize-mood", optimizeMood);
router.post("/:id/add-activity", addActivity);
router.post("/:id/update-activity", updateActivity);
router.post("/:id/delete-activity", deleteActivity);

export default router;
