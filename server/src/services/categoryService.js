const { BadRequestError } = require('../errors/BadRequestError')
const { NotFoundError } = require('../errors/NotFoundError')
const categoryRepository = require('../repositories/categoryRepository')
const CacheManager = require('../utils/cacheManager')

async function getCategoryList() {
    const cached = await CacheManager.get("category:all");
    if (cached)
        return cached;

    const categories = await categoryRepository.getAll();
    const result = categories.map(c => ({
        category_id: c.category_id,
        category_name: c.category_name,
        category_code: c.category_code,
        category_description: c.category_description
    }));

    await CacheManager.set("category:all", result);

    return result;
}

async function getCategoryById(category_id) {
    const cached = await CacheManager.get(`category:${category_id}`);
    if (cached)
        return cached;

    const category = await categoryRepository.getById(category_id);
    if (!category)
        throw new NotFoundError("Category not found");

    const result = {
        category_id: category.category_id,
        category_name: category.category_name,
        category_code: category.category_code,
        category_description: category.category_description
    };

    await CacheManager.set(`category:${category_id}`, result);

    return result;
}

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

        const result = categoryRepository.createCategories(categories)
        await CacheManager.del('category:all')

        return result
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
            category_name: payload.category_name,
            category_code: payload.category_code,
            category_description: payload.category_description,
            }
        });

        await CacheManager.del('category:all');
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

        await CacheManager.del('category:all');
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
    getCategoryList,
    getCategoryById,
    createCategories,
    updateCategory,
    deleteCategory
}