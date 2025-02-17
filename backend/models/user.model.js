import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
const UserSchema = new mongoose.Schema({
    email : {
        type: String,
        require : true,
        unique : true,
        trim: true,
        lowercase: true,
        minLength: [6, 'Email must be at least 6 characters long'],
        maxLength: [50, 'Email must not be longer than 50 characters']
    },
    password:{
        type: String,
        required: true,
        select : false,
    }
})

UserSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password, 10);
}

UserSchema.methods.generateJWT = function(){
    const token = jwt.sign(
        {email: this.email},
        process.env.JWT_KEY,
        {expiresIn : '24h'});
    return token;
}

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compare(this.password, password);
}

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;