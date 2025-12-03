import { Router } from "express";
import EspecialidadController from "../controllers/especialidadController.js";
import { requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

/* ======================================================
   📌 RUTAS DEL CRUD DE ESPECIALIDADES (API)
   Protegidas para ADMIN
====================================================== */

// Obtener todas
router.get(
    "/", 
    requireRole("admin"),
    EspecialidadController.listar
);

// Crear nueva especialidad
router.post(
    "/", 
    requireRole("admin"),
    EspecialidadController.crear
);

// Actualizar especialidad
router.put(
    "/:id",
    requireRole("admin"),
    EspecialidadController.actualizar
);

// Eliminar especialidad
router.delete(
    "/:id",
    requireRole("admin"),
    EspecialidadController.eliminar
);

export default router;
