document.addEventListener("DOMContentLoaded", () => {
    const tipoSel = document.getElementById("tipo-reporte");
    const desdeInp = document.getElementById("fecha-desde");
    const hastaInp = document.getElementById("fecha-hasta");
    const btnGenerar = document.getElementById("btn-generar");
    const contenedor = document.getElementById("contenedor-resultado");
    const acciones = document.getElementById("acciones-reporte");
    const btnDescargar = document.getElementById("btn-descargar");

    let ultimoCSV = null;

    btnGenerar?.addEventListener("click", async () => {
        const tipo = tipoSel.value;
        const desde = desdeInp.value || "";
        const hasta = hastaInp.value || "";

        const params = new URLSearchParams({ tipo, desde, hasta });
        contenedor.innerHTML = "<p>Generando...</p>";
        acciones.style.display = "none";
        ultimoCSV = null;

        try {
            const resp = await fetch(`/admin-panel/reportes-data?${params.toString()}`);
            const data = await resp.json();
            if (!resp.ok || data.ok === false) {
                contenedor.innerHTML = `<p>Error: ${data.error || "No se pudo generar el reporte"}</p>`;
                return;
            }

            // Render según tipo
            if (tipo === "turnos-dia") {
                contenedor.innerHTML = renderTabla(data.rows, ["fecha", "total"]);
            } else if (tipo === "consultas-profesional") {
                contenedor.innerHTML = renderTabla(data.rows, ["profesional", "total"]);
            } else {
                contenedor.innerHTML = "<p>Tipo de reporte no soportado.</p>";
            }

            // CSV para descarga
            ultimoCSV = data.csv || null;
            if (ultimoCSV) {
                acciones.style.display = "flex";
            }

        } catch (err) {
            console.error("Error generando reporte:", err);
            contenedor.innerHTML = "<p>Error al generar el reporte.</p>";
        }
    });

    btnDescargar?.addEventListener("click", () => {
        if (!ultimoCSV) return;
        const blob = new Blob([ultimoCSV], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "reporte.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    function renderTabla(rows, columnas) {
        if (!rows || !rows.length) return "<p>Sin datos en el rango seleccionado.</p>";

        const header = columnas.map(c => `<th>${c}</th>`).join("");
        const body = rows.map(r => {
            return "<tr>" + columnas.map(c => `<td>${r[c] ?? "-"}</td>`).join("") + "</tr>";
        }).join("");

        return `
            <table class="data-table">
                <thead><tr>${header}</tr></thead>
                <tbody>${body}</tbody>
            </table>
        `;
    }
});
