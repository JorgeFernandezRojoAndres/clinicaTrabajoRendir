import Atencion from "../models/Atencion.js";  
import Diagnostico from "../models/Diagnostico.js";
import Alergia from "../models/Alergia.js";
import Antecedente from "../models/Antecedente.js";
import Habito from "../models/Habito.js";
import MedicamentoUso from "../models/MedicamentoUso.js";

import { db } from "../config/db.js";

const AtencionController = {

    // ======================================================
    // 🔥 OBTENER ATENCIÓN COMPLETA POR ID DE TURNO
    // ======================================================
    async getForTurno(req, res) {
        try {
            const idTurno = req.params.turnoId;

            const [turnoRows] = await db.query(`
                SELECT 
                    t.id AS turnoId,
                    t.motivo AS motivoTurno,
                    t.estado,
                    p.id AS pacienteId,
                    p.nombreCompleto AS pacienteNombre,
                    p.dni,
                    p.genero,
                    p.fechaNacimiento,
                    ha.fechaHora
                FROM turno t
                JOIN paciente p ON p.id = t.pacienteId
                JOIN horario_agenda ha ON ha.id = t.horarioAgendaId
                WHERE t.id = ?
            `, [idTurno]);

            if (turnoRows.length === 0) {
                return res.status(404).json({ ok: false, error: "Turno no encontrado" });
            }

            const turno = turnoRows[0];

            // Buscar atención existente o crearla
            const [atRows] = await db.query(`
                SELECT * FROM atencion WHERE turnoId = ?
            `, [idTurno]);

            let atencionId;

            if (atRows.length > 0) {
                atencionId = atRows[0].id;

            } else {
                // Crear historia clínica si no existe
                const [hcRows] = await db.query(`
                    SELECT id FROM historia_clinica WHERE pacienteId = ?
                `, [turno.pacienteId]);

                let historiaClinicaId;

                if (hcRows.length > 0) {
                    historiaClinicaId = hcRows[0].id;
                } else {
                    const [newHC] = await db.query(`
                        INSERT INTO historia_clinica (pacienteId)
                        VALUES (?)
                    `, [turno.pacienteId]);
                    historiaClinicaId = newHC.insertId;
                }

                // Crear atención
                const [result] = await db.query(`
                    INSERT INTO atencion (turnoId, historiaClinicaId, profesionalId, fecha)
                    VALUES (?, ?, ?, NOW())
                `, [
                    idTurno,
                    historiaClinicaId,
                    req.session.user.id
                ]);

                atencionId = result.insertId;
            }

            // Cargar historia clínica por atención
            const alergias = await Alergia.getByAtencionId(atencionId);
            const antecedentes = await Antecedente.getByAtencionId(atencionId);
            const habitos = await Habito.getByAtencionId(atencionId);
            const medicamentos = await MedicamentoUso.getByAtencionId(atencionId);
            const diagnosticos = await Diagnostico.getByAtencion(atencionId);

            return res.json({
                ok: true,
                atencionId,
                turno,
                historiaClinica: {
                    alergias,
                    antecedentes,
                    habitos,
                    medicamentos
                },
                diagnosticos
            });

        } catch (err) {
            console.error("❌ Error en getForTurno:", err);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    // ======================================================
    // 🔥 UPDATE EVOLUCIÓN
    // ======================================================
    async update(req, res) {
        try {
            const idAtencion = req.params.id;
            const { evolucion } = req.body;

            await db.query(`
                UPDATE atencion 
                SET evolucion = ?
                WHERE id = ?
            `, [evolucion, idAtencion]);

            return res.json({ ok: true });

        } catch (err) {
            console.error("Error actualizando atención:", err);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    // ======================================================
    // 🔥 GET HISTORIA CLÍNICA
    // ======================================================
    async alergias(req, res) {
        const data = await Alergia.getByAtencionId(req.params.id);
        return res.json({ ok: true, alergias: data });
    },

    async antecedentes(req, res) {
        const data = await Antecedente.getByAtencionId(req.params.id);
        return res.json({ ok: true, antecedentes: data });
    },

    async habitos(req, res) {
        const data = await Habito.getByAtencionId(req.params.id);
        return res.json({ ok: true, habitos: data });
    },

    async medicamentos(req, res) {
        const data = await MedicamentoUso.getByAtencionId(req.params.id);
        return res.json({ ok: true, medicamentos: data });
    },

    // ======================================================
    // 🔥 POST — AGREGAR ALERGIAS / ANTECEDENTES / HÁBITOS / MEDICACIÓN
    // ======================================================

    async addAlergia(req, res) {
        try {
            const atencionId = req.params.id;
            const { descripcion } = req.body;

            await db.query(`
                INSERT INTO alergia (atencionId, descripcion)
                VALUES (?, ?)
            `, [atencionId, descripcion]);

            return res.json({ ok: true, mensaje: "Alergia agregada." });

        } catch (err) {
            console.error("❌ Error agregando alergia:", err);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    async addAntecedente(req, res) {
        try {
            const atencionId = req.params.id;
            const { descripcion } = req.body;

            await db.query(`
                INSERT INTO antecedente (atencionId, descripcion)
                VALUES (?, ?)
            `, [atencionId, descripcion]);

            return res.json({ ok: true, mensaje: "Antecedente agregado." });

        } catch (err) {
            console.error("❌ Error agregando antecedente:", err);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    async addHabito(req, res) {
        try {
            const atencionId = req.params.id;
            const { descripcion } = req.body;

            await db.query(`
                INSERT INTO habito (atencionId, descripcion)
                VALUES (?, ?)
            `, [atencionId, descripcion]);

            return res.json({ ok: true, mensaje: "Hábito agregado." });

        } catch (err) {
            console.error("❌ Error agregando hábito:", err);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    },
    // ======================================================
// Métodos vacíos para evitar errores de rutas
// (Por ahora no se usan pero deben existir)
// ======================================================
async get(req, res) {
    return res.json({ ok: false, error: "Método no implementado." });
},

async create(req, res) {
    return res.json({ ok: false, error: "Método no implementado." });
},

async delete(req, res) {
    return res.json({ ok: false, error: "Método no implementado." });
},

    async addMedicamentoUso(req, res) {
        try {
            const atencionId = req.params.id;
            const { descripcion } = req.body;

            await db.query(`
                INSERT INTO medicamento_uso (atencionId, descripcion)
                VALUES (?, ?)
            `, [atencionId, descripcion]);

            return res.json({ ok: true, mensaje: "Medicamento agregado." });

        } catch (err) {
            console.error("❌ Error agregando medicamento:", err);
            return res.status(500).json({ ok: false, error: "Error interno" });
        }
    }

};

export default AtencionController;
