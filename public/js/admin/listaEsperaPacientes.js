document.addEventListener("DOMContentLoaded", async () => {

    const tbody = document.querySelector("#tablaPacientesPendientes");

    async function cargarPendientes() {
        try {
            const res = await fetch("/admin/pacientes-pendientes");
            const data = await res.json();

            tbody.innerHTML = "";

            if (!data.length) {
                tbody.innerHTML = `<tr><td colspan="6">No hay pacientes pendientes.</td></tr>`;
                return;
            }

            data.forEach(p => {
                tbody.innerHTML += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.nombre} ${p.apellido}</td>
                        <td>${p.dni}</td>
                        <td>${p.obraSocial || "-"}</td>
                        <td>${p.telefono || "-"}</td>
                        <td>
                            <button class="btn-editar" data-id="${p.id}" data-action="aprobar">Aprobar</button>
                            <button class="btn-eliminar" data-id="${p.id}" data-action="rechazar">Rechazar</button>
                        </td>
                    </tr>
                `;
            });

            document.querySelectorAll("button[data-action]").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.dataset.id;
                    const action = btn.dataset.action;

                    await procesarAccion(id, action);
                });
            });

        } catch (err) {
            console.error("Error trayendo pendientes:", err);
        }
    }

    async function procesarAccion(id, accion) {
        try {
            const res = await fetch(`/admin/pacientes-pendientes/${id}/${accion}`, {
                method: "PUT"
            });

            const data = await res.json();

            if (data.ok) {
                alert(`Paciente ${accion === "aprobar" ? "aprobado" : "rechazado"} correctamente`);
                cargarPendientes();
            } else {
                alert("Error: " + data.error);
            }

        } catch (err) {
            console.error("Error procesando acción:", err);
        }
    }

    cargarPendientes();
});
