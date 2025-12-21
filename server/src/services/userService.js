const { hashPassword } = require('../utils/passwordUtils');
const userRepository = require('../repositories/userRepository');
const cloudinaryService = require('./cloudinaryService');

const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../errors/NotFoundError');
const { ForbiddenError } = require('../errors/ForbiddenError');
const { ConflictError } = require("../errors/ConflictError");
const { BadRequestError } = require("../errors/BadRequestError");

const prisma = new PrismaClient();

function validatePassword(password) {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const hasUppercase = /[A-Z]/;

    if (password.length < minLength)
        throw new BadRequestError("Password must be at least 8 characters long");

    if (!hasUppercase.test(password))
        throw new BadRequestError("Password must contain at least one uppercase letter");

    if (!hasNumber.test(password))
        throw new BadRequestError("Password must contain at least one number");

    if (!hasSpecialChar.test(password))
        throw new BadRequestError("Password must contain at least one special character");
}

async function registerUser(userData) {
    if (await userRepository.getUserByEmail(userData.email))
        throw new ConflictError("Email already exists");

    validatePassword(userData.password);
    const password_hash = await hashPassword(userData.password);

    const avatarFile = userData.avatarFile;

    let avatar_url;
    if (avatarFile)
        avatar_url = await cloudinaryService.uploadImage(avatarFile.buffer, "avatars");

    const newUser = await prisma.user.create({
        data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password_hash,
            role: 'CUSTOMER',
            avatar_url: avatar_url
        },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true
        }
    });

    const newCart = await prisma.cart.create({
        data: {
            user_id: newUser.user_id,
            total_items: 0,
            total_price: 0,
        }
    });

    return {
        user: {
            user_id: newUser.user_id,
            cart_id: newCart.cart_id || null,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            avatar_url: newUser.avatar_url
        }
    };
}

async function registerAdmin(userData) {
    if (await userRepository.getUserByEmail(userData.email))
        throw new ConflictError("Email already exists");

    validatePassword(userData.password);
    const password_hash = await hashPassword(userData.password);
    const avatarFile = userData.avatarFile;

    let avatar_url;
    if (avatarFile)
        avatar_url = await cloudinaryService.uploadImage(avatarFile.buffer, "avatars");

    const newUser = await prisma.user.create({
        data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password_hash,
            role: 'ADMIN',
            avatar_url: avatar_url
        },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true
        }
    });

    return newUser;
}

async function getUserById(user_id) {
    const user = await userRepository.getUserById(user_id);
    if (!user)
        throw new NotFoundError("User not found");

    return {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_url: user.avatar_url
    };
}

async function getUserByEmail(email) {
    return await userRepository.getUserByEmail(email);
}

async function updateUser(user_id, userData) {
    const { first_name, last_name, avatarFile } = userData;

    const user = await userRepository.getUserById(user_id);
    if (!user)
        throw new NotFoundError("User not found");

    let avatar_url;
    if (avatarFile) {
        if (user.avatar_url)
            await cloudinaryService.deleteImage(user.avatar_url);
        avatar_url = await cloudinaryService.uploadImage(avatarFile.buffer, "avatars");
    }

    const updated_user = await userRepository.updateUser(user_id, { first_name, last_name, avatar_url });

    return {
        user_id: updated_user.user_id,
        first_name: updated_user.first_name,
        last_name: updated_user.last_name,
        email: updated_user.email,
        avatar_url: updated_user.avatar_url
    };
}

const getUserWithPasswordById = userRepository.getUserWithPasswordById;
const getUserWithPasswordByEmail = userRepository.getUserWithPasswordByEmail;
const updatePassword = userRepository.updatePassword;

async function getUserList() {
    const userList = await userRepository.getAll();

    const result = userList.map(u => ({
        user_id: u.user_id,
        cart_id: u.cart_id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        avatar_url: u.avatar_url,
        locked: u.locked,
        created_at: u.created_at
    }));

    return result;
}

async function updateLockedState(user_id, locked) {
    const user = await userRepository.getUserById(user_id);
    if (!user)
        throw new NotFoundError("User not found");
    if (user.role === 'ADMIN')
        throw new ForbiddenError("Cannot lock admin");

    await userRepository.updateLockedState(user_id, locked);
}

module.exports = {
    registerUser,
    registerAdmin,
    getUserById,
    getUserByEmail,
    getUserWithPasswordById,
    getUserWithPasswordByEmail,
    updatePassword,
    updateUser,
    getUserList,
    updateLockedState
};
