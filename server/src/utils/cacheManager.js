const { redisClient } = require("../infrastructure/redis"); 
const crypto = require("crypto");
const Redis = require("ioredis");

let redis

(async () => {
    redis = await redisClient()
})()

class CacheManager {
    constructor() {
        this.TTL = {
            PRODUCT: 900,
            PRODUCTS: 60,         
            CATEGORY: 3600,        
            CART: 604800,            
            STOCK: null,                 
        };
    }

    async get(key) {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set(key, value, ttl = null) {
        if (ttl) {
            await redis.setEx(key, ttl, JSON.stringify(value));
        } else {
            await redis.set(key, JSON.stringify(value));
        }
    }

    async del(key) {
        await redis.del(key);
    }

    async clearByPrefix(prefix) {
        const stream = new Redis().scanStream({ match: `${prefix}*`, count: 100 });
        stream.on("data", (keys) => {
            if (keys.length) redis.del(keys);
        });
    }


    /** ================================
     * Key Name Generator
     * ================================ */

    key = {
        product: id => `product:${id}`,
        productsList: query => {
            const key = this.makeQueryKey(query)
            return `products:list:${key}`
        },
        product_variant: id => `product_variant:${id}`,
        productList: catId => `product:list:category:${catId}`,
        categoryTree: `category:tree`,
        cart: cartId => `cart:${cartId}`,
        stock: productId => `stock:${productId}`,
        promotion: id => `promotion:${id}`,
    };


    async getProduct(id) {
        return this.get(this.key.product(id));
    }

    async getProductVariant(id){
        return this.get(this.key.product_variant(id))
    }

    async getProducts(query){
        return this.get(this.key.productsList(query))
    }


    async setProduct(id, data) {
        return this.set(this.key.product(id), data, this.TTL.PRODUCT);
    }

    async setProductVariant(id, data){
        return this.set(this.key.product_variant(id), data, this.PRODUCT)
    }

    async setProducts(query, data){
        return this.set(this.key.productList(query), data, this.TTL.PRODUCTS)
    }

    async clearProduct(id) {
        return this.del(this.key.product(id));
    }

    /** ================================
     * Cart Cache
     * ================================ */

    async getCart(cartId) {
        return this.get(this.key.cart(cartId));
    }

    async setCart(cartId, cartData) {
        return this.set(this.key.cart(cartId), cartData, this.TTL.CART);
    }

    async clearCart(cartId) {
        return this.del(this.key.cart(cartId));
    }

    /** ================================
     * Stock Cache
     * ================================ */

    async getStock(productId) {
        const stock = await redis.get(this.key.stock(productId));
        return stock ? Number(stock) : null;
    }

    async setStock(productId, qty) {
        await redis.set(this.key.stock(productId), qty.toString());
    }

    async decreaseStock(productId, qty = 1) {
        return await redis.decrBy(this.key.stock(productId), qty);
    }

    /** ================================
     * Promotion Cache
     * ================================ */

    async getPromotion(id) {
        return this.get(this.key.promotion(id));
    }

    async setPromotion(id, data) {
        return this.set(this.key.promotion(id), data, this.TTL.PROMOTION);
    }

    async clearPromotion(id) {
        return this.del(this.key.promotion(id));
    }

    /** ================================
     * Utils
     * ================================ */
    makeQueryKey(query) {
        const raw = JSON.stringify(query);
        return "products:list:" + crypto.createHash("md5").update(raw).digest("hex");
    }
}

module.exports = new CacheManager();
