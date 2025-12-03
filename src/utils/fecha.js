import { db } from "../config/db.js";

// 🔥 Devuelve true si la fecha (YYYY-MM-DD) es feriado
export async function esFeriado(fechaYYYYMMDD) {
    const [rows] = await db.query(
        "SELECT id FROM dia_no_laborable WHERE fecha = ?",
        [fechaYYYYMMDD]
    );

    return rows.length > 0;
}
