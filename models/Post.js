const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const slugify = require('slugify')


const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug:{
        type:String
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'admin'
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:"category"
    },
    
    status:{
        type:String,
        default:"draft"
    },
    cover_photo:{
        type:String,
        default: "https://images.pexels.com/photos/2774570/pexels-photo-2774570.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
    },
    comments:[{
        type:Schema.Types.ObjectId,
        ref:'Comment'
    }],
    content: {
        type: String,
        required: true,
    },
    image:{
        type:String
    },
    views: {
        type: Number,
        default: '0',    },

    dateCreated:{
        type:Date,
        default:Date.now

    }
});


postSchema.pre("save", function(next) {
    slug = slugify(this.title);
    this.slug=slug.toLowerCase() 
    next();
  });


function validatePost(post){
    const schema ={
        title:Joi.string().min(5).max(250).required(),  // validating title
        content:Joi.string().min(0).required(),
        likes: Joi.number().min(0),
        image:Joi.string(),
        category: Joi.objectId().required(),  // validating owner id
        // comments:Joi.objectId().required()
    }
    return Joi.validate(post, schema);
}

// module.exports ={
//     Post : mongoose.model('Post', postSchema),
//     validate:validatePost
// }


module.exports = mongoose.model('Post', postSchema);

// exports.validate = validatePost;