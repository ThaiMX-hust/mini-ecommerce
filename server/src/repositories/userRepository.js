const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getUserById(user_id, client = prisma) {
    return await client.user.findUnique({
        where: { user_id },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
            role: true,
            created_at: true,
            updated_at: true,
        }
    });
}

async function getUserByEmail(email, client = prisma) {
    return await client.user.findUnique({
        where: { email },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
            role: true,
            created_at: true,
            updated_at: true,
            Cart: {
                select: {cart_id: true}
            }
        }
    });
}

async function getUserHashedPassword(user_id, client = prisma) {
    return (await client.user.findUnique({
        where: { user_id },
        select: { password_hash: true }
    })).password_hash;
}

module.exports = {
    getUserById,
    getUserByEmail,
    getUserHashedPassword
};