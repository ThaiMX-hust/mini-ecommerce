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

async function createNewStatus(client, status_code, status_name){
    return await client.orderStatus.create({
        data: {
            order_status_code: status_code,
            order_status_name: status_name
        }
    })
}

async function getStatusById(status_id){
    return await prisma.orderStatus.findUnique({
        where:{order_status_id: status_id}
    })
}

async function getStatusByCode(status_code){
    return await prisma.orderStatus.findUnique({
        where:{order_status_code: status_code}
    })
}

async function createNewStatusToHistory(client, order_id, status_code, changed_by, note = null) {
    const status_id = await getStatusByCode(status_code)

    return await client.orderStatusHistory.create({
        data: {
        order_id,
        order_status_id: status_id.order_status_id,
        changed_by: changed_by ?? null,
        note: note ?? null,
        changed_at: new Date()
        }
    });
}

async function getById(order_id) {
    return await prisma.order.findUnique({
        where: { order_id },
        include: { history: true }
    });
}

module.exports = {
    getPrismaClientInstance,
    getAdjustmentsByCartId,
    getStatusByCode,
    createNewStatus,
    getStatusById,
    createNewStatusToHistory,
    getById
} 
