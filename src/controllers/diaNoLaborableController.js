import DiaNoLaborable from "../models/DiaNoLaborable.js";
import { db } from "../config/db.js";

const DiaNoLaborableController = {

    // ===========================================================
    // 📌 LISTAR TODOS
    // ===========================================================
    async listar(req, res) {
        try {
            const data = await DiaNoLaborable.getAll();
            return res.json(data);
        } catch (err) {
            console.error("Error listando feriados:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    // ===========================================================
    // 📌 CREAR FERIADO
    // ===========================================================
    async crear(req, res) {
        try {
            const { fecha, descripcion } = req.body;

            if (!fecha) {
                return res.status(400).json({ error: "La fecha es obligatoria" });
            }

            const id = await DiaNoLaborable.create({
                fecha,
                descripcion: descripcion || null
            });

            return res.json({ ok: true, id });

        } catch (err) {
            console.error("Error creando feriado:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    // ===========================================================
    // 📌 ELIMINAR FERIADO
    // ===========================================================
    async eliminar(req, res) {
        try {
            const { id } = req.params;

            await DiaNoLaborable.delete(id);
            return res.json({ ok: true });

        } catch (err) {
            console.error("Error eliminando feriado:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    // ===========================================================
    // 📌 NUEVO: CONSULTAR SI UNA FECHA ES FERIADO
    // GET /api/feriados?fecha=YYYY-MM-DD
    // ===========================================================
    async esFeriado(req, res) {
        try {
            const fecha = req.query.fecha;

            if (!fecha) {
                return res.json({ esFeriado: false });
            }

            const [rows] = await db.query(
                "SELECT id FROM dia_no_laborable WHERE fecha = ?",
                [fecha]
            );

            return res.json({
                esFeriado: rows.length > 0
            });

        } catch (err) {
            console.error("Error verificando feriado:", err);
            return res.status(500).json({ esFeriado: false });
        }
    }

};

export default DiaNoLaborableController;
    