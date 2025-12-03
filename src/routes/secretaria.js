import express from "express";
import { authSecretaria } from "../middleware/authMiddleware.js";

const router = express.Router();

// Escritorio principal
router.get("/", authSecretaria, (req, res) => {
    res.sendFile("escritoriosecretaria.html", { root: "views/secretaria" });
});

// Agenda
router.get("/agenda", authSecretaria, (req, res) => {
    res.sendFile("agenda.html", { root: "views/secretaria" });
});

// Turnos
router.get("/turnos", authSecretaria, (req, res) => {
    res.sendFile("turnos.html", { root: "views/secretaria" });
});

// Buscador
router.get("/buscador", authSecretaria, (req, res) => {
    res.sendFile("buscador.html", { root: "views/secretaria" });
});

// Lista de espera
router.get("/lista-espera", authSecretaria, (req, res) => {
    res.sendFile("listaEspera.html", { root: "views/secretaria" });
});

// Registrar Paciente
router.get("/registrar-paciente", authSecretaria, (req, res) => {
    res.sendFile("registrarPaciente.html", { root: "views/secretaria" });
});

export default router;
