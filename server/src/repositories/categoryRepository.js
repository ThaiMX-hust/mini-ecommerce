const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function getPrismaClientInstance(){
    return prisma;
}

async function getAll() {
    return await prisma.category.findMany();
}

async function getById(category_id) {
    return await prisma.category.findFirst({ where: { category_id } });
}

async function createCategories(categories) {
    const data = categories.map(cat => ({
        category_name: cat.category_name,
        category_code: cat.category_code,
        category_description: cat.category_description ?? null,
    }));

    await prisma.category.createMany({
        data,
        skipDuplicates: true
    });

    const categoryCodes = categories.map(cat => cat.category_code)

    const insertedRecords = await prisma.category.findMany({
        where: {
         category_code: { in: categoryCodes }
        }
    });

    return {
        categories: insertedRecords
    };
}


async function getCategoryIdByCode(category_code){
    const code = prisma.category.findUnique({
        where: {category_code: category_code}
    })

    return code
}

module.exports = {
    getAll,
    getById,
    getPrismaClientInstance,
    createCategories,
    getCategoryIdByCode
}