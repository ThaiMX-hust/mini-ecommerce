const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient()

async function getCart(user_id){
    const cart = prisma.cart.findUniqueOrThrow({
        where: {user_id}
    })

    return cart
}