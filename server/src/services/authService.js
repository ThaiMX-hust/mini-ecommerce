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

    const jwtPayload = { id: user.user_id, email: user.email, role: user.role };
        
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' } );

    const { password_hash, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
}

module.exports = {
    loginUser
};