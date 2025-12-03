// ====================================================================== 
// 📌 PROFESIONALES - ADMINISTRADOR
// ======================================================================

document.addEventListener("DOMContentLoaded", async () => {

    const tablaBody = document.querySelector("#tablaProfesionales tbody");
    if (!tablaBody) return; // seguridad por si no está en esta vista

    try {
        // Traemos los profesionales desde el backend
        const res = await fetch("/profesionales");
        const profesionales = await res.json();

        tablaBody.innerHTML = ""; // limpiar tabla

        profesionales.forEach(p => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.usuario}</td>
                <td>${p.rol}</td>
                <td>
                    <button class="btnEditar" data-id="${p.id}">✏️</button>
                    <button class="btnEliminar" data-id="${p.id}">🗑️</button>
                </td>
            `;

            tablaBody.appendChild(tr);
        });

        // Inicializar DataTable después de renderizar filas
        $("#tablaProfesionales").DataTable({
            pagingType: "simple_numbers",   // ←🔥 Hace el paginado moderno de Bootstrap
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            }
        });

    } catch (error) {
        console.error("Error cargando profesionales:", error);
        alert("No se pudieron cargar los profesionales.");
    }
});


// ======================================================================
// 📌 BOTÓN "NUEVO PROFESIONAL"
// (Respeto tu código – solo agrego el ROL porque tu tabla lo usa)
// ======================================================================

const btnNuevo = document.getElementById("btnNuevo");

if (btnNuevo) {
    btnNuevo.addEventListener("click", () => {

        Swal.fire({
            title: "Nuevo Profesional",
            html: `
                <input id="nuevoNombre" class="swal2-input" placeholder="Nombre completo">
                <input id="nuevoUsuario" class="swal2-input" placeholder="Usuario">
                <input id="nuevoPassword" class="swal2-input" type="password" placeholder="Password" autocomplete="new-password">

                <select id="nuevoRol" class="swal2-input">
                    <option value="profesional">Profesional</option>
                    <option value="admin">Administrador</option>
                    <option value="secretaria">Secretaria</option>
                </select>
            `,
            confirmButtonText: "Crear",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                return {
                    nombre: document.getElementById("nuevoNombre").value,
                    usuario: document.getElementById("nuevoUsuario").value,
                    password: document.getElementById("nuevoPassword").value,
                    rol: document.getElementById("nuevoRol").value
                };
            }
        }).then(async (result) => {

            if (!result.isConfirmed) return;

            const res = await fetch("/profesionales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.value)
            });

            const data = await res.json();

            if (data.ok) {
                Swal.fire("Listo", "Profesional creado con éxito", "success")
                    .then(() => location.reload());
            } else {
                Swal.fire("Error", data.error || "No se pudo crear el profesional", "error");
            }
        });
    });
}


// ======================================================================
// 📌 EDITAR PROFESIONAL
// ======================================================================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("btnEditar")) return;

    const id = e.target.dataset.id;

    // Obtener profesional actual
    const res = await fetch(`/profesionales/${id}`);
    const p = await res.json();

    Swal.fire({
        title: "Editar Profesional",
        html: `
            <input id="editNombre" class="swal2-input" value="${p.nombre}">
            <input id="editUsuario" class="swal2-input" value="${p.usuario}">
            <input id="editPassword" class="swal2-input" type="password" placeholder="Nuevo password (opcional)">
            <select id="editRol" class="swal2-input">
                <option value="profesional" ${p.rol === "profesional" ? "selected" : ""}>Profesional</option>
                <option value="admin" ${p.rol === "admin" ? "selected" : ""}>Administrador</option>
                <option value="secretaria" ${p.rol === "secretaria" ? "selected" : ""}>Secretaria</option>
            </select>
        `,
        confirmButtonText: "Guardar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const pass = document.getElementById("editPassword").value;

            return {
                nombre: document.getElementById("editNombre").value,
                usuario: document.getElementById("editUsuario").value,
                rol: document.getElementById("editRol").value,
                ...(pass ? { password: pass } : {}) // solo incluir si lo escribió
            };
        }
    }).then(async (result) => {

        if (!result.isConfirmed) return;

        const res2 = await fetch(`/profesionales/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value)
        });

        const data = await res2.json();

        if (data.ok) {
            Swal.fire("Actualizado", "El profesional fue modificado", "success")
                .then(() => location.reload());
        } else {
            Swal.fire("Error", data.error || "No se pudo actualizar", "error");
        }
    });
});


// ======================================================================
// 📌 ELIMINAR PROFESIONAL
// ======================================================================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("btnEliminar")) return;

    const id = e.target.dataset.id;

    Swal.fire({
        title: "¿Eliminar profesional?",
        text: "No se puede deshacer esta acción.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then(async (r) => {

        if (!r.isConfirmed) return;

        const res = await fetch(`/profesionales/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (data.ok) {
            Swal.fire("Eliminado", "Profesional borrado con éxito", "success")
                .then(() => location.reload());
        }
    });
});
