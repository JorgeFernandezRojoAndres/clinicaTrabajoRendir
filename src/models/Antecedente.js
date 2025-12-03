import { db } from "../config/db.js";

const Antecedente = {
    async getAll() {
        const [rows] = await db.query("SELECT * FROM ANTECEDENTE");
        return rows;
    },
    async getByAtencionId(atencionId) {
    const [rows] = await db.query(
        "SELECT * FROM ANTECEDENTE WHERE atencionId = ?",
        [atencionId]
    );
    return rows;
}
    ,

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM ANTECEDENTE WHERE id = ?", 
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { atencionId, descripcion, desde, hasta } = data;
        const [result] = await db.query(
            "INSERT INTO ANTECEDENTE (atencionId, descripcion, desde, hasta) VALUES (?, ?, ?, ?)",
            [atencionId, descripcion, desde, hasta]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { atencionId, descripcion, desde, hasta } = data;
        await db.query(
            "UPDATE ANTECEDENTE SET atencionId = ?, descripcion = ?, desde = ?, hasta = ? WHERE id = ?",
            [atencionId, descripcion, desde, hasta, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM ANTECEDENTE WHERE id = ?", [id]);
        return true;
    }
};

export default Antecedente;

