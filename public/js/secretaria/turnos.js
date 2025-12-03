// =======================================================
//  TURNOS - SECRETARÍA
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTOS DEL MODAL
    const modalCrear = new bootstrap.Modal(document.getElementById("modalTurno"));
    const especialidadSelect = document.getElementById("especialidadSelectModal");
    const medicoSelect = document.getElementById("medicoSelectModal");
    const tipoTurnoSelect = document.getElementById("tipoTurnoSelect");
    const horarioSelect = document.getElementById("horarioSelectModal");
    const pacienteSelect = document.getElementById("pacienteSelect");
    const motivoInput = document.getElementById("motivoInput");


    const contenedorTurnos = document.getElementById("contenedorTurnos");
    const btnGuardarTurno = document.getElementById("btnGuardarTurno");

    // =======================================================
    // 1. CARGAR ESPECIALIDADES
    // =======================================================
    async function cargarEspecialidades() {
        try {
            const res = await fetch("/especialidades");
            const data = await res.json();

            especialidadSelect.innerHTML = `<option value="">Seleccione una especialidad</option>`;

            data.forEach(e => {
                especialidadSelect.innerHTML += `
                    <option value="${e.id}">${e.nombre}</option>
                `;
            });
        } catch (err) {
            console.error("Error cargando especialidades:", err);
        }
    }

    // =======================================================
    // 2. CARGAR MÉDICOS SEGÚN ESPECIALIDAD
    // =======================================================
    async function cargarMedicos(especialidadId) {
        medicoSelect.innerHTML = `<option value="">Cargando...</option>`;
        medicoSelect.disabled = true;

        try {
            const res = await fetch(`/profesionales/por-especialidad/${especialidadId}`);
            const data = await res.json();

            medicoSelect.innerHTML = `<option value="">Seleccione un médico</option>`;

            data.forEach(m => {
                medicoSelect.innerHTML += `
                    <option value="${m.id}">${m.apellido}, ${m.nombre}</option>
                `;
            });

            medicoSelect.disabled = false;

        } catch (err) {
            console.error("Error cargando médicos:", err);
        }
    }

    // =======================================================
    // 3. CARGAR AGENDAS DEL MÉDICO
    // =======================================================
    async function cargarAgendas(medicoId, especialidadId) {
        try {
            const res = await fetch(`/agenda/buscar?medicoId=${medicoId}&especialidadId=${especialidadId}`);
            const data = await res.json();

            // Para horarios necesitamos agendaId
            return data;

        } catch (err) {
            console.error("Error cargando agendas:", err);
            return [];
        }
    }
    async function cargarHorarios(agendaId) {

        horarioSelect.innerHTML = `<option>Cargando...</option>`;
        horarioSelect.disabled = true;



        try {
            const res = await fetch(`/agenda/horarios-libres/${agendaId}`);
            const data = await res.json();

            horarioSelect.innerHTML = `<option value="">Seleccione un horario</option>`;

            // Agrupar por fecha
            const grupos = {};

            data.forEach(h => {
                if (!grupos[h.fecha]) grupos[h.fecha] = [];
                grupos[h.fecha].push(h);
            });

            // Construir opciones ordenadas por día
            Object.keys(grupos).forEach(fecha => {

                const opcionesDia = grupos[fecha];

                const fechaStr = new Date(`${fecha}T00:00:00-03:00`)
                    .toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    });

                horarioSelect.innerHTML += `
                <option disabled>────────── ${fechaStr.toUpperCase()} ──────────</option>
            `;

                opcionesDia.forEach(h => {

                    const inicio = new Date(`${h.fecha}T${h.horaInicio}:00-03:00`);
                    const fin = new Date(`${h.fecha}T${h.horaFin}:00-03:00`);

                    const horaInicioStr = inicio.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    const horaFinStr = fin.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    horarioSelect.innerHTML += `
                    <option value="${h.id}">
                        ${horaInicioStr} a ${horaFinStr}
                    </option>
                `;
                });
            });

            horarioSelect.disabled = false;
            // ⭐ HABILITAR / CONFIGURAR TIPO DE TURNO
            const tipoTurnoSelect = document.getElementById("tipoTurnoSelect");

            if (horariosFiltrados.length === 0) {
                // SOLO SOBRETURNO
                tipoTurnoSelect.disabled = false;
                tipoTurnoSelect.innerHTML = `
        <option value="">Seleccione tipo de turno</option>
        <option value="sobreturno">Sobreturno</option>
    `;
            } else {
                // NORMAL + SOBRETURNO
                tipoTurnoSelect.disabled = false;
                tipoTurnoSelect.innerHTML = `
        <option value="">Seleccione tipo de turno</option>
        <option value="normal">Turno normal</option>
        <option value="sobreturno">Sobreturno</option>
    `;
            }


            // ============================================================
            // 🔥 NUEVO — CONTROLAR TIPO DE TURNO SEGÚN DISPONIBILIDAD
            // ============================================================

            if (!tipoTurnoSelect) {
                console.warn("⚠️ No existe #tipoTurnoSelect en el modal");
                return;
            }

            if (data.length === 0) {
                // SOLO SOBRETURNO
                tipoTurnoSelect.disabled = false;
                tipoTurnoSelect.innerHTML = `
                <option value="">Seleccione tipo de turno</option>
                <option value="sobreturno">Sobreturno</option>
            `;
            } else {
                // NORMAL + SOBRETURNO
                tipoTurnoSelect.disabled = false;
                tipoTurnoSelect.innerHTML = `
                <option value="">Seleccione tipo de turno</option>
                <option value="normal">Turno normal</option>
                <option value="sobreturno">Sobreturno</option>
            `;
            }

        } catch (err) {
            console.error("Error cargando horarios:", err);
        }
    }




    // =======================================================
    // 5. CARGAR PACIENTES
    // =======================================================
    async function cargarPacientes() {
        try {
            const res = await fetch("/pacientes");
            const data = await res.json();

            pacienteSelect.innerHTML = `<option value="">Seleccione un paciente</option>`;

            data.forEach(p => {
                pacienteSelect.innerHTML += `
                    <option value="${p.id}">${p.apellido}, ${p.nombre} (${p.dni})</option>
                `;
            });

        } catch (err) {
            console.error("Error cargando pacientes:", err);
        }
    }

    // =======================================================
    // 6. CARGAR LISTADO DE TURNOS EN LA PANTALLA (ACTUALIZADO)
    // =======================================================
    async function cargarTurnos() {
        try {
            const res = await fetch("/turnos");
            const data = await res.json();

            contenedorTurnos.innerHTML = "";

            data.forEach(t => {
                const estado = t.estado.toLowerCase();

                let botones = "";

                // ---------------------------
                // ESTADO: LIBRE
                // ---------------------------
                if (estado === "libre") {
                    botones = `
                    <button class="btn-reservar" data-horario="${t.horarioAgendaId}">
                        Reservar
                    </button>`;
                }

                // ---------------------------
                // ESTADO: RESERVADO
                // ---------------------------
                if (estado === "reservado") {
                    botones = `
                    <div class="btn-group">
                        <button class="btn-confirmar" data-id="${t.id}">Confirmar</button>
                        <button class="btn-cancelar" data-id="${t.id}">Cancelar</button>
                    </div>
                `;
                }

                // ---------------------------
                // ESTADO: CONFIRMADO
                // ---------------------------
                if (estado === "confirmado") {
                    botones = `
                    <div class="btn-group">
                        <button class="btn-pasar" data-id="${t.id}">Marcar Presente</button>
                        <button class="btn-cancelar" data-id="${t.id}">Cancelar</button>
                    </div>
                `;
                }

                contenedorTurnos.innerHTML += `
                <div class="turno-card ${estado === "cancelado" ? "cancelado" : ""}">
                    <div class="turno-info">
                        <h3>${t.fecha} - ${t.hora}</h3>
                        <p class="turno-detalle">${t.paciente || t.estado}</p>
                    </div>
                    ${botones}
                </div>
            `;
            });

            activarBotonesReservar();
            activarBotonesEstados();

        } catch (err) {
            console.error("Error cargando turnos:", err);
        }
    }
    // =======================================================
    // NUEVO: ACTIVAR BOTONES CONFIRMAR / CANCELAR / PRESENTE
    // =======================================================
    function activarBotonesEstados() {

        // CONFIRMAR
        document.querySelectorAll(".btn-confirmar").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                await fetch(`/turnos/${id}/confirmar`, { method: "PUT" });
                cargarTurnos();
            });
        });

        // CANCELAR
        document.querySelectorAll(".btn-cancelar").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                await fetch(`/turnos/${id}/cancelar`, { method: "PUT" });
                cargarTurnos();
            });
        });

        // PRESENTE
        document.querySelectorAll(".btn-pasar").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-id");
                await fetch(`/turnos/${id}/presente`, { method: "PUT" });
                cargarTurnos();
            });
        });
    }


    // =======================================================
    // 7. CLICK EN BOTÓN "RESERVAR" → ABRE EL MODAL
    // =======================================================
    function activarBotonesReservar() {
        document.querySelectorAll(".btn-reservar").forEach(btn => {
            btn.addEventListener("click", async () => {
                const horarioId = btn.getAttribute("data-horario");

                // Guardamos horarioId temporal (solo para mostrar algo si se quiere)
                horarioSelect.setAttribute("data-horario-origen", horarioId);

                // 🔥 RESETEAR TIPO DE TURNO
                tipoTurnoSelect.disabled = true;
                tipoTurnoSelect.innerHTML = `<option value="">Seleccione tipo de turno</option>`;

                // 🔥 NUEVO: Cargar horarios para activar tipoTurnoSelect
                const agendaId = horarioSelect.getAttribute("data-agenda");
                if (agendaId) {
                    await cargarHorarios(agendaId);
                }

                modalCrear.show();
            });
        });
    }


    // =======================================================
    // EVENTOS DE LOS SELECTS
    // =======================================================
    especialidadSelect.addEventListener("change", async () => {
        const id = especialidadSelect.value;
        if (!id) return;

        await cargarMedicos(id);
        horarioSelect.disabled = true;
        horarioSelect.innerHTML = `<option value="">Seleccione un médico primero</option>`;
    });

    medicoSelect.addEventListener("change", async () => {
        const medicoId = medicoSelect.value;
        const especialidadId = especialidadSelect.value;

        if (!medicoId || !especialidadId) return;

        const agendas = await cargarAgendas(medicoId, especialidadId);

        if (!agendas.length) {
            horarioSelect.innerHTML = `<option>No hay agendas configuradas</option>`;
            horarioSelect.disabled = true;
            return;
        }

        const agendaId = agendas[0].id;
        horarioSelect.setAttribute("data-agenda", agendaId);

        cargarHorarios(agendaId);
    });

    // ---------------------------------------------------------
    // GUARDAR TURNO DESDE EL CALENDARIO (ACTUALIZADO)
    // ---------------------------------------------------------
    const btnGuardar = document.getElementById("btnGuardarTurno");
    btnGuardar.addEventListener("click", async () => {

        console.log("========== 📌 GUARDAR TURNO — INICIO ==========");

        const pacienteId = document.getElementById("pacienteSelect")?.value;
        const motivo = document.getElementById("motivoInput")?.value.trim();
        const fecha = document.getElementById("fechaInput")?.value;

        const especialidadId = document.getElementById("especialidadSelectModal")?.value;
        const medicoId = document.getElementById("medicoSelectModal")?.value;
        const tipoTurno = document.getElementById("tipoTurnoSelect")?.value;

        const horarioSelect = document.getElementById("horarioSelectModal");
        let horarioAgendaId = horarioSelect?.value || null;

        const agendaId = horarioSelect.getAttribute("data-agenda");

        console.log("📋 DATOS CAPTURADOS DEL FORM:");
        console.log({ pacienteId, motivo, fecha, horarioAgendaId, especialidadId, medicoId, tipoTurno, agendaId });

        // =============================
        // VALIDACIONES → SEGÚN TIPO
        // =============================

        if (!pacienteId || !fecha) {
            alert("Debe seleccionar paciente y fecha.");
            return;
        }

        if (!especialidadId || !medicoId) {
            alert("Debe seleccionar un médico y una especialidad.");
            return;
        }

        if (!agendaId) {
            alert("Error interno: falta agendaId");
            return;
        }

        // ⭐ TURNO NORMAL → REQUIERE HORARIO
        if (tipoTurno === "normal" && !horarioAgendaId) {
            alert("Debe seleccionar un horario para turnos normales.");
            return;
        }

        // ⭐ SOBRETURNO → IGNORAR HORARIO
        if (tipoTurno === "sobreturno") {
            horarioAgendaId = null;
        }

        const payload = {
            pacienteId: Number(pacienteId),
            motivo,
            fecha,
            tipoTurno,
            agendaId: Number(agendaId),
            horarioAgendaId: horarioAgendaId ? Number(horarioAgendaId) : null,
            especialidadId: Number(especialidadId),
            medicoId: Number(medicoId)
        };

        console.log("📤 PAYLOAD ENVIADO AL BACKEND:");
        console.log(payload);

        const res = await fetch("/turnos/crear-desde-calendario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log("📥 STATUS DEL BACKEND:", res.status);

        const data = await res.json();
        console.log("📥 RESPUESTA DEL BACKEND:", data);

        if (data.ok) {
            console.log("✅ Turno creado correctamente");
            calendar.refetchEvents();

            const modalEl = document.getElementById("modalTurno");
            const modalInstance =
                bootstrap.Modal.getInstance(modalEl) ||
                new bootstrap.Modal(modalEl);

            modalInstance.hide();

        } else {
            console.error("❌ Error desde backend:", data.error);
            alert("Error: " + data.error);
        }

        console.log("========== 📌 GUARDAR TURNO — FIN ==========");
    });


    // =======================================================
    // INICIALIZACIÓN
    // =======================================================
    cargarEspecialidades();
    cargarPacientes();
    cargarTurnos();

});
