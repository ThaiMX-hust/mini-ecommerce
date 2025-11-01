const cartService = require('../services/cartService')

const cartTest = async (req, res) => {
    const responsePayload = await cartService.cartTest();
    return res.status(200).json(responsePayload);
}

const addToCart = async (req, res) => {
    
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