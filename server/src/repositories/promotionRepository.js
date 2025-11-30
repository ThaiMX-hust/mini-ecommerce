const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getPrismaClientInstance(){
    return prisma
}

async function createPromotion(){

}

module.exports = {
    getPrismaClientInstance,
    createPromotion
}