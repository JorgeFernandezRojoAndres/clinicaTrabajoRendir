import express from "express";
import AgendaController from "../controllers/agendaController.js";

const router = express.Router();
router.get("/horarios/:id", AgendaController.horarios);

router.get("/horarios-libres/:id", AgendaController.horariosLibres);

router.get("/buscar", AgendaController.buscar);
router.get("/",       AgendaController.list);
router.get("/:id",    AgendaController.get);
router.post("/",      AgendaController.create);
router.put("/:id",    AgendaController.update);
router.delete("/:id", AgendaController.delete);

export default router;
