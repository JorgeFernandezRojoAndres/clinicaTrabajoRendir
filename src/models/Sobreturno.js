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
        const { horarioAgendaId, pacienteId, motivo, fechaHoraManual } = data;

        const [result] = await db.query(
            `INSERT INTO SOBRETURNO (horarioAgendaId, pacienteId, motivo, fechaHoraManual)
         VALUES (?, ?, ?, ?)`,
            [horarioAgendaId || null, pacienteId, motivo || null, fechaHoraManual || null]
        );

        return result.insertId;
    }
    ,

    async update(id, data) {
        const { horarioAgendaId, pacienteId, motivo, fechaHoraManual } = data;

        await db.query(
            `UPDATE SOBRETURNO 
         SET horarioAgendaId = ?, pacienteId = ?, motivo = ?, fechaHoraManual = ?
         WHERE id = ?`,
            [horarioAgendaId || null, pacienteId, motivo || null, fechaHoraManual || null, id]
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

        if (!horarioAgendaId) {
            return false; // los sobreturnos sin horario no chocan con nada
        }

        const [rows] = await db.query(
            "SELECT * FROM SOBRETURNO WHERE horarioAgendaId = ? AND pacienteId = ?",
            [horarioAgendaId, pacienteId]
        );

        return rows.length > 0;
    }
};

export default Sobreturno;
