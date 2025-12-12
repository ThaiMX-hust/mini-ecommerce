const authService = require('../services/authService');

const { BadRequestError } = require('../errors/BadRequestError');

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || typeof (email) !== 'string' || typeof (password) !== 'string') {
        throw new BadRequestError("Missing field(s)");
    }

    const result = await authService.loginUser(email, password);
    return res.status(200).json(result);
};

const changePassword = async (req, res) => {
    const user_id = req.user.user_id;
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
        throw new BadRequestError('Missing or invalid fields');
    }

    await authService.changePassword(user_id, old_password, new_password);
    return res.status(200).json({ message: 'Password changed successfully' });
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    return res.status(200).json({ message: 'Password reset link sent to email' });
};

const resetPassword = async (req, res) => {
    const { token, new_password } = req.body;
    await authService.resetPassword(token, new_password);
    return res.status(200).json({ message: 'Password reset successfully' });
};

module.exports = {
    login,
    changePassword,
    requestPasswordReset,
    resetPassword
};
