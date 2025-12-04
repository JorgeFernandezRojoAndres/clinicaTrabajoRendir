// =====================================================
// 📌 MIS TURNOS DEL PROFESIONAL
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const inputFecha = document.querySelector(".date-selector");
    const listaTurnos = document.querySelector("#turnos-lista");

    if (!inputFecha || !listaTurnos) return;

    // ⭐ Cargar turnos del día actual
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.value = hoy;
    cargarTurnos(hoy);

    // ⭐ Cambiar fecha → actualizar lista
    inputFecha.addEventListener("change", () => {
        cargarTurnos(inputFecha.value);
    });

    async function cargarTurnos(fecha) {
        try {
            listaTurnos.innerHTML = `<p>Cargando...</p>`;

            // 🔥 1. Verificar si es feriado (USANDO LA RUTA CORRECTA)
            const resFeriado = await fetch(`/api/feriados/feriado?fecha=${fecha}`);
            const dataFeriado = await resFeriado.json();

            if (dataFeriado.esFeriado === true) {
                listaTurnos.innerHTML = `
                <p style="color:red; font-weight:bold;">
                    Este día es feriado. No hay horarios disponibles.
                </p>`;

                Swal.fire({
                    icon: "warning",
                    title: "Día no laborable",
                    text: "Este día es feriado. No hay turnos disponibles.",
                    confirmButtonText: "Entendido"
                });

                return; // ⛔ NO buscar turnos
            }

            // 🔥 2. Buscar turnos normalmente
            const res = await fetch(`/turnos/profesional?fecha=${fecha}`);
            const data = await res.json();

            if (!data.ok) {
                listaTurnos.innerHTML = `<p>No hay turnos.</p>`;
                return;
            }

            if (data.turnos.length === 0) {
                listaTurnos.innerHTML = `<p>No hay turnos para esta fecha.</p>`;
                return;
            }

            listaTurnos.innerHTML = "";

            data.turnos.forEach(t => {

                const div = document.createElement("div");
                div.classList.add("turno-card");
                const esSobreturno = (t.estado || "").toUpperCase() === "SOBRETURNO";
                const badgeSobreturno = esSobreturno ? `<span class="pill pill-sobre">SOBRETURNO</span>` : "";

                // 🔥 REGLA FINAL
                // SI ESTÁ ATENDIDO → NO HAY BOTÓN
                let boton = "";

                if (t.estado !== "ATENDIDO") {

                    const texto =
                        t.estado === "EN CONSULTA"
                            ? "Continuar"
                            : "Atender";

                    boton = `
                        <button class="btn-atender" data-id="${t.id}">
                            ${texto}
                        </button>
                    `;
                }

                div.innerHTML = `
    <div class="turno-info">
        <h3>${t.paciente}</h3>
        <p class="turno-hora">${t.hora} hs ${badgeSobreturno}</p>
    </div>

    <div class="turno-estado ${t.estado.toLowerCase()}">
        ${t.estado}
    </div>

    <div class="turno-acciones">
        ${boton}
        <button class="btn-historia" data-paciente="${t.id_paciente}">
            Historia
        </button>
    </div>
`;


                listaTurnos.appendChild(div);
            });

        } catch (err) {
            console.error("Error cargando turnos:", err);
            listaTurnos.innerHTML = `<p>Error al cargar.</p>`;
        }
    }

    // =====================================================
    // 📌 VERIFICAR SI LA FECHA ES FERIADO
    // =====================================================
    async function esFeriado(fecha) {
        try {
            const res = await fetch(`/api/feriados/feriado?fecha=${fecha}`)
            const data = await res.json();
            return data.esFeriado === true;
        } catch (err) {
            console.error("Error verificando feriado:", err);
            return false;
        }
    }
    // =====================================================
    // 📌 VER HISTORIA CLÍNICA DEL PACIENTE
    // =====================================================
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-historia");
        if (!btn) return;

        const pacienteId = btn.dataset.paciente;
        if (!pacienteId) {
            console.error("❌ No se encontró pacienteId en el botón Historia");
            return;
        }

        // 🔥 Ruta REAL de tu backend:
        // GET /historia/historial/:pacienteId
        window.location.href = `/pro-historia/${pacienteId}?paciente=${pacienteId}`;


    });


    // =====================================================
    // 📌 INICIAR / CONTINUAR CONSULTA
    // =====================================================
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-atender");
        if (!btn) return;

        const id = btn.dataset.id;

        try {
            const res = await fetch(`/turnos/iniciar/${id}`, {
                method: "PUT"
            });

            const data = await res.json();

            if (!data.ok) {
                alert(data.error || "No se pudo iniciar la consulta");
                return;
            }

            // Redirigir a la vista de atención
            window.location.href = `/pro-atencion/${id}`;

        } catch (err) {
            console.error("Error iniciando consulta:", err);
        }
    });

});
