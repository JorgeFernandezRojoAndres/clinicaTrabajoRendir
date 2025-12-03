document.addEventListener("DOMContentLoaded", async () => {

    const tbody = document.querySelector("#tablaPacientes tbody");
    if (!tbody) return;

    try {
        const res = await fetch("/pacientes");
        const pacientes = await res.json();

        tbody.innerHTML = "";

        pacientes.forEach(p => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombreCompleto}</td>
                <td>${p.dni}</td>
                <td>${p.obraSocial}</td>
                <td>${p.contacto}</td>
            `;

            tbody.appendChild(tr);
        });

        if (!$.fn.DataTable.isDataTable("#tablaPacientes")) {
            $("#tablaPacientes").DataTable();
        }

    } catch (err) {
        console.error("Error cargando pacientes:", err);
        
    }

});
