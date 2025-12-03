import { db } from "../config/db.js";

const Habito = {
    async getAll() {
        const [rows] = await db.query("SELECT * FROM HABITO");
        return rows;
    },
    async getByAtencionId(atencionId) {
        const [rows] = await db.query(
            "SELECT * FROM HABITO WHERE atencionId = ?",
            [atencionId]
        );
        return rows;
    }
    ,

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM HABITO WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { atencionId, descripcion, desde, hasta } = data;
        const [result] = await db.query(
            "INSERT INTO HABITO (atencionId, descripcion, desde, hasta) VALUES (?, ?, ?, ?)",
            [atencionId, descripcion, desde, hasta]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { atencionId, descripcion, desde, hasta } = data;
        await db.query(
            "UPDATE HABITO SET atencionId = ?, descripcion = ?, desde = ?, hasta = ? WHERE id = ?",
            [atencionId, descripcion, desde, hasta, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM HABITO WHERE id = ?", [id]);
        return true;
    }
};

export default Habito;
