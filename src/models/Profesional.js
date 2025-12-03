import { db } from "../config/db.js";

const Profesional = {

    // ======================================================
    // 📌 TRAER TODOS
    // ======================================================
    async getAll() {
        const [rows] = await db.query("SELECT * FROM PROFESIONAL");
        return rows;
    },

    // ======================================================
    // 📌 TRAER SOLO MÉDICOS REALES (CON ESPECIALIDAD)
    // ======================================================
    async getMedicos() {
        const [rows] = await db.query(`
        SELECT DISTINCT
            pr.id,
            pr.nombre
        FROM profesional pr
        JOIN profesional_especialidad pe ON pr.id = pe.profesionalId
        ORDER BY pr.nombre
    `);

        return rows;
    }
    ,
    // ======================================================
    // 📌 TRAER POR ID
    // ======================================================
    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM PROFESIONAL WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    // ======================================================
    // 📌 CREAR PROFESIONAL (ADMIN)
    // ======================================================
    async create(data) {
        const { nombre, usuario, password, rol } = data;

        const [result] = await db.query(
            `
            INSERT INTO PROFESIONAL (nombre, usuario, password, rol)
            VALUES (?, ?, ?, ?)
            `,
            [nombre, usuario, password, rol || "profesional"]
        );

        return result.insertId;
    },

    // ======================================================
    // 📌 ACTUALIZAR PROFESIONAL
    // ======================================================
    async update(id, data) {
        const { nombre, usuario, password, rol } = data;

        await db.query(
            `
            UPDATE PROFESIONAL 
            SET nombre = ?, usuario = ?, password = ?, rol = ?
            WHERE id = ?
            `,
            [nombre, usuario, password, rol || "profesional", id]
        );

        return true;
    },
    // ======================================================
    // 📌 TRAER MÉDICOS FILTRADOS POR ESPECIALIDAD
    // ======================================================
    async getMedicosPorEspecialidad(especialidadId) {
        const [rows] = await db.query(
            `
        SELECT 
            pr.id,
            pr.nombre
        FROM profesional pr
        JOIN profesional_especialidad pe ON pr.id = pe.profesionalId
        WHERE pe.especialidadId = ?
        ORDER BY pr.nombre
        `,
            [especialidadId]
        );

        return rows;
    },
    // ======================================================
    // 📌 ESPECIALIDADES DE UN PROFESIONAL (CORREGIDO)
    // ======================================================
    async getEspecialidadesProfesional(profesionalId) {
        const [rows] = await db.query(
            `
        SELECT 
            esp.id AS especialidadId,
            esp.nombre AS especialidadNombre
        FROM profesional_especialidad pe
        JOIN especialidad esp ON pe.especialidadId = esp.id
        WHERE pe.profesionalId = ?
        ORDER BY esp.nombre
        `,
            [profesionalId]
        );

        return rows;
    }
    ,
    // ======================================================
    // 📌 ELIMINAR PROFESIONAL
    // ======================================================
    async delete(id) {
        await db.query(
            "DELETE FROM PROFESIONAL WHERE id = ?",
            [id]
        );
        return true;
    }
};

export default Profesional;
