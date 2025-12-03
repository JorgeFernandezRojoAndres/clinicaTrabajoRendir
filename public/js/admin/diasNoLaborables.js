document.addEventListener("DOMContentLoaded", () => {

    const fechaInput = document.querySelector("#fechaFeriado");
    const descripcionInput = document.querySelector("#descripcionFeriado");
    const btnAgregar = document.querySelector("#btnAgregarFeriado");
    const lista = document.querySelector("#listaFeriados");

    // ==========================
    // CARGAR FERIADOS
    // ==========================
    async function cargarFeriados() {
        const res = await fetch("/api/feriados");
        const data = await res.json();

        // 🔥 Nuevo: evitar fallos si el backend responde error
        if (!Array.isArray(data)) {
            lista.innerHTML = "<p>Error al cargar los feriados.</p>";
            return;
        }

        lista.innerHTML = "";

        if (data.length === 0) {
            lista.innerHTML = "<p>No hay feriados cargados.</p>";
            return;
        }

        data.forEach(f => {

            // ✅ Formatear la fecha ISO → dd/mm/yyyy
            const fechaObj = new Date(f.fecha);
            const fechaFormateada = fechaObj.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            lista.innerHTML += `
            <div class="agenda-item">
                <p><b>${fechaFormateada}</b> — ${f.descripcion || "Sin descripción"}</p>
                <button class="btn-editar eliminar-btn" data-id="${f.id}">
                    Eliminar
                </button>
            </div>
        `;
        });

        document.querySelectorAll(".eliminar-btn").forEach(btn => {
            btn.addEventListener("click", () => eliminarFeriado(btn.dataset.id));
        });
    }


    // ==========================
    // CREAR FERIADO
    // ==========================
    async function crearFeriado() {
        const fecha = fechaInput.value;
        const descripcion = descripcionInput.value;

        if (!fecha) {
            alert("La fecha es obligatoria");
            return;
        }

        const res = await fetch("/api/feriados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fecha, descripcion })
        });

        const data = await res.json();

        if (data.ok) {
            fechaInput.value = "";
            descripcionInput.value = "";
            cargarFeriados();
        } else {
            alert("Error al cargar feriado");
        }
    }

    // ==========================
    // ELIMINAR FERIADO
    // ==========================
    async function eliminarFeriado(id) {
        if (!confirm("¿Eliminar feriado?")) return;

        await fetch(`/api/feriados/${id}`, { method: "DELETE" });

        cargarFeriados();
    }

    // ==========================
    // EVENTOS
    // ==========================
    btnAgregar.addEventListener("click", crearFeriado);

    cargarFeriados();
});
