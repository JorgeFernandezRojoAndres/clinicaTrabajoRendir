// Validaciones centralizadas con SweetAlert2
function mostrarError(msg) {
    if (window.Swal) {
        Swal.fire({
            icon: "error",
            title: "Campo inválido",
            text: msg || "Revisa los datos ingresados"
        });
    } else {
        alert(msg || "Revisa los datos ingresados");
    }
}

function obtenerEtiqueta(campo) {
    const label = campo.closest(".field")?.querySelector("label");
    if (label && label.textContent) return label.textContent.trim();
    if (campo.placeholder) return campo.placeholder.trim();
    if (campo.name) return campo.name;
    return "Este campo";
}

function validarFormulario(form) {
    const elementos = form.querySelectorAll("input, select, textarea");
    for (const el of elementos) {
        if (el.disabled) continue;
        if (["submit", "button", "reset"].includes(el.type)) continue;

        const valor = (el.value || "").trim();
        const requerido = el.dataset.required === "true";

        if (requerido && !valor) {
            mostrarError(`${obtenerEtiqueta(el)} es obligatorio.`);
            return false;
        }

        if (el.type === "email" && valor) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(valor)) {
                mostrarError(`${obtenerEtiqueta(el)} no parece un email válido.`);
                return false;
            }
        }

        if (el.type === "number" && valor && isNaN(Number(valor))) {
            mostrarError(`${obtenerEtiqueta(el)} debe ser numérico.`);
            return false;
        }
    }
    return true;
}
