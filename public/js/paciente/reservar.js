document.addEventListener("DOMContentLoaded", () => {
    const selEsp = document.getElementById("sel-especialidad");
    const selMed = document.getElementById("sel-medico");
    const selFecha = document.getElementById("sel-fecha");
    const chips = document.getElementById("chips-horarios");
    const btn = document.getElementById("btn-reservar");
    const nombreEl = document.getElementById("pac-nombre-reserva");

    let horarioSeleccionado = null;
    let agendaIdActual = null;

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
        data.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.nombre || `${m.apellido}, ${m.nombre}`;
            selMed.appendChild(opt);
        });
    }

    async function cargarHorarios() {
        chips.innerHTML = `<p>Cargando horarios...</p>`;
        horarioSeleccionado = null;

        if (!selEsp.value || !selMed.value || !selFecha.value) {
            chips.innerHTML = `<p>Elige especialidad, médico y fecha.</p>`;
            return;
        }

        // Obtener agenda para ese médico/especialidad
        const params = new URLSearchParams({
            medicoId: selMed.value,
            especialidadId: selEsp.value
        });
        const resAgenda = await fetch(`/paciente/agendas?${params.toString()}`, { credentials: "include" });
        const agendas = await resAgenda.json();
        if (!agendas.length) {
            chips.innerHTML = `<p>No hay agenda configurada para ese profesional.</p>`;
            return;
        }
        agendaIdActual = agendas[0].id;

        // Traer horarios libres de la agenda
        const resHor = await fetch(`/paciente/horarios-libres/${agendaIdActual}`, { credentials: "include" });
        const horarios = await resHor.json();

        // Filtrar por fecha seleccionada
        const fechaSel = selFecha.value;
        const list = horarios.filter(h => h.fecha === fechaSel);

        if (!list.length) {
            chips.innerHTML = `<p>No hay horarios libres para esa fecha.</p>`;
            return;
        }

        chips.innerHTML = "";
        list.forEach(h => {
            const c = document.createElement("div");
            c.classList.add("chip");
            c.textContent = h.horaInicio;
            c.addEventListener("click", () => {
                horarioSeleccionado = h.id;
                chips.querySelectorAll(".chip").forEach(ch => ch.classList.remove("selected"));
                c.classList.add("selected");
            });
            chips.appendChild(c);
        });
    }

    selEsp?.addEventListener("change", async () => {
        await cargarMedicos(selEsp.value);
        chips.innerHTML = `<p>Elige médico y fecha.</p>`;
    });

    selMed?.addEventListener("change", () => {
        chips.innerHTML = `<p>Elige fecha.</p>`;
    });

    selFecha?.addEventListener("change", cargarHorarios);

    btn?.addEventListener("click", async () => {
        if (!selEsp.value || !selMed.value || !selFecha.value || !horarioSeleccionado || !agendaIdActual) {
            alert("Selecciona especialidad, médico, fecha y horario.");
            return;
        }

        const payload = {
            especialidadId: Number(selEsp.value),
            medicoId: Number(selMed.value),
            agendaId: Number(agendaIdActual),
            horarioAgendaId: Number(horarioSeleccionado),
            motivo: "Reserva web",
            tipoTurno: "normal",
            fecha: selFecha.value
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
