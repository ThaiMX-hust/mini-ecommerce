const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function getPrismaClientInstance(){
    return prisma
}

async function getAdjustmentsByCartId(client, cart_id, order_id){
    const activeAdjustments = await client.adjustment.findMany({
        where: {
        cart_id,
        order_id: order_id || null,
        },
        orderBy: { created_at: "desc" },
    });

    return activeAdjustments
}

module.exports = {
    getPrismaClientInstance,
    getAdjustmentsByCartId
} 