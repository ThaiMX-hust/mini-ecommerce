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

const changePassword = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { old_password, new_password } = req.body;
        if (!old_password || !new_password) {
            return res.status(400).json({ error: 'Missing or invalid fields' });
        }

        const result = await authService.changePassword(user_id, old_password, new_password);
        if (!result) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    login,
    changePassword,
};