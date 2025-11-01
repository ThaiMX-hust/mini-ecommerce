const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const name = req.query.name;
        let categories = req.query.categories;
        if (categories && !Array.isArray(categories)) {
            categories = [categories];
        }
        const min_price = Number(req.query.min_price);
        const max_price = Number(req.query.max_price);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const isAdmin = req.user && req.user.role === 'ADMIN';

        const products = await productService.getProducts({ name, categories, min_price, max_price, page, limit }, isAdmin);
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const isAdmin = req.user && req.user.role === 'ADMIN';
        const product = await productService.getProductById(productId, isAdmin);
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

        try {
            const requiredFields = ['name', 'description', 'categories', 'options', 'variants'];
            const missing = requiredFields.filter(f => !productData[f] || (Array.isArray(productData[f]) && productData[f].length === 0));
            if (missing.length > 0) {
                throw new Error('Missing fields');
            }

            productData.categories = JSON.parse(productData.categories);
            productData.options = JSON.parse(productData.options);
            productData.variants = JSON.parse(productData.variants);
            for (const opt of productData.options) {
                if (!opt.option_name || !Array.isArray(opt.values) || opt.values.length === 0) {
                    return res.status(400).json({ error: 'Each option must have option_name and non-empty values array' });
                }
            }
        } catch (error) {
            return res.status(400).json({ "error": "Missing or invalid fields" });
        }    

        productData.variants_images = req.files;

        const newProduct = await productService.addProduct(productData);
        console.log('Added new product:', newProduct);
        return res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const productData = { ...req.body, variant_images: req.files };

        try {
            if (productData.categories) {
                productData.categories = JSON.parse(productData.categories);
            }
            if (productData.is_disabled !== undefined) {
                productData.is_disabled = productData.is_disabled === 'true' || productData.is_disabled === true;
            }
        } catch (error) {
            return res.status(400).json({ "error": "Missing or invalid fields" });
        }

        const updatedProduct = await productService.updateProduct(productId, productData);
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const deletedProduct = await productService.deleteProduct(productId);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};