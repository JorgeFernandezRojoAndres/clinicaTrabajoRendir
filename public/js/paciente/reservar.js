document.addEventListener("DOMContentLoaded", () => {
    const selEsp = document.getElementById("sel-especialidad");
    const selMed = document.getElementById("sel-medico");
    const calendarEl = document.getElementById("calendar");
    const chips = document.getElementById("chips-horarios");
    const btn = document.getElementById("btn-reservar");
    const nombreEl = document.getElementById("pac-nombre-reserva");

    let horarioSeleccionado = null;
    let agendaIdActual = null;
    let calendar = null;
    let horariosActuales = [];

    // Cargar nombre paciente
    fetch("/paciente/datos", { credentials: "include" })
        .then(r => r.json())
        .then(data => {
            if (data.ok && data.paciente && nombreEl) {
                nombreEl.textContent = `Hola, ${data.paciente.nombreCompleto || "Paciente"}`;
            }
        })
        .catch(() => {});

    // Cargar especialidades reales
    async function cargarEspecialidades() {
        const res = await fetch("/paciente/especialidades", { credentials: "include" });
        const data = await res.json();
        console.log("[reserva] especialidades:", data);
        selEsp.innerHTML = `<option value="">Seleccionar especialidad</option>`;
        data.forEach(e => {
            const opt = document.createElement("option");
            opt.value = e.id;
            opt.textContent = e.nombre;
            selEsp.appendChild(opt);
        });
    }

    async function cargarMedicos(especialidadId) {
        selMed.innerHTML = `<option value="">Seleccionar médico</option>`;
        if (!especialidadId) return;
        const res = await fetch(`/paciente/especialidades/${especialidadId}/medicos`, { credentials: "include" });
        const data = await res.json();
        console.log("[reserva] medicos esp", especialidadId, data);
        data.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.nombre || `${m.apellido}, ${m.nombre}`;
            selMed.appendChild(opt);
        });
    }

    const fechaMatch = (h, fechaSel) => {
        const f =
            h.fecha ||
            (h.fechaHora ? h.fechaHora.substring(0, 10) : "");
        return f === fechaSel;
    };

    async function cargarHorarios() {
        chips.innerHTML = `<p>Cargando horarios...</p>`;
        horarioSeleccionado = null;
        horariosActuales = [];

        if (!selEsp.value || !selMed.value) {
            chips.innerHTML = `<p>Elige especialidad y médico.</p>`;
            if (calendar) calendar.removeAllEvents();
            return;
        }

        // Obtener agenda para ese médico/especialidad
        const params = new URLSearchParams({
            medicoId: selMed.value,
            especialidadId: selEsp.value
        });
        const resAgenda = await fetch(`/paciente/agendas?${params.toString()}`, { credentials: "include" });
        const agendas = await resAgenda.json();
        console.log("[reserva] agendas", agendas);
        if (!agendas.length) {
            chips.innerHTML = `<p>No hay agenda configurada para ese profesional.</p>`;
            if (calendar) calendar.removeAllEvents();
            return;
        }
        agendaIdActual = agendas[0].id;

        // Traer horarios libres de la agenda
        const resHor = await fetch(`/paciente/horarios-libres/${agendaIdActual}`, { credentials: "include" });
        const horarios = await resHor.json();
        console.log("[reserva] horarios libres agenda", agendaIdActual, horarios);
        horariosActuales = horarios.map(h => {
            const fechaISO = (h.fecha || "").substring(0, 10);
            const rawHora = (h.hora || h.horaInicio || "").substring(0, 5);
            const horaFmt = rawHora.length >= 5 ? rawHora.slice(0, 5) : rawHora;
            return { ...h, fechaISO, horaFmt };
        });

        // Pintar en el calendar
        if (calendar) {
            calendar.removeAllEvents();
            const events = horariosActuales.map(h => {
                const start = `${h.fechaISO}T${h.horaFmt}:00-03:00`;
                return {
                    id: String(h.id),
                    title: h.horaFmt,
                    start
                };
            });
            console.log("[reserva] eventos calendar", events);
            calendar.addEventSource(events);
        }

        chips.innerHTML = `<p>Elige una fecha en el calendario.</p>`;
    }

    selEsp?.addEventListener("change", async () => {
        await cargarMedicos(selEsp.value);
        agendaIdActual = null;
        horariosActuales = [];
        if (calendar) calendar.removeAllEvents();
        chips.innerHTML = `<p>Elige médico y fecha.</p>`;
    });

    selMed?.addEventListener("change", () => {
        chips.innerHTML = `<p>Elige fecha.</p>`;
        cargarHorarios();
    });

    // Inicializar calendario FullCalendar
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            height: "auto",
            selectable: true,
            headerToolbar: {
                left: "prev,next",
                center: "title",
                right: ""
            },
            locale: "es",
            dateClick: (info) => {
                const fechaSel = info.dateStr;
                const list = horariosActuales.filter(h => h.fechaISO === fechaSel);
                console.log("[reserva] click fecha", fechaSel, "match", list);
                chips.innerHTML = "";
                horarioSeleccionado = null;

                if (!list.length) {
                    chips.innerHTML = `<p>No hay horarios libres para esa fecha.</p>`;
                    return;
                }

                list.forEach(h => {
                    const c = document.createElement("div");
                    c.classList.add("chip-item");
                    c.textContent = h.horaFmt || h.hora || h.horaInicio || "";
                    c.addEventListener("click", () => {
                        horarioSeleccionado = h.id;
                        chips.querySelectorAll(".chip-item").forEach(ch => ch.classList.remove("chip-selected"));
                        c.classList.add("chip-selected");
                    });
                    chips.appendChild(c);
                });
            }
        });
        calendar.render();
    }

    btn?.addEventListener("click", async () => {
        if (!selEsp.value || !selMed.value || !horarioSeleccionado || !agendaIdActual) {
            alert("Selecciona especialidad, médico y horario.");
            return;
        }

        const payload = {
            especialidadId: Number(selEsp.value),
            medicoId: Number(selMed.value),
            agendaId: Number(agendaIdActual),
            horarioAgendaId: Number(horarioSeleccionado),
            motivo: "Reserva web",
            tipoTurno: "normal",
            fecha: "" // no usado en normal con horario
        };

        const res = await fetch("/paciente/reserva", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok && data.ok) {
            alert("Reserva enviada. Queda pendiente de confirmación.");
            horarioSeleccionado = null;
            chips.querySelectorAll(".chip").forEach(ch => ch.classList.remove("selected"));
        } else {
            alert(data.error || "No se pudo reservar.");
        }
    });

    cargarEspecialidades();
});
