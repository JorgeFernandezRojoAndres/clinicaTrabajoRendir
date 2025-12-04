document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/paciente/datos/json", { credentials: "include" });
        const data = await res.json();
        if (!res.ok || data.ok === false) {
            alert(data.error || "No se pudieron cargar tus datos");
            return;
        }
        const p = data.paciente || {};
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val || "-";
        };
        set("d-nombre", p.nombreCompleto);
        set("d-dni", p.dni);
        set("d-obra", p.obraSocial);
        set("d-contacto", p.contacto);
        set("d-estado", p.estado);
    } catch (err) {
        console.error("Error cargando datos:", err);
        alert("Error al cargar tus datos.");
    }
});
