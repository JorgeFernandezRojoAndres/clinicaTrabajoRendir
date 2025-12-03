import { Router } from "express";
import Diagnostico from "../models/Diagnostico.js";
import { requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

/* ================================
   📌 Obtener los diagnósticos de una atención
================================== */
router.get("/:atencionId", requireRole("profesional"), async (req, res) => {
    try {
        const { atencionId } = req.params;
        const rows = await Diagnostico.getByAtencion(atencionId);
        return res.json({ ok: true, diagnosticos: rows });
    } catch (err) {
        console.error(err);
        return res.json({ ok: false, error: "Error obteniendo diagnósticos" });
    }
});

/* ================================
   📌 Crear diagnóstico
================================== */
router.post("/", requireRole("profesional"), async (req, res) => {
    try {
        const { atencionId, descripcion, tipo } = req.body;

        if (!atencionId || !descripcion) {
            return res.json({ ok: false, error: "Datos incompletos" });
        }

        const nuevoId = await Diagnostico.create({
            atencionId,
            descripcion,
            tipo: tipo || "preliminar"
        });

        return res.json({ ok: true, id: nuevoId });

    } catch (err) {
        console.error(err);
        return res.json({ ok: false, error: "No se pudo crear el diagnóstico" });
    }
});

/* ================================
   📌 Eliminar diagnóstico
================================== */
router.delete("/:id", requireRole("profesional"), async (req, res) => {
    try {
        await Diagnostico.delete(req.params.id);
        return res.json({ ok: true });
    } catch (err) {
        console.error(err);
        return res.json({ ok: false, error: "No se pudo eliminar el diagnóstico" });
    }
});

export default router;
