const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('./userService');
const userRepository = require('../repositories/userRepository');

async function getUserHashedPassword(user_id) {
    return await userRepository.getUserHashedPassword(user_id);
}

async function loginUser(email, password) {
    const user = await userService.getUserByEmail(email);
    if (!user) {
        return null;
    }

    const password_hash = await getUserHashedPassword(user.user_id);
    const isPasswordValid = await bcrypt.compare(password, password_hash);
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

    return { token, user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_url: user.avatar_url
    } };
}

module.exports = {
    loginUser
};