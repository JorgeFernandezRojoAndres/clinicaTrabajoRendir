import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { requireRole } from "../middlewares/authMiddleware.js";
import Profesional from "../models/Profesional.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 Panel del profesional (vista principal)
router.get("/pro-panel", requireRole("profesional"), (req, res) => {
    return res.sendFile(path.join(__dirname, "../../views/profesional/misTurnos.html"));
});

// 📌 Datos del profesional logueado (para completar topbar)
router.get("/pro-panel/datos", requireRole("profesional"), async (req, res) => {
    try {
        const user = req.session?.user;
        const profesionalId = user?.id_profesional || user?.id;

        if (!profesionalId) {
            return res.status(401).json({ ok: false, error: "No autenticado" });
        }

        const profesional = await Profesional.getById(profesionalId);
        if (!profesional) {
            return res.status(404).json({ ok: false, error: "Profesional no encontrado" });
        }

        return res.json({
            ok: true,
            profesional: {
                nombre: profesional.nombre,
                usuario: profesional.usuario
            }
        });
    } catch (err) {
        console.error("Error en /pro-panel/datos:", err);
        return res.status(500).json({ ok: false, error: "Error interno" });
    }
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
