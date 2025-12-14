const jwt = require('jsonwebtoken');
const { UnauthorizeError } = require("../errors/UnauthorizeError");
const { ForbiddenError } = require("../errors/ForbiddenError");

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        throw new UnauthorizeError();

    const token = authHeader.split(' ')[1];
    if (!token)
        throw new UnauthorizeError();

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        return next();
    } catch (error) {
        throw new UnauthorizeError();
    }
}

function requireAdmin(req, res, next) {
    if (!req.user)
        throw new UnauthorizeError();

    if (req.user.role !== 'ADMIN')
        throw new ForbiddenError();

    return next();
}

function authenticateOptional(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return next();

    const token = authHeader.split(' ')[1];
    if (!token)
        return next();

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
    } catch (error) { }

    return next();
}

module.exports = { authenticate, requireAdmin, authenticateOptional };
