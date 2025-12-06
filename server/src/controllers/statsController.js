const statsService = require('../services/statsService');
const { AppError } = require('../errors/AppError');
const { BadRequestError } = require('../errors/BadRequestError')

async function getRevenueStats(req, res) {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            throw new BadRequestError("Invalid date");
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
            throw new BadRequestError("Invalid date");
        }

        const data = await statsService.getRevenue(from, to);
        return res.status(200).json(data);

    } catch (error) {
        if (error instanceof AppError)
            return res.status(error.statusCode).json({ error: error.message });

        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getRevenueStats
};