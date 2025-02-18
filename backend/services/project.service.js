import { projectModel } from "../models/project.model.js"


export const createProject = async (name, userId) => {
    if (!name) {
        throw new Error("Name is required !")
    }
    if (!userId) {
        throw new Error("userId is required !")
    }
    try {
        const project = projectModel.create({
            name,
            users: [userId]
        })

        return project;
    } catch (error) {
        throw error
    }
}
export const getAllProjects = async (userId) => {
    try {
        if (!userId) {
            throw new Error("userId is required !")
        }
        const projects = await projectModel.find({
            users: userId
        })
        return projects;

    } catch (error) {
        throw error
    }
}
export const getProjectById = async (projectId) => {
    try {
        if (!projectId) {
            throw new Error("projectId is required !")
        }
        const project = await projectModel.findOne({
            _id: projectId
        }).populate('users')
        return project;

    } catch (error) {
        throw error
    }
}
export const addUser = async ({ userId, users, projectId }) => {
    try {
        if (!userId) {
            throw new Error("userId is required !")
        }
        if (!users) {
            throw new Error("users are required !")
        }
        if (!projectId) {
            throw new Error("project ID is required !")
        }
        
        const project = await projectModel.findOne({
            _id: projectId,
            users: userId
        })
        if (!project) {
            throw new Error("User does not belond to this project!")
        }

        const updatedProject = await projectModel.findByIdAndUpdate(
            projectId,
            { $addToSet: { users: { $each: users } } },
            { new: true }
        )
        return updatedProject;

    } catch (error) {
        throw error
    }
}
