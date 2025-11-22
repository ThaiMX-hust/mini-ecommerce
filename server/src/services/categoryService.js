const { BadRequestError } = require('../errors/BadRequestError')
const { NotFoundError } = require('../errors/NotFoundError')
const categoryRepository = require('../repositories/categoryRepository')
const CacheManager = require('../utils/cacheManager')

async function createCategories(categories){
    try{
        if(!categories || categories.length === 0){
            throw new BadRequestError("Missing fields or invalid body", 400)
        }

        categories.forEach(cat => {
            if(!cat.category_name || !cat.category_code || !cat.category_description){
                throw new BadRequestError("Missing fields or invalid body", 400)
            }
        })

        return categoryRepository.createCategories(categories)
    } catch (error){
        console.log(error)
        throw error
    }
}

async function updateCategory(category_id, payload) {
    try{
        const prisma = categoryRepository.getPrismaClientInstance()

        const exist = await prisma.category.findUnique({
            where: { category_id }
        });

        if (!exist) {
            throw new NotFoundError("Category not found", 404);
        }

        if (payload.category_code) {
            const code = payload.category_code;
            if (!/^[A-Z0-9_]+$/.test(code)) {
                throw new BadRequestError("category_code must be uppercase alphanumeric", 400);
            }

            const dup = await prisma.category.findUnique({
            where: { category_code: code }
            });

            if (dup && dup.category_id !== category_id) {
                throw BadRequestError("Category code already exist", 409);
            }
        }

        const result = await prisma.category.update({
            where: { category_id },
            data: {
            name: payload.category_name,
            category_code: payload.category_code,
            description: payload.category_description,
            }
        });

        await CacheManager.del(`category:${category_id}`);
        await CacheManager.clearByPrefix("products:list:*");
        await CacheManager.del(`products:list:category:${category_id}`);

        return result
    } catch (error){
        console.log(error)
        throw error
    }
}

async function deleteCategory(category_id) {
    try{
        const prisma = categoryRepository.getPrismaClientInstance()

        const exist = await prisma.category.findUnique({
            where: { category_id }
        });
        if (!exist) {
            throw new NotFoundError("Category not found", 404);
        }

        await prisma.category.delete({
            where: { category_id }
        });

        await CacheManager.del(`category:${category_id}`);
        await CacheManager.clearByPrefix("products:list:*");
        await CacheManager.del(`products:list:category:${category_id}`);

        return category_id
    } catch(error){
        console.log(error)
        throw error
    }
}

module.exports = {
    createCategories,
    updateCategory,
    deleteCategory
}