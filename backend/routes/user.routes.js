import express from 'express';
import { body } from 'express-validator';
import { createUser, getAllUsers, loginUser, logoutUser, userProfile } from '../controllers/user.controller.js';
import { authUser } from '../middlewares/auth.js';

const router = express.Router();

router.get('/',)

router.post('/register', [
    body('email').isEmail().withMessage("Invalid email"),
    body('password').isLength({ min: 3 }).withMessage('password must contain at least 3 characters')
], createUser);

router.post('/login',[
    body('email').isEmail().withMessage("Invalid email"),
    body('password').isLength({ min: 3 }).withMessage('password should contain at least 3 characters')
], loginUser);

router.get('/profile', authUser, userProfile);

router.get('/logout', authUser, logoutUser);


router.get("/all",
    authUser,
    getAllUsers
)


export default router;