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
        {
            user_id: user.user_id,
            cart_id: user.Cart?.cart_id || null,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );


    const { password_hashed, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
}

module.exports = {
    loginUser
};