import express from "express";
import HistoriaClinicaController from "../controllers/historiaClinicaController.js";

const router = express.Router();

router.get("/", HistoriaClinicaController.list);
router.get("/:id", HistoriaClinicaController.get);
router.post("/", HistoriaClinicaController.create);

// Atenciones completas
router.get("/atenciones/all", HistoriaClinicaController.atenciones);

export default router;
