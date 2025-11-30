const { redisClient } = require("../infrastructure/redis"); 
const crypto = require("crypto");

let redis;
async function getRedis() {
    if (!redis) redis = await redisClient();
    return redis;
}

class CacheManager {
    constructor() {
        this.TTL = {
            PRODUCT: 900,
            PRODUCTS: 60,
            CATEGORY: 3600,
            CART: 604800,
            STOCK: null,
            PROMOTION: 3600
        };
    }

    async get(key) {
        const r = await getRedis();
        const data = await r.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set(key, value, ttl = null) {
        const r = await getRedis();
        value = JSON.stringify(value);

        if (ttl) {
            await r.set(key, value, "EX", ttl);
        } else {
            await r.set(key, value);
        }
    }

    async del(key) {
        const r = await getRedis();
        await r.del(key);
    }

    async clearByPrefix(prefix) {
        const r = await getRedis();
        const stream = r.scanStream({ match: `${prefix}*`, count: 100 });

        stream.on("data", (keys) => {
            if (keys.length) r.del(...keys);
        });
    }

    /** ================================
     * Key Generator
     * ================================ */
    key = {
        product: id => `product:${id}`,
        productsList: query => `products:list:${this.makeQueryKey(query)}`,
        product_variant: id => `product_variant:${id}`,
        productList: catId => `product:list:category:${catId}`,
        categoryTree: `category:tree`,
        cart: id => `cart:${id}`,
        stock: id => `stock:${id}`,
        promotion: id => `promotion:${id}`,
    };

    /** PRODUCT */
    async getProduct(id) {
        return this.get(this.key.product(id));
    }

    async setProduct(id, data) {
        return this.set(this.key.product(id), data, this.TTL.PRODUCT);
    }

    async getProductVariant(id){
        return this.get(this.key.product_variant(id))
    }

    async setProductVariant(id, data){
        return this.set(this.key.product_variant(id), data, this.TTL.PRODUCT)
    }

    async getProducts(query){
        return this.get(this.key.productsList(query))
    }

    async setProducts(query, data){
        return this.set(this.key.productsList(query), data, this.TTL.PRODUCTS)
    }

    /** CART */
    async getCart(id) {
        return this.get(this.key.cart(id));
    }

    async setCart(id, data) {
        return this.set(this.key.cart(id), data, this.TTL.CART);
    }

    async clearCart(id) {
        return this.del(this.key.cart(id));
    }

    /** STOCK */
    async getStock(id) {
        const r = await getRedis();
        const stock = await r.get(this.key.stock(id));
        return stock ? Number(stock) : null;
    }

    async setStock(id, qty) {
        const r = await getRedis();
        await r.set(this.key.stock(id), qty.toString());
    }

    async decreaseStock(id, qty = 1) {
        const r = await getRedis();
        return await r.decrBy(this.key.stock(id), qty);
    }

    /** PROMOTION */
    async getPromotion(id) {
        return this.get(this.key.promotion(id));
    }

    async setPromotion(id, data) {
        return this.set(this.key.promotion(id), data, this.TTL.PROMOTION);
    }

    async clearPromotion(id) {
        return this.del(this.key.promotion(id));
    }

    /** Utils */
    makeQueryKey(query) {
        return crypto.createHash("md5").update(JSON.stringify(query)).digest("hex");
    }
}

module.exports = new CacheManager();
