import { db } from "../config/db.js";

const Agenda = {

    async getAll() {
        const [rows] = await db.query(`
            SELECT 
                a.id,
                a.profesionalEspecialidadId,
                a.intervaloMin,
                a.diasLaborales,
                a.horaInicio,
                a.horaFin,
                a.sucursal,

                p.nombre AS profesionalNombre,
                e.nombre AS especialidadNombre

            FROM agenda a
            JOIN profesional_especialidad pe ON pe.id = a.profesionalEspecialidadId
            JOIN profesional p ON p.id = pe.profesionalId
            JOIN especialidad e ON e.id = pe.especialidadId
            ORDER BY p.nombre
        `);

        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(`
            SELECT *
            FROM agenda
            WHERE id = ?
        `, [id]);

        return rows[0] || null;
    },
    async getHorariosLibres(agendaId) {
        const [rows] = await db.query(`
        SELECT 
            id,
            DATE(fechaHora) AS fecha,
            TIME(fechaHora) AS hora,
            estado
        FROM horario_agenda
        WHERE agendaId = ?
          AND estado = 'LIBRE'
        ORDER BY fechaHora
    `, [agendaId]);

        return rows;
    }, async create(data) {
        const { profesionalId, especialidadId, intervaloMin, diasLaborales, horaInicio, horaFin, sucursal = "Central" } = data;

        // ---------------------------------------------
        // 1) Buscar relación profesional-especialidad
        // ---------------------------------------------
        const [rowsPE] = await db.query(`
        SELECT id 
        FROM profesional_especialidad
        WHERE profesionalId = ? AND especialidadId = ?
    `, [profesionalId, especialidadId]);

        if (rowsPE.length === 0) {
            throw new Error("No existe la relación profesional-especialidad");
        }

        const profesionalEspecialidadId = rowsPE[0].id;

        // ---------------------------------------------
        // 2) Evitar agenda duplicada exacta
        // ---------------------------------------------
        const [agendaExacta] = await db.query(`
        SELECT id 
        FROM agenda
        WHERE profesionalEspecialidadId = ?
          AND diasLaborales = ?
          AND horaInicio = ?
          AND horaFin = ?
    `, [
            profesionalEspecialidadId,
            diasLaborales,
            horaInicio,
            horaFin
        ]);

        if (agendaExacta.length > 0) {
            throw new Error("Ya existe una agenda con el mismo horario y días laborales para este profesional.");
        }

        // -----------------------------------------------------
        // 3) ❗ Evitar solapamiento con OTRAS especialidades
        // -----------------------------------------------------
        const [otrasAgendas] = await db.query(`
        SELECT 
            a.id,
            a.horaInicio,
            a.horaFin,
            a.diasLaborales
        FROM agenda a
        JOIN profesional_especialidad pe ON pe.id = a.profesionalEspecialidadId
        WHERE pe.profesionalId = ?
    `, [profesionalId]);

        const nuevoInicio = horaInicio;
        const nuevoFin = horaFin;
        const diasNuevos = diasLaborales.split(",");

        for (const ag of otrasAgendas) {

            const diasExistentes = ag.diasLaborales.split(",");

            // 🔸 Ver si tienen al menos UN día en común
            const compartenDia = diasNuevos.some(d => diasExistentes.includes(d));
            if (!compartenDia) continue;

            // 🔸 Validar solapamiento de horarios
            const inicio = ag.horaInicio;
            const fin = ag.horaFin;

            const seSolapan = !(nuevoFin <= inicio || nuevoInicio >= fin);

            if (seSolapan) {
                throw new Error(
                    "Este profesional ya tiene una agenda en ese horario (aunque sea otra especialidad)."
                );
            }
        }

        // ---------------------------------------------
        // 4) Crear agenda
        // ---------------------------------------------
        const [result] = await db.query(`
        INSERT INTO agenda (
            profesionalEspecialidadId,
            intervaloMin,
            diasLaborales,
            horaInicio,
            horaFin,
            sucursal
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
            profesionalEspecialidadId,
            intervaloMin,
            diasLaborales,
            horaInicio,
            horaFin,
            sucursal
        ]);

        const nuevaAgendaId = result.insertId;

        // ---------------------------------------------
        // 5) Generar horarios automáticamente
        // ---------------------------------------------
        const { generarHorariosParaAgenda } = await import("../utils/generarHorarios.js");

        await generarHorariosParaAgenda({
            id: nuevaAgendaId,
            diasLaborales,
            intervaloMin,
            horaInicio,
            horaFin
        });

        return nuevaAgendaId;
    },

async update(id, data) {
        const { intervaloMin, diasLaborales, horaInicio, horaFin, sucursal } = data;

        const params = [intervaloMin, diasLaborales, horaInicio, horaFin];
        let setSucursal = "";
        if (typeof sucursal === "string") {
            setSucursal = ", sucursal = ? ";
            params.push(sucursal);
        }
        params.push(id);

        await db.query(`
            UPDATE agenda
            SET intervaloMin = ?, diasLaborales = ?, horaInicio = ?, horaFin = ? ${setSucursal}
            WHERE id = ?
        `, params);
    },

    async delete(id) {
        await db.query(`DELETE FROM agenda WHERE id = ?`, [id]);
    },

    // Buscar profesional_especialidad por profesional + especialidad
    async obtenerPE(profesionalId, especialidadId) {
        const [[row]] = await db.query(`
            SELECT id
            FROM profesional_especialidad
            WHERE profesionalId = ? AND especialidadId = ?
        `, [profesionalId, especialidadId]);

        return row || null;
    },

    // Buscar agendas por profesionalEspecialidadId
    async getByProfesionalEspecialidadId(id, sucursal = null) {
        const params = [id];
        let whereSucursal = "";
        if (sucursal) {
            whereSucursal = " AND sucursal = ? ";
            params.push(sucursal);
        }

        const [rows] = await db.query(`
            SELECT *
            FROM agenda
            WHERE profesionalEspecialidadId = ?
            ${whereSucursal}
        `, params);

        return rows;
    },

    async getSucursales() {
        const [rows] = await db.query(`
            SELECT DISTINCT sucursal
            FROM agenda
            WHERE sucursal IS NOT NULL AND sucursal <> ''
            ORDER BY sucursal
        `);
        return rows.map(r => r.sucursal);
    }
};

export default Agenda;
