import Paciente from "../models/Paciente.js";

const PacienteController = {
    // Listar todos los pacientes
    async list(req, res) {
        try {
            const data = await Paciente.getAll();  // Obtiene todos los pacientes
            res.json(data);  // Devuelve los datos en formato JSON
        } catch (err) {
            res.status(500).json({ error: err.message });  // Maneja errores de la base de datos
        }
    },

    // Obtener un paciente por ID
    async get(req, res) {
        const id = req.params.id;  // Obtiene el id del paciente desde los parámetros de la URL
        try {
            const data = await Paciente.getById(id);  // Busca el paciente en la base de datos
            if (!data) {
                return res.status(404).json({ error: "Paciente no encontrado" });  // Si no existe, retorna 404
            }
            res.json(data);  // Devuelve los datos del paciente
        } catch (err) {
            res.status(500).json({ error: err.message });  // Maneja errores de la base de datos
        }
    },

    // Crear un nuevo paciente
    async create(req, res) {
        try {
            const id = await Paciente.create(req.body);  // Crea un nuevo paciente usando los datos del cuerpo de la solicitud
            res.status(201).json({ ok: true, id });  // Devuelve el id del nuevo paciente creado
        } catch (err) {
            res.status(500).json({ error: err.message });  // Maneja errores de la base de datos
        }
    },

    // Actualizar un paciente existente
    async update(req, res) {
        const id = req.params.id;  // Obtiene el id del paciente desde los parámetros de la URL
        try {
            await Paciente.update(id, req.body);  // Actualiza los datos del paciente en la base de datos
            res.json({ ok: true });  // Confirma que la actualización fue exitosa
        } catch (err) {
            res.status(500).json({ error: err.message });  // Maneja errores de la base de datos
        }
    },

    // Eliminar un paciente
    async delete(req, res) {
        const id = req.params.id;  // Obtiene el id del paciente desde los parámetros de la URL
        try {
            await Paciente.delete(id);  // Elimina el paciente de la base de datos
            res.json({ ok: true });  // Confirma que el paciente fue eliminado
        } catch (err) {
            res.status(500).json({ error: err.message });  // Maneja errores de la base de datos
        }
    },

    // Datos del paciente logueado
    async getMe(req, res) {
        try {
            const pacienteId = req.session?.user?.id;
            if (!pacienteId) {
                return res.status(401).json({ ok: false, error: "Paciente no autenticado" });
            }
            const data = await Paciente.getById(pacienteId);
            if (!data) return res.status(404).json({ ok: false, error: "Paciente no encontrado" });
            return res.json({ ok: true, paciente: data });
        } catch (err) {
            return res.status(500).json({ ok: false, error: err.message });
        }
    }
};

export default PacienteController;
