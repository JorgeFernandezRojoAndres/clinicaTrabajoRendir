import { db } from "../config/db.js";

const DiaNoLaborable = {

    async getAll() {
        const [rows] = await db.query(`
            SELECT * 
            FROM DIA_NO_LABORABLE
            ORDER BY fecha ASC
        `);
        return rows;
    },

    async create({ fecha, descripcion }) {
        const [result] = await db.query(
            "INSERT INTO DIA_NO_LABORABLE (fecha, descripcion) VALUES (?, ?)",
            [fecha, descripcion]
        );
        return result.insertId;
    },

    async delete(id) {
        await db.query("DELETE FROM DIA_NO_LABORABLE WHERE id = ?", [id]);
        return true;
    },

    // ============================================================
    // ✅ NUEVO MÉTODO: Buscar feriado por fecha exacta
    // ============================================================
    async findByDate(fecha) {
        const [rows] = await db.query(
            "SELECT * FROM DIA_NO_LABORABLE WHERE fecha = ? LIMIT 1",
            [fecha]
        );

        return rows.length > 0 ? rows[0] : null;
    }
};

export default DiaNoLaborable;
