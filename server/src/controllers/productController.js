const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const name = req.query.name;
        const categories = req.query.categories;
        const minPrice = Number(req.query.minPrice);
        const maxPrice = Number(req.query.maxPrice);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const products = await productService.getProducts({ name, categories, minPrice, maxPrice, page, limit });
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productService.getProductById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const addProduct = async (req, res) => {
    try {
        const productData = req.body;
        productData.categories = JSON.parse(productData.categories);
        productData.options = JSON.parse(productData.options);
        productData.variants = JSON.parse(productData.variants);
        productData.variants_images = req.files;

        const newProduct = await productService.addProduct(productData);
        console.log('Added new product:', newProduct);
        return res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getProducts,
    getProductById,
    addProduct
};