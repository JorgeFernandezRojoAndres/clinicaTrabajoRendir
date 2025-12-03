import express from "express";
import PacienteController from "../controllers/pacienteController.js";

const router = express.Router();

router.get("/", PacienteController.list);
router.get("/:id", PacienteController.get);
router.post("/", PacienteController.create);
router.put("/:id", PacienteController.update);
router.delete("/:id", PacienteController.delete);

export default router;
