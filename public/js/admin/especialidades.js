// =======================================
//  ESPECIALIDADES - ADMIN
// =======================================
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("tablaEspecialidades")) {
        cargarEspecialidades();
    }

    const form = document.getElementById("formEspecialidad");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (typeof validarFormulario === "function") {
                const ok = validarFormulario(form);
                if (!ok) return;
            }
            crearEspecialidad(e);
        });
    }
});


// =======================================
//  CARGAR LISTADO
// =======================================
async function cargarEspecialidades() {

    const tbody = document.getElementById("tablaEspecialidades");
    if (!tbody) return; // ✅ evita error si no existe en esta vista

    try {
        const res = await fetch("/api/especialidades");
        if (!res.ok) throw new Error("Error al obtener especialidades");

        const data = await res.json();
        renderizarTabla(data);

    } catch (error) {
        console.error(error);
        alert("No se pudieron cargar las especialidades");
    }
}


function renderizarTabla(lista) {
    const tbody = document.getElementById("tablaEspecialidades");
    if (!tbody) return; // ✅ evita error

    tbody.innerHTML = "";

    lista.forEach(es => {
        const nombreSafe = encodeURIComponent(es.nombre);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${es.id}</td>
            <td>${es.nombre}</td>
            <td>
                <button class="btn-edit" onclick="editarEspecialidad(${es.id}, decodeURIComponent('${nombreSafe}'))"
>✏ Editar</button>
                <button class="btn-delete" onclick="eliminarEspecialidad(${es.id})">🗑 Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// =======================================
//  CREAR NUEVA ESPECIALIDAD
// =======================================
async function crearEspecialidad(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();

    if (nombre.length < 3) {
        alert("El nombre es demasiado corto");
        return;
    }

    try {
        const res = await fetch("/api/especialidades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre })
        });

        if (!res.ok) throw new Error("Error al crear especialidad");

        document.getElementById("formEspecialidad").reset();
        cargarEspecialidades();

    } catch (error) {
        console.error(error);
        alert("No se pudo registrar la especialidad");
    }
}


// =======================================
//  EDITAR (CON PROMPT SIMPLE)
// =======================================
async function editarEspecialidad(id, nombreActual) {
    const nuevoNombre = prompt("Nuevo nombre:", nombreActual);

    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
        alert("Nombre inválido");
        return;
    }

    try {
        const res = await fetch(`/api/especialidades/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoNombre })
        });

        if (!res.ok) throw new Error("Error al actualizar");

        cargarEspecialidades();

    } catch (error) {
        console.error(error);
        alert("No se pudo actualizar la especialidad");
    }
}


// =======================================
//  ELIMINAR
// =======================================
async function eliminarEspecialidad(id) {
    const ok = confirm("¿Seguro que deseas eliminar esta especialidad?");
    if (!ok) return;

    try {
        const res = await fetch(`/api/especialidades/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Error al eliminar");

        cargarEspecialidades();

    } catch (error) {
        console.error(error);
        alert("No se pudo eliminar la especialidad");
    }
}
