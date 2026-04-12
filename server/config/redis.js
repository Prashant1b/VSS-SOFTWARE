import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();
const redisClient = createClient({
    username: 'default',
    password: process.env.REDISPASSWORD,
    socket: {
        host: 'redis-13191.c57.us-east-1-4.ec2.cloud.redislabs.com',
        port: 13191
    }
});
export default redisClient;