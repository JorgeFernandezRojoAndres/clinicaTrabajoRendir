document.addEventListener("DOMContentLoaded", () => {

    const calendarEl = document.getElementById("calendar");

    let medico = "";
    let especialidad = "";
    let estado = "";

    // ---------------------------------------------------------
    // CARGAR MÉDICOS (SOLO PROFESIONALES)
    // ---------------------------------------------------------
    async function cargarMedicos() {
        try {
            const res = await fetch("/profesionales/medicos");
            const data = await res.json();

            const select = document.getElementById("medico");
            select.innerHTML = `<option value="">Seleccione…</option>`;

            data.forEach(m => {
                select.innerHTML += `
                    <option value="${m.id}">${m.nombre}</option>
                `;
            });
        } catch (err) {
            console.error("Error cargando médicos:", err);
        }
    }

    // ---------------------------------------------------------
    // CARGAR ESPECIALIDADES
    // ---------------------------------------------------------
    async function cargarEspecialidades() {
        try {
            const res = await fetch("/profesionales/especialidades");
            const data = await res.json();

            const select = document.getElementById("especialidadSelectModal");
            if (!select) {
                console.warn("No existe #especialidadSelect en el modal");
                return;
            }

            select.innerHTML = `<option value="">Seleccione…</option>`;

            data.forEach(e => {
                select.innerHTML += `
                <option value="${e.especialidadId}">
                    ${e.especialidad}
                </option>
            `;
            });

        } catch (err) {
            console.error("Error cargando especialidades:", err);
        }
    }


    // ---------------------------------------------------------
    // ABRIR MODAL PARA CREAR TURNO (ACTUALIZADO)
    // ---------------------------------------------------------
    async function abrirModalCrearTurno(fechaStr) {

        // Fecha seleccionada
        const fechaInput = document.getElementById("fechaInput");
        fechaInput.value = fechaStr;
        await cargarTiposTurno(fechaStr);


        // ============================
        // 1) Cargar PACIENTES
        // ============================
        const resPac = await fetch("/pacientes");
        const pacientes = await resPac.json();

        const pacienteSelect = document.getElementById("pacienteSelect");
        pacienteSelect.innerHTML = `<option value="">Seleccione…</option>`;

        pacientes.forEach(p => {
            pacienteSelect.innerHTML += `
            <option value="${p.id}">${p.nombreCompleto}</option>
        `;
        });

        // ============================
        // 2) Cargar ESPECIALIDADES
        // ============================
        const resEsp = await fetch("/profesionales/especialidades")

        const especialidades = await resEsp.json();

        const espSelect = document.getElementById("especialidadSelectModal");
        espSelect.innerHTML = `<option value="">Seleccione…</option>`;

        especialidades.forEach(e => {
            espSelect.innerHTML += `
            <option value="${e.id}">${e.nombre}</option>
        `;
        });

        // limpiamos selects dependientes
        document.getElementById("medicoSelectModal").innerHTML =
            `<option value="">Seleccione un médico</option>`;
        document.getElementById("medicoSelectModal").disabled = true;

        // ⭐⭐ NUEVO: INICIALIZAR EL SELECT TIPO DE TURNO ⭐⭐
        const tipoTurnoSelect = document.getElementById("tipoTurnoSelect");
        if (tipoTurnoSelect) {
            tipoTurnoSelect.disabled = true;
            tipoTurnoSelect.innerHTML = `
        <option value="">Seleccione tipo de turno</option>
        <option value="normal">Turno normal</option>
        <option value="sobreturno">Sobreturno</option>
    `;

            // ⭐ NUEVA LÓGICA: CAMBIO DE TIPO DE TURNO
            tipoTurnoSelect.onchange = () => {
                const valor = tipoTurnoSelect.value;
                const horarioSelect = document.getElementById("horarioSelectModal");

                if (valor === "sobreturno") {
                    // ❗ Sobreturno NO necesita horario
                    horarioSelect.value = "";
                    horarioSelect.disabled = true;
                } else {
                    // ✔ Turno normal → habilito el horario
                    horarioSelect.disabled = false;
                }
            };
        }


        document.getElementById("horarioSelectModal").innerHTML =
            `<option value="">Seleccione un horario</option>`;
        document.getElementById("horarioSelectModal").disabled = true;

        // ============================
        // EVENTO: AL CAMBIAR ESPECIALIDAD
        // ============================
        espSelect.onchange = async () => {

            const espId = espSelect.value;
            const medSelect = document.getElementById("medicoSelectModal");

            if (!espId) {
                medSelect.innerHTML = `<option value="">Seleccione un médico</option>`;
                medSelect.disabled = true;
                return;
            }

            // cargar médicos de la especialidad
            const resMed = await fetch(`/profesionales/por-especialidad/${espId}`);
            const medicos = await resMed.json();

            medSelect.innerHTML = `<option value="">Seleccione un médico</option>`;
            medicos.forEach(m => {
                medSelect.innerHTML += `
        <option value="${m.id}">${m.nombre}</option>
    `;
            });



            medSelect.disabled = false;
        };

        // ============================
        // EVENTO: AL CAMBIAR MÉDICO  (FILTRADO POR FECHA SELECCIONADA)
        // ============================
        document.getElementById("medicoSelectModal").onchange = async () => {

            const medicoId = document.getElementById("medicoSelectModal").value;
            const espId = document.getElementById("especialidadSelectModal").value;
            const horarioSelect = document.getElementById("horarioSelectModal");

            console.log(">> CAMBIO MÉDICO");
            console.log("medicoId:", medicoId, "espId:", espId);

            if (!medicoId || !espId) return;

            // ================================
            // 1) BUSCAR LA AGENDA DEL MÉDICO
            // ================================
            const resAg = await fetch(`/agenda/buscar?medicoId=${medicoId}&especialidadId=${espId}`);
            const agendas = await resAg.json();

            console.log("AGENDA ENCONTRADA:", agendas);

            if (!agendas.length) {
                console.warn("⚠️ No hay agendas para este médico");
                horarioSelect.innerHTML = `<option>No hay horarios disponibles</option>`;
                horarioSelect.disabled = true;
                return;
            }

            const agendaId = agendas[0].id;
            console.log("AGENDA ID DETECTADA:", agendaId);

            // ⭐⭐⭐ IMPORTANTE ⭐⭐⭐
            horarioSelect.setAttribute("data-agenda", agendaId);

            // ================================
            // 2) CARGAR HORARIOS LIBRES
            // ================================
            const resHor = await fetch(`/agenda/horarios-libres/${agendaId}`);
            const horarios = await resHor.json();

            console.log("HORARIOS COMPLETOS:", horarios);

            const fechaSeleccionada = document.getElementById("fechaInput").value;

            const horariosFiltrados = horarios.filter(h => {
                const fechaNorm = h.fecha.slice(0, 10);
                return fechaNorm === fechaSeleccionada;
            });

            console.log("HORARIOS FILTRADOS:", horariosFiltrados);

            horarioSelect.innerHTML = `<option value="">Seleccione un horario</option>`;

            horariosFiltrados.forEach(h => {
                const hora = h.hora.slice(0, 5);
                horarioSelect.innerHTML += `<option value="${h.id}">${hora}</option>`;
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

        };

        // Abrir modal
        new bootstrap.Modal(document.getElementById("modalTurno")).show();
    }

    // ---------------------------------------------------------
    // CALENDARIO
    // ---------------------------------------------------------
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "es",       // ✔ idioma español
        height: "auto",
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            list: 'Lista'
        },

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
        },
        // 🔥 CLICK EN EL DÍA / HORA → VALIDAR FERIADO Y ABRIR MODAL 
        dateClick: async function (info) {

            const fecha = info.dateStr;

            try {
                // Consultar si ese día permite turnos
                const res = await fetch(`/turnos/tipos-turno?fecha=${fecha}`);
                const data = await res.json();

                // ❗ Si está vacío → es feriado → bloquear creación
                if (!data.tipos || data.tipos.length === 0) {
                    Swal.fire({
                        title: "Día feriado",
                        text: "No se pueden crear turnos en esta fecha.",
                        icon: "warning",
                        confirmButtonText: "Entendido",
                        confirmButtonColor: "#ff6b6b"
                    });
                    return; // ⛔ NO abrir modal
                }

                // ✔ No es feriado → seguir
                abrirModalCrearTurno(fecha);

            } catch (err) {
                console.error("Error verificando feriado:", err);

                Swal.fire({
                    title: "Error",
                    text: "No se pudo validar si la fecha es feriado.",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
        },


        events: function (info, success, failure) {

            const url = `/turnos/filtrar?medico=${medico}&especialidad=${especialidad}&estado=${estado}`;

            fetch(url)
                .then(res => res.json())
                .then(data => {

                    const eventos = data.map(e => {

                        // 🎨 Color especial para sobreturnos
                        const color =
                            e.tipo === "sobreturno"
                                ? "#ff5722" // naranja fuerte
                                : e.estado === "LIBRE" ? "#28a745"
                                    : e.estado === "RESERVADO" ? "#ffc107"
                                        : e.estado === "CONFIRMADO" ? "#0d6efd"
                                            : e.estado === "CANCELADO" ? "#dc3545"
                                                : "#6c757d";

                        return {
                            id: e.id,
                            title: e.pacienteNombre || (e.tipo === "sobreturno" ? "Sobreturno" : "Turno"),
                            start: e.start,   // ← viene del backend listo
                            end: e.end,
                            color,
                            extendedProps: {
                                estado: e.estado,
                                tipo: e.tipo,
                                motivo: e.motivo
                            }
                        };
                    });

                    success(eventos);
                })
                .catch(err => failure(err));
        }

    });

    calendar.render();
    window.calendar = calendar; // para refrescar desde fuera

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
    async function cargarTiposTurno(fecha) {
        const tipoTurnoSelect = document.getElementById("tipoTurnoSelect");
        if (!tipoTurnoSelect) return;

        tipoTurnoSelect.disabled = true;
        tipoTurnoSelect.innerHTML = `<option value="">Cargando...</option>`;

        try {
            const res = await fetch(`/turnos/tipos-turno?fecha=${fecha}`);
            const data = await res.json();

            tipoTurnoSelect.innerHTML = `<option value="">Seleccione tipo de turno</option>`;

            if (!data.tipos || data.tipos.length === 0) {
                tipoTurnoSelect.innerHTML =
                    `<option value="">No disponible (feriado)</option>`;
                return;
            }

            data.tipos.forEach(t => {
                tipoTurnoSelect.innerHTML += `
                <option value="${t}">${t === "normal" ? "Turno normal" : "Sobreturno"}</option>
            `;
            });

            tipoTurnoSelect.disabled = false;

        } catch (err) {
            console.error("Error cargando tipos turno:", err);
        }
    }


    // ---------------------------------------------------------
    // CUANDO CAMBIA EL MÉDICO → CARGAR SUS ESPECIALIDADES
    // ---------------------------------------------------------
    document.getElementById("medico").addEventListener("change", async () => {
        const medicoId = document.getElementById("medico").value;
        const espSelect = document.getElementById("especialidad");

        if (!medicoId) {
            espSelect.innerHTML = `<option value="">Seleccione…</option>`;
            return;
        }

        try {
            // Buscar especialidades del médico
            const res = await fetch(`/profesionales/${medicoId}/especialidades`);
            const data = await res.json();

            espSelect.innerHTML = `<option value="">Seleccione…</option>`;

            // Cargar especialidades del médico
            data.forEach(e => {
                espSelect.innerHTML += `
                <option value="${e.especialidadId}">
                    ${e.especialidadNombre}
                </option>
            `;
            });

            // Si tiene solo 1 → autoseleccionar
            if (data.length === 1) {
                espSelect.value = data[0].especialidadId;
            }

        } catch (err) {
            console.error("Error cargando especialidades del médico:", err);
        }
    });

    // ---------------------------------------------------------
    // FILTROS
    // ---------------------------------------------------------
    document.getElementById("applyFilters").addEventListener("click", () => {

        medico = document.getElementById("medico").value;
        especialidad = document.getElementById("especialidad").value;
        estado = document.getElementById("estado").value;

        calendar.refetchEvents();
    });

    // ---------------------------------------------------------
    // EJECUCIÓN INICIAL
    // ---------------------------------------------------------
    cargarMedicos();
    cargarEspecialidades();

});
