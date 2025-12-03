import Agenda from "../models/Agenda.js";

const AgendaController = {

    async list(req, res) {
        try {
            const data = await Agenda.getAll();
            res.json(data);
        } catch (err) {
            console.error("Error listando agendas:", err);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    async get(req, res) {
        try {
            const id = req.params.id;
            const data = await Agenda.getById(id);

            if (!data) return res.status(404).json({ error: "Agenda no existe" });

            res.json(data);
        } catch (err) {
            console.error("Error obteniendo agenda:", err);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },
async horariosLibres(req, res) {
try {
    const id = req.params.id;
    const data = await Agenda.getHorariosLibres(id);
    res.json(data);
} catch (err) {
    console.error("Error obteniendo horarios:", err);
    res.status(500).json({ error: err.message });
}
},
// =======================================================
// 📌 OBTENER TODOS LOS HORARIOS DE UNA AGENDA (libres + reservados)
//      GET /agenda/horarios/:id
// =======================================================
async horarios(req, res) {
    try {
        const id = req.params.id;
        const data = await Agenda.getHorarios(id);

        res.json(data);

    } catch (err) {
        console.error("Error obteniendo horarios:", err);
        res.status(500).json({ error: err.message });
    }
},


// =======================================================
// 📌 BUSCAR AGENDA POR MÉDICO + ESPECIALIDAD
//     GET /agenda/buscar?medicoId=XX&especialidadId=YY
// =======================================================
async buscar(req, res) {
        try {
            const { medicoId, especialidadId } = req.query;

            if (!medicoId || !especialidadId) {
                return res.status(400).json({ ok: false, error: "Faltan parámetros" });
            }

            // Paso 1: obtener profesionalEspecialidadId:
            const profesionalEspecialidad = await Agenda.obtenerPE(
                medicoId,
                especialidadId
            );

            if (!profesionalEspecialidad) {
                return res.json([]); // No tiene agenda
            }

            // Paso 2: obtener agenda real
            const agendas = await Agenda.getByProfesionalEspecialidadId(
                profesionalEspecialidad.id
            );

            res.json(agendas);

        } catch (err) {
            console.error("Error buscando agenda:", err);
            res.status(500).json({ ok: false, error: "Error interno del servidor" });
        }
    },

  async create(req, res) {
    try {
        console.log("🔥 Datos recibidos en create:", req.body); // Debug

        const id = await Agenda.create(req.body);
        res.json({ ok: true, id });

    } catch (err) {
        console.error("Error creando agenda:", err);
        res.status(500).json({ error: err.message });
    }
  },

    async update(req, res) {
        try {
            const id = req.params.id;
            await Agenda.update(id, req.body);
            res.json({ ok: true });
        } catch (err) {
            console.error("Error actualizando agenda:", err);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            await Agenda.delete(id);
            res.json({ ok: true });
        } catch (err) {
            console.error("Error eliminando agenda:", err);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
};

export default AgendaController;
