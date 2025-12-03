import { db } from "../config/db.js";

const MedicamentoUso = {
    async getAll() {
        const [rows] = await db.query("SELECT * FROM MEDICAMENTO_USO");
        return rows;
    },
    async getByAtencionId(atencionId) {
    const [rows] = await db.query(
        "SELECT * FROM MEDICAMENTO_USO WHERE atencionId = ?",
        [atencionId]
    );
    return rows;
}
    ,

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM MEDICAMENTO_USO WHERE id = ?", 
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { atencionId, descripcion } = data;
        const [result] = await db.query(
            "INSERT INTO MEDICAMENTO_USO (atencionId, descripcion) VALUES (?, ?)",
            [atencionId, descripcion]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { atencionId, descripcion } = data;
        await db.query(
            "UPDATE MEDICAMENTO_USO SET atencionId = ?, descripcion = ? WHERE id = ?",
            [atencionId, descripcion, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM MEDICAMENTO_USO WHERE id = ?", [id]);
        return true;
    }
};

export default MedicamentoUso;
