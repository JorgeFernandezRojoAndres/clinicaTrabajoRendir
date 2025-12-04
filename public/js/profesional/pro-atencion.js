// ===================================================== 
// 📌 ATENCIÓN MÉDICA — CARGA INICIAL
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    // Obtener ID del turno desde la URL: /pro-atencion/15
    const idTurno = window.location.pathname.split("/").pop();
    console.log("Turno cargado:", idTurno);

    // Campos visibles en el HTML
    const inputNombre       = document.querySelector("#pacienteNombre");
    const inputEdad         = document.querySelector("#pacienteEdad");
    const selectGenero      = document.querySelector("#pacienteGenero");

    const txtMotivo         = document.querySelector("#motivo");
    const txtEvolucion      = document.querySelector("#evolucion");

    // Contenedores clínicos
    const contAlergias      = document.querySelector("#alergias");
    const contAntecedentes  = document.querySelector("#antecedentes");
    const contHabitos       = document.querySelector("#habitos");
    const contMedicacion    = document.querySelector("#medicacion");
    const listaDiagnosticos = document.querySelector("#listaDiagnosticos");
    const btnAddDiag        = document.querySelector("#btnAddDiag");

    if (!inputNombre) return;

    // ID REAL DE LA ATENCIÓN
    let atencionId = null;
    let diagnosticosCache = [];

    try {
        // 🔥 NUEVA RUTA CORRECTA
        const res = await fetch(`/atencion/turno/${idTurno}`);
        const data = await res.json();

        if (!data.ok) {
            console.error("No se pudo cargar la atención:", data.error);
            return;
        }

        const t = data.turno;
        atencionId = data.atencionId;

        // =====================================================
        // 📌 CARGAR DATOS DEL PACIENTE
        // =====================================================
        inputNombre.value = t.pacienteNombre || "";
        inputEdad.value = t.fechaNacimiento 
            ? calcularEdad(t.fechaNacimiento) + " años" 
            : "";
        selectGenero.value = t.genero || "";

        // =====================================================
        // 📌 CARGAR MOTIVO Y EVOLUCIÓN (si existe)
        // =====================================================
        txtMotivo.value = t.motivoTurno || "";
        txtEvolucion.value = t.evolucion || "";

        // =====================================================
        // 📌 CARGAR HISTORIA CLÍNICA (texto simple)
        // =====================================================
        renderTexto(contAlergias,     data.historiaClinica.alergias);
        renderTexto(contAntecedentes, data.historiaClinica.antecedentes);
        renderTexto(contHabitos,      data.historiaClinica.habitos);
        renderTexto(contMedicacion,   data.historiaClinica.medicamentos);

        // =====================================================
        // 📌 CARGAR DIAGNÓSTICOS
        // =====================================================
        diagnosticosCache = data.diagnosticos || [];
        renderDiagnosticos();

    } catch (err) {
        console.error("Error cargando atención:", err);
    }

    // -----------------------------------------------------
    // Función para calcular edad
    // -----------------------------------------------------
    function calcularEdad(fecha) {
        const nacimiento = new Date(fecha);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();

        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }

    // -----------------------------------------------------
    // Función para renderizar en TEXTAREA
    // -----------------------------------------------------
    function renderTexto(textarea, items) {
        if (!items || items.length === 0) {
            textarea.value = "";
            return;
        }

        textarea.value = items
            .map(i => i.descripcion || i.nombre || i.detalle || "")
            .join("\n");
    }

    // -----------------------------------------------------
    // Renderizar diagnósticos
    // -----------------------------------------------------
    function renderDiagnosticos() {
        if (!listaDiagnosticos) return;
        if (!diagnosticosCache || diagnosticosCache.length === 0) {
            listaDiagnosticos.innerHTML = "<p class=\"muted\">Sin diagnósticos cargados.</p>";
            return;
        }

        listaDiagnosticos.innerHTML = "";

        diagnosticosCache.forEach(diag => {
            const item = document.createElement("div");
            item.classList.add("diag-item");
            item.innerHTML = `
                <div>
                    <strong>${diag.tipo || "Preliminar"}</strong><br>
                    <span>${diag.descripcion || ""}</span>
                </div>
                <button class="btn-borrar" data-id="${diag.id}">Eliminar</button>
            `;
            listaDiagnosticos.appendChild(item);
        });

        listaDiagnosticos.querySelectorAll(".btn-borrar").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.dataset.id;
                if (!id) return;

                const confirm = await Swal.fire({
                    icon: "warning",
                    title: "Eliminar diagnóstico",
                    text: "¿Confirmás eliminarlo?",
                    showCancelButton: true,
                    confirmButtonText: "Sí, eliminar"
                });
                if (!confirm.isConfirmed) return;

                try {
                    const res = await fetch(`/diagnosticos/${id}`, { method: "DELETE" });
                    const data = await res.json();
                    if (!data.ok) throw new Error(data.error || "No se pudo eliminar");

                    diagnosticosCache = diagnosticosCache.filter(d => String(d.id) !== String(id));
                    renderDiagnosticos();
                } catch (err) {
                    console.error(err);
                    Swal.fire("Error", err.message || "No se pudo eliminar", "error");
                }
            });
        });
    }

    // -----------------------------------------------------
    // Añadir diagnóstico
    // -----------------------------------------------------
    btnAddDiag?.addEventListener("click", async () => {
        if (!atencionId) {
            return Swal.fire("Atención no encontrada", "Reabrí la consulta e intenta de nuevo.", "error");
        }

        const { value: formValues, isConfirmed } = await Swal.fire({
            title: "Nuevo diagnóstico",
            html: `
                <textarea id="diag-desc" class="swal2-textarea" placeholder="Descripción" rows="4"></textarea>
                <select id="diag-tipo" class="swal2-select">
                    <option value="preliminar" selected>Preliminar</option>
                    <option value="definitivo">Definitivo</option>
                    <option value="probable">Probable</option>
                </select>
            `,
            focusConfirm: false,
            preConfirm: () => {
                const descripcion = (document.getElementById("diag-desc").value || "").trim();
                const tipo = (document.getElementById("diag-tipo").value || "preliminar").trim();
                if (!descripcion) {
                    Swal.showValidationMessage("Ingresá una descripción");
                    return false;
                }
                return { descripcion, tipo };
            },
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            showCancelButton: true
        });

        if (!isConfirmed || !formValues) return;

        try {
            const res = await fetch("/diagnosticos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    atencionId,
                    descripcion: formValues.descripcion,
                    tipo: formValues.tipo
                })
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || "No se pudo guardar");

            diagnosticosCache.unshift({
                id: data.id,
                descripcion: formValues.descripcion,
                tipo: formValues.tipo
            });
            renderDiagnosticos();
            Swal.fire("Guardado", "Diagnóstico agregado.", "success");
        } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || "No se pudo guardar el diagnóstico.", "error");
        }
    });

    // =====================================================
    // 📌 BOTÓN GUARDAR EVOLUCIÓN (UPDATE ATENCIÓN)
    // =====================================================
    document.querySelector("#btnGuardar").addEventListener("click", async () => {

        if (!atencionId) {
            return Swal.fire("Error", "No se encontró la atención.", "error");
        }

        const evolucion = txtEvolucion.value;
        const payloads = [
            { url: `/atencion/${atencionId}`, body: { evolucion }, method: "PUT" },
        ];

        // Helpers para dividir los textarea por línea y armar peticiones
        const toLines = (txt) =>
            (txt || "")
                .split("\n")
                .map(t => t.trim())
                .filter(Boolean);

        toLines(contAlergias?.value).forEach(descripcion => {
            payloads.push({ url: `/atencion/${atencionId}/alergias`, body: { descripcion }, method: "POST" });
        });
        toLines(contAntecedentes?.value).forEach(descripcion => {
            payloads.push({ url: `/atencion/${atencionId}/antecedentes`, body: { descripcion }, method: "POST" });
        });
        toLines(contHabitos?.value).forEach(descripcion => {
            payloads.push({ url: `/atencion/${atencionId}/habitos`, body: { descripcion }, method: "POST" });
        });
        toLines(contMedicacion?.value).forEach(descripcion => {
            payloads.push({ url: `/atencion/${atencionId}/medicamentos`, body: { descripcion }, method: "POST" });
        });

        try {
            for (const p of payloads) {
                const res = await fetch(p.url, {
                    method: p.method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(p.body)
                });
                const data = await res.json();
                if (!data.ok) {
                    throw new Error(data.error || "Error guardando datos");
                }
            }

            Swal.fire("Guardado", "Atención actualizada.", "success");

        } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || "No se pudo guardar.", "error");
        }
    });

    // ======================================================
    // 📌 BOTÓN "CERRAR CONSULTA" — MARCA EL TURNO COMO ATENDIDO
    // ======================================================
    document.querySelector("#btnCerrar").addEventListener("click", async () => {

        if (!diagnosticosCache || diagnosticosCache.length === 0) {
            return Swal.fire("No se puede cerrar", "Agregá al menos un diagnóstico.", "warning");
        }
        if (!txtEvolucion.value.trim()) {
            return Swal.fire("No se puede cerrar", "Cargá una evolución.", "warning");
        }

        try {
            const res = await fetch(`/turnos/finalizar/${idTurno}`, {
                method: "PUT"
            });

            const data = await res.json();

            if (!data.ok) {
                return Swal.fire("Error", data.error, "error");
            }

            Swal.fire({
                icon: "success",
                title: "Consulta finalizada",
                timer: 1500,
                showConfirmButton: false
            });

            setTimeout(() => {
                window.location.href = "/pro-panel";
            }, 1500);

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "No se pudo cerrar la consulta.", "error");
        }
    });

});
