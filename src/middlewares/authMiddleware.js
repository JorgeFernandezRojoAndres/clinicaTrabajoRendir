// ============================================================================
// 🔐 Verificar si la request es AJAX / JSON
// ============================================================================
function esApi(req) {
    return req.xhr ||
           req.headers.accept?.includes("application/json") ||
           req.path.includes("/api/");
}

// ============================================================================
// 🔐 Verificar login
// ============================================================================
export function requireLogin(req, res, next) {
    const user = req.session?.user;

    if (!user) {
        // 👉 API → devolver JSON limpio
        if (esApi(req)) {
            return res.status(401).json({ ok: false, error: "No autenticado" });
        }

        // 👉 Vista → redirigir al login
        return res.redirect("/login");
    }

    next();
}

// ============================================================================
// 🔐 Verificar UN rol
// ============================================================================
export function requireRole(role) {
    return (req, res, next) => {
        const user = req.session?.user;

        if (!user) {
            if (esApi(req)) {
                return res.status(401).json({ ok: false, error: "No autenticado" });
            }
            return res.redirect("/login");
        }

        if (user.tipo !== role) {
            if (esApi(req)) {
                return res.status(403).json({
                    ok: false,
                    error: `No autorizado — requiere rol: ${role}`
                });
            }
            return res.redirect("/unauthorized");
        }

        next();
    };
}

// ============================================================================
// 🔐 Verificar VARIOS roles
// ============================================================================
export function requireRoles(roles = []) {
    return (req, res, next) => {
        const user = req.session?.user;

        if (!user) {
            if (esApi(req)) {
                return res.status(401).json({ ok: false, error: "No autenticado" });
            }
            return res.redirect("/login");
        }

        if (!roles.includes(user.tipo)) {
            if (esApi(req)) {
                return res.status(403).json({
                    ok: false,
                    error: `No autorizado — roles permitidos: ${roles.join(", ")}`
                });
            }
            return res.redirect("/unauthorized");
        }

        next();
    };
}

// ============================================================================
// 🔥 Helpers rápidos
// ============================================================================
export const soloAdmin = requireRole("admin");
export const soloSecretaria = requireRole("secretaria");
export const soloProfesional = requireRole("profesional");
export const soloPaciente = requireRole("paciente");
