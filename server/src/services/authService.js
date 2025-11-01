const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('./userService');

async function loginUser(email, password) {
    const user = await userService.getUserByEmail(email);
    if (!user) {
        return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        return null;
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const { hashedPassword, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
}

module.exports = {
    loginUser
};