const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

    return newUser;
}

async function getUserByEmail(email) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            password_hash: true,
            avatar_url: true,
            role: true
        }
    });
    return user;
}

module.exports = {
    registerUser,
    getUserByEmail
};