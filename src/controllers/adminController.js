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
                SELECT id, nombre, apellido, dni, obraSocial, telefono, estado
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

};

export default AdminController;
