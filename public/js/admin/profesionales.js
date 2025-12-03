// ======================================================================
// 📌 CARGA INICIAL (CON DATATABLES EN ESPAÑOL)
// ======================================================================
document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.querySelector("#tablaProfesionales tbody");
    if (!tablaBody) return;

    try {
        const res = await fetch("/profesionales");
        const profesionales = await res.json();

        tablaBody.innerHTML = "";

        profesionales.forEach(p => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.usuario}</td>
                <td>${p.rol}</td>
                <td>
                    <button class="btn-accion btn-edit" data-id="${p.id}" data-nombre="${p.nombre}" data-usuario="${p.usuario}">
                        ✏ Editar
                    </button>
                    <button class="btn-accion btn-delete" data-id="${p.id}">
                        🗑 Eliminar
                    </button>
                </td>
            `;

            tablaBody.appendChild(tr);
        });

        // 🔥 ACTIVAR DATATABLE EN ESPAÑOL
        if (!$.fn.DataTable.isDataTable("#tablaProfesionales")) {
            $("#tablaProfesionales").DataTable({
                pagingType: "simple_numbers",   // ←🔥 Hace el paginado moderno de Bootstrap
                language: {
                    url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
                }
            });

        }

    } catch (error) {
        console.error("Error cargando profesionales:", error);
        Swal.fire("Error", "No se pudieron cargar los profesionales.", "error");
    }
});


// ======================================================================
// 📌 NUEVO PROFESIONAL (CON ESPECIALIDADES MULTIPLE)
// ======================================================================
document.addEventListener("click", async (e) => {
    if (!e.target.closest("#btnNuevo")) return;

    // Traemos especialidades desde el backend
    const respEsp = await fetch("/api/especialidades");
    const especialidades = await respEsp.json();

    // Armamos opciones HTML
    const opciones = especialidades
        .map(es => `<option value="${es.id}">${es.nombre}</option>`)
        .join("");

    Swal.fire({
        title: "Nuevo Profesional",
        html: `
<form id="formNuevoPro">
    <input id="nuevoNombre" class="swal2-input" placeholder="Nombre completo">
    <input id="nuevoUsuario" class="swal2-input" placeholder="Usuario">
    <input id="nuevoPassword" class="swal2-input" type="password" placeholder="Password" autocomplete="new-password">


    <div class="swal-especialidades">
        <label for="nuevoEsp">Especialidades</label>
        <select id="nuevoEsp" multiple>
            ${opciones}
        </select>
        <small>(Podés seleccionar varias manteniendo CTRL)</small>
    </div>
</form>
`,


        confirmButtonText: "Crear",
        showCancelButton: true,
        cancelButtonText: "Cancelar",

        preConfirm: () => {
            const select = document.getElementById("nuevoEsp");

            // obtener IDs seleccionados
            const seleccionadas = Array.from(select.selectedOptions).map(o => o.value);

            return {
                nombre: document.getElementById("nuevoNombre").value,
                usuario: document.getElementById("nuevoUsuario").value,
                password: document.getElementById("nuevoPassword").value,
                especialidades: seleccionadas   // <-- se envía al backend
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


// ======================================================================
// 📌 EDITAR PROFESIONAL (CON ESPECIALIDADES MULTIPLE)
// ======================================================================
document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-edit");
    if (!btn) return;

    const id = btn.dataset.id;
    const nombreActual = btn.dataset.nombre;
    const usuarioActual = btn.dataset.usuario;

    // 1️⃣ Traer especialidades
    const respEsp = await fetch("/api/especialidades");
    const especialidades = await respEsp.json();

    // 2️⃣ Traer especialidades actuales del profesional
    const respProf = await fetch(`/profesionales/${id}/especialidades`);
    const espActuales = await respProf.json();  // ej: [1, 3]

    const opciones = especialidades
        .map(es => `
            <option value="${es.id}" 
                ${espActuales.includes(es.id) ? "selected" : ""}>
                ${es.nombre}
            </option>
        `)
        .join("");

    Swal.fire({
        title: "Editar Profesional",
        html: `
            <input id="editNombre" class="swal2-input" value="${nombreActual}">
            <input id="editUsuario" class="swal2-input" value="${usuarioActual}">

            <label style="margin-top:10px; font-weight:600">Especialidades</label>
            <select id="editEsp" class="swal2-input" multiple style="height:120px;">
                ${opciones}
            </select>
            <small style="font-size:12px; color:#666;">
                (CTRL para seleccionar varias)
            </small>
        `,
        confirmButtonText: "Guardar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const select = document.getElementById("editEsp");
            const seleccionadas = Array.from(select.selectedOptions).map(o => o.value);

            return {
                nombre: document.getElementById("editNombre").value,
                usuario: document.getElementById("editUsuario").value,
                especialidades: seleccionadas
            };
        }
    }).then(async (result) => {
        if (!result.isConfirmed) return;

        const res = await fetch(`/profesionales/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.value)
        });

        const data = await res.json();

        if (data.ok) {
            Swal.fire("Listo", "Profesional actualizado", "success")
                .then(() => location.reload());
        } else {
            Swal.fire("Error", data.error || "No se pudo actualizar", "error");
        }
    });
});

// ======================================================================
// 📌 ELIMINAR PROFESIONAL
// ======================================================================
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-delete");
    if (!btn) return;

    const id = btn.dataset.id;

    Swal.fire({
        title: "¿Eliminar profesional?",
        text: "Esta acción no se puede revertir",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(async (result) => {
        if (!result.isConfirmed) return;

        const res = await fetch(`/profesionales/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (data.ok) {
            Swal.fire("Eliminado", "El profesional fue eliminado", "success")
                .then(() => location.reload());
        } else {
            Swal.fire("Error", data.error || "No se pudo eliminar", "error");
        }
    });
});
