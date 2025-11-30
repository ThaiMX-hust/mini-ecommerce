const prisma = require('../infrastructure/prisma');

async function add(data) {
    const { order_id, reason, amount } = data;
    return await prisma.refund.create({
        data: {
            order_id, reason, amount
        }
    });
}

async function getByOrderId(order_id) {
    return await prisma.refund.findMany({ where: { order_id }});
}

async function getAll() {
    return await prisma.refund.findMany();
}

async function getAllPending() {
    return await prisma.refund.findMany({ where: { status: "PENDING" } });
}

async function getByUserId(user_id) {
    return await prisma.refund.findMany({
        where: {
            order: { user_id }
        }
    });
}

async function getById(refund_id) {
    return await prisma.refund.findUnique({ where: { refund_id } });
}

async function update(refund_id, refund) {
    return await prisma.refund.update({
        where: { refund_id },
        data: refund
    });
}

module.exports = {
    add,
    getByOrderId,
    getAll,
    getAllPending,
    getByUserId,
    getById,
    update
};
