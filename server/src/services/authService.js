const jwt = require('jsonwebtoken');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const cartRepository = require('../repositories/cartRepository')
const userService = require('./userService');
const emailService = require('./emailService');
const {redisClient} = require('../infrastructure/redis');

async function loginUser(email, password) {
    const user = await userService.getUserWithPasswordByEmail(email);
    const cart = await cartRepository.getCartFromUserId(user.user_id)
    if (!user) {
        return null;
    }

    const password_hash = user.password_hash;
    const isPasswordValid = await verifyPassword(password, password_hash);
    if (!isPasswordValid) {
        return null;
    }

    const redis = await redisClient()
    let token = null
    token = await redis.get(`user:${user.user_id}:token`)

    if(!token){
        token = jwt.sign(
            {
                user_id: user.user_id,
                cart_id: cart.cart_id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await redis.set(`user:${user.user_id}:token`, token, 'EX', 3600)  
    }

    return { token, user: {
        user_id: user.user_id,
        card_id: cart.cart_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_url: user.avatar_url
    } };
}

async function changePassword(user_id, old_password, new_password) {
    const user = await userService.getUserWithPasswordById(user_id);
    if (!user)
        return false;

    let password_hash = user.password_hash;
    const isPasswordValid = await verifyPassword(old_password, password_hash);
    if (!isPasswordValid)
        return false;

    password_hash = await hashPassword(new_password);
    await userService.updatePassword(user_id, password_hash);
    return true;
}

async function requestPasswordReset(email) {
    const user = await userService.getUserByEmail(email);
    if (!user)
        return false;

    const user_id = user.user_id;
    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    await emailService.sendResetPasswordEmail(email, token);

    return true;
}

async function resetPassword(token, new_password) {
    let user_id;
    try {
        user_id = jwt.verify(token, process.env.JWT_SECRET).user_id;
    } catch (error) {
        return false;
    }

    const password_hash = await hashPassword(new_password);
    await userService.updatePassword(user_id, password_hash);

    return true;
}

module.exports = {
    loginUser,
    changePassword,
    requestPasswordReset,
    resetPassword
};