const Redis = require("ioredis");

let redis;

function redisClient() {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    });

    redis.on("connect", () => {
      console.log("Redis connected");
    });

    redis.on("error", (err) => {
      console.error("Redis Error:", err);
    });
  }

  return redis;
}

module.exports = { redisClient };
