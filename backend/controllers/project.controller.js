import { validationResult } from "express-validator";
import { projectModel } from "../models/project.model.js";
import * as projectService from '../services/project.service.js'
import UserModel from "../models/user.model.js";

export const createProject = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name } = req.body;
        const isNamePresent = await projectModel.findOne({ name });

        if (isNamePresent) {
            return res.status(400).json({ error: "Name already exits" });
        }
        const newProject = await projectService.createProject(name, req.user._id);

        res.status(200).json({ newProject });
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const getAllProjects = async (req, res) => {

    try {
        const user = await UserModel.findOne({ email: req.user.email });

        if (!user) {
            return res.status(400).json({ error: "User Not found" });
        }

        const projects = await projectService.getAllProjects(req.user._id)

        res.status(200).json({ projects });

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const getProjectById = async (req, res) => {

    try {
        const { projectId } = req.params;
        const project = await projectService.getProjectById(projectId)

        res.status(200).json({ project });

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const addUser = async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { users, projectId } = req.body;

        const updatedProject = await projectService.addUser({
            projectId,
            users,
            userId: req.user._id,
        })

        res.status(200).json({ updatedProject });

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}