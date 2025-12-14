const { BadRequestError } = require('../errors/BadRequestError');
const { ConflictError } = require("../errors/ConflictError");
const { NotFoundError } = require('../errors/NotFoundError');
const categoryRepository = require('../repositories/categoryRepository');
const CacheManager = require('../utils/cacheManager');

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

    await CacheManager.set("category:all", result, CacheManager.TTL.CATEGORY);

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

    await CacheManager.set(`category:${category_id}`, result, CacheManager.TTL.CATEGORY);

    return result;
}

async function createCategories(categories) {
    const result = categoryRepository.createCategories(categories);
    await CacheManager.del('category:all');

    return result;
}

async function updateCategory(category_id, payload) {
    const prisma = categoryRepository.getPrismaClientInstance();

    const exist = await prisma.category.findUnique({
        where: { category_id }
    });

    if (!exist) {
        throw new NotFoundError("Category not found");
    }

    if (payload.category_code) {
        const code = payload.category_code;
        const dup = await prisma.category.findUnique({
            where: { category_code: code }
        });

        if (dup && dup.category_id !== category_id) {
            throw new ConflictError("Category code already exist");
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

    return result;
}

async function deleteCategory(category_id) {
    const prisma = categoryRepository.getPrismaClientInstance();

    const exist = await prisma.category.findUnique({
        where: { category_id }
    });
    if (!exist) {
        throw new NotFoundError("Category not found");
    }

    await prisma.category.delete({
        where: { category_id }
    });

    await CacheManager.del('category:all');
    await CacheManager.del(`category:${category_id}`);
    await CacheManager.clearByPrefix("products:list:*");
    await CacheManager.del(`products:list:category:${category_id}`);
}

module.exports = {
    getCategoryList,
    getCategoryById,
    createCategories,
    updateCategory,
    deleteCategory
};
