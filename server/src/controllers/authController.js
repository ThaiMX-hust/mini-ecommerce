const authService = require('../services/authService');
const { NotFoundError } = require('../errors/NotFoundError');
const { UnauthorizeError } = require('../errors/UnauthorizeError');
const { BadRequestError } = require('../errors/BadRequestError');
const { AppError } = require('../errors/AppError');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password || typeof(email) !== 'string' || typeof(password) !== 'string') {
            throw new BadRequestError("Missing field(s)")
        }

        const result = await authService.loginUser(email, password);
    
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError)
            return res.status(error.statusCode).json({ error: error.message });

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

const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.requestPasswordReset(email);
        if (!result)
            return res.status(404).json({ error: 'Email not found' });
        return res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;
        const result = await authService.resetPassword(token, new_password);
        if (!result)
            return res.status(400).json({ error: 'Invalid or expired token' });
        return res.status(200).json({ message: 'Password reset successfully' }); 
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    login,
    changePassword,
    requestPasswordReset,
    resetPassword
};