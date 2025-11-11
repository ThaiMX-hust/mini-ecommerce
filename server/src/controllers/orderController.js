const { EmptyCartError, BadRequestError, OutOfStockError } = require('../errors/BadRequestError')

const orderService = require('../services/orderService')

const createOrder = async (req, res) => {
    const userId = req.user.user_id
    if(!userId) return res.status(404).json({error: "No user found"})

    const cartId = req.user.cart_id
    if(!cartId) return res.status(404).json({error: "No cart found"})

    const receiverName = req.body.receiver_name
    const phone = req.body.phone
    const address = req.body.address

    if(!receiverName || !phone || !address){
        return res.status(400).json({error: "Missing or invalid fields"})
    }

    try{
        const newOrder = await orderService.createOrder(userId, cartId, receiverName, phone, address)

        return res.status(201).json(newOrder)
    } catch (e){
        console.log(e)
        if (e instanceof EmptyCartError){
            return res.status(e.statusCode).json({error: "Empty cart"})
        } else if (e instanceof OutOfStockError) {
            return res.status(e.statusCode).json({error: "Out of stock"})
        } else if (e instanceof BadRequestError){
            return res.status(e.statusCode).json({error: "Bad request"})
        } else {
            return res.status(500).json({error: "Internal server error"})
        }
    }
}

module.exports = {
    createOrder
}