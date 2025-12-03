import express from "express";
import atencionController from "../controllers/atencionController.js";

const router = express.Router();

// ======================================================
// 🔥 OBTENER ATENCIÓN POR TURNO
// ======================================================
router.get("/turno/:turnoId", atencionController.getForTurno);

// ======================================================
// 🩺 HISTORIA CLÍNICA — GET
// ======================================================
router.get("/:id/alergias",     atencionController.alergias);
router.get("/:id/antecedentes", atencionController.antecedentes);
router.get("/:id/habitos",      atencionController.habitos);
router.get("/:id/medicamentos", atencionController.medicamentos);

// ======================================================
// 🩺 HISTORIA CLÍNICA — POST (NUEVO)
// ======================================================
router.post("/:id/alergias",     atencionController.addAlergia);
router.post("/:id/antecedentes", atencionController.addAntecedente);
router.post("/:id/habitos",      atencionController.addHabito);
router.post("/:id/medicamentos", atencionController.addMedicamentoUso);

// ======================================================
// CRUD BÁSICO — ATENCIÓN
// ======================================================
router.get("/:id",    atencionController.get);
router.post("/",      atencionController.create);
router.put("/:id",    atencionController.update);
router.delete("/:id", atencionController.delete);

export default router;
