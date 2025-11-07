const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient()

async function registerUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // TODO: upload avatarFile and get URL
    const avatar_url = null;

    const newUser = await prisma.user.create({
        data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password_hash: hashedPassword,
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

    return {
        user: newUser
    };
}

async function registerAdmin(userData){
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // TODO: upload avatarFile and get URL
    const avatar_url = null;

    const newUser = await prisma.user.create({
        data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password_hash: hashedPassword,
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

module.exports = {
    registerUser,
    registerAdmin,
    getUserById,
    getUserByEmail
};