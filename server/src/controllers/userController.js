const userService = require('../services/userService');
const regexUtils = require('../utils/regexUtils');

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
}

const getUserByID = async(req, res) => {

}

const updateUserByID = async(req, res) => {

}

module.exports = {
    register,
    getUserByID,
    updateUserByID
};