// =====================================================
// 📌 HISTORIA CLÍNICA DEL PROFESIONAL
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    // ⚠ Necesitamos el ID del paciente
    // 1) Buscar en query param: /pro-historia?paciente=12
    const params = new URLSearchParams(window.location.search);
    let pacienteId = params.get("paciente");

    // 2) Si no vino por query param → tomarlo de /pro-historia/12
    if (!pacienteId) {
        const partes = window.location.pathname.split("/");
        const posibleId = partes.pop();

        if (!isNaN(posibleId)) {
            pacienteId = posibleId;
        }
    }

    if (!pacienteId) {
        console.error("No se recibió pacienteId en /pro-historia");
        return;
    }

    // Contenedor donde se va a renderizar el historial
    const contenedor = document.querySelector("#historial-clinico");
    if (!contenedor) return;

    contenedor.innerHTML = `<p>Cargando historial...</p>`;

    try {
        // ===============================
        // 1. Traer historial del backend
        // ===============================
        const res = await fetch(`/pro-historia/historial/${pacienteId}`);

        const data = await res.json();

        if (!data.ok) {
            contenedor.innerHTML = `<p>No hay historial disponible.</p>`;
            return;
        }

        const historial = data.historial;

        // =====================================================
        // 📌 Cargar datos básicos del paciente
        // =====================================================
        async function cargarDatosPaciente(id) {
            try {
                const res = await fetch(`/pro-historia/paciente/${id}`);
                const data = await res.json();

                if (!data.ok) {
                    console.error("Error cargando paciente");
                    return;
                }

                const p = data.paciente;

                // Verificar que los elementos existen antes de intentar asignarles valores
                const nombreElemento = document.getElementById("paciente-nombre");
                const edadElemento = document.getElementById("paciente-edad");
                const dniElemento = document.getElementById("paciente-dni");
                const obraElemento = document.getElementById("paciente-obra");

                if (nombreElemento) nombreElemento.textContent = p.nombreCompleto || "Nombre no disponible";
                if (edadElemento) edadElemento.textContent = p.edad || "...";
                if (dniElemento) dniElemento.textContent = p.dni || "DNI no disponible";
                if (obraElemento) obraElemento.textContent = p.obraSocial || "Obra Social no disponible";

            } catch (err) {
                console.error("Error cargando datos del paciente:", err);
            }
        }


        // ⭐⭐⭐ AGREGADO — LLAMAR A CARGAR DATOS DEL PACIENTE
        cargarDatosPaciente(pacienteId);

        // ===============================
        // 2. Renderizar historial
        // ===============================
        if (!historial || historial.length === 0) {
            contenedor.innerHTML = `<p>Este paciente no tiene atenciones previas contigo.</p>`;
            return;
        }

        contenedor.innerHTML = "";

        historial.forEach(h => {
            const item = document.createElement("div");
            item.classList.add("historia-card");

            item.innerHTML = `
                <div class="hc-fecha">${h.fecha_atencion || ""}</div>

                <div class="hc-prof">${h.profesional}</div>

                <div class="hc-diag">
                    <strong>Diagnóstico:</strong> ${h.diagnostico || "Sin diagnóstico"}
                </div>

                <div class="hc-motivo">
                    <strong>Motivo:</strong> ${h.motivo || "No registrado"}
                </div>

                <button class="hc-detalle-btn" data-id="${h.id}">
                    Ver detalle
                </button>
            `;

            contenedor.appendChild(item);
        });

        // ===============================
        // 3. Botón “Ver detalle”
        // ===============================
        document.querySelectorAll(".hc-detalle-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idAtencion = e.target.dataset.id;
                window.location.href = `/pro-historia/detalle/${idAtencion}`;
            });
        });

    } catch (err) {
        console.error("Error cargando historial:", err);
        contenedor.innerHTML = `<p>Error cargando historial.</p>`;
    }

});
