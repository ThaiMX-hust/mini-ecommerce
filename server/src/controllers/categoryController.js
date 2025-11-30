const e = require('express')
const { BadRequestError } = require('../errors/BadRequestError')
const categoryService = require('../services/categoryService')
const { NotFoundError } = require('../errors/NotFoundError')

const getCategories = async (req, res) => {
    try {
        const result = await categoryService.getCategoryList();
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error getting category list: ", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

const getCategoryDetail = async (req, res) => {
    try {
        const category_id = req.params.category_id;
        const result = await categoryService.getCategoryById(category_id);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error getting category detail: ", error);
        return res.status(500).json({error: "Internal server error"});
    }
}

const createCategories = async (req, res) => {
    try {
        const categories = req.body.categories
        const created = await categoryService.createCategories(categories)

        return res.status(201).json(created)

    } catch (error){
        if(error instanceof BadRequestError){
            return res.status(400).json({error: error.message})
        } else {
            return res.status(500).json({error: "Internal server error"})
        }
    }
}

const updateCategory = async (req, res) => {
    try {
        const category_id = req.params.category_id;
        const payload = req.body;

        const updated = await categoryService.updateCategory(category_id, payload);

        return res.status(200).json(updated);
    } catch (error){
        if (error instanceof BadRequestError || error instanceof NotFoundError){
            return res.status(error.statusCode).json({error: error.message})
        } else {
            return res.status(500).json({error: "Internal server error"})
        }
    }
}

const deleteCategory = async (req, res) => {
    try {
        const category_id = req.params.category_id
        await categoryService.deleteCategory(category_id)

        return res.status(204).send()
    } catch (error){
        if (error instanceof BadRequestError || error instanceof NotFoundError){
            return res.status(error.statusCode).json({error: error.message})
        } else {
            return res.status(500).json({error: "Internal server error"})
        }
    }
}

module.exports = {
    getCategories,
    getCategoryDetail,
    createCategories,
    updateCategory,
    deleteCategory
}