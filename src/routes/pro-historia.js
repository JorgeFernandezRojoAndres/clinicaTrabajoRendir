import express from "express";  
import path from "path";
import { fileURLToPath } from "url";
import historiaClinicaController from "../controllers/historiaClinicaController.js";
import { requireRole } from "../middlewares/authMiddleware.js";
import PacienteController from "../controllers/pacienteController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// 📌 Obtener datos del paciente (MOVER ARRIBA)
// =====================================================
router.get("/paciente/:pacienteId", requireRole("profesional"), async (req, res) => {
    try {
        const id = req.params.pacienteId;

        const [rows] = await req.db.query(
            "SELECT id, nombreCompleto, dni, obraSocial, fechaNacimiento FROM PACIENTE WHERE id = ?",
            [id]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ ok: false, error: "Paciente no encontrado" });
        }

        const paciente = rows[0];

        res.json({
            ok: true,
            paciente: {
                ...paciente,
                edad: paciente.fechaNacimiento
                    ? new Date().getFullYear() - new Date(paciente.fechaNacimiento).getFullYear()
                    : null
            }
        });

    } catch (err) {
        console.error("Error cargando datos del paciente:", err);
        res.status(500).json({ ok: false, error: "Error interno" });
    }
});

// =====================================================
// 📌 Ruta para ver detalles de atención en la vista HTML
// =====================================================
router.get("/detalle/:id", requireRole("profesional"), async (req, res) => {
    const atencionId = req.params.id;

    try {
        const [rows] = await req.db.query(`
            SELECT 
                a.id,
                a.turnoId,
                a.historiaClinicaId,
                a.profesionalId,
                a.fecha,
                a.motivo,
                a.evolucion,
                ha.fechaHora AS fecha_turno, 
                h.diagnostico
            FROM 
                Atencion a
            JOIN 
                Turno t ON a.turnoId = t.id
            LEFT JOIN 
                historia_clinica h ON a.historiaClinicaId = h.id
            LEFT JOIN 
                horario_agenda ha ON t.horarioAgendaId = ha.id
            WHERE 
                a.id = ?`, [atencionId]);

        if (rows.length === 0) {
            return res.status(404).send("Atención no encontrada");
        }

        const atencion = rows[0];

        // Renderiza la vista EJS y pasa los datos de la atención
        res.render("profesional/historiaPaciente", {
            atencion: atencion  // Pasa los datos a la vista
        });

    } catch (err) {
        console.error("Error al obtener los detalles de la atención:", err);
        return res.status(500).send("Error interno");
    }
});


// =====================================================
// 📌 Historial clínico del profesional (API JSON)
// =====================================================
router.get(
    "/historial/:pacienteId",
    requireRole("profesional"),
    historiaClinicaController.getHistoriaProfesional
);

// =====================================================
// 📌 Vista HTML (con ID de paciente)
// =====================================================
router.get(
    "/:pacienteId",
    requireRole("profesional"),
    (req, res) => {
        return res.sendFile(
            path.join(__dirname, "../../views/profesional/historiaPaciente.html")
        );
    }
);

export default router;
