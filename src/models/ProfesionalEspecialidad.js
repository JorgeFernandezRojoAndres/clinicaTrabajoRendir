import { db } from "../config/db.js";

const ProfesionalEspecialidad = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT pe.*, p.nombre AS profesional, e.nombre AS especialidad
            FROM PROFESIONAL_ESPECIALIDAD pe
            JOIN PROFESIONAL p ON pe.profesionalId = p.id
            JOIN ESPECIALIDAD e ON pe.especialidadId = e.id
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM PROFESIONAL_ESPECIALIDAD WHERE id = ?",
            [id]
        );
        return rows[0];
    },
    async getUniqueSpecialties() {
        const [rows] = await db.query(`
        SELECT 
            e.id AS id,
            e.nombre AS nombre
        FROM ESPECIALIDAD e
        ORDER BY e.nombre
    `);
        return rows;
    },

    async create(data) {
        const { profesionalId, especialidadId, matricula } = data;
        const [result] = await db.query(
            "INSERT INTO PROFESIONAL_ESPECIALIDAD (profesionalId, especialidadId, matricula) VALUES (?, ?, ?)",
            [profesionalId, especialidadId, matricula]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { profesionalId, especialidadId, matricula } = data;
        await db.query(
            "UPDATE PROFESIONAL_ESPECIALIDAD SET profesionalId = ?, especialidadId = ?, matricula = ? WHERE id = ?",
            [profesionalId, especialidadId, matricula, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM PROFESIONAL_ESPECIALIDAD WHERE id = ?", [id]);
        return true;
    }
};

export default ProfesionalEspecialidad;
