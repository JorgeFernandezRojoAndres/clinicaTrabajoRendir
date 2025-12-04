document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".registro-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombreCompleto = document.getElementById("nombreCompleto")?.value.trim();
        const dni = document.getElementById("dni")?.value.trim();
        const correo = document.getElementById("correo")?.value.trim();
        const obraSocial = document.getElementById("obraSocial")?.value.trim();
        const fotoInput = document.getElementById("fotoDni");

        console.log("[registro paciente] submit", { nombreCompleto, dni, correo, obraSocial });

        if (!nombreCompleto || !dni || !correo || !obraSocial) {
            alert("Completa los campos obligatorios");
            return;
        }

        // Por ahora solo guardamos la URL del DNI vacía (no hay upload en este flujo)
        const payload = {
            nombreCompleto,
            dni,
            obraSocial,
            contacto: correo,
            fotoDniUrl: ""
        };

        try {
            const resp = await fetch("/pacientes/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await resp.json();
            console.log("[registro paciente] respuesta", data);

            if (!resp.ok || data.ok === false) {
                alert(data.error || "No se pudo registrar el paciente");
                return;
            }

            alert("Registro enviado. Queda pendiente de validación.");
            window.location.href = "/login";
        } catch (err) {
            console.error("Error registrando paciente:", err);
            alert("Error al registrar. Intenta nuevamente.");
        }
    });
});
