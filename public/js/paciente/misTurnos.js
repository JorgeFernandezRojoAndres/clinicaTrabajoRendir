// =====================================================
// 📌 MIS TURNOS DEL PACIENTE
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.querySelector("main .turnos-container");
    if (!contenedor) return;

    contenedor.innerHTML = "<p>Cargando...</p>";

    try {
        const res = await fetch("/turnos/paciente", { credentials: "include" });
        const data = await res.json();

        if (!data.ok) {
            contenedor.innerHTML = "<p>No se pudieron cargar tus turnos.</p>";
            return;
        }

        const turnos = data.turnos || [];
        if (turnos.length === 0) {
            contenedor.innerHTML = "<p>No tenés turnos registrados.</p>";
            return;
        }

        contenedor.innerHTML = "";

        turnos.forEach(t => {
            const card = document.createElement("div");
            card.classList.add("turno-card");
            if (t.estado && t.estado.toLowerCase() === "confirmado") {
                card.classList.add("confirmado");
            }
            const fecha = t.fechaHora ? new Date(t.fechaHora) : null;
            const fechaStr = fecha
                ? fecha.toLocaleDateString("es-AR") + " - " + fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
                : "Sin fecha";

            card.innerHTML = `
                <div class="info">
                    <h3>${fechaStr}</h3>
                    <p><b>Especialidad:</b> ${t.especialidadNombre || ""}</p>
                    <p><b>Médico:</b> ${t.medicoNombre || ""}</p>
                    <p><b>Estado:</b> ${t.estado || ""}</p>
                </div>
            `;

            contenedor.appendChild(card);
        });

    } catch (err) {
        console.error("Error cargando turnos del paciente:", err);
        contenedor.innerHTML = "<p>Error al cargar.</p>";
    }
});
