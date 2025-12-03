import express from "express";
import ProfesionalController from "../controllers/profesionalController.js";

const router = express.Router();

/**
 * -----------------------------------------------------
 * 📌 ORDEN CORRECTO PARA EVITAR CONFLICTO CON "/:id"
 * -----------------------------------------------------
 * Primero rutas específicas
 * Luego rutas dinámicas
 * -----------------------------------------------------
 */

// =====================================================
// 📌 SOLO MÉDICOS (con especialidad asignada)
// =====================================================
router.get("/medicos", ProfesionalController.medicos);

// =====================================================
// 📌 ESPECIALIDADES ÚNICAS (para el modal del calendario)
// =====================================================
router.get("/especialidades", ProfesionalController.especialidades);

// =====================================================
// 📌 MÉDICOS POR ESPECIALIDAD
// =====================================================
router.get("/por-especialidad/:id", ProfesionalController.medicosPorEspecialidad);

// =====================================================
// 📌 LISTAR TODOS
// =====================================================
router.get("/", ProfesionalController.list);

// =====================================================
// 📌 ESPECIALIDADES DEL PROFESIONAL (NUEVO ENDPOINT)
// =====================================================
router.get("/:id/especialidades", ProfesionalController.especialidadesProfesional);

// =====================================================
// 📌 OBTENER PROFESIONAL POR ID  (🔥 SIEMPRE ÚLTIMA)
// =====================================================
router.get("/:id", ProfesionalController.get);

// =====================================================
// 📌 CREAR PROFESIONAL
// =====================================================
router.post("/", ProfesionalController.create);

// =====================================================
// 📌 ACTUALIZAR PROFESIONAL
// =====================================================
router.put("/:id", ProfesionalController.update);

// =====================================================
// 📌 ELIMINAR PROFESIONAL
// =====================================================
router.delete("/:id", ProfesionalController.delete);

export default router;
