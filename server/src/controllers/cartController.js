const cartService = require('../services/cartService');
const cartRepository = require('../repositories/cartRepository');
const productService = require('../services/productService');

const { BadRequestError } = require('../errors/BadRequestError');
const { NotFoundError } = require("../errors/NotFoundError");

const cartTest = async (req, res) => {
    const responsePayload = await cartService.cartTest();
    return res.status(200).json(responsePayload);
};

const addToCart = async (req, res) => {
    const userId = req.user.user_id;
    if (!userId)
        throw new BadRequestError("Missing user id");

    const cartId = req.user.cart_id;
    if (!cartId)
        throw new BadRequestError("Missing cart id");

    const productVariantId = req.body.product_variant_id;
    const quantity = req.body.quantity;

    if (!productVariantId || !quantity)
        throw new BadRequestError("Missing or invalid fields");

    const productVariant = await productService.getProductVariantById(productVariantId);

    if (!productVariant) {
        throw new NotFoundError("Product variant not found");
    }

    const cartObject = await cartService.addItemToCart(cartId, productVariantId, quantity);
    if (cartObject.method === 'add') {
        return res.status(201).json(cartObject.item);
    } else if (cartObject.method === 'update') {
        return res.status(200).json(cartObject.item);
    }
};

const getCart = async (req, res) => {
    const { user_id: userId, cart_id: cartId } = req.user ?? {};

    if (!userId)
        throw new BadRequestError("Missing user id");

    if (!cartId)
        throw new BadRequestError("Missing cart id");

    const cartItems = await cartService.getCart(cartId);

    return res.status(200).json(cartItems);
};

const updateItemQuantityFromCart = async (req, res) => {
    const userId = req.user.user_id;
    if (!userId)
        throw new BadRequestError("Missing user id");

    const cartId = req.user.cart_id;
    if (!cartId)
        throw new BadRequestError("Missing cart id");

    const cartItemId = req.params.cart_item_id;
    const quantity = req.body.quantity;

    const cartItem = await cartRepository.getCartItem(cartId, cartItemId);
    if (!cartItem) {
        throw new NotFoundError("Cart item not found or does not belong to this user");
    }

    const updatedItem = await cartService.updateItemQuantityFromCart(cartId, cartItemId, quantity);
    return res.status(200).json(updatedItem);
};

const deleteItemFromCart = async (req, res) => {
    const userId = req.user.user_id;
    if (!userId)
        throw new BadRequestError("Missing user id");

    const cartId = req.user.cart_id;
    if (!cartId)
        throw new BadRequestError("Missing cart id");

    const cartItemId = req.params.cart_item_id;
    console.log(cartItemId);

    const cartItem = await cartRepository.getCartItem(cartId, cartItemId);
    if (!cartItem) {
        throw new NotFoundError("Cart item not found or does not belong to this user");
    }

    await cartService.deleteItemFromCart(cartId, cartItemId);
    return res.status(204).send();
};

module.exports = {
    cartTest,
    addToCart,
    getCart,
    updateItemQuantityFromCart,
    deleteItemFromCart
};
