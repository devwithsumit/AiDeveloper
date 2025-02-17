import Redis from "ioredis";

const RedisClient = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
})

RedisClient.on('connect', ()=>{
    console.log("Redis connected")
})

export default RedisClient;