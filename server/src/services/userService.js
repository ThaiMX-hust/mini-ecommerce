const { hashPassword } = require('../utils/passwordUtils');
const userRepository = require('../repositories/userRepository');

const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient()

async function registerUser(userData) {
    const password_hash = await hashPassword(userData.password);
    
    // TODO: upload avatarFile and get URL
    const avatar_url = null;

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
    })

    return newUser;
}

async function registerAdmin(userData){
    const password_hash = await hashPassword(userData.password);
    
    // TODO: upload avatarFile and get URL
    const avatar_url = null;

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
    return await userRepository.getUserById(user_id);
}

async function getUserByEmail(email) {
    return await userRepository.getUserByEmail(email);
}

const getUserWithPasswordById = userRepository.getUserWithPasswordById;
const getUserWithPasswordByEmail = userRepository.getUserWithPasswordByEmail;
const updatePassword = userRepository.updatePassword;

module.exports = {
    registerUser,
    registerAdmin,
    getUserById,
    getUserByEmail,
    getUserWithPasswordById,
    getUserWithPasswordByEmail,
    updatePassword
};