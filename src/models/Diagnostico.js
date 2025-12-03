import { db } from "../config/db.js";

const Diagnostico = {
    async getAll() {
        const [rows] = await db.query("SELECT * FROM DIAGNOSTICO");
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM DIAGNOSTICO WHERE id = ?", 
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { atencionId, descripcion, tipo } = data;
        const [result] = await db.query(
            "INSERT INTO DIAGNOSTICO (atencionId, descripcion, tipo) VALUES (?, ?, ?)",
            [atencionId, descripcion, tipo]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { atencionId, descripcion, tipo } = data;
        await db.query(
            "UPDATE DIAGNOSTICO SET atencionId = ?, descripcion = ?, tipo = ? WHERE id = ?",
            [atencionId, descripcion, tipo, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM DIAGNOSTICO WHERE id = ?", [id]);
        return true;
    }
};

export default Diagnostico;
