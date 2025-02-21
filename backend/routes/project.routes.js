import express from 'express';
import { body } from 'express-validator';
import { authUser } from '../middlewares/auth.js';
import { addUser, createProject, getAllProjects, getProjectById, updateFileTree } from '../controllers/project.controller.js';

const router = express.Router();


router.post('/create', [
    body('name').isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
], authUser, createProject)

router.get("/all",
    authUser,
    getAllProjects
)

router.get('/get-project/:projectId',
    authUser,
    getProjectById
)

router.put("/add-user", authUser, [
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
], addUser)

router.put('/update-file-tree',
    authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    updateFileTree
)

export default router;