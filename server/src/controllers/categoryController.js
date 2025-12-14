const categoryService = require('../services/categoryService');

const { BadRequestError } = require('../errors/BadRequestError');

const getCategories = async (req, res) => {
    const result = await categoryService.getCategoryList();
    return res.status(200).json(result);
};

const getCategoryDetail = async (req, res) => {
    const category_id = req.params.category_id;
    const result = await categoryService.getCategoryById(category_id);
    return res.status(200).json(result);
};

const createCategories = async (req, res) => {
    const categories = req.body.categories;
    if (!categories || categories.length === 0) {
        throw new BadRequestError("Missing fields or invalid body");
    }
    categories.forEach(cat => {
        if (!cat.category_name || !cat.category_code || !cat.category_description) {
            throw new BadRequestError("Missing fields or invalid body");
        }
    });

    const created = await categoryService.createCategories(categories);

    return res.status(201).json(created);
};

const updateCategory = async (req, res) => {
    const category_id = req.params.category_id;
    const payload = req.body;

    if (payload.category_code) {
        const code = payload.category_code;
        if (!/^[A-Z0-9_]+$/.test(code)) {
            throw new BadRequestError("category_code must be uppercase alphanumeric");
        }
    }

    const updated = await categoryService.updateCategory(category_id, payload);

    return res.status(200).json(updated);
};

const deleteCategory = async (req, res) => {
    const category_id = req.params.category_id;
    await categoryService.deleteCategory(category_id);

    return res.status(204).send();
};

module.exports = {
    getCategories,
    getCategoryDetail,
    createCategories,
    updateCategory,
    deleteCategory
};
