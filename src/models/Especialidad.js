import { db } from "../config/db.js";

const Especialidad = {
    async getAll() {
        const [rows] = await db.query("SELECT * FROM ESPECIALIDAD");
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query("SELECT * FROM ESPECIALIDAD WHERE id = ?", [id]);
        return rows[0];
    },

    async create(data) {
        const { nombre } = data;
        const [result] = await db.query(
            "INSERT INTO ESPECIALIDAD (nombre) VALUES (?)",
            [nombre]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { nombre } = data;
        await db.query(
            "UPDATE ESPECIALIDAD SET nombre = ? WHERE id = ?",
            [nombre, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM ESPECIALIDAD WHERE id = ?", [id]);
        return true;
    }
};

export default Especialidad;
