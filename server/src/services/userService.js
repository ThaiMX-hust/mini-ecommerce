const bcrypt = require('bcryptjs');

const usersDB = []; // Placeholder for user database

async function registerUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // TODO: upload avatarFile and get URL

    const newUser = {
        id: usersDB.length + 1,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password_hash: hashedPassword,
        role: 'CUSTOMER',
        avatar_url: null // Placeholder for avatar URL
    }
    usersDB.push(newUser);

    const { password_hash, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
}

async function getUserByEmail(email) {
    return usersDB.find(user => user.email === email);
}

module.exports = {
    registerUser,
    getUserByEmail
};