import { validationResult } from "express-validator";
import UserModel from "../models/user.model.js";
import * as userService from '../services/user.service.js'
import RedisClient from "../services/redis.service.js";

export const createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "Email already exits" });
        }
        const newUser = await userService.createUser(email, password);
        const token = newUser.generateJWT();

        res.status(200).json({
            message: "User Created successfully",
            token,
            newUser,
        })

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json("Invalid email or password")
        }

        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            return res.status(400).json("Invalid email or password")
        }
        const token = user.generateJWT();

        delete user._doc.password;

        res.status(200).json({
            message: "Logged in successfully",
            token,
            user,
        })
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const userProfile = async (req, res, next) => {
    res.status(200).json({
        message: "Profile fetch successfully",
        user: req.user,
    })
}

export const logoutUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        RedisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        res.status(400).json({ message: "logout successful" });

    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const getAllUsers = async (req, res) => {

    try {
        const user = await UserModel.findOne({ email: req.user.email });

        if (!user) {
            return res.status(400).json({ error: "User Not found" });
        }

        const users = await userService.getAllUsers(req.user._id);

        res.status(200).json({ users });

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

