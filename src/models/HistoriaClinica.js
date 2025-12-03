import { db } from "../config/db.js";

const HistoriaClinica = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT hc.*, p.nombreCompleto AS paciente
            FROM HISTORIA_CLINICA hc
            JOIN PACIENTE p ON hc.pacienteId = p.id
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM HISTORIA_CLINICA WHERE id = ?", 
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { pacienteId } = data;
        const [result] = await db.query(
            "INSERT INTO HISTORIA_CLINICA (pacienteId) VALUES (?)",
            [pacienteId]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { pacienteId } = data;
        await db.query(
            "UPDATE HISTORIA_CLINICA SET pacienteId = ? WHERE id = ?",
            [pacienteId, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM HISTORIA_CLINICA WHERE id = ?", [id]);
        return true;
    }
};

export default HistoriaClinica;
