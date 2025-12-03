import { Router } from "express";
import DiaNoLaborableController from "../controllers/diaNoLaborableController.js";
import { requireRole } from "../middlewares/authMiddleware.js";
import DiaNoLaborable from "../models/DiaNoLaborable.js"; // ← necesario para consulta pública

const router = Router();

/* ============================================================
   📌 ENDPOINT PÚBLICO (Profesional / Secretaria / Cualquiera logueado)
   GET /api/feriados/feriado?fecha=2025-12-08
   ============================================================ */
router.get("/feriado", async (req, res) => {
    try {
        const { fecha } = req.query;

        if (!fecha) {
            return res.json({ esFeriado: false });
        }

        const fila = await DiaNoLaborable.findByDate(fecha);

        return res.json({
            esFeriado: !!fila
        });

    } catch (err) {
        console.error("Error consultando feriado:", err);
        return res.json({ esFeriado: false });
    }
});

/* ============================================================
   📌 CRUD SOLO PARA ADMINISTRADOR
   ============================================================ */

// Listar días no laborables
router.get("/", requireRole("admin"), DiaNoLaborableController.listar);

// Crear día no laborable
router.post("/", requireRole("admin"), DiaNoLaborableController.crear);

// Eliminar día no laborable
router.delete("/:id", requireRole("admin"), DiaNoLaborableController.eliminar);

export default router;
