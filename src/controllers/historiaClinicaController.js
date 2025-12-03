import HistoriaClinica from "../models/HistoriaClinica.js";
import Atencion from "../models/Atencion.js";
import Turno from "../models/Turno.js";
import Profesional from "../models/Profesional.js";
import Diagnostico from "../models/Diagnostico.js";
import { db } from "../config/db.js";

const HistoriaClinicaController = {

    async list(req, res) {
        const data = await HistoriaClinica.getAll();
        res.json(data);
    },

    async get(req, res) {
        const id = req.params.id;
        const data = await HistoriaClinica.getById(id);
        res.json(data);
    },

    async create(req, res) {
        const id = await HistoriaClinica.create(req.body);
        res.json({ ok: true, id });
    },

    async atenciones(req, res) {
        const data = await Atencion.getAll();
        res.json(data);
    },
    // Agregar en historiaClinicaController.js
    async getDetalle(req, res) {
        const atencionId = req.params.id;  // Obtener el ID de la atención

        try {
            // Consultar en la base de datos para obtener los detalles de la atención
            const [rows] = await req.db.query(`
    SELECT 
        a.id,
        a.turnoId,
        a.historiaClinicaId,
        a.profesionalId,
        a.fecha,
        a.motivo,
        a.evolucion,
        ha.fechaHora AS fecha_turno,   -- Usamos la columna 'fechaHora' de la tabla horario_agenda
        h.diagnostico  -- Diagnóstico de historia clínica
    FROM 
        Atencion a
    JOIN 
        Turno t ON a.turnoId = t.id
    LEFT JOIN 
        historia_clinica h ON a.historiaClinicaId = h.id
    LEFT JOIN 
        horario_agenda ha ON t.horarioAgendaId = ha.id  -- Relacionamos con la tabla horario_agenda
    WHERE 
        a.id = ?`, [atencionId]);  // Usamos el ID de la atención


            if (!rows || rows.length === 0) {
                return res.status(404).json({ ok: false, error: "Atención no encontrada" });
            }

            // Si se encuentra la atención, devolver los detalles
            const atencion = rows[0];
            res.json({ ok: true, atencion });

        } catch (err) {
            console.error("Error al obtener detalle de atención:", err);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    }
    ,

    // ==========================================================
    // 📌 NUEVO: Historial del profesional
    // GET /pro-historia/historial/:pacienteId
    // ==========================================================
    async getHistoriaProfesional(req, res) {
        try {
            const pacienteId = req.params.pacienteId;
            const profesionalId = req.session?.user?.id_profesional;

            if (!profesionalId) {
                return res.status(401).json({ ok: false, error: "Profesional no autenticado" });
            }

            // --- Obtener historial desde el modelo ---
            const rows = await Atencion.getByPacienteYProfesional(pacienteId, profesionalId);

            if (!rows || rows.length === 0) {
                return res.json({ ok: true, historial: [] });
            }

            // --- Formateo de fechas ---
            const historial = rows.map(r => {
                const fechaAt = r.fecha_atencion
                    ? new Date(r.fecha_atencion).toLocaleDateString("es-AR")
                    : "";

                const fechaTurno = r.fecha_turno
                    ? new Date(r.fecha_turno).toLocaleDateString("es-AR")
                    : "";

                return {
                    id: r.id,
                    motivo: r.motivo,
                    evolucion: r.evolucion,
                    fecha_atencion: fechaAt,
                    fecha_turno: fechaTurno,
                    hora_turno: r.hora_turno,
                    profesional: r.profesional,
                    diagnostico: r.diagnostico || "Sin diagnóstico"
                };
            });

            return res.json({ ok: true, historial });

        } catch (error) {
            console.error("Error en getHistoriaProfesional:", error);
            return res.status(500).json({ ok: false, error: "Error interno del servidor" });
        }
    }

};

export default HistoriaClinicaController;
