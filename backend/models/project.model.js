import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true,
        trim : true,
        minlength : [3, "Name must be at least 3 characters long"],
        unique: true,
    },
    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'user',
    }],
    fileTree: {
        type: Object,
        default: {},
    },
})

export const projectModel = mongoose.model('project', ProjectSchema);