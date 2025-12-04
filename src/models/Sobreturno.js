import { db } from "../config/db.js";

const Sobreturno = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT st.*, p.nombreCompleto AS paciente, ha.fechaHora
            FROM SOBRETURNO st
            JOIN PACIENTE p ON st.pacienteId = p.id
            LEFT JOIN HORARIO_AGENDA ha ON st.horarioAgendaId = ha.id
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM SOBRETURNO WHERE id = ?", [id]
        );
        return rows[0];
    },

    async create(data) {
        const {
            pacienteId,
            motivo,
            fechaHoraManual,
            profesionalId,
            especialidadId
        } = data;

        const [result] = await db.query(
            `INSERT INTO SOBRETURNO 
            (pacienteId, motivo, fechaHoraManual, profesionalId, especialidadId)
            VALUES (?, ?, ?, ?, ?)`,
            [
                pacienteId,
                motivo || null,
                fechaHoraManual || null,
                profesionalId || null,
                especialidadId || null
            ]
        );

        return result.insertId;
    }
    ,

    async update(id, data) {
        const {
            pacienteId,
            motivo,
            fechaHoraManual,
            profesionalId,
            especialidadId
        } = data;

        await db.query(
            `UPDATE SOBRETURNO 
         SET pacienteId = ?, motivo = ?, fechaHoraManual = ?, profesionalId = ?, especialidadId = ?
         WHERE id = ?`,
            [
                pacienteId,
                motivo || null,
                fechaHoraManual || null,
                profesionalId || null,
                especialidadId || null,
                id
            ]
        );

        return true;
    }
    ,

    async delete(id) {
        await db.query("DELETE FROM SOBRETURNO WHERE id = ?", [id]);
        return true;
    },

    // 🔍 Si no hay horario (es null), no hay que validar nada
    async existeSobreturnoPaciente(horarioAgendaId, pacienteId) {

        // La tabla SOBRETURNO ya no tiene horarioAgendaId.
        // Si se pasa un horario, no hay choque directo: se permite.
        // Esta validación se mantiene por compatibilidad de firma.
        return false;
    }
};

export default Sobreturno;
