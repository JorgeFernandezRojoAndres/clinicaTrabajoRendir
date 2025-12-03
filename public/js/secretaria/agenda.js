// =======================================================
//  AGENDA DE SECRETARÍA
// =======================================================

document.addEventListener("DOMContentLoaded", async () => {

    // ---------------------------------------------------
    // ELEMENTOS DEL DOM
    // ---------------------------------------------------
    const profesionSelect = document.querySelector("#profesionalSelect");
    const agendaSelect = document.querySelector("#agendaSelect");
    const calendarEl = document.getElementById("calendar");

    let feriados = [];
    let fechasNoLaborables = [];

    // ---------------------------------------------------
    // CARGAR PROFESIONALES
    // ---------------------------------------------------
    async function cargarProfesionales() {
        const res = await fetch("/profesionales");
        const data = await res.json();

        profesionSelect.innerHTML = `<option value="">Seleccione...</option>`;

        data.forEach(p => {
            profesionSelect.innerHTML += `
                <option value="${p.id}">
                    ${p.nombre} ${p.apellido}
                </option>
            `;
        });
    }

    // ---------------------------------------------------
    // CARGAR AGENDAS SEGÚN PROFESIONAL
    // ---------------------------------------------------
    async function cargarAgendas(profId) {
        if (!profId) {
            agendaSelect.innerHTML = `<option value="">Seleccione...</option>`;
            return;
        }

        const res = await fetch(`/agenda?profesionalId=${profId}`);
        const data = await res.json();

        agendaSelect.innerHTML = `<option value="">Seleccione...</option>`;

        data.forEach(a => {
            agendaSelect.innerHTML += `
                <option value="${a.id}">
                    ${a.especialidadNombre} — ${a.sucursal}
                </option>
            `;
        });
    }

    // ---------------------------------------------------
    // OBTENER FERIADOS DEL ADMIN
    // ---------------------------------------------------
    async function cargarFeriados() {
        try {
            const res = await fetch("/admin/dias-no-laborables");
            feriados = await res.json();

            fechasNoLaborables = feriados.map(f => f.fecha);
        } catch {
            fechasNoLaborables = [];
        }
    }

    // ---------------------------------------------------
    // GENERAR HORARIOS LIBRES SEGÚN AGENDA
    // ---------------------------------------------------
    function generarHorariosLibres(agenda) {
        const libres = [];

        const inicio = agenda.horaInicio;
        const fin = agenda.horaFin;
        const intervalo = agenda.intervaloMin;
        const dias = agenda.diasLaborales.split(",").map(Number);

        const fechaBase = new Date();
        fechaBase.setHours(0, 0, 0, 0);

        for (let i = 0; i < 14; i++) {
            const d = new Date(fechaBase);
            d.setDate(fechaBase.getDate() + i);

            const dow = d.getDay();
            const iso = d.toISOString().slice(0, 10);

            // Bloqueo por feriado
            if (fechasNoLaborables.includes(iso)) continue;

            // Solo días laborales
            if (!dias.includes(dow)) continue;

            // Horas
            const [hIni, mIni] = inicio.split(":");
            const [hFin, mFin] = fin.split(":");

            let current = new Date(d);
            current.setHours(Number(hIni), Number(mIni), 0, 0);

            const limite = new Date(d);
            limite.setHours(Number(hFin), Number(mFin), 0, 0);

            while (current < limite) {
                libres.push({
                    title: "Disponible",
                    start: current.toISOString(),
                    color: "#28a745"
                });

                current = new Date(current.getTime() + intervalo * 60 * 1000);
            }
        }

        return libres;
    }


    // ---------------------------------------------------
    // INICIALIZAR CALENDARIO
    // ---------------------------------------------------
    let calendar;
    function iniciarCalendario(eventos) {
        if (calendar) {
            calendar.destroy();
        }

        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            locale: "es",            // idioma español
            firstDay: 1,             // lunes
            height: "auto",
            events: eventos
        });

        calendar.render();
    }


    // ---------------------------------------------------
    // CUANDO SELECCIONA PROFESIONAL
    // ---------------------------------------------------
    profesionSelect.addEventListener("change", () => {
        cargarAgendas(profesionSelect.value);
    });

    agendaSelect.addEventListener("change", async () => {
        const idAgenda = agendaSelect.value;
        if (!idAgenda) return;

        const resAgenda = await fetch(`/agenda/${idAgenda}`);
        const agenda = await resAgenda.json();

        const resHorarios = await fetch(`/agenda/horarios/${idAgenda}`);
        const horarios = await resHorarios.json();

        await cargarFeriados();

        const eventos = horarios.map(h => ({
            id: h.id,
            title: h.estado === "libre" ? "Libre" : h.estado,
            start: `${h.fecha}T${h.horaInicio}`,
            end: `${h.fecha}T${h.horaFin}`,
            color:
                h.estado === "libre"
                    ? "#28a745"
                    : h.estado === "reservado"
                        ? "#ffc107"
                        : h.estado === "confirmado"
                            ? "#0d6efd"
                            : h.estado === "cancelado"
                                ? "#dc3545"
                                : "#6c757d"
        }));

        iniciarCalendario(eventos);
    });


});
