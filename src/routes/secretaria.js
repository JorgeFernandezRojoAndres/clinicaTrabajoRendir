import express from "express";
import { soloSecretaria } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Escritorio principal
router.get("/", soloSecretaria, (req, res) => {
    res.sendFile("escritoriosecretaria.html", { root: "views/secretaria" });
});

// Agenda
router.get("/agenda", soloSecretaria, (req, res) => {
    res.sendFile("agenda.html", { root: "views/secretaria" });
});

// Turnos
router.get("/turnos", soloSecretaria, (req, res) => {
    res.sendFile("turnos.html", { root: "views/secretaria" });
});

// Buscador
router.get("/buscador", soloSecretaria, (req, res) => {
    res.sendFile("buscador.html", { root: "views/secretaria" });
});

// Lista de espera
router.get("/lista-espera", soloSecretaria, (req, res) => {
    res.sendFile("listaEspera.html", { root: "views/secretaria" });
});

// Registrar Paciente
router.get("/registrar-paciente", soloSecretaria, (req, res) => {
    res.sendFile("registrarPaciente.html", { root: "views/secretaria" });
});

export default router;
