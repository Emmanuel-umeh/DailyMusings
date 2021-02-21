const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const commentSchema = new mongoose.Schema({
    
    content: {
        type: String,
        required: true,
    },

    post:{
        type:Schema.Types.ObjectId,
        ref:'Post'
    },

    owner_name:{
        type:String
    },
    email :{
        type:String
    },

    dateCreated:{
        type:Date,
        default:Date.now
    },

    dateUpdated:{
        type:Date
    }
    
});


function validateComment(comment){
    const schema={
        content:Joi.string().min(5).max(120).required(),
        likes:Joi.number(),
        post:Joi.objectId().required(),
        owner:Joi.objectId().required()
    }
    return Joi.validate(comment, schema)
}
// const Comment = mongoose.model('Comment', commentSchema);
// module.exports = Comment

module.exports = {
    Comment : mongoose.model('Comment', commentSchema),   
    validateComment:validateComment
}