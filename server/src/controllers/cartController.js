const cartService = require('../services/cartService')

const cartTest = async (req, res) => {
    const responsePayload = await cartService.cartTest();
    return res.status(200).json(responsePayload);
}

const addToCart = async (req, res) => {
    const userId = req.user.user_id
    if(!userId) return res.status(404).json({error: "No user found"})

    const cartId = req.user.cart_id
    if(!cartId) return res.status(404).json({error: "No cart found"})

    try {
        const productVariantId = req.body.product_variant_id
        const quantity = req.body.quantity

        const cartObject = await cartService.addItemToCart(cartId, productVariantId, quantity)
        if(cartObject.method === 'add'){
            return res.status(201).json(cartObject.item)
        } else if(cartObject.method === 'update'){
            return res.status(200).json(cartObject.item)
        }
    } catch (err){
        console.log(err)
        return res.status(500).json({error: "Internal server error"})
    }
}


const getCart = async (req, res) => {

}

const updateItemFromCart = async (req, res) => {

}

const updateItemQuantityFromCart = async (req, res) => {

}

const deleteItemFromCart = async (req, res) => {

}

module.exports = {
    cartTest,
    addToCart,
    getCart,
    updateItemFromCart,
    updateItemQuantityFromCart,
    deleteItemFromCart
}