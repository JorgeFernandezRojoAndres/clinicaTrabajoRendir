import Turno from "../models/Turno.js";
import Sobreturno from "../models/Sobreturno.js";
import HorarioAgenda from "../models/HorarioAgenda.js"; // Necesario para buscar horarios
import Agenda from "../models/Agenda.js";
import ProfesionalEspecialidad from "../models/ProfesionalEspecialidad.js";
import { db } from "../config/db.js";
import { esFeriado } from "../utils/fecha.js";

const TurnoController = {

    // 1. LISTAR TODOS LOS TURNOS
    async list(req, res) {
        try {
            const data = await Turno.getAll();
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 2. OBTENER UN TURNO POR ID
    async get(req, res) {
        const id = req.params.id;
        try {
            const data = await Turno.getById(id);
            if (!data) return res.status(404).json({ error: "Turno no encontrado" });
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 3. CREAR UN NUEVO TURNO (normal)
    async create(req, res) {
        try {
            const turnoData = req.body;
            const nuevoTurno = await Turno.create(turnoData);
            res.json({ ok: true, id: nuevoTurno.id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 🔥 3b. CREAR TURNO DESDE EL CALENDARIO (NORMAL + SOBRETURNO)
    async crearDesdeCalendario(req, res) {
        try {
            console.log("📥 BODY RECIBIDO:", req.body);

            const {
                especialidadId,
                medicoId,
                agendaId,
                horarioAgendaId,
                pacienteId,
                motivo,
                tipoTurno,
                fecha
            } = req.body;

            // ================================
            // VALIDACIÓN GENERAL
            // ================================
            if (!especialidadId || !medicoId || !agendaId || !pacienteId || !tipoTurno) {
                return res.status(400).json({ error: "Faltan datos obligatorios" });
            }

            if (tipoTurno === "normal" && !horarioAgendaId) {
                return res.status(400).json({ error: "Debe seleccionar un horario" });
            }

            // ================================
            // 1️⃣ VALIDAR AGENDA
            // ================================
            const agenda = await Agenda.getById(agendaId);
            if (!agenda) return res.status(400).json({ error: "La agenda no existe" });

            const pe = await ProfesionalEspecialidad.getById(agenda.profesionalEspecialidadId);
            if (!pe) return res.status(400).json({ error: "No existe la relación profesional/especialidad" });

            if (pe.profesionalId !== Number(medicoId) || pe.especialidadId !== Number(especialidadId)) {
                return res.status(400).json({ error: "La agenda no coincide con el médico/especialidad" });
            }

            const profesionalIdReal = pe.profesionalId;
            const especialidadIdReal = pe.especialidadId;

            // ================================
            // 2️⃣ VALIDAR HORARIO (solo si existe)
            // ================================
            let horario = null;

            if (horarioAgendaId) {
                horario = await HorarioAgenda.getById(horarioAgendaId);
                if (!horario) return res.status(400).json({ error: "El horario no existe" });

                if (horario.agendaId !== Number(agendaId)) {
                    return res.status(400).json({ error: "Ese horario no pertenece a la agenda" });
                }
            }

            // ================================
            // LOGICAS SEGÚN TIPO
            // ================================

            // -----------  NORMAL  -----------
            if (tipoTurno === "normal") {

                if (horario.estado.toLowerCase() !== "libre") {
                    return res.status(400).json({ error: "Ese horario ya no está disponible" });
                }

                if (await Turno.existeTurnoPaciente(horarioAgendaId, pacienteId)) {
                    return res.status(400).json({ error: "El paciente ya tiene un turno en ese horario" });
                }

                if (await Sobreturno.existeSobreturnoPaciente(horarioAgendaId, pacienteId)) {
                    return res.status(400).json({ error: "El paciente ya tiene un sobreturno en ese horario" });
                }

                const nuevoTurno = await Turno.create({
                    horarioAgendaId,
                    pacienteId,
                    motivo: motivo || "",
                    estado: "reservado"
                });

                await HorarioAgenda.update(horarioAgendaId, { estado: "reservado" });

                return res.json({ ok: true, id: nuevoTurno.id });
            }

            // -----------  SOBRETURNO  -----------
                if (tipoTurno === "sobreturno") {

                    // ============================
                    // CASO 1: Sobreturno CON horario base
                    // ============================
                    if (horarioAgendaId) {

                    if (await Turno.existeTurnoPaciente(horarioAgendaId, pacienteId)) {
                        return res.status(400).json({ error: "Ya tiene un turno normal en ese horario" });
                    }

                    if (await Sobreturno.existeSobreturnoPaciente(horarioAgendaId, pacienteId)) {
                        return res.status(400).json({ error: "Ya tiene un sobreturno en ese horario" });
                    }

                        const nuevoSobre = await Sobreturno.create({
                            pacienteId,
                            motivo: motivo || "",
                            profesionalId: profesionalIdReal,
                            especialidadId: especialidadIdReal
                        });

                        return res.json({ ok: true, idSobreturno: nuevoSobre });
                    }

                    // ============================
                    // CASO 2: Sobreturno SIN horario base
                    // ============================
                const fechaHoraFake = `${fecha}T23:59:00`;

                    const nuevoSobre = await Sobreturno.create({
                        pacienteId,
                        motivo: motivo || "",
                        fechaHoraManual: fechaHoraFake,
                        profesionalId: profesionalIdReal,
                        especialidadId: especialidadIdReal
                    });

                return res.json({
                    ok: true,
                    idSobreturno: nuevoSobre,
                    fechaHora: fechaHoraFake,
                    tipoTurno: "sobreturno"
                });
            }

            return res.status(400).json({ error: "Tipo de turno inválido" });

        } catch (err) {
            console.error("❌ Error crearDesdeCalendario:", err);
            return res.status(500).json({ error: err.message });
        }
    }
    ,
    // 4. ACTUALIZAR UN TURNO
    async update(req, res) {
        const id = req.params.id;
        try {
            const turnoData = req.body;
            const turnoExistente = await Turno.getById(id);

            if (!turnoExistente)
                return res.status(404).json({ error: "Turno no encontrado" });

            await Turno.update(id, turnoData);
            res.json({ ok: true });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 5. ELIMINAR UN TURNO
    async delete(req, res) {
        const id = req.params.id;
        try {
            const turnoExistente = await Turno.getById(id);

            if (!turnoExistente)
                return res.status(404).json({ error: "Turno no encontrado" });

            await Turno.delete(id);
            res.json({ ok: true });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 6. CREAR SOBRETURNO
    async crearSobreturno(req, res) {
        try {
            const sobreturnoData = req.body;
            const nuevoSobreturno = await Sobreturno.create(sobreturnoData);
            res.json({ ok: true, id: nuevoSobreturno.id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    

// ===========================================================
// 📌 TURNOS DEL PROFESIONAL (por fecha) + AUTO-ATENDIDOS
// GET /turnos/profesional?fecha=YYYY-MM-DD
// ===========================================================
async profesionalDelDia(req, res) { 
    try {
        const fecha = req.query.fecha;
        const profesionalId = req.session.user.id; 

        if (!fecha) {
            return res.status(400).json({ ok: false, error: "Falta la fecha" });
        }

        // ----------------------------------------------------
        // 1) MARCAR TURNOS COMO ATENDIDOS SI LA FECHA YA PASÓ
        // ----------------------------------------------------
        const hoy = new Date().toISOString().split("T")[0];

        if (fecha < hoy) {
            await db.query(`
                UPDATE turno t
                JOIN horario_agenda ha ON ha.id = t.horarioAgendaId
                JOIN agenda a ON a.id = ha.agendaId
                JOIN profesional_especialidad pe ON pe.id = a.profesionalEspecialidadId
                SET t.estado = 'ATENDIDO'
                WHERE pe.profesionalId = ?
                AND DATE(ha.fechaHora) = ?
                AND t.estado NOT IN ('ATENDIDO', 'CANCELADO');
            `, [profesionalId, fecha]);
        }

        // ----------------------------------------------------
        // 2) OBTENER TURNOS DEL PROFESIONAL (YA ACTUALIZADOS)
        // ----------------------------------------------------
            const [rows] = await db.query(`
            SELECT 
                t.id,
                t.pacienteId AS id_paciente,
                p.nombreCompleto AS paciente,
                DATE_FORMAT(ha.fechaHora, '%H:%i') AS hora,
                t.estado
            FROM turno t
            JOIN paciente p ON p.id = t.pacienteId
            JOIN horario_agenda ha ON ha.id = t.horarioAgendaId
            JOIN agenda a ON a.id = ha.agendaId
            JOIN profesional_especialidad pe ON pe.id = a.profesionalEspecialidadId
            WHERE pe.profesionalId = ?
            AND DATE(ha.fechaHora) = ?
            ORDER BY ha.fechaHora ASC
        `, [profesionalId, fecha]);

        // ------------------------------------------------------------------
        // SOBRETURNO del profesional en esa fecha (con o sin horario base)
        // ------------------------------------------------------------------
        const [sobreRows] = await db.query(`
            SELECT 
                st.id,
                st.pacienteId AS id_paciente,
                p.nombreCompleto AS paciente,
                COALESCE(
                    DATE_FORMAT(ha.fechaHora, '%H:%i'),
                    DATE_FORMAT(st.fechaHoraManual, '%H:%i')
                ) AS hora,
                'SOBRETURNO' AS estado
            FROM sobreturno st
            JOIN paciente p ON p.id = st.pacienteId
            LEFT JOIN horario_agenda ha ON ha.id = st.horarioAgendaId
            LEFT JOIN agenda a ON a.id = ha.agendaId
            LEFT JOIN profesional_especialidad pe ON pe.id = a.profesionalEspecialidadId
            WHERE
                (COALESCE(pe.profesionalId, st.profesionalId) = ?)
                AND DATE(COALESCE(ha.fechaHora, st.fechaHoraManual)) = ?
            ORDER BY hora ASC
        `, [profesionalId, fecha]);

        const turnosConSobre = [
            ...rows,
            ...sobreRows
        ];

        return res.json({ ok: true, turnos: turnosConSobre });

    } catch (err) {
        console.error("Error en profesionalDelDia:", err);
        res.status(500).json({ ok: false, error: "Error interno" });
    }
    },
    // ===========================================================
    // 📌 TURNOS DEL PACIENTE (sesión paciente)
    // GET /turnos/paciente
    // ===========================================================
    async pacienteMisTurnos(req, res) {
        try {
            const pacienteId = req.session?.user?.id;
            if (!pacienteId) {
                return res.status(401).json({ ok: false, error: "Paciente no autenticado" });
            }

            // Turnos normales del paciente
            const [turnos] = await db.query(`
                SELECT 
                    t.id,
                    t.motivo,
                    t.estado,
                    ha.fechaHora AS fechaHora,
                    DATE_ADD(ha.fechaHora, INTERVAL a.intervaloMin MINUTE) AS fechaHoraFin,
                    pr.nombre AS medicoNombre,
                    esp.nombre AS especialidadNombre,
                    'normal' AS tipoTurno
                FROM TURNO t
                JOIN horario_agenda ha ON ha.id = t.horarioAgendaId
                JOIN agenda a ON a.id = ha.agendaId
                JOIN profesional_especialidad pe ON pe.id = a.profesionalEspecialidadId
                JOIN profesional pr ON pr.id = pe.profesionalId
                JOIN especialidad esp ON esp.id = pe.especialidadId
                WHERE t.pacienteId = ?
            `, [pacienteId]);

            // Sobreturnos del paciente
            const [sobreturnos] = await db.query(`
                SELECT 
                    s.id,
                    s.motivo,
                    'SOBRETURNO' AS estado,
                    s.fechaHoraManual AS fechaHora,
                    DATE_ADD(s.fechaHoraManual, INTERVAL 1 MINUTE) AS fechaHoraFin,
                    pr.nombre AS medicoNombre,
                    esp.nombre AS especialidadNombre,
                    'sobreturno' AS tipoTurno
                FROM SOBRETURNO s
                LEFT JOIN profesional pr ON pr.id = s.profesionalId
                LEFT JOIN especialidad esp ON esp.id = s.especialidadId
                WHERE s.pacienteId = ?
            `, [pacienteId]);

            const todos = [...turnos, ...sobreturnos].sort((a, b) => {
                return new Date(a.fechaHora) - new Date(b.fechaHora);
            });

            return res.json({ ok: true, turnos: todos });

        } catch (err) {
            console.error("Error en pacienteMisTurnos:", err);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    // ===========================================================
    // 📌 INICIAR / CONTINUAR CONSULTA
    // PUT /turnos/iniciar/:id
    // ===========================================================
async iniciarConsulta(req, res) {
    try {
        const id = req.params.id;

        // Obtener estado actual
        const [t] = await db.query(
            "SELECT estado FROM turno WHERE id = ?",
            [id]
        );

        if (!t[0]) {
            return res.status(404).json({ ok: false, error: "Turno no encontrado" });
        }

        const estadoActual = t[0].estado;

        // Si ya está atendido no se puede tocar
        if (estadoActual === "ATENDIDO") {
            return res.status(400).json({ ok: false, error: "El turno ya fue atendido" });
        }

        // Si está reservado o confirmado → pasa a EN CONSULTA
        // Si ya está en consulta → no se cambia
        const nuevoEstado = "EN CONSULTA";

        await db.query(
            "UPDATE turno SET estado = ? WHERE id = ?",
            [nuevoEstado, id]
        );

        return res.json({ ok: true });

    } catch (err) {
        console.error("Error en iniciarConsulta:", err);
        res.status(500).json({ ok: false, error: "Error interno" });
    }
}
    ,

    // ===========================================================
// 📌 FINALIZAR CONSULTA
// PUT /turnos/finalizar/:id
// ===========================================================
async finalizarConsulta(req, res) {
    try {
        const id = req.params.id;

        // Buscar turno real
        const [turnoRows] = await db.query(
            "SELECT estado FROM turno WHERE id = ?",
            [id]
        );

        if (!turnoRows[0]) {
            return res.status(404).json({ ok: false, error: "Turno no encontrado" });
        }

        const estadoActual = turnoRows[0].estado;

        if (estadoActual !== "EN CONSULTA") {
            return res.status(400).json({ ok: false, error: "El turno no está en consulta" });
        }

        // Marcar finalizado
        await db.query(
            "UPDATE turno SET estado = 'ATENDIDO', fechaFin = NOW() WHERE id = ?",
            [id]
        );

        return res.json({ ok: true, message: "Consulta finalizada" });

    } catch (err) {
        console.error("Error finalizando consulta:", err);
        return res.status(500).json({ ok: false, error: "Error interno" });
    }
},

    // --------------------------------------------------------
    // NUEVO ENDPOINT: tipos de turno según fecha seleccionada
    // --------------------------------------------------------
    async tipos(req, res) {
        try {
            const { fecha } = req.query;

            if (!fecha) {
                return res.status(400).json({ error: "Falta la fecha" });
            }

            // fecha viene tipo "2025-12-08T00:00:00"
            const soloFecha = fecha.split("T")[0];

            // 🔥 si es feriado → no se permiten turnos
            if (await esFeriado(soloFecha)) {
                return res.json({ tipos: [] });
            }

            // 🔥 día normal → normal y sobreturno
            return res.json({ tipos: ["normal", "sobreturno"] });

        } catch (err) {
            console.error("Error en tipos-turno:", err);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    // 7. FILTRAR TURNOS (secretaría)
    async filtrar(req, res) {
        try {
            const { medico, especialidad, estado } = req.query;

            // ------------------------------------------------------------------
            // 1) TURNOS (NORMALES + SOBRETURNOS) DESDE EL MODELO
            // ------------------------------------------------------------------
            const resultados = await Turno.filtrar(medico, especialidad, estado);

            const eventos = resultados
                .map(t => {
                    const start = t.fechaHora;
                    const end = t.fechaHoraFin || null;
                    if (!start) return null;
                    return {
                        id: `${t.tipoTurno === "sobreturno" ? "S" : "T"}-${t.id}`,
                        pacienteNombre: t.pacienteNombre,
                        start,
                        end: end || new Date(new Date(start).getTime() + 60000).toISOString(),
                        estado: t.estado,
                        motivo: t.motivo,
                        tipo: t.tipoTurno
                    };
                })
                .filter(Boolean);

            res.json(eventos);

        } catch (err) {
            console.error("❌ Error en filtrar:", err);
            res.status(500).json({ error: err.message });
        }
    }
    


};

export default TurnoController;
