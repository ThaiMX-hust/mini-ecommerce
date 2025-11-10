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

async function getUserWithPassword(where, client = prisma) {
    return await client.user.findUnique({
        where,
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
            password_hash: true,
            role: true,
            created_at: true,
            updated_at: true,
        }
    });
}

const getUserWithPasswordById = (user_id, client = prisma) => getUserWithPassword({ user_id }, client);

const getUserWithPasswordByEmail = (email, client = prisma) => getUserWithPassword({ email }, client);

async function getUserHashedPassword(user_id, client = prisma) {
    return (await client.user.findUnique({
        where: { user_id },
        select: { password_hash: true }
    })).password_hash;
}

async function updatePassword(user_id, password_hash, client = prisma) {
    return await client.user.update({
        where: { user_id },
        data: { password_hash }
    });
}

module.exports = {
    getUserById,
    getUserByEmail,
    getUserWithPasswordById,
    getUserWithPasswordByEmail,
    getUserHashedPassword,
    updatePassword
};