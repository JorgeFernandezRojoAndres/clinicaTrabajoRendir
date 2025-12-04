// =====================================================
// 📌 MIS TURNOS DEL PACIENTE
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.querySelector(".turnos-lista");
    const nombreEl = document.getElementById("pac-nombre-turnos");
    if (!contenedor) return;

    contenedor.innerHTML = "<p>Cargando...</p>";

    // poner nombre si está disponible desde dashboard
    try {
        const r = await fetch("/paciente/datos/json", { credentials: "include" });
        const d = await r.json();
        if (d.ok && d.paciente && nombreEl) {
            nombreEl.textContent = d.paciente.nombreCompleto || "Paciente";
        }
    } catch (e) {}

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

            const fecha = t.fechaHora ? new Date(t.fechaHora) : null;
            const fechaStr = fecha
                ? fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
                  " · " +
                  fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
                : "Sin fecha";

            const badgeClass = t.tipoTurno === "sobreturno" ? "badge sobreturno" : "badge";
            const estado = (t.estado || "").toUpperCase();

            card.innerHTML = `
                <div class="turno-left">
                    <h3>${fechaStr}</h3>
                    <p><b>Profesional:</b> ${t.medicoNombre || "-"}</p>
                    <p><b>Especialidad:</b> ${t.especialidadNombre || "-"}</p>
                    <p><b>Motivo:</b> ${t.motivo || "No registrado"}</p>
                </div>
                <div class="turno-right">
                    <span class="${badgeClass}">${t.tipoTurno === "sobreturno" ? "Sobreturno" : estado || "Pendiente"}</span>
                    <a class="btn-detalle" href="#" data-id="${t.id}">Ver detalle</a>
                </div>
            `;

            contenedor.appendChild(card);
        });

        contenedor.addEventListener("click", (e) => {
            const link = e.target.closest(".btn-detalle");
            if (!link) return;
            e.preventDefault();
            const id = link.dataset.id;
            console.log("Detalle turno ID:", id);
            alert("Detalle pendiente de implementar (ID " + id + ")");
        });

    } catch (err) {
        console.error("Error cargando turnos del paciente:", err);
        contenedor.innerHTML = "<p>Error al cargar.</p>";
    }
});
