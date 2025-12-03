import express from "express";
import { requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📌 Panel del profesional (vista principal)
router.get("/pro-panel", requireRole("profesional"), (req, res) => {
    res.sendFile("profesional/misTurnos.html", { root: "views" });
});
// 📌 Vista de HISTORIA CLÍNICA del paciente
router.get("/pro-historia/:pacienteId", requireRole("profesional"), (req, res) => {
    res.sendFile("profesional/historiaPaciente.html", { root: "views" });
});


// 📌 Vista de ATENCIÓN MÉDICA (consulta del turno)
router.get("/pro-atencion/:turnoId", requireRole("profesional"), (req, res) => {
    res.sendFile("profesional/atencion.html", { root: "views" });
});

export default router;
