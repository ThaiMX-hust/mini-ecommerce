const prisma = require("../infrastructure/prisma");

function getPrismaClientInstance() {
    return prisma;
}

async function getAdjustmentsByCartId(client, cart_id, order_id) {
    const activeAdjustments = await client.adjustment.findMany({
        where: {
            cart_id,
            order_id: order_id || null,
        },
        orderBy: { created_at: "desc" },
    });

    return activeAdjustments;
}

async function createNewStatus(client, status_code, status_name) {
    return await client.orderStatus.create({
        data: {
            order_status_code: status_code,
            order_status_name: status_name
        }
    });
}

async function getStatusById(status_id) {
    return await prisma.orderStatus.findUnique({
        where: { order_status_id: status_id }
    });
}

async function getStatusByCode(status_code) {
    return await prisma.orderStatus.findUnique({
        where: { order_status_code: status_code }
    });
}

async function createNewStatusToHistory(client, order_id, status_code, changed_by, note = null) {
    const status_id = await getStatusByCode(status_code);

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

async function getWithStatus(order_id) {
    return await prisma.order.findUnique({
        where: { order_id },
        include: { history: { include: { status: true } } }
    });
}

async function getRevenue(from, to) {
    const orders = await prisma.order.findMany({
        where: {
            created_at: {
                gte: new Date(from),
                lte: new Date(to)
            }
        },
        include: {
            history: {
                orderBy: { changed_at: 'desc' },
                take: 1,
                include: { status: true }
            }
        }
    });

    const completed = orders.filter(o =>
        o.history[0]?.status.order_status_code === "COMPLETED"
    );

    const revenue = completed.reduce((sum, o) => sum + Number(o.final_total_price), 0);

    return {
        revenue,
        total_orders: completed.length
    };
}

// for admin only
async function getAll(query, sort) {
    const { offset, limit, status_code } = query;

    const where = { AND: [] };

    if (status_code) {
        const matchingOrders = await prisma.$queryRaw`
            SELECT o.order_id
            FROM \`Order\` o
            JOIN \`OrderStatusHistory\` osh ON o.order_id = osh.order_id
            JOIN \`OrderStatus\` os ON osh.order_status_id = os.order_status_id
            WHERE os.order_status_code = ${status_code}
            AND osh.changed_at = (
                SELECT MAX(changed_at) FROM \`OrderStatusHistory\` sub WHERE sub.order_id = o.order_id
            )
        `;

        const orderIds = matchingOrders.map(o => o.order_id);
        where.AND.push({ order_id: { in: orderIds } });
    }

    const [count, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
            where,
            include: {
                history: {
                    orderBy: { changed_at: "desc" },
                    take: 1,
                    include: { status: true }
                }
            },
            orderBy: sort,
            skip: offset,
            take: limit
        })
    ]);

    return { count, orders };
}

async function getDetail(order_id) {
    return await prisma.order.findUnique({
        where: { order_id },
        include: {
            history: { include: { status: true } },
            items: {
                include: {
                    product_variant: {
                        include: {
                            Product: true,
                            ProductVariantOption: {
                                include: { ProductOptionValue: { include: { ProductOption: true } } }
                            }
                        }
                    }
                }
            }
        }
    });
}

module.exports = {
    getPrismaClientInstance,
    getAdjustmentsByCartId,
    getStatusByCode,
    createNewStatus,
    getStatusById,
    createNewStatusToHistory,
    getWithStatus,
    getRevenue,
    getAll,
    getDetail
};
