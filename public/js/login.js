// =================================================================== 
// 🔄 MANEJO DEL SWITCH DE ROLES EN EL LOGIN
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
    const btnAdmin = document.getElementById("btn-admin");
    const btnProfesional = document.getElementById("btn-profesional");
    const btnPaciente = document.getElementById("btn-paciente");
    const inputRol = document.getElementById("rol");

    const resetButtons = () => {
        if (btnAdmin) btnAdmin.textContent = "Administrador";
        if (btnProfesional) btnProfesional.textContent = "Profesional";
        if (btnPaciente) btnPaciente.textContent = "Paciente";
    };

    // ADMIN
    if (btnAdmin) {
        btnAdmin.addEventListener("click", () => {
            resetButtons();

            btnAdmin.classList.add("active");
            btnProfesional?.classList.remove("active");
            btnPaciente?.classList.remove("active");

            btnAdmin.textContent = "Administrador ✔";
            inputRol.value = "admin";
        });
    }

    // PROFESIONAL
    btnProfesional?.addEventListener("click", () => {
        resetButtons();

        btnProfesional.classList.add("active");
        btnPaciente.classList.remove("active");
        btnAdmin?.classList.remove("active");

        btnProfesional.textContent = "Profesional ✔";
        inputRol.value = "profesional";
    });

    // PACIENTE
    btnPaciente?.addEventListener("click", () => {
        resetButtons();

        btnPaciente.classList.add("active");
        btnProfesional.classList.remove("active");
        btnAdmin?.classList.remove("active");

        btnPaciente.textContent = "Paciente ✔";
        inputRol.value = "paciente";
    });
});

// ===================================================================
// 🔐 LOGIN VIA FETCH (usuario + password + rol seleccionado)
// ===================================================================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = document.getElementById("loginForm");

    const usuario = form.usuario.value.trim();
    const password = form.password.value.trim();
    const rol = form.rol.value.trim(); // <-- viene del botón seleccionado

    const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password, rol }),
        credentials: "include"
    });

    const data = await res.json();

    if (!data.ok) {
        const errorBox = document.getElementById("error");
        if (errorBox) errorBox.innerText = data.error || "Error de login";
        else alert(data.error || "Error de login");
        return;
    }

    // ===================================================================
    // 🔀 REDIRECCIÓN SEGÚN EL TIPO REAL DE USUARIO
    // (NO según el rol seleccionado)
    // ===================================================================
    // El backend responde cuál es el tipo real:
    // admin | profesional | secretaria | paciente
    const tipoReal = data.tipo;

    switch (tipoReal) {
        case "admin":
            window.location.href = "/admin-panel";
            break;

        case "secretaria":
            // 👈 SECRETARIA usa el login del administrador
            // pero entra a su propio panel
           window.location.href = "/sec-panel";

            break;

        case "profesional":
            window.location.href = "/pro-panel";
            break;

        case "paciente":
            window.location.href = "/pac-panel";
            break;

        default:
            alert("Rol no reconocido");
            break;
    }
});
