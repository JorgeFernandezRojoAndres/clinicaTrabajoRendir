import { db } from "../config/db.js";

const ListaEspera = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT le.*, 
                   p.nombreCompleto AS paciente,
                   pr.nombre AS profesional,
                   e.nombre AS especialidad
            FROM LISTA_ESPERA le
            LEFT JOIN PACIENTE p ON le.pacienteId = p.id
            LEFT JOIN PROFESIONAL pr ON le.profesionalId = pr.id
            LEFT JOIN ESPECIALIDAD e ON le.especialidadId = e.id
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM LISTA_ESPERA WHERE id = ?", 
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { pacienteId, profesionalId, especialidadId, fechaRegistro } = data;
        const [result] = await db.query(
            "INSERT INTO LISTA_ESPERA (pacienteId, profesionalId, especialidadId, fechaRegistro) VALUES (?, ?, ?, ?)",
            [pacienteId, profesionalId, especialidadId, fechaRegistro]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { pacienteId, profesionalId, especialidadId, fechaRegistro } = data;
        await db.query(
            "UPDATE LISTA_ESPERA SET pacienteId = ?, profesionalId = ?, especialidadId = ?, fechaRegistro = ? WHERE id = ?",
            [pacienteId, profesionalId, especialidadId, fechaRegistro, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM LISTA_ESPERA WHERE id = ?", [id]);
        return true;
    }
};

export default ListaEspera;
