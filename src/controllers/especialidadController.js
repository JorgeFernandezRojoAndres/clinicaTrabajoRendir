import { db } from "../config/db.js";

const EspecialidadController = {

    async listar(req, res) {
        try {
            const [rows] = await db.query("SELECT * FROM ESPECIALIDAD");
            return res.json(rows);
        } catch (err) {
            console.error("Error al listar especialidades:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    async crear(req, res) {
        try {
            const { nombre } = req.body;

            if (!nombre || nombre.trim() === "") {
                return res.status(400).json({ error: "El nombre es obligatorio" });
            }

            await db.query(
                "INSERT INTO ESPECIALIDAD (nombre) VALUES (?)",
                [nombre]
            );

            return res.json({ ok: true });
        } catch (err) {
            console.error("Error al crear especialidad:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            await db.query(
                "UPDATE ESPECIALIDAD SET nombre = ? WHERE id = ?",
                [nombre, id]
            );

            return res.json({ ok: true });
        } catch (err) {
            console.error("Error al actualizar especialidad:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    async eliminar(req, res) {
        try {
            const { id } = req.params;

            await db.query(
                "DELETE FROM ESPECIALIDAD WHERE id = ?",
                [id]
            );

            return res.json({ ok: true });
        } catch (err) {
            console.error("Error al eliminar especialidad:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }
};

export default EspecialidadController;
