import { db } from "../config/db.js";

const AdminController = {

    // ============================================================
    // 📌 DASHBOARD (CÓDIGO ORIGINAL — NO SE TOCÓ NADA)
    // ============================================================
    async getDashboardData(req, res) {
        try {
            // Total de profesionales
            const [[{ totalProfesionales }]] = await db.query(`
                SELECT COUNT(*) AS totalProfesionales
                FROM PROFESIONAL
            `);

            // Total de pacientes
            const [[{ totalPacientes }]] = await db.query(`
                SELECT COUNT(*) AS totalPacientes
                FROM PACIENTE
            `);

            // Turnos de HOY
            const [[{ turnosHoy }]] = await db.query(`
                SELECT COUNT(*) AS turnosHoy
                FROM TURNO t
                JOIN HORARIO_AGENDA h ON h.id = t.horarioAgendaId
                WHERE DATE(h.fechaHora) = CURDATE()
            `);

            // Consultas del MES
            const [[{ consultasMes }]] = await db.query(`
                SELECT COUNT(*) AS consultasMes
                FROM ATENCION
            `);

            return res.json({
                ok: true,
                data: {
                    totalProfesionales,
                    totalPacientes,
                    turnosHoy,
                    consultasMes
                }
            });

        } catch (err) {
            console.error("Error en dashboard admin:", err);
            return res.status(500).json({
                ok: false,
                error: "Error interno del servidor"
            });
        }
    },

    // ============================================================
    // 📌 NUEVO: LISTAR PACIENTES PENDIENTES (NO BORRA NADA)
    // ============================================================
    async pacientesPendientes(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id, 
                    nombreCompleto, 
                    dni, 
                    obraSocial, 
                    contacto AS telefono, 
                    estado
                FROM PACIENTE
                WHERE estado = 'pendiente'
            `);

            return res.json(rows);

        } catch (err) {
            console.error("Error obteniendo pacientes pendientes:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    // ============================================================
    // 📌 NUEVO: APROBAR PACIENTE
    // ============================================================
    async aprobarPaciente(req, res) {
        try {
            const { id } = req.params;

            await db.query(`
                UPDATE PACIENTE
                SET estado = 'activo'
                WHERE id = ?
            `, [id]);

            return res.json({ ok: true });

        } catch (err) {
            console.error("Error aprobando paciente:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    // ============================================================
    // 📌 NUEVO: RECHAZAR PACIENTE
    // ============================================================
    async rechazarPaciente(req, res) {
        try {
            const { id } = req.params;

            await db.query(`
                UPDATE PACIENTE
                SET estado = 'rechazado'
                WHERE id = ?
            `, [id]);

            return res.json({ ok: true });

        } catch (err) {
            console.error("Error rechazando paciente:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    // ============================================================
    // 📌 REPORTES
    // ============================================================
    async generarReporte(req, res) {
        try {
            const { tipo, desde, hasta } = req.query;

            if (!tipo) {
                return res.status(400).json({ ok: false, error: "Falta tipo de reporte" });
            }

            // Normalizar fechas si vienen
            const fDesde = desde ? `${desde} 00:00:00` : null;
            const fHasta = hasta ? `${hasta} 23:59:59` : null;

            let rows = [];
            let csv = "data:text/csv;charset=utf-8,";

            if (tipo === "turnos-dia") {
                const [r] = await db.query(`
                    SELECT DATE_FORMAT(ha.fechaHora, '%Y-%m-%d') AS fecha, COUNT(*) AS total
                    FROM TURNO t
                    JOIN HORARIO_AGENDA ha ON ha.id = t.horarioAgendaId
                    WHERE (? IS NULL OR ha.fechaHora >= ?)
                    AND   (? IS NULL OR ha.fechaHora <= ?)
                    GROUP BY DATE(ha.fechaHora)
                    ORDER BY fecha ASC
                `, [fDesde, fDesde, fHasta, fHasta]);
                rows = r;
                csv += "fecha,total\n" + rows.map(x => `${x.fecha},${x.total}`).join("\n");
            } else if (tipo === "consultas-profesional") {
                const [r] = await db.query(`
                    SELECT pr.nombre AS profesional, COUNT(*) AS total
                    FROM ATENCION a
                    JOIN PROFESIONAL pr ON pr.id = a.profesionalId
                    WHERE (? IS NULL OR a.fecha >= ?)
                    AND   (? IS NULL OR a.fecha <= ?)
                    GROUP BY pr.id, pr.nombre
                    ORDER BY total DESC, pr.nombre ASC
                `, [fDesde, fDesde, fHasta, fHasta]);
                rows = r;
                csv += "profesional,total\n" + rows.map(x => `${x.profesional},${x.total}`).join("\n");
            } else {
                return res.status(400).json({ ok: false, error: "Tipo de reporte no soportado" });
            }

            return res.json({ ok: true, rows, csv });

        } catch (err) {
            console.error("Error generando reporte:", err);
            return res.status(500).json({ ok: false, error: "Error interno del servidor" });
        }
    }

};

export default AdminController;
