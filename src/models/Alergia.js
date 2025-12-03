import { db } from "../config/db.js";

const Alergia = {
    async getAll() {
        const [rows] = await db.query("SELECT * FROM ALERGIA");
        return rows;
    },
    async getByAtencionId(atencionId) {
        const [rows] = await db.query(
            "SELECT * FROM ALERGIA WHERE atencionId = ?",
            [atencionId]
        );
        return rows;
    }
    ,

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM ALERGIA WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { atencionId, nombre, importancia, desde, hasta } = data;
        const [result] = await db.query(
            "INSERT INTO ALERGIA (atencionId, nombre, importancia, desde, hasta) VALUES (?, ?, ?, ?, ?)",
            [atencionId, nombre, importancia, desde, hasta]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { atencionId, nombre, importancia, desde, hasta } = data;
        await db.query(
            "UPDATE ALERGIA SET atencionId = ?, nombre = ?, importancia = ?, desde = ?, hasta = ? WHERE id = ?",
            [atencionId, nombre, importancia, desde, hasta, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM ALERGIA WHERE id = ?", [id]);
        return true;
    }
};

export default Alergia;
