import { db } from "../config/db.js";

const Turno = {

    // ============================================================
    // LISTAR TODOS LOS TURNOS (NO SE TOCA)
    // ============================================================
    async getAll() {
        const [rows] = await db.query(`
            SELECT t.*, 
                   p.nombreCompleto AS paciente,
                   ha.fechaHora
            FROM TURNO t
            JOIN PACIENTE p ON t.pacienteId = p.id
            JOIN HORARIO_AGENDA ha ON t.horarioAgendaId = ha.id
        `);
        return rows;
    },

    // ============================================================
    // OBTENER POR ID (NO SE TOCA)
    // ============================================================
    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM TURNO WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    // ============================================================
    // CREAR TURNO (NO SE TOCA)
    // ============================================================
    async create(data) {
        const { horarioAgendaId, pacienteId, motivo, estado } = data;
        const [result] = await db.query(
            "INSERT INTO TURNO (horarioAgendaId, pacienteId, motivo, estado) VALUES (?, ?, ?, ?)",
            [horarioAgendaId, pacienteId, motivo, estado]
        );
        return result.insertId;
    },

    // ============================================================
    // ACTUALIZAR TURNO (NO SE TOCA)
    // ============================================================
    async update(id, data) {
        const { horarioAgendaId, pacienteId, motivo, estado } = data;
        await db.query(
            "UPDATE TURNO SET horarioAgendaId = ?, pacienteId = ?, motivo = ?, estado = ? WHERE id = ?",
            [horarioAgendaId, pacienteId, motivo, estado, id]
        );
        return true;
    },

    // ============================================================
    // ELIMINAR TURNO (NO SE TOCA)
    // ============================================================
    async delete(id) {
        await db.query("DELETE FROM TURNO WHERE id = ?", [id]);
        return true;
    },

    // 🔍 Ver si un paciente ya tiene turno en un horario
    async existeTurnoPaciente(horarioAgendaId, pacienteId) {
        const [rows] = await db.query(
            "SELECT * FROM TURNO WHERE horarioAgendaId = ? AND pacienteId = ? AND estado != 'CANCELADO'",
            [horarioAgendaId, pacienteId]
        );
        return rows.length > 0;
    },


    // ============================================================
    // FILTRAR TURNOS + SOBRETURNOS (unificados)
    // ============================================================
    async filtrar(medicoId, especialidadId, estado, sucursal) {

        // ==============================
        // 1) Filtros para turnos normales
        // ==============================
        let filtros = "";
        const params = [];

        if (medicoId) {
            filtros += " AND pr.id = ? ";
            params.push(medicoId);
        }

        if (especialidadId) {
            filtros += " AND esp.id = ? ";
            params.push(especialidadId);
        }

        if (sucursal) {
            filtros += " AND a.sucursal = ? ";
            params.push(sucursal);
        }

        if (estado) {
            filtros += " AND UPPER(t.estado) = ? ";
            params.push(estado.toUpperCase());
        }

        const sqlTurnos = `
        SELECT 
            t.id,
            t.motivo,
            t.estado,
            p.nombreCompleto AS pacienteNombre,
            ha.fechaHora AS fechaHora,
            DATE_ADD(ha.fechaHora, INTERVAL a.intervaloMin MINUTE) AS fechaHoraFin,
            pr.nombre AS medicoNombre,
            esp.nombre AS especialidadNombre,
            'normal' AS tipoTurno
        FROM TURNO t
        JOIN PACIENTE p ON t.pacienteId = p.id
        JOIN HORARIO_AGENDA ha ON t.horarioAgendaId = ha.id
        JOIN AGENDA a ON ha.agendaId = a.id
        JOIN profesional_especialidad pe ON a.profesionalEspecialidadId = pe.id
        JOIN profesional pr ON pe.profesionalId = pr.id
        JOIN especialidad esp ON pe.especialidadId = esp.id
        WHERE 1=1 
        ${filtros}
        AND ( ? <> 'SOBRETURNO' )
    `;
    params.push(estado ? estado.toUpperCase() : "");

        // ==============================
        // 2) Filtros para sobreturnos
        // ==============================
        let filtrosSobre = "";
        const paramsSobre = [];

        if (medicoId) {
            filtrosSobre += " AND s.profesionalId = ? ";
            paramsSobre.push(medicoId);
        }

        if (especialidadId) {
            filtrosSobre += " AND s.especialidadId = ? ";
            paramsSobre.push(especialidadId);
        }

        // Si se filtra por sucursal, los sobreturnos sin sucursal asociada se omiten
        if (sucursal) {
            filtrosSobre += " AND 1=0 ";
        }

        if (estado && estado.toUpperCase() !== "SOBRETURNO") {
            filtrosSobre += " AND 1=0 "; // No mostrar sobreturnos.
        }

        const sqlSobreturnos = `
        SELECT 
            s.id,
            s.motivo,
            'SOBRETURNO' AS estado,
            p.nombreCompleto AS pacienteNombre,
            s.fechaHoraManual AS fechaHora,
            DATE_ADD(s.fechaHoraManual, INTERVAL 1 MINUTE) AS fechaHoraFin,
            pr.nombre AS medicoNombre,
            esp.nombre AS especialidadNombre,
            'sobreturno' AS tipoTurno
        FROM SOBRETURNO s
        JOIN PACIENTE p ON s.pacienteId = p.id
        LEFT JOIN profesional pr ON pr.id = s.profesionalId
        LEFT JOIN especialidad esp ON esp.id = s.especialidadId
        WHERE 1=1 
        ${filtrosSobre}
    `;

        // ==============================
        // Ejecutar ambas
        // ==============================
        let turnosNormales = [];
        const [tn] = await db.query(sqlTurnos, params);
        turnosNormales = tn;
        const [sobreturnos] = await db.query(sqlSobreturnos, paramsSobre);

        // ==============================
        // Unir
        // ==============================
        return [...turnosNormales, ...sobreturnos];
    }

};

export default Turno;
