import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import RedisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    if (!token) {
        res.status(400).json({ message: "Unauthorised access"});
    }
    const isBlacklisted = await RedisClient.get(token);

    if(isBlacklisted){
        res.status(400).json({ message: "Unauthorised access/ Blacklisted token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await UserModel.findOne({ email: decoded.email });

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({
            message: "Unauthorised access",
            errors: error.message
        })
    }
}