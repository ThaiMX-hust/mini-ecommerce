const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const result = await authService.loginUser(email, password);
        if (!result) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('User logged in:', result);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    login
};