const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { addProduct } = require('../../src/services/productService');

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {}, 
        create: {
            first_name: "admin",
            last_name: "admin",
            email: 'admin@example.com',
            password_hash: adminPassword,
            role: 'ADMIN',
            avatar_url: null
        },
     });

    await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            first_name: "John",
            last_name: "Witch",
            email: 'customer@example.com',
            password_hash: customerPassword,
            role: 'CUSTOMER',
            avatar_url: null
        },
    });

  const customer = await prisma.user.findUnique({
    where: {email: "customer@example.com"}
  })

    await prisma.cart.upsert({
        where: { user_id: customer.user_id },
        update: {},
        create: {
            user_id: customer.user_id,
            total_items: 0,
            total_price: 0
        },
    });

    await createCategories()
    await createProducts()
}

async function createProducts(){
    const products = [
        {
        name: 'Áo thun cotton unisex',
        description: 'Áo thun cotton 100%, thấm hút mồ hôi tốt.',
        categories: ['CAT_TSHIRT', 'CAT_SUMMER'],
        options: [
            { option_name: 'Color', values: ['Black', 'White', 'Gray'] },
            { option_name: 'Size', values: ['S', 'M', 'L', 'XL'] },
        ],
        variants: [
            { sku: 'TS-BLK-M', raw_price: 199000, stock_quantity: 30, is_disabled: false, options: [{ option_name: 'Color', value: 'Black' }, { option_name: 'Size', value: 'M' }] },
            { sku: 'TS-WHT-L', raw_price: 199000, stock_quantity: 25, is_disabled: false, options: [{ option_name: 'Color', value: 'White' }, { option_name: 'Size', value: 'L' }] },
        ],
        },
        {
        name: 'Áo sơ mi trắng công sở',
        description: 'Áo sơ mi dáng slim-fit, vải chống nhăn.',
        categories: ['CAT_SHIRT', 'CAT_FORMAL'],
        options: [{ option_name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
        variants: [{ sku: 'SH-WHT-M', raw_price: 299000, stock_quantity: 20, is_disabled: false, options: [{ option_name: 'Size', value: 'M' }] }],
        },
        {
        name: 'Quần jean slim-fit',
        description: 'Jean nam nữ co giãn, form ôm vừa.',
        categories: ['CAT_JEANS'],
        options: [
            { option_name: 'Color', values: ['Blue', 'Black'] },
            { option_name: 'Size', values: ['29', '30', '31', '32'] },
        ],
        variants: [
            { sku: 'JN-BLU-30', raw_price: 399000, stock_quantity: 25, is_disabled: false, options: [{ option_name: 'Color', value: 'Blue' }, { option_name: 'Size', value: '30' }] },
            { sku: 'JN-BLK-31', raw_price: 399000, stock_quantity: 20, is_disabled: false, options: [{ option_name: 'Color', value: 'Black' }, { option_name: 'Size', value: '31' }] },
        ],
        },
        {
        name: 'Áo hoodie unisex form rộng',
        description: 'Hoodie nỉ cotton, form rộng, in hình front logo.',
        categories: ['CAT_HOODIE', 'CAT_JACKET'],
        options: [
            { option_name: 'Color', values: ['Gray', 'Black', 'Beige'] },
            { option_name: 'Size', values: ['M', 'L', 'XL'] },
        ],
        variants: [
            { sku: 'HD-GRY-L', raw_price: 359000, stock_quantity: 22, is_disabled: false, options: [{ option_name: 'Color', value: 'Gray' }, { option_name: 'Size', value: 'L' }] },
            { sku: 'HD-BLK-M', raw_price: 359000, stock_quantity: 18, is_disabled: false, options: [{ option_name: 'Color', value: 'Black' }, { option_name: 'Size', value: 'M' }] },
        ],
        },
        {
        name: 'Đầm công sở dáng xòe',
        description: 'Đầm nữ thanh lịch, chất vải co giãn nhẹ.',
        categories: ['CAT_DRESS', 'CAT_FORMAL'],
        options: [{ option_name: 'Size', values: ['S', 'M', 'L'] }],
        variants: [{ sku: 'DR-OFF-M', raw_price: 459000, stock_quantity: 15, is_disabled: false, options: [{ option_name: 'Size', value: 'M' }] }],
        },
        {
        name: 'Quần short kaki nam',
        description: 'Short kaki basic, thoáng mát, dễ phối đồ.',
        categories: ['CAT_SHORT', 'CAT_SUMMER'],
        options: [
            { option_name: 'Color', values: ['Beige', 'Navy'] },
            { option_name: 'Size', values: ['M', 'L', 'XL'] },
        ],
        variants: [
            { sku: 'SHRT-BEI-L', raw_price: 259000, stock_quantity: 25, is_disabled: false, options: [{ option_name: 'Color', value: 'Beige' }, { option_name: 'Size', value: 'L' }] },
        ],
        },
        {
        name: 'Áo len cổ lọ mùa đông',
        description: 'Áo len dày cổ cao, giữ ấm tốt, phù hợp mùa lạnh.',
        categories: ['CAT_SWEATER', 'CAT_COAT'],
        options: [
            { option_name: 'Color', values: ['Brown', 'Gray'] },
            { option_name: 'Size', values: ['M', 'L', 'XL'] },
        ],
        variants: [
            { sku: 'SW-BRN-L', raw_price: 429000, stock_quantity: 20, is_disabled: false, options: [{ option_name: 'Color', value: 'Brown' }, { option_name: 'Size', value: 'L' }] },
        ],
        },
        {
        name: 'Chân váy xếp ly dài',
        description: 'Chân váy dài, vải nhẹ, dễ phối sơ mi.',
        categories: ['CAT_SKIRT'],
        options: [
            { option_name: 'Color', values: ['Beige', 'Black'] },
            { option_name: 'Size', values: ['S', 'M', 'L'] },
        ],
        variants: [
            { sku: 'SK-BEI-M', raw_price: 299000, stock_quantity: 30, is_disabled: false, options: [{ option_name: 'Color', value: 'Beige' }, { option_name: 'Size', value: 'M' }] },
        ],
        },
        {
        name: 'Áo sơ mi caro cổ bẻ',
        description: 'Áo sơ mi caro trẻ trung, phù hợp dạo phố.',
        categories: ['CAT_SHIRT'],
        options: [
            { option_name: 'Color', values: ['Red', 'Blue'] },
            { option_name: 'Size', values: ['M', 'L', 'XL'] },
        ],
        variants: [
            { sku: 'SH-CAR-L', raw_price: 329000, stock_quantity: 26, is_disabled: false, options: [{ option_name: 'Color', value: 'Red' }, { option_name: 'Size', value: 'L' }] },
        ],
        },
        {
        name: 'Áo khoác măng tô dài',
        description: 'Áo khoác dáng dài, dạ mịn, giữ ấm tốt.',
        categories: ['CAT_COAT', 'CAT_FORMAL'],
        options: [
            { option_name: 'Color', values: ['Black', 'Gray'] },
            { option_name: 'Size', values: ['M', 'L', 'XL'] },
        ],
        variants: [
            { sku: 'CT-BLK-L', raw_price: 699000, stock_quantity: 12, is_disabled: false, options: [{ option_name: 'Color', value: 'Black' }, { option_name: 'Size', value: 'L' }] },
        ],
        },
    ];

    for (const p of products) {
        await addProduct(p);
    }
}

async function createCategories(){

    const categories = [
        {
        category_code: 'CAT_TSHIRT',
        category_name: 'Áo thun',
        category_description: 'Áo thun nam nữ, basic, form rộng, tay ngắn, tay dài.',
        },
        {
        category_code: 'CAT_SHIRT',
        category_name: 'Áo sơ mi',
        category_description: 'Áo sơ mi công sở, dáng slim-fit hoặc oversize.',
        },
        {
        category_code: 'CAT_JACKET',
        category_name: 'Áo khoác',
        category_description: 'Áo khoác jean, hoodie, bomber, áo gió, áo dạ.',
        },
        {
        category_code: 'CAT_JEANS',
        category_name: 'Quần jean',
        category_description: 'Quần jean nam nữ, skinny, baggy, slim-fit.',
        },
        {
        category_code: 'CAT_TROUSER',
        category_name: 'Quần dài',
        category_description: 'Quần vải, quần tây, chinos, quần ống rộng.',
        },
        {
        category_code: 'CAT_SHORT',
        category_name: 'Quần short',
        category_description: 'Quần short kaki, jean, thể thao, mặc hàng ngày.',
        },
        {
        category_code: 'CAT_DRESS',
        category_name: 'Đầm',
        category_description: 'Đầm công sở, đầm dạo phố, đầm dự tiệc.',
        },
        {
        category_code: 'CAT_SKIRT',
        category_name: 'Chân váy',
        category_description: 'Váy ngắn, váy dài, váy chữ A, váy xếp ly.',
        },
        {
        category_code: 'CAT_HOODIE',
        category_name: 'Áo hoodie',
        category_description: 'Áo hoodie trơn, in hình, unisex, oversize.',
        },
        {
        category_code: 'CAT_SWEATER',
        category_name: 'Áo len',
        category_description: 'Áo len cổ tròn, cổ cao, cardigan, sweater mùa đông.',
        },
        {
        category_code: 'CAT_UNDERWEAR',
        category_name: 'Đồ lót',
        category_description: 'Đồ lót nam nữ, cotton, co giãn, thoải mái.',
        },
        {
        category_code: 'CAT_SPORT',
        category_name: 'Đồ thể thao',
        category_description: 'Bộ đồ tập gym, yoga, chạy bộ, thể dục.',
        },
        {
        category_code: 'CAT_PAJAMA',
        category_name: 'Đồ ngủ',
        category_description: 'Bộ pijama, đồ ngủ cotton, thoáng mát.',
        },
        {
        category_code: 'CAT_SWIM',
        category_name: 'Đồ bơi',
        category_description: 'Bikini, đồ bơi nam nữ, đi biển, chất co giãn.',
        },
        {
        category_code: 'CAT_ACCESSORY',
        category_name: 'Phụ kiện',
        category_description: 'Mũ, nón, thắt lưng, khăn, vớ, kính mát, vòng tay.',
        },
        {
        category_code: 'CAT_BAG',
        category_name: 'Túi xách',
        category_description: 'Túi đeo chéo, túi tote, balo, túi clutch.',
        },
        {
        category_code: 'CAT_SHOES',
        category_name: 'Giày dép',
        category_description: 'Giày sneaker, sandal, dép lê, giày cao gót.',
        },
        {
        category_code: 'CAT_COAT',
        category_name: 'Áo măng tô',
        category_description: 'Áo khoác dài, dạ măng tô, blazer, trench coat.',
        },
        {
        category_code: 'CAT_FORMAL',
        category_name: 'Đồ công sở',
        category_description: 'Set đồ vest, áo sơ mi, quần tây, chân váy công sở.',
        },
        {
        category_code: 'CAT_SUMMER',
        category_name: 'Đồ mùa hè',
        category_description: 'Quần áo vải mỏng, cotton, màu sáng, thoáng mát.',
        },
    ];

    await prisma.category.createMany({
        data: categories,
        skipDuplicates: true,
    });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
