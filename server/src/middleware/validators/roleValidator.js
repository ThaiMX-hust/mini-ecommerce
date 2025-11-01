require('express')

function verifyCustomerRole(req, res, next) {
    const payload = req.user; 

    if (!payload) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!payload.role || payload.role !== 'customer'.toUpperCase()) {
        return res.status(403).json({ error: "Forbidden" });
    }

    console.log("hehe")

    return next();
}

function verifyAdminRole(req, res, next){
    const userRole = req.user.role.toLowerCase()

    if (!payload) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!payload.role || userRole !== 'admin'.toUpperCase()) {
        return res.status(403).json({ error: "Forbidden" });
    }

    return next();
}

function verifyRole(role) {
    return (req, res, next) => {
        const payload = req.user;

        if (!payload) {
        return res.status(401).json({ error: "Unauthorized" });
        }

        const userRole = payload.role ? payload.role.toLowerCase() : null;

        if (!userRole || userRole !== role.toLowerCase()) {
        return res.status(403).json({ error: "Forbidden" });
        }

        return next();
    }
}


module.exports = {
    verifyCustomerRole,
    verifyAdminRole,
    verifyRole
}