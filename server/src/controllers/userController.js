const userService = require('../services/userService');
const regexUtils = require('../utils/regexUtils');
const { AppError } = require('../errors/AppError');
const { BadRequestError } = require('../errors/BadRequestError');
const { cleanText } = require('../utils/sanitizer');
const { ForbiddenError } = require("../errors/ForbiddenError");

const register = async (req, res) => {
    let { first_name, last_name, email, password } = req.body;
    const avatarFile = req.file;

    if (!first_name || !last_name || !email || !password) {
        throw new BadRequestError('Missing or invalid fields');
    }
    if (!regexUtils.isValidEmail(email)) {
        throw new BadRequestError('Missing or invalid fields');
    }

    first_name = cleanText(first_name);
    last_name = cleanText(last_name);

    const newUser = await userService.registerUser({ first_name, last_name, email, password, avatarFile });
    return res.status(201).json(newUser);
};

const registerAdmin = async (req, res) => {
    let { first_name, last_name, email, password } = req.body;
    const avatarFile = req.file;

    if (!first_name || !last_name || !email || !password) {
        throw new BadRequestError('Missing or invalid fields');
    }
    if (!regexUtils.isValidEmail(email)) {
        throw new BadRequestError('Missing or invalid fields');
    }

    first_name = cleanText(first_name);
    last_name = cleanText(last_name);

    const newUser = await userService.registerAdmin({ first_name, last_name, email, password, avatarFile });
    return res.status(201).json(newUser);
};

const getUser = async (req, res) => {
    const user_id = req.params.user_id;
    if (user_id !== req.user.user_id && req.user.role !== 'ADMIN')
        throw new ForbiddenError();

    const user = await userService.getUserById(user_id);
    return res.status(200).json(user);
};

const updateUser = async (req, res) => {
    const user_id = req.params.user_id;
    if (user_id !== req.user.user_id)
        throw new ForbiddenError();

    let { first_name, last_name } = req.body;
    first_name = cleanText(first_name);
    last_name = cleanText(last_name);

    const avatarFile = req.file;

    const user = await userService.updateUser(user_id, { first_name, last_name, avatarFile });
    return res.status(200).json(user);
};

const getUserList = async (req, res) => {
    const result = await userService.getUserList();
    return res.status(200).json(result);
};

async function updateLockedState(req, res) {
    const user_id = req.params.user_id;
    const locked = req.body.locked;
    if (locked == null || typeof (locked) !== 'boolean')
        throw new BadRequestError("Missing or invalid field");

    await userService.updateLockedState(user_id, locked);
    return res.status(200).send();
}

module.exports = {
    register,
    registerAdmin,
    getUser,
    updateUser,
    getUserList,
    updateLockedState
};
