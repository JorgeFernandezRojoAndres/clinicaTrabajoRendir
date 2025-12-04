document.addEventListener("DOMContentLoaded", () => {
    const statusCfg = document.getElementById("config-status");
    const statusNotif = document.getElementById("notif-status");

    document.getElementById("btn-guardar-config")?.addEventListener("click", () => {
        statusCfg.textContent = "Guardado (demo).";
        setTimeout(() => (statusCfg.textContent = ""), 2500);
    });

    document.getElementById("btn-guardar-notif")?.addEventListener("click", () => {
        statusNotif.textContent = "Guardado (demo).";
        setTimeout(() => (statusNotif.textContent = ""), 2500);
    });
});
