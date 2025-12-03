import { db } from "../config/db.js";

// ------------------------------------------------------------
// 📌 Genera horarios para los próximos 90 días
// ------------------------------------------------------------
export async function generarHorariosParaAgenda(agenda) {

    const agendaId = agenda.id;

    // 1) Parseo de días laborales (ej. "1,2,3,4,5")
    const diasLaborales = agenda.diasLaborales
        .split(",")
        .map(n => Number(n.trim())); // [1,2,3,4,5]

    // 2) Intervalos
    const intervalo = Number(agenda.intervaloMin);

    const horaInicio = agenda.horaInicio; // "08:00:00"
    const horaFin = agenda.horaFin;       // "12:00:00"

    // 3) Buscar feriados de la BD
    const [feriadosRows] = await db.query(
        `SELECT fecha FROM dia_no_laborable`
    );

    const feriadosSet = new Set(
        feriadosRows.map(f => f.fecha.toISOString().slice(0, 10))
    );

    // 4) Generar días desde hoy hasta 90 días
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fin = new Date();
    fin.setDate(fin.getDate() + 90);
    fin.setHours(0, 0, 0, 0);

    // 5) Recorremos cada día
    const inserts = [];

    for (let d = new Date(hoy); d <= fin; d.setDate(d.getDate() + 1)) {

        const diaSemana = d.getDay(); // 0 domingo → 6 sábado  
        // Tu BD usa 1=lunes a 5=viernes → getDay() devuelve 1..5 igual, OK

        const fechaISO = d.toISOString().slice(0, 10);

        // Saltar días no laborales
        if (!diasLaborales.includes(diaSemana)) continue;
        if (feriadosSet.has(fechaISO)) continue;

        // 6) Generar horarios dentro del día
        const [hInicioH, hInicioM] = horaInicio.split(":").map(Number);
        const [hFinH, hFinM] = horaFin.split(":").map(Number);

        const inicio = new Date(d);
        inicio.setHours(hInicioH, hInicioM, 0, 0);

        const finDia = new Date(d);
        finDia.setHours(hFinH, hFinM, 0, 0);

        for (let h = new Date(inicio); h < finDia; h.setMinutes(h.getMinutes() + intervalo)) {

            const fechaHora = h.toISOString().slice(0, 19).replace("T", " ");

            // Evitar duplicados
            inserts.push([agendaId, fechaHora, "LIBRE", "NORMAL"]);
        }
    }

    if (inserts.length === 0) return;

    // 7) Inserción masiva
    await db.query(
        `
        INSERT IGNORE INTO horario_agenda 
        (agendaId, fechaHora, estado, tipoClasificacion)
        VALUES ?
        `,
        [inserts]
    );
}
