// ============================================================================
//  GESTIÓN DE AGENDAS - PANEL ADMIN
// ============================================================================

document.addEventListener("DOMContentLoaded", async () => {

    const selProfesional = document.querySelector("#profesionalSelect");
    const selEspecialidad = document.querySelector("#especialidadSelect");
    const selSucursal = document.querySelector("#sucursalSelect");
    const selIntervalo = document.querySelector("#intervaloSelect");
    const btnCrear = document.querySelector("#btnCrearAgenda");
    const contenedorAgendas = document.querySelector("#listaAgendas");

    const inputHoraInicio = document.querySelector("#horaInicio");
    const inputHoraFin = document.querySelector("#horaFin");
    selProfesional.addEventListener("change", cargarEspecialidadesDelProfesional);

    // Obtener días laborales marcados
    function obtenerDiasLaborales() {
        return [...document.querySelectorAll(".dias-grid input:checked")]
            .map(c => c.value)
            .join(",");
    }

    // =========================================================================
    // 1. CARGAR PROFESIONALES
    // =========================================================================
    async function cargarProfesionales() {
        try {
            const res = await fetch("/profesionales/medicos");
            const data = await res.json();

        selProfesional.innerHTML = `<option value="">Seleccione...</option>`;

        data.forEach(p => {
            selProfesional.innerHTML += `
        <option value="${p.id}">${p.nombre}</option>
    `;
        });


    } catch (err) {
        console.error("Error cargando profesionales:", err);
    }
}
    // =========================================================================
    // 1b. CARGAR SUCURSALES
    // =========================================================================
    async function cargarSucursales() {
        try {
            const res = await fetch("/agenda/sucursales");
            const data = await res.json();
            const sucursales = data.ok ? data.sucursales : [];

            selSucursal.innerHTML = `<option value="">Seleccione...</option>`;
            sucursales.forEach(s => {
                selSucursal.innerHTML += `<option value="${s}">${s}</option>`;
            });
        } catch (err) {
            console.error("Error cargando sucursales:", err);
        }
    }

    // =========================================================================
    // 2b. CARGAR ESPECIALIDADES SEGÚN EL PROFESIONAL SELECCIONADO
    // =========================================================================
    async function cargarEspecialidadesDelProfesional() {
        const profesionalId = selProfesional.value;

        // Si no eligió nada, limpiar select
        if (!profesionalId) {
            selEspecialidad.innerHTML = `<option value="">Seleccione...</option>`;
            return;
        }

        try {
            const res = await fetch(`/profesionales/${profesionalId}/especialidades`);
            const data = await res.json();

            selEspecialidad.innerHTML = "";

            // Si no tiene especialidades
            if (data.length === 0) {
                selEspecialidad.innerHTML = `<option value="">Sin especialidades</option>`;
                return;
            }

            // Si tiene una sola → seleccionarla automáticamente
            if (data.length === 1) {
                selEspecialidad.innerHTML = `
                <option value="${data[0].especialidadId}" selected>${data[0].especialidadNombre}</option>
            `;
                return;
            }

            // Si tiene varias → mostrarlas todas
            selEspecialidad.innerHTML = `<option value="">Seleccione...</option>`;
            data.forEach(e => {
                selEspecialidad.innerHTML += `
                <option value="${e.especialidadId}">${e.especialidadNombre}</option>
            `;
            });

        } catch (err) {
            console.error("Error cargando especialidades del profesional:", err);
        }
    }

    // =========================================================================
    // 3. CREAR AGENDA
    // =========================================================================
    async function crearAgenda() {
        const profesionalId = selProfesional.value;
        const especialidadId = selEspecialidad.value;
        const sucursal = selSucursal.value;
        const intervalo = selIntervalo.value;

        const horaInicio = inputHoraInicio.value;
        const horaFin = inputHoraFin.value;

        const diasLaborales = obtenerDiasLaborales();

        if (!profesionalId || !especialidadId || !intervalo || !horaInicio || !horaFin || !sucursal) {
            alert("Complete todos los campos (incluida la sucursal).");
            return;
        }

        // Como tu tabla tiene "profesionalEspecialidadId",
        // HACEMOS UN POST QUE RESPETE TU MODELO.
        try {
            const res = await fetch("/agenda", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profesionalId,
                    especialidadId,
                    intervaloMin: intervalo,
                    diasLaborales,
                    horaInicio,
                    horaFin,
                    sucursal
                })
            });

            const data = await res.json();

            if (data.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Agenda creada",
                    timer: 1400,
                    showConfirmButton: false
                });
                cargarAgendas();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "No se pudo crear",
                    text: data.error || "Error al crear agenda"
                });
            }

        } catch (err) {
            console.error("Error creando agenda:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "No se pudo crear la agenda"
            });
        }
    }

    // =========================================================================
    // 4. LISTAR AGENDAS EXISTENTES
    // =========================================================================
    async function cargarAgendas() {
        try {
            const res = await fetch("/agenda");
            const data = await res.json();

            contenedorAgendas.innerHTML = "";

            if (data.length === 0) {
                contenedorAgendas.innerHTML = `<p>No hay agendas registradas.</p>`;
                return;
            }

            data.forEach(a => {

                contenedorAgendas.innerHTML += `
                    <div class="agenda-item">
                        <p><b>${a.profesionalNombre} — ${a.especialidadNombre}</b></p>
                        <p>Días: ${a.diasLaborales}</p>
                        <p>Horario: ${a.horaInicio} a ${a.horaFin}</p>
                        <p>Intervalo: ${a.intervaloMin} min</p>

                        <button class="btn-editar" data-id="${a.id}">Editar</button>
                    </div>
                `;
            });

            // Botones editar (actualizado)
            document.querySelectorAll(".btn-editar").forEach(btn => {
                btn.addEventListener("click", async () => {

                    const id = btn.dataset.id;

                    // Traer datos reales de la agenda
                    const res = await fetch(`/agenda/${id}`);
                    const agenda = await res.json();

                    // Cargar valores en el modal
                    document.getElementById("editAgendaId").value = id;
                    document.getElementById("editIntervalo").value = agenda.intervaloMin;
                    document.getElementById("editDiasLaborales").value = agenda.diasLaborales;
                    document.getElementById("editHoraInicio").value = agenda.horaInicio;
                    document.getElementById("editHoraFin").value = agenda.horaFin;

                    // Abrir modal
                    new bootstrap.Modal(document.getElementById("modalEditarAgenda")).show();
                });
            });

        } catch (err) {
            console.error("Error cargando agendas:", err);
        }
    }
    // ============================================================
    //  ELIMINAR AGENDA
    // ============================================================
    document.addEventListener("click", async (e) => {

        if (e.target.id !== "btnEliminarAgenda") return;

        const id = document.getElementById("editAgendaId").value;

        if (!confirm("¿Desea eliminar esta agenda? Esta acción no se puede deshacer.")) {
            return;
        }

        const res = await fetch(`/agenda/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (data.ok) {
            alert("Agenda eliminada correctamente.");
            bootstrap.Modal.getInstance(document.getElementById("modalEditarAgenda")).hide();
            cargarAgendas();
        } else {
            alert("Error eliminando agenda.");
        }
    });


    // =========================================================================
    // EVENTOS
    // =========================================================================
    btnCrear.addEventListener("click", crearAgenda);

    // =========================================================================
    // EJECUCIÓN INICIAL
    // =========================================================================
    await cargarProfesionales();
    await cargarSucursales();
    //await cargarEspecialidades();
    await cargarAgendas();

});
