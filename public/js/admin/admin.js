// =========================================================
// 📌 CARGA AUTOMÁTICA DEL DASHBOARD DEL ADMINISTRADOR
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {

    // Si esta vista no es el dashboard, no hacemos nada
    if (!document.querySelector(".dashboard-container")) return;

    try {
        const res = await fetch("/admin-panel/dashboard-data");

        const data = await res.json();

        if (!data.ok) {
            console.error("Error en dashboard:", data.error);
            return;
        }

        const d = data.data; // 🔥 acceso directo a los datos reales del backend

        // =============================
        //  Asignar datos al panel
        // =============================
        document.getElementById("statProfesionales").textContent = d.totalProfesionales;
        document.getElementById("statPacientes").textContent = d.totalPacientes;
        document.getElementById("statTurnosHoy").textContent = d.turnosHoy;
       
        // Próximos turnos (si existen)
        if (d.proximosTurnos && d.proximosTurnos.length > 0) {
            const cont = document.getElementById("listaTurnos");

            d.proximosTurnos.forEach(t => {
                const div = document.createElement("div");
                div.classList.add("turno-item");
                div.innerHTML = `<p><b>${t.hora}</b> — ${t.paciente} / ${t.profesional}</p>`;
                cont.appendChild(div);
            });
        }

    } catch (err) {
        console.error("Error cargando dashboard:", err);
    }
});


// =========================================================
// 📌 MANEJO DE CLICKS EN TARJETAS PRINCIPALES DEL PANEL ADMIN
// =========================================================

document.addEventListener("click", (e) => {
    const card = e.target.closest(".link-box");
    if (!card) return;

    const url = card.getAttribute("href");
    if (url) window.location.href = url;
});
