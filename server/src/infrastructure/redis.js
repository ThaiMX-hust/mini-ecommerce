const Redis = require("ioredis");

let redis;

function redisClient() {
  if (!redis) {
    redis = new Redis({
      host: "127.0.0.1",
      port: 6379,
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
