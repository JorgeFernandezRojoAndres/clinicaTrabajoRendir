import { db } from "../config/db.js";

const Paciente = {

    async getAll() {
        const [rows] = await db.query("SELECT * FROM PACIENTE");
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query("SELECT * FROM PACIENTE WHERE id = ?", [id]);
        return rows[0];
    },

    async create(data) {
        const {
            nombreCompleto,
            fechaNacimiento = null,
            genero = null,
            dni,
            obraSocial,
            contacto,
            fotoDniUrl
        } = data;

        const estado = "pendiente";

        const [result] = await db.query(
            `INSERT INTO PACIENTE 
                (nombreCompleto, fechaNacimiento, genero, dni, obraSocial, contacto, fotoDniUrl, estado) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombreCompleto, fechaNacimiento, genero, dni, obraSocial, contacto, fotoDniUrl, estado]
        );

        return result.insertId;
    },

    async update(id, data) {
        const {
            nombreCompleto,
            fechaNacimiento = null,
            genero = null,
            dni,
            obraSocial,
            contacto,
            fotoDniUrl
        } = data;

        await db.query(
            `UPDATE PACIENTE 
             SET nombreCompleto = ?, fechaNacimiento = ?, genero = ?, dni = ?, obraSocial = ?, contacto = ?, fotoDniUrl = ? 
             WHERE id = ?`,
            [nombreCompleto, fechaNacimiento, genero, dni, obraSocial, contacto, fotoDniUrl, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM PACIENTE WHERE id = ?", [id]);
        return true;
    },

    // 🔥 NUEVO: obtener solo pendientes
    async getPendientes() {
        const [rows] = await db.query(`
            SELECT * 
            FROM PACIENTE 
            WHERE estado = 'pendiente'
        `);
        return rows;
    },

    // 🔥 NUEVO: aprobar paciente
    async aprobar(id) {
        await db.query(`
            UPDATE PACIENTE 
            SET estado = 'activo'
            WHERE id = ?
        `, [id]);
        return true;
    },

    // 🔥 NUEVO: rechazar paciente
    async rechazar(id) {
        await db.query(`
            UPDATE PACIENTE 
            SET estado = 'rechazado'
            WHERE id = ?
        `, [id]);
        return true;
    }
};

export default Paciente;
