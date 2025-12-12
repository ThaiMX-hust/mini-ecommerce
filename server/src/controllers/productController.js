const productService = require('../services/productService');
const { cleanText } = require('../utils/sanitizer');

const { BadRequestError } = require('../errors/BadRequestError');

const getProducts = async (req, res) => {
    const name = req.query.name || req.query.search;
    let categories = req.query.categories;
    if (categories && !Array.isArray(categories)) {
        categories = [categories];
    }
    const min_price = Number(req.query.min_price);
    const max_price = Number(req.query.max_price);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const products = await productService.getProducts({ name, categories, min_price, max_price, page, limit });
    return res.status(200).json(products);
};

const getAllProducts = async (req, res) => {
    const name = req.query.name || req.query.search;
    let categories = req.query.categories;
    if (categories && !Array.isArray(categories)) {
        categories = [categories];
    }
    const min_price = Number(req.query.min_price);
    const max_price = Number(req.query.max_price);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const products = await productService.getAllProducts({ name, categories, min_price, max_price, page, limit });
    return res.status(200).json(products);
};

const getProductById = async (req, res) => {
    const product_id = req.params.product_id;
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const product = await productService.getProductById(product_id, isAdmin);
    return res.status(200).json(product);
};

const addProduct = async (req, res) => {
    const productData = req.body;

    const requiredFields = ['name', 'description', 'categories', 'options', 'variants'];
    const missing = requiredFields.filter(f => !productData[f] || (Array.isArray(productData[f]) && productData[f].length === 0));
    if (missing.length > 0) {
        throw new BadRequestError('Missing fields');
    }

    try {
        productData.categories = JSON.parse(productData.categories);
        productData.options = JSON.parse(productData.options);
        productData.variants = JSON.parse(productData.variants);
    } catch (error) {
        throw new BadRequestError('Missing or invalid fields');
    }

    for (const opt of productData.options) {
        if (!opt.option_name || !Array.isArray(opt.values) || opt.values.length === 0) {
            throw new BadRequestError('Each option must have option_name and non-empty values array');
        }
    }

    productData.is_disabled = (productData.is_disabled === true || productData.is_disabled === 'true');
    productData.images = req.files;

    const newProduct = await productService.addProduct(productData);
    return res.status(201).json(newProduct);
};

const updateProduct = async (req, res) => {
    const product_id = req.params.product_id;
    const productData = { ...req.body, images: req.files };

    try {
        if (productData.categories) {
            productData.categories = JSON.parse(productData.categories);
        }
        if (productData.is_disabled !== undefined) {
            productData.is_disabled = productData.is_disabled === 'true' || productData.is_disabled === true;
        }
    } catch (error) {
        throw new BadRequestError("Missing or invalid fields");
    }

    const updatedProduct = await productService.updateProduct(product_id, productData);
    return res.status(200).json(updatedProduct);
};

const updateProductOption = async (req, res) => {
    const product_id = req.params.product_id;
    const product_option_id = req.params.product_option_id;
    const optionData = req.body;

    const updatedOption = await productService.updateProductOption(product_id, product_option_id, optionData);
    return res.status(200).json(updatedOption);
};

const updateProductVariant = async (req, res) => {
    const product_id = req.params.product_id;
    const product_variant_id = req.params.product_variant_id;

    let { sku, raw_price, stock_quantity, image_indexes, options } = req.body;

    try {
        raw_price = raw_price ? Number(raw_price) : null;
        stock_quantity = stock_quantity ? parseInt(stock_quantity) : null;
        image_indexes = image_indexes ? JSON.parse(image_indexes) : null;
        options = options ? JSON.parse(options) : null;
    } catch (error) {
        throw new BadRequestError("Missing or invalid fields");
    }

    const variantData = { sku, raw_price, stock_quantity, image_indexes, options };

    const updatedVariant = await productService.updateProductVariant(product_id, product_variant_id, variantData);
    return res.status(200).json(updatedVariant);
};

const deleteProduct = async (req, res) => {
    const product_id = req.params.product_id;
    await productService.deleteProduct(product_id);
    return res.status(204).send();
};

const deleteProductVariant = async (req, res) => {
    const product_id = req.params.product_id;
    const product_variant_id = req.params.product_variant_id;
    await productService.deleteProductVariant(product_id, product_variant_id);
    return res.status(204).send();
};

const addReview = async (req, res) => {
    const product_id = req.params.product_id;
    const by_user_id = req.user.user_id;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        throw new BadRequestError('Missing or invalid fields');
    }

    const review = { rating, comment: cleanText(comment), by_user_id };

    const result = await productService.addReview(product_id, review);
    return res.status(201).json(result);
};

const getReviews = async (req, res) => {
    const product_id = req.params.product_id;
    const reviews = await productService.getReviews(product_id);
    return res.status(200).json(reviews);
};

const softDelete = async (req, res) => {
    const product_id = req.params.product_id;
    const result = await productService.softDelete(product_id);
    return res.status(200).json(result);
};

const restore = async (req, res) => {
    const product_id = req.params.product_id;
    const result = await productService.restore(product_id);
    return res.status(200).json(result);
};

module.exports = {
    getProducts,
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    updateProductOption,
    updateProductVariant,
    deleteProduct,
    deleteProductVariant,
    addReview,
    getReviews,
    softDelete,
    restore
};
