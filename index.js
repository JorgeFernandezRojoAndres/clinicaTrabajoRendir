import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";

// 🔐 Middlewares correctos
import {
    requireLogin,
    requireRole,
    requireRoles
} from "./src/middlewares/authMiddleware.js";

// Rutas API
import authRoutes from "./src/routes/auth.js";
import pacientesRoutes from "./src/routes/pacientes.js";
import profesionalesRoutes from "./src/routes/profesionales.js";
import historiaRoutes from "./src/routes/historia.js";
import atencionRoutes from "./src/routes/atencion.js";
import agendaRoutes from "./src/routes/agenda.js";
import turnosRoutes from "./src/routes/turnos.js";
import diasNoLaborablesRoutes from "./src/routes/diaNoLaborable.js";
import especialidadRoutes from "./src/routes/especialidades.js";
import diagnosticosRoutes from "./src/routes/diagnosticos.js";
// ⭐ Rutas del Admin (API + Vistas)
import adminRoutes from "./src/routes/admin.js";
import proHistoriaRoutes from "./src/routes/pro-historia.js";

// Necesario en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --------------------------------------------------
// CONFIGURACIÓN GENERAL
// --------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 🔥 Inyectar DB en req antes de TODAS las rutas
import { db } from "./src/config/db.js";

app.use((req, res, next) => {
    req.db = db;
    next();
});
app.use(cookieParser());

app.use(
    session({
        secret: "clinica-lab2-secret",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 horas
    })
);

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// --------------------------------------------------
// CONFIGURACIÓN DE EJS
// --------------------------------------------------
app.set("view engine", "ejs"); // Usar EJS como motor de plantillas
app.set("views", path.join(__dirname, "views")); // Directorio de vistas

// --------------------------------------------------
// RUTAS API (PROTEGIDAS POR ROL)
// --------------------------------------------------

// 🔹 Auth (pública)
app.use("/auth", authRoutes);

// 🔹 API del Dashboard Admin (solo admin)
app.use("/admin-panel", requireRole("admin"), adminRoutes);
app.use("/api/especialidades", requireRole("admin"), especialidadRoutes);
// Rutas públicas (consulta de feriado)
app.use("/api/feriados", diasNoLaborablesRoutes);

// Vista HTML de profesionales (solo admin)
app.get("/admin-panel/profesionales", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/admin/profesionales.html"));
});
app.get("/admin-panel/pacientes", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/admin/pacientes.html"));
});
app.get("/admin-panel/reportes", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/admin/reportes.html"));
});
app.get("/admin-panel/especialidades", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/admin/especialidades.html"));
});
app.get("/admin-panel/agendas", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/admin/agendas.html"));
});
app.get("/admin-panel/lista-espera", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/admin/listaEsperaPacientes.html"));
});
app.get(
    "/admin-panel/feriados",
    requireRole("admin"),
    (req, res) => {
        res.sendFile(path.join(__dirname, "views/admin/feriados.html"));
    }
);

// 🔹 Pacientes → Solo SECRETARIA
app.use("/pacientes", requireRoles(["secretaria", "admin"]), pacientesRoutes);

// 🔹 Profesionales → Solo ADMIN
app.use("/profesionales", requireRoles(["admin", "secretaria"]), profesionalesRoutes);
app.use("/pro-historia", requireRole("profesional"), proHistoriaRoutes);

// 🔹 Historia Clínica → Solo PROFESIONAL
app.use("/historia", requireRole("profesional"), historiaRoutes);

// 🔹 Atención Médica → Solo PROFESIONAL
app.use("/atencion", requireRole("profesional"), atencionRoutes);

// 🔹 Diagnósticos → Solo PROFESIONAL
app.use("/diagnosticos", requireRole("profesional"), diagnosticosRoutes);

// 🔹 Agenda → SECRETARIA o PROFESIONAL
app.use("/agenda", requireRoles(["secretaria", "profesional", "admin"]), agendaRoutes);

// 🔹 Turnos → SECRETARIA o PROFESIONAL
app.use("/turnos", requireRoles(["secretaria", "profesional"]), turnosRoutes);
app.use("/api/feriados", diasNoLaborablesRoutes);

// --------------------------------------------------
// RUTAS HTML (VISTAS)
// --------------------------------------------------

// Login
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views/login.html"));
});

// Panel Profesional
app.get("/pro-panel", requireRole("profesional"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/profesional/misTurnos.html"));
});

// Vista de Atención Médica del Profesional
app.get("/pro-atencion/:turnoId", requireRole("profesional"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/profesional/atencion.html"));
});
// Panel Paciente
app.get("/pac-panel", requireRole("paciente"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/paciente/misTurnos.html"));
});

// Panel Admin (dashboard principal)
app.get("/admin-panel", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/admin/dashboard.html"));
});

// Panel Secretaría
app.get("/sec-panel", requireRole("secretaria"), (req, res) => {
    res.sendFile(path.join(__dirname, "views/secretaria/agenda.html"));
});

// --------------------------------------------------
// INICIAR SERVIDOR
// --------------------------------------------------
const PORT = 3000;
app.listen(PORT, () =>
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
);
