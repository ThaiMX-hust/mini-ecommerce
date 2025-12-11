const userService = require('../services/userService');
const regexUtils = require('../utils/regexUtils');
const { AppError } = require('../errors/AppError');
const { BadRequestError } = require('../errors/BadRequestError');

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const avatarFile = req.file;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'Missing or invalid fields' });
        }
        if (!regexUtils.isValidEmail(email)) {
            return res.status(400).json({ error: 'Missing or invalid fields' });
        }

        if (await userService.getUserByEmail(email)) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const newUser = await userService.registerUser({ first_name, last_name, email, password, avatarFile });
        console.log('Registered new user:', newUser);

        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const avatarFile = req.file;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'Missing or invalid fields' });
        }
        if (!regexUtils.isValidEmail(email)) {
            return res.status(400).json({ error: 'Missing or invalid fields' });
        }

        if (await userService.getUserByEmail(email)) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const newUser = await userService.registerAdmin({ first_name, last_name, email, password, avatarFile });
        console.log('Registered new user:', newUser);

        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (user_id !== req.user.user_id && req.user.role !== 'ADMIN')
            return res.status(403).json({ error: 'Forbidden' });

        const user = await userService.getUserById(user_id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user info:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (user_id !== req.user.user_id)
            return res.status(403).json({ error: 'Forbidden' });

        const { first_name, last_name } = req.body;
        const avatarFile = req.file;

        const user = await userService.updateUser(user_id, { first_name, last_name, avatarFile });
        if (!user)
            return res.status(404).json({ error: 'User not found' });

        return res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        console.error('Error getting user info:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserList = async (req, res) => {
    try {
        const result = await userService.getUserList();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error getting user list: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

async function updateLockedState(req, res) {
    try {
        const user_id = req.params.user_id;
        const locked = req.body.locked;
        if (locked == null || typeof (locked) !== 'boolean')
            throw new BadRequestError("Missing or invalid field");

        await userService.updateLockedState(user_id, locked);
        return res.status(200).send();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        console.error('Error updating user locked state: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    register,
    registerAdmin,
    getUser,
    updateUser,
    getUserList,
    updateLockedState
};
