import { db } from "../config/db.js";

const AuthController = {
    async login(req, res) {
        const { usuario, password, rol } = req.body;

        if (!usuario || !password || !rol) {
            return res.status(400).json({ ok: false, error: "Faltan datos" });
        }

        // -----------------------------------------------------
        // 🔹 LOGIN ADMIN (INCLUYE SECRETARIA)
        // -----------------------------------------------------
        if (rol === "admin") {

            // 1) ¿Es secretaria?
            const [sec] = await db.query(
                "SELECT * FROM PROFESIONAL WHERE usuario = ? AND rol = 'secretaria'",
                [usuario]
            );

            if (sec[0]) {
                if (sec[0].password !== password) {
                    return res.status(401).json({ ok: false, error: "Contraseña incorrecta" });
                }

                req.session.user = {
                    id: sec[0].id,
                    tipo: "secretaria"
                };

                return res.json({ ok: true, tipo: "secretaria" });
            }

            // 2) Si no es secretaria, verificar si es admin
            const [rows] = await db.query(
                "SELECT * FROM PROFESIONAL WHERE usuario = ? AND rol = 'admin'",
                [usuario]
            );

            if (!rows[0]) {
                return res.status(401).json({ ok: false, error: "Administrador no encontrado" });
            }

            if (rows[0].password !== password) {
                return res.status(401).json({ ok: false, error: "Contraseña incorrecta" });
            }

            req.session.user = {
                id: rows[0].id,
                tipo: "admin"
            };

            return res.json({ ok: true, tipo: "admin" });
        }


        // -----------------------------------------------------
        // 🔹 LOGIN PROFESIONAL
        // -----------------------------------------------------
        if (rol === "profesional") {

            const [rows] = await db.query(
                "SELECT * FROM PROFESIONAL WHERE usuario = ? AND rol = 'profesional'",
                [usuario]
            );

            if (!rows[0]) {
                return res.status(401).json({ ok: false, error: "No existe el profesional" });
            }

            if (rows[0].password !== password) {
                return res.status(401).json({ ok: false, error: "Contraseña incorrecta" });
            }

            req.session.user = {
                id: rows[0].id,            // ID del usuario profesional
                id_profesional: rows[0].id,  // 🔥 este lo exige el controller
                tipo: "profesional"
            };


            return res.json({ ok: true, tipo: "profesional" }); // 👈 AGREGADO
        }


        // -----------------------------------------------------
        // 🔹 LOGIN PACIENTE
        // -----------------------------------------------------
        if (rol === "paciente") {

            const [rows] = await db.query(
                "SELECT * FROM PACIENTE WHERE contacto = ?",
                [usuario]
            );

            if (!rows[0]) {
                return res.status(401).json({ ok: false, error: "Paciente no encontrado" });
            }

            if (rows[0].password && rows[0].password !== password) {
                return res.status(401).json({ ok: false, error: "Contraseña incorrecta" });
            }

            req.session.user = {
                id: rows[0].id,
                tipo: "paciente"
            };

            return res.json({ ok: true, tipo: "paciente" }); // 👈 AGREGADO
        }

        // -----------------------------------------------------
        // 🔹 ROL INVÁLIDO
        // -----------------------------------------------------
        return res.status(400).json({ ok: false, error: "Rol inválido" });
    },

    async logout(req, res) {
        req.session.destroy();
        res.json({ ok: true });
    }
};

export default AuthController;
