import { db } from "../config/db.js";

const Atencion = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT a.*, 
                   p.nombre AS profesional
            FROM ATENCION a
            JOIN PROFESIONAL p ON a.profesionalId = p.id
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM ATENCION WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { historiaClinicaId, profesionalId, fecha, motivo, evolucion } = data;
        const [result] = await db.query(
            "INSERT INTO ATENCION (historiaClinicaId, profesionalId, fecha, motivo, evolucion) VALUES (?, ?, ?, ?, ?)",
            [historiaClinicaId, profesionalId, fecha, motivo, evolucion]
        );
        return result.insertId;
    },

    async update(id, data) {
        const { historiaClinicaId, profesionalId, fecha, motivo, evolucion } = data;
        await db.query(
            "UPDATE ATENCION SET historiaClinicaId = ?, profesionalId = ?, fecha = ?, motivo = ?, evolucion = ? WHERE id = ?",
            [historiaClinicaId, profesionalId, fecha, motivo, evolucion, id]
        );
        return true;
    },

    async delete(id) {
        await db.query("DELETE FROM ATENCION WHERE id = ?", [id]);
        return true;
    },
    async getByPacienteYProfesional(pacienteId, profesionalId) {
        const [rows] = await db.query(`
        SELECT 
            a.id,
            a.motivo,
            a.evolucion,
            a.fecha AS fecha_atencion,

            -- Fecha y hora REAL del turno
            DATE(ha.fechaHora) AS fecha_turno,
            DATE_FORMAT(ha.fechaHora, '%H:%i') AS hora_turno,

            p.nombre AS profesional,

            d.descripcion AS diagnostico

        FROM ATENCION a
        JOIN TURNO t ON t.id = a.turnoId
        JOIN horario_agenda ha ON ha.id = t.horarioAgendaId
        JOIN PROFESIONAL p ON p.id = a.profesionalId
        LEFT JOIN DIAGNOSTICO d ON d.atencionId = a.id

        WHERE t.pacienteId = ?
        AND a.profesionalId = ?

        ORDER BY a.fecha DESC
    `, [pacienteId, profesionalId]);

        return rows;
    },
     


};

export default Atencion;
