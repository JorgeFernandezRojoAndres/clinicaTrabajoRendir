import express from "express";
import TurnoController from "../controllers/turnoController.js";

const router = express.Router();

// =========================================================
// 📌 RUTAS ESPECÍFICAS — SIEMPRE ANTES DE "/:id"
// =========================================================

// FILTRO DE SECRETARÍA
router.get("/filtrar", TurnoController.filtrar);

// TIPOS DE TURNO SEGÚN FECHA
router.get("/tipos-turno", TurnoController.tipos);

// CREAR DESDE FULLCALENDAR
router.post("/crear-desde-calendario", TurnoController.crearDesdeCalendario);

// SOBRETURNO
router.post("/sobreturno", TurnoController.crearSobreturno);

// =========================================================
// 🔥 PROFESIONAL (DEBE IR ANTES DE "/:id")
// =========================================================

// Turnos del profesional según fecha  ✅ FIX
router.get("/profesional", TurnoController.profesionalDelDia);

// Iniciar / continuar consulta
router.put("/iniciar/:id", TurnoController.iniciarConsulta);
// 🔥 Finalizar consulta (NUEVA)
router.put("/finalizar/:id", TurnoController.finalizarConsulta);

// =========================================================
// 📌 RUTAS GENERALES DE TURNOS
// =========================================================

// Listar turnos
router.get("/", TurnoController.list);

// Crear turno normal
router.post("/", TurnoController.create);

// Obtener un turno por ID
router.get("/:id", TurnoController.get);

// Actualizar un turno
router.put("/:id", TurnoController.update);

// Eliminar un turno
router.delete("/:id", TurnoController.delete);

// =========================================================
// 🔥 ESTADOS SIMPLIFICADOS (USAN UPDATE)
// =========================================================

// Confirmar turno
router.put("/:id/confirmar", (req, res) => {
    req.body.estado = "confirmado";
    return TurnoController.update(req, res);
});

// Cancelar turno
router.put("/:id/cancelar", (req, res) => {
    req.body.estado = "cancelado";
    return TurnoController.update(req, res);
});

// Marcar presente
router.put("/:id/presente", (req, res) => {
    req.body.estado = "presente";
    return TurnoController.update(req, res);
});

export default router;
