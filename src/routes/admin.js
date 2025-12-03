import express from "express";   
import AdminController from "../controllers/adminController.js";
import { requireRole } from "../middlewares/authMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";

// Nuevo: controlador de días no laborables
import DiaNoLaborableController from "../controllers/diaNoLaborableController.js";

const router = express.Router();

// Necesario para rutas absolutas de vistas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = path.join(__dirname, "../../views/admin");

// =======================================================
// 🔍 PROTECCIÓN: evitar crash si el controller no exporta bien
// =======================================================
if (!AdminController || typeof AdminController.getDashboardData !== "function") {
    console.error("❌ ERROR: AdminController.getDashboardData no es una función.");
}

// =======================================================
// 📌 API: datos del dashboard (JSON)
// =======================================================
router.get(
    "/dashboard-data",
    requireRole("admin"),
    (req, res, next) => {
        if (!AdminController.getDashboardData) {
            return res.status(500).json({
                ok: false,
                error: "getDashboardData no está disponible"
            });
        }
        next();
    },
    AdminController.getDashboardData
);

// =======================================================
// 📌 VISTAS DEL ADMINISTRADOR
// =======================================================

// Dashboard principal
router.get("/", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(viewsPath, "dashboard.html"));
});

// Gestión de especialidades
router.get("/especialidades", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(viewsPath, "especialidades.html"));
});

// Configuración de agendas base
router.get("/agendas", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(viewsPath, "agendas.html"));
});

// Reportes
router.get("/reportes", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(viewsPath, "reportes.html"));
});

// =======================================================
// 📌 NUEVA VISTA: Pacientes pendientes de aprobación
// =======================================================
router.get("/lista-espera", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(viewsPath, "listaEsperaPacientes.html"));
});

// =======================================================
// 📌 API PACIENTES PENDIENTES
// =======================================================

// Listar pendientes
router.get(
    "/pacientes-pendientes",
    requireRole("admin"),
    AdminController.pacientesPendientes
);

// Aprobar paciente
router.put(
    "/pacientes-pendientes/:id/aprobar",
    requireRole("admin"),
    AdminController.aprobarPaciente
);

// Rechazar paciente
router.put(
    "/pacientes-pendientes/:id/rechazar",
    requireRole("admin"),
    AdminController.rechazarPaciente
);

// =======================================================
// 📌 NUEVA VISTA: Días NO laborables (FERIADOS)
// =======================================================

// Ruta principal del botón del menú:
router.get("/feriados", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(viewsPath, "feriados.html"));
});

// Por compatibilidad (si otro módulo la llama)
router.get("/dias-no-laborables", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(viewsPath, "feriados.html"));
});

// =======================================================
// 📌 API FERIADOS (CRUD)
// =======================================================

// Listar feriados
router.get(
    "/api/dias-no-laborables",
    requireRole("admin"),
    DiaNoLaborableController.listar   // ← CORREGIDO
);

// Crear feriado
router.post(
    "/api/dias-no-laborables",
    requireRole("admin"),
    DiaNoLaborableController.crear    // ← CORREGIDO
);

// Eliminar feriado
router.delete(
    "/api/dias-no-laborables/:id",
    requireRole("admin"),
    DiaNoLaborableController.eliminar // ← CORREGIDO
);

export default router;
