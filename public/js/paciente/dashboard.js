document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/paciente/datos/json", { credentials: "include" });
        const data = await res.json();
        if (data.ok && data.paciente) {
            const nombre = data.paciente.nombreCompleto || "Paciente";
            const nombreEl = document.getElementById("pac-nombre");
            if (nombreEl) nombreEl.textContent = nombre;
        }
    } catch (err) {
        console.error("Error cargando datos paciente:", err);
    }
});
