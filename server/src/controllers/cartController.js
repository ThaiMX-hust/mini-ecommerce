const cartService = require('../services/cartService')
const cartRepository = require('../repositories/cartRepository')
const productService = require('../services/productService');
const { OutOfStockError } = require('../errors/BadRequestError');

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

        if(!productVariantId || !quantity){
            return res.status(400).json({error: "Missing or invalid fields"})
        }

        const productVariant = await productService.getProductVariantById(productVariantId)
    
        if (!productVariant){
            return res.status(404).json({error: "Product variant not found"})
        }

        const cartObject = await cartService.addItemToCart(cartId, productVariantId, quantity)
        if(cartObject.method === 'add'){
            return res.status(201).json(cartObject.item)
        } else if(cartObject.method === 'update'){
            return res.status(200).json(cartObject.item)
        }
    } catch (err){
        console.log(err)
        if(err instanceof OutOfStockError){
            return res.status(400).json({error: err.message})
        } else 
            return res.status(500).json({error: "Internal server error"})
    }
}


const getCart = async (req, res) => {
    const userId = req.user.user_id
    if(!userId) return res.status(404).json({error: "No user found"})

    const cartId = req.user.cart_id
    if(!cartId) return res.status(404).json({error: "No cart found"})

    try {
        const cartItems = await cartService.getCart(cartId);
        
        return res.status(200).json(cartItems)
        
    } catch(e){
        console.log(e)
        return res.status(500).json({error: "Internal server error"})
    }
}

const updateItemFromCart = async (req, res) => {
}

const updateItemQuantityFromCart = async (req, res) => {
    const userId = req.user.user_id
    if(!userId) return res.status(404).json({error: "No user found"})

    const cartId = req.user.cart_id
    if(!cartId) return res.status(404).json({error: "No cart found"})

    const cartItemId = req.params.cart_item_id;
    const quantity = req.body.quantity

    try {
        const cartItem = await cartRepository.getCartItem(cartId, cartItemId)
        if(!cartItem){
            return res.status(404).json({error: "Cart item not found or does not belong to this user"})
        }

        const updatedItem = await cartService.updateItemQuantityFromCart(cartId, cartItemId, quantity)
        return res.status(200).json(updatedItem)

    } catch (err) {
        console.log(err)
        return res.status(500).json({error: "Internal server error"})
    }
}

const deleteItemFromCart = async (req, res) => {
    const userId = req.user.user_id
    if(!userId) return res.status(404).json({error: "No user found"})

    const cartId = req.user.cart_id
    if(!cartId) return res.status(404).json({error: "No cart found"})

    const cartItemId = req.params.cart_item_id;
    console.log(cartItemId)

    try {
        const cartItem = await cartRepository.getCartItem(cartId, cartItemId)
        if(!cartItem){
            return res.status(404).json({error: "Cart item not found or does not belong to this user"})
        }

        await cartService.deleteItemFromCart(cartId, cartItemId)
        return res.status(204).send()

    } catch (err) {
        console.log(err)
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports = {
    cartTest,
    addToCart,
    getCart,
    updateItemFromCart,
    updateItemQuantityFromCart,
    deleteItemFromCart
}