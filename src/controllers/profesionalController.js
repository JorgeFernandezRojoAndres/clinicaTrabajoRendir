import Profesional from "../models/Profesional.js";
import ProfesionalEspecialidad from "../models/ProfesionalEspecialidad.js";

const ProfesionalController = {

    // ======================================================
    // 📌 LISTAR TODOS
    // ======================================================
    async list(req, res) {
        try {
            const data = await Profesional.getAll();
            res.json(data);
        } catch (err) {
            console.error("Error listando profesionales:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    // ======================================================
    // 📌 OBTENER POR ID
    // ======================================================
    async get(req, res) {
        try {
            const id = req.params.id;
            const data = await Profesional.getById(id);

            if (!data) {
                return res.status(404).json({ ok: false, error: "No encontrado" });
            }

            res.json(data);

        } catch (err) {
            console.error("Error obteniendo profesional:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    // ======================================================
    // 📌 CREAR PROFESIONAL
    // ======================================================
    async create(req, res) {
        try {
            const { nombre, usuario, password, especialidades } = req.body;

            if (!nombre || !usuario || !password) {
                return res.status(400).json({
                    ok: false,
                    error: "Faltan datos obligatorios"
                });
            }

            // 1️⃣ Crear profesional
            const profesionalId = await Profesional.create({
                nombre,
                usuario,
                password,
                rol: "profesional"
            });

            // 2️⃣ Guardar especialidades (si vinieron)
            if (Array.isArray(especialidades) && especialidades.length > 0) {
                for (const espId of especialidades) {
                    await ProfesionalEspecialidad.create({
                        profesionalId,
                        especialidadId: espId
                    });
                }
            }

            res.json({ ok: true, id: profesionalId });

        } catch (err) {
            console.error("Error creando profesional:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    // ======================================================
    // 📌 ACTUALIZAR
    // ======================================================
    async update(req, res) {
        try {
            const id = req.params.id;

            const { especialidades, ...data } = req.body;

            await Profesional.update(id, data);

            if (Array.isArray(especialidades)) {
                // No borramos las relaciones existentes para no romper FKs con agenda.
                // Solo agregamos las nuevas que falten.
                const actuales = await Profesional.getEspecialidadesProfesional(id);
                const actualesIds = actuales.map(e => Number(e.especialidadId));
                const nuevas = especialidades.map(e => Number(e));

                for (const espId of nuevas) {
                    if (!actualesIds.includes(Number(espId))) {
                        await ProfesionalEspecialidad.create({
                            profesionalId: id,
                            especialidadId: espId
                        });
                    }
                }
            }

            res.json({ ok: true });

        } catch (err) {
            console.error("Error actualizando profesional:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    // ======================================================
    // 📌 ELIMINAR
    // ======================================================
    async delete(req, res) {
        try {
            const id = req.params.id;

            await Profesional.delete(id);

            res.json({ ok: true });

        } catch (err) {
            console.error("Error eliminando profesional:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    // ======================================================
    // 📌 LISTAR SOLO MÉDICOS (Tienen especialidad real)
    // ======================================================
    async medicos(req, res) {
        try {
            // 🔥 Usa directamente la consulta optimizada del modelo
            const data = await Profesional.getMedicos();

            res.json(data);

        } catch (err) {
            console.error("Error listando médicos:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    },
    // ======================================================
    // 📌 ESPECIALIDADES DEL PROFESIONAL (nuevo)
    // ======================================================
    async especialidadesProfesional(req, res) {
        try {
            const { id } = req.params;

            const data = await Profesional.getEspecialidadesProfesional(id);

            res.json(data);

        } catch (err) {
            console.error("Error obteniendo especialidades del profesional:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    },
    // ======================================================
    // 📌 MÉDICOS POR ESPECIALIDAD
    // ======================================================
    async medicosPorEspecialidad(req, res) {
        try {
            const { id } = req.params;

            // método que deberás tener en Profesional.js
            const data = await Profesional.getMedicosPorEspecialidad(id);

            res.json(data);

        } catch (err) {
            console.error("Error obteniendo médicos por especialidad:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    },

    async especialidades(req, res) {
        try {
            const data = await ProfesionalEspecialidad.getUniqueSpecialties();
            res.json(data);
        } catch (err) {
            console.error("Error obteniendo especialidades:", err);
            res.status(500).json({ ok: false, error: "Error interno" });
        }
    }


};

export default ProfesionalController;
