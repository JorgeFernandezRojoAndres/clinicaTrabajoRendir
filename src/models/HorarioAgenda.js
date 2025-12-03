import { db } from "../config/db.js";

const HorarioAgenda = {

    async getAll() {
        const [rows] = await db.query(`
            SELECT ha.*, a.profesionalEspecialidadId
            FROM HORARIO_AGENDA ha
            JOIN AGENDA a ON ha.agendaId = a.id
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM HORARIO_AGENDA WHERE id = ?", [id]
        );
        return rows[0];
    },

    // 🔥 NUEVO: BUSCAR UN HORARIO POR FECHA Y HORA EXACTA
    async getByFecha(fechaHora) {
        const [rows] = await db.query(
            "SELECT * FROM HORARIO_AGENDA WHERE fechaHora = ?",
            [fechaHora]
        );
        return rows[0];
    },

    async create(data) {
        const { agendaId, fechaHora, estado, tipoClasificacion } = data;
        const [result] = await db.query(
            "INSERT INTO HORARIO_AGENDA (agendaId, fechaHora, estado, tipoClasificacion) VALUES (?, ?, ?, ?)",
            [agendaId, fechaHora, estado, tipoClasificacion]
        );
        return result.insertId;
    },

    async update(id, data) {

        // Construir SET dinámico solo con los campos enviados
        const campos = [];
        const valores = [];

        for (const key in data) {
            campos.push(`${key} = ?`);
            valores.push(data[key]);
        }

        // Si no se envió nada, no actualizar
        if (campos.length === 0) return false;

        const sql = `
        UPDATE HORARIO_AGENDA 
        SET ${campos.join(", ")}
        WHERE id = ?
    `;

        valores.push(id);

        await db.query(sql, valores);
        return true;
    },


    async delete(id) {
        await db.query("DELETE FROM HORARIO_AGENDA WHERE id = ?", [id]);
        return true;
    }
};

export default HorarioAgenda;
