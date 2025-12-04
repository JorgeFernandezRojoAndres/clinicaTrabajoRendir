document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".registro-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (typeof validarFormulario === "function") {
            const ok = validarFormulario(form);
            if (!ok) return;
        }

        const nombreCompleto = document.getElementById("nombreCompleto")?.value.trim();
        const dni = document.getElementById("dni")?.value.trim();
        const correo = document.getElementById("correo")?.value.trim();
        const obraSocial = document.getElementById("obraSocial")?.value.trim();
        const fotoInput = document.getElementById("fotoDni");

        console.log("[registro paciente] submit", { nombreCompleto, dni, correo, obraSocial });

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
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "No se pudo registrar el paciente"
                });
                return;
            }

            await Swal.fire({
                icon: "success",
                title: "Registro enviado",
                text: "Queda pendiente de validación."
            });
            window.location.href = "/login";
        } catch (err) {
            console.error("Error registrando paciente:", err);
            Swal.fire({
                icon: "error",
                title: "Error al registrar",
                text: "Intenta nuevamente."
            });
        }
    });
});
