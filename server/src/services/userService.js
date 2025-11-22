const { hashPassword } = require('../utils/passwordUtils');
const userRepository = require('../repositories/userRepository');
const { PrismaClient } = require('@prisma/client');
const cloudinaryService = require('./cloudinaryService');

const prisma = new PrismaClient();

async function registerUser(userData) {
    const password_hash = await hashPassword(userData.password);
    
    //  Upload avatar lên Cloudinary
    let avatar_url = null;
    if (userData.avatarFile) {
        try {
            avatar_url = await cloudinaryService.uploadImage(
                userData.avatarFile.buffer,
                'avatars'  
            );
            console.log('Avatar uploaded to Cloudinary:', avatar_url);
        } catch (error) {
            console.error(' Error uploading avatar:', error);
            // Không throw error, cho phép đăng ký mà không có avatar
        }
    }

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
    const password_hash = await hashPassword(userData.password);
    
    //  Upload avatar lên Cloudinary cho admin
    let avatar_url = null;
    if (userData.avatarFile) {
        try {
            avatar_url = await cloudinaryService.uploadImage(
                userData.avatarFile.buffer,
                'avatars'
            );
            console.log('Admin avatar uploaded to Cloudinary:', avatar_url);
        } catch (error) {
            console.error(' Error uploading admin avatar:', error);
        }
    }

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
        return null;

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

    //  Upload avatar mới lên Cloudinary khi update
    let avatar_url = null;
    if (avatarFile) {
        try {
            // Upload avatar mới
            avatar_url = await cloudinaryService.uploadImage(
                avatarFile.buffer,
                'avatars'
            );
            console.log(' Avatar updated on Cloudinary:', avatar_url);

            // Xóa avatar cũ (nếu có)
            const oldUser = await userRepository.getUserById(user_id);
            if (oldUser && oldUser.avatar_url) {
                try {
                    await cloudinaryService.deleteImage(oldUser.avatar_url);
                    console.log('✅ Old avatar deleted from Cloudinary');
                } catch (deleteError) {
                    console.error('⚠️ Could not delete old avatar:', deleteError);
                    // Không throw error, vì upload mới đã thành công
                }
            }
        } catch (error) {
            console.error('❌ Error uploading new avatar:', error);
            // Không throw error, cho phép update thông tin mà không đổi avatar
        }
    }

    const user = await userRepository.updateUser(user_id, { 
        first_name, 
        last_name, 
        avatar_url 
    });
    
    if (!user)
        return null;

    return {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_url: user.avatar_url
    };
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
    updatePassword,
    updateUser
};