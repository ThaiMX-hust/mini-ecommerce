const { createClient } = require("redis");

let redis;

async function redisClient() {
  if (!redis) {
    redis = createClient({
        socket: {
          host: "127.0.0.1",
          port: 6379
        },
        password: process.env.REDIS_PASSWORD
    });

    redis.on("error", (err) => console.error("Redis Client Error", err));

    await redis.connect();
    console.log("Redis connected");
  }

  return redis;
}

module.exports = {
  redisClient
};
