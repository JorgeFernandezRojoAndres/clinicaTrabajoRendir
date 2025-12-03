// =======================================================
//  PANEL DE SECRETARÍA - UI GENERAL
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------
    // Toggle del menú lateral
    // -----------------------------
    const btnMenu = document.querySelector(".menu-btn");
    const sidebar = document.querySelector(".sidebar");

    if (btnMenu && sidebar) {
        btnMenu.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // -----------------------------
    // Enlaces del panel
    // -----------------------------
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });

});
