document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/admin-panel/dashboard-data");

        const data = await res.json();

        if (!data.ok) return;

        const d = data.data;

        document.getElementById("consultasMes").textContent = d.consultasMes;
        document.getElementById("turnosHoy").textContent = d.turnosHoy;

    } catch (e) {
        console.error("Error cargando reportes:", e);
    }
});
