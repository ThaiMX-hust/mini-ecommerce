const ordersRepository = require('../repositories/ordersRepository');

async function getRevenue(from, to) {
    const result = await ordersRepository.getRevenue(from, to);

    return {
        revenue: result.revenue,
        total_orders: result.total_orders,
        from,
        to,
    };
}

module.exports = {
    getRevenue
}