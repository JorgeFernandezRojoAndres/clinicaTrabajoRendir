import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import PacienteController from "../controllers/pacienteController.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vista de registro de paciente
router.get("/registro", (req, res) => {
    res.sendFile(path.join(__dirname, "../../views/paciente/registro.html"));
});

router.get("/", PacienteController.list);
router.get("/:id", PacienteController.get);
router.post("/", PacienteController.create);
router.put("/:id", PacienteController.update);
router.delete("/:id", PacienteController.delete);

// Lista de espera (paciente)
router.post("/lista-espera", PacienteController.addToWaitlist);

export default router;
