import UserModel from '../models/user.model.js';


export const createUser = async (email, password) => {

    if (!email || !password) {
        throw new Error("All fields are required");
    }
    try {
        const hashedPassword = await UserModel.hashPassword(password);
        
        const user = await UserModel.create({
            email,
            password: hashedPassword
        })

        return user;
    } catch (error) {
        throw error
    }
}

export const getAllUsers = async (userId) => {
    try {
        if (!userId) {
            throw new Error("userId is required !")
        }
        const users = await UserModel.find({
            _id: { $ne: userId }
        })
        return users;

    } catch (error) {
        throw error
    }
}