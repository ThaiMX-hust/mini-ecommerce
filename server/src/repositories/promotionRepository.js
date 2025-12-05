const prisma = require("../infrastructure/prisma");

function getPrismaClientInstance() {
    return prisma;
}

async function createPromotion() {

}

module.exports = {
    getPrismaClientInstance,
    createPromotion
};
