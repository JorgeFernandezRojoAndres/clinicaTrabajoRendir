// ===================================================== 
// 📌 ATENCIÓN MÉDICA — CARGA INICIAL
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    // Obtener ID del turno desde la URL: /pro-atencion/15
    const idTurno = window.location.pathname.split("/").pop();
    console.log("Turno cargado:", idTurno);

    // Campos visibles en el HTML
    const inputNombre       = document.querySelector("#pacienteNombre");
    const inputEdad         = document.querySelector("#pacienteEdad");
    const selectGenero      = document.querySelector("#pacienteGenero");

    const txtMotivo         = document.querySelector("#motivo");
    const txtEvolucion      = document.querySelector("#evolucion");

    // Contenedores clínicos
    const contAlergias      = document.querySelector("#alergias");
    const contAntecedentes  = document.querySelector("#antecedentes");
    const contHabitos       = document.querySelector("#habitos");
    const contMedicacion    = document.querySelector("#medicacion");

    if (!inputNombre) return;

    // ID REAL DE LA ATENCIÓN
    let atencionId = null;

    try {
        // 🔥 NUEVA RUTA CORRECTA
        const res = await fetch(`/atencion/turno/${idTurno}`);
        const data = await res.json();

        if (!data.ok) {
            console.error("No se pudo cargar la atención:", data.error);
            return;
        }

        const t = data.turno;
        atencionId = data.atencionId;

        // =====================================================
        // 📌 CARGAR DATOS DEL PACIENTE
        // =====================================================
        inputNombre.value = t.pacienteNombre || "";
        inputEdad.value = t.fechaNacimiento 
            ? calcularEdad(t.fechaNacimiento) + " años" 
            : "";
        selectGenero.value = t.genero || "";

        // =====================================================
        // 📌 CARGAR MOTIVO Y EVOLUCIÓN (si existe)
        // =====================================================
        txtMotivo.value = t.motivoTurno || "";
        txtEvolucion.value = t.evolucion || "";

        // =====================================================
        // 📌 CARGAR HISTORIA CLÍNICA (texto simple)
        // =====================================================
        renderTexto(contAlergias,     data.historiaClinica.alergias);
        renderTexto(contAntecedentes, data.historiaClinica.antecedentes);
        renderTexto(contHabitos,      data.historiaClinica.habitos);
        renderTexto(contMedicacion,   data.historiaClinica.medicamentos);

    } catch (err) {
        console.error("Error cargando atención:", err);
    }

    // -----------------------------------------------------
    // Función para calcular edad
    // -----------------------------------------------------
    function calcularEdad(fecha) {
        const nacimiento = new Date(fecha);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();

        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }

    // -----------------------------------------------------
    // Función para renderizar en TEXTAREA
    // -----------------------------------------------------
    function renderTexto(textarea, items) {
        if (!items || items.length === 0) {
            textarea.value = "";
            return;
        }

        textarea.value = items
            .map(i => i.descripcion || i.nombre || i.detalle || "")
            .join("\n");
    }

    // =====================================================
    // 📌 BOTÓN GUARDAR EVOLUCIÓN (UPDATE ATENCIÓN)
    // =====================================================
    document.querySelector("#btnGuardar").addEventListener("click", async () => {

        if (!atencionId) {
            return Swal.fire("Error", "No se encontró la atención.", "error");
        }

        const evolucion = txtEvolucion.value;

        try {
            const res = await fetch(`/atencion/${atencionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ evolucion })
            });

            const data = await res.json();

            if (!data.ok) {
                return Swal.fire("Error", data.error, "error");
            }

            Swal.fire("Guardado", "Atención actualizada.", "success");

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "No se pudo guardar.", "error");
        }
    });

});
// ======================================================
// 📌 BOTÓN "CERRAR CONSULTA" — MARCA EL TURNO COMO ATENDIDO
// ======================================================
document.querySelector("#btnCerrar").addEventListener("click", async () => {

    try {
        const res = await fetch(`/turnos/finalizar/${idTurno}`, {
            method: "PUT"
        });

        const data = await res.json();

        if (!data.ok) {
            return Swal.fire("Error", data.error, "error");
        }

        Swal.fire({
            icon: "success",
            title: "Consulta finalizada",
            timer: 1500,
            showConfirmButton: false
        });

        setTimeout(() => {
            window.location.href = "/pro-panel";
        }, 1500);

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo cerrar la consulta.", "error");
    }
});
