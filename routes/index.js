const express = require('express')
const request= require("request")


var FroalaEditor = require("wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const router = express.Router()


const BlogCategory = require("../models/BlogCategory");
const Downloadables = require("../models/Downloadable");
const Post = require('../models/Post');
const {Comment} = require('../models/Comment');

const moment = require("moment")
var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })

const isLoggedIn = require('../middleware/loggedIn');
let passport

passport = require('passport');
require('../config/passport')(passport);
const multer = require("multer")
// var upload = multer({ dest: 'uploads/' })
var cloudinary = require('cloudinary').v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const News = require('../models/News');

// cloudinary configuration
cloudinary.config({
  cloud_name: "dailymusings",
  api_key: "727572747612253",
  api_secret: "pKKrw6zilXbGUF-Owfrx2nW8s0U"
  // cloud_name: process.env.CLOUD_NAME,
  // api_key: process.env.API_KEY,
  // api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  // params: {
  //   folder: "public",
  //   // fileFilter,
  //   // format: async (req, file) => 'img', // supports promises as well
  //   public_id: (req, file) => {
  //     // console.log(req.body)
  //     `blog-image-${Date.now()}`;
  //   },
  //   resource_type: "image",
  // },

  allowedFormats: ["jpg", "png", "jpeg"],
transformation: [{ width: 500, height: 500, crop: "limit" }]

});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/mkv" ||
    file.mimetype == "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


const parser = multer({ storage: storage });
// auth handles
// router.get("/signup",csrfProtection,function (req, res) {
//   console.log(req);
//   // render the page and pass in any flash data if it exists
//   res.render("signup.ejs", {
//     message: req.flash("signupMessage"),
//     title: "Sign-Up",
//     csrfToken: req.csrfToken()
//   });
// });
// router.post(
//   "/signup",
//   // csrfProtection,
//   // checkPasswords,
//   passport.authenticate("admin-signup", {
//     successRedirect : '/admin-panel', // redirect to the secure profile section
//     failureRedirect: "/admin/signup", // redirect back to the signup page if there is an error
//     failureFlash: true, // allow flash messages
//   }),
//   function (req, res) {
//     // WHEN THE USER SIGNS UP SUCCESSFULLY
//     // console.log("")
//     // pusher.trigger("cryptoHeaven", "signedUp", {
//     //   message: "Signed Up Successfully",
//     // });
//     // const user =  User.findByIdAndUpdate(req.user._id, {
//     //   $set:{
//     //     "isAdmin":truw
//     //   }
//     // })
//     // res.redirect("/admin");
//     res.json("signed up successfully")
//   }
// );


router.get("/login", csrfProtection, async (req, res)=> {

  var recent_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    dateCreated : -1
  })).slice(0,4)


  // console.log("Referral ID",req.query['referral'])
  // render the page and pass in any flash data if it exists
  return res.render("login", {
    message: req.flash("loginMessage"),
    successMessage : req.flash("successMessage"),
    title: "Log-In",
    csrfToken: req.csrfToken(),
    recent_posts,
    moment
  });
});

router.post(
  "/login",
  csrfProtection,
  passport.authenticate("local-login", {
    // successRedirect: "/dashboard", // redirect to the secure profile section
    failureRedirect: "/login", // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
  }),
  function (req, res) {
  
      res.redirect("/admin-panel");
    
  }
);
//auth handl;es end



router.get("/", async(req, res) => {

  var recent_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    dateCreated : -1
  })).slice(0,4)


  var popular_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    views : -1
  })).slice(0,4)

  var categories = await (await BlogCategory.find()).slice(0,10)

  
  
  const { page = 1} = req.query;
  const limit = 5
 
  const posts = await Post.find()
                          .limit(limit * 1)
                          .skip((page - 1) * limit)
                          .populate("category")
                          .exec()

                          const count = await Post.countDocuments();
console.log({posts})
          
  const toalPages = Math.ceil(count / limit) 
  console.log("TOTAL PAGES", toalPages)



    res.render("index", {
      recent_posts,
      popular_posts,

      posts,
      moment,
      categories,
      toalPages,
      currentPage: page,
    })
})
router.get("/about", async(req, res) => {
  var recent_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    dateCreated : -1
  })).slice(0,4)

  
  var categories = await (await BlogCategory.find()).slice(0,10)

   
  var popular_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    views : -1
  })).slice(0,4)

    res.render("about", {
      recent_posts,
      moment  ,
      categories,
      popular_posts
    })
})

// router.get("/gallery", async(req, res) => {
//   var recent_posts = await ( await Post.find() .populate("category").sort({
//     dateCreated : -1
//   })).slice(0,4)


//     res.render("gallery")
// })

router.get("/contact", async(req, res) => {

  var recent_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    dateCreated : -1
  })).slice(0,4)



  var categories = await (await BlogCategory.find()).slice(0,10)
  
   
  var popular_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    views : -1
  })).slice(0,4)
    res.render("contact",{
      recent_posts,
      moment,
      popular_posts,
      categories
    })
})
router.get("/blog", async(req, res) => {



  var recent_posts = await ( await Post.find() .where('status').equals("published").populate("category").sort({
    dateCreated : -1
  })).slice(0,4)
  var popular_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    views : -1
  })).slice(0,4)

  var categories = await (await BlogCategory.find()).slice(0,10)
  
  const { page = 1} = req.query;
  const limit = 5
 
  const blogs = await Post.find().where('status').equals("published")
                          .limit(limit * 1)
                          .skip((page - 1) * limit)
                          .populate("category")
                          .exec()

                          const count = await Post.countDocuments();
console.log({blogs})
          
  const toalPages = Math.ceil(count / limit) 
  console.log("TOTAL PAGES", toalPages)

    res.render("blog", {
      blogs,
      message: req.flash("error"),
      successMessage: req.flash("success"),
      toalPages,
      currentPage: page,
      moment,
      recent_posts,
      categories,
      popular_posts
    })



})
router.get("/blog/:slug", async(req, res) => {

  var {slug} = req.params

  var recent_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    dateCreated : -1
  })).slice(0,4)
  
  var popular_posts = await ( await Post.find().where('status').equals("published") .populate("category").sort({
    views : -1
  })).slice(0,4)
  var categories = await (await BlogCategory.find()).slice(0,10)

  var views = (await Post.findOne({slug})).views

  console.log({views})
 var post =  await Post.findOneAndUpdate({slug}, {
   $set:{
     views: views+1
   }
 },{new : true}).populate("category").populate("comments")


 var comments = post.comments


 console.log({comments})

 var similar_blogs = await Post.find().where('status').equals("published").where("category").equals(post.category).populate("category")


 console.log({similar_blogs})
    res.render("single_blog", {
      post,
       categories, moment,
       popular_posts,
       comments,
       similar_blogs,
       recent_posts,
      //  csrfToken: req.csrfToken(),

       message: req.flash("error"),
       successMessage: req.flash("success"),
    })
})




router.post("/blog/:slug/add-comment", async(req, res) => {

  var {slug} = req.params
  const {owner_name, email,content } = req.body
  if(!owner_name || !email || !content){

    console.log("enter all fields")
    req.flash("error", "Please fill all fields")
    res.redirect(`/blog/${slug}`)
  }

  var post_id = (await Post.findOne({slug}))._id

  var comment = new Comment({
post : post_id,
owner_name,email,content


  })

  console.log({comment})
  var saved_comment = await comment.save()

  await Post.findOneAndUpdate({slug},{
    $push:{
      comments : saved_comment._id 
    }
  })
console.log("saved succesfully!!!")

// req.flash("success", "commented succes")

    res.redirect(`/blog/${slug}`)
})
















/**
 * 
 * 







 ADMIN ROUTES!!!!!
 */
router.get("/admin-panel", isLoggedIn, async(req, res) => {

  var post_length = await (await Post.find()).length
  var posts = await Post.find()

  var views =await posts.reduce((n, {views}) => n + views, 0)

  var published = await (await Post.find({status : "published"})).length

  console.log({views })
    res.render("dashboard/index",{
      post_length,
      views,
      published
    })
})
router.get("/admin-panel/blogs",isLoggedIn, async(req, res) => {


  const { page = 1} = req.query;
  const limit = 5
 
  const blogs = await Post.find()
                          .limit(limit * 1)
                          .skip((page - 1) * limit)
                          .exec()

                          const count = await Post.countDocuments();

          
  const toalPages = Math.ceil(count / limit) 
  console.log("TOTAL PAGES", toalPages)

    res.render("dashboard/blog", {
      blogs,
      message: req.flash("error"),
      successMessage: req.flash("success"),
      toalPages,
      currentPage: page
    })
})

router.get("/admin-panel/create-blog", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

  var categories = await BlogCategory.find()


    res.render("dashboard/create_post", {
      // editor

      categories: categories,
      message: req.flash("error"),
      successMessage: req.flash("success"),
    })
})
router.post("/admin-panel/create-blog", isLoggedIn,  parser.single("file"), async(req, res) => {
  // var editor =  FroalaEditor("#example")


  if(!req.file.path){
    
    req.flash("error", "Could not upload this image. please try another")
    return res.redirect("/admin-panel/create-blog")
  }

  const cover_photo = req.file.path

  const {title, category,content  } = req.body

  if(!title || !category || !content){
req.flash("error" , "Please enter all fields")
   return res.redirect("/admin-panel/create-blog")
  }


  var new_post = new Post({
    title,category, content, cover_photo
  })
  // console.log(title, category, content)
  await new_post.save()
  req.flash("success" , "Blog post created successfully. Publish it to make it visible to users")
  return res.redirect("/admin-panel/create-blog")
})


// publish blog
router.put("/admin-panel/:id/publish", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

  try {
    const {id} = req.params

    if(!id){
      req.flash("error" , "Something went wrong. Please contact developer")
      return res.redirect("/admin-panel/blogs")
    }

    await Post.findByIdAndUpdate(id, {
      $set:{
        status : "published"
      }
    }) 
    req.flash("success" , "Blog post published successfully and is now visible to users")
    return res.redirect("/admin-panel/blogs")
  } catch (error) {
    req.flash("error" , "Something went wrong. Please contact developer")
    return res.redirect("/admin-panel/blogs")
  }

})
// Un publish blog
router.put("/admin-panel/:id/unpublish", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

  try {
    const {id} = req.params

    if(!id){
      req.flash("error" , "Something went wrong. Please contact developer")
      return res.redirect("/admin-panel/blogs")
    }

    await Post.findByIdAndUpdate(id, {
      $set:{
        status : "draft"
      }
    }) 
    req.flash("success" , "Blog post unpublished successfully and is no longer visible to users")
    return res.redirect("/admin-panel/blogs")
  } catch (error) {
    req.flash("error" , "Something went wrong. Please contact developer")
    return res.redirect("/admin-panel/blogs")
  }

})

router.post("/admin-panel/:id/delete", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

  try {
    const {id} = req.params

    if(!id){
      req.flash("error" , "Something went wrong. Please contact developer")
      return res.redirect("/admin-panel/downloadables")
    }

    await Post.findByIdAndDelete(id) 
    req.flash("success" , "Blog post deleted successfully and is no longer visible to users")
    return res.redirect("/admin-panel/blogs")
  } catch (error) {
    req.flash("error" , "Something went wrong. Please contact developer")
    return res.redirect("/admin-panel/blogs")
  }

})



router.post("/admin-panel/create-category", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

var {category_name} = req.body

if(!category_name){

  req.flash("error", "Please enter a proper category name");
 return res.redirect("/admin-panel/create-category")
}


 var exists = await   BlogCategory.findOne({ category_name })

// Post

  if(exists){
  
    req.flash("error", "This category already exists");
   return res.redirect("/admin-panel/create-category")
  }else{

    var new_category = await new BlogCategory({
      category_name
    })
    await new_category.save()
    req.flash("success", "Category created successfully");
    res.redirect("/admin-panel/create-category")
  }

})

router.get("/admin-panel/create-category", isLoggedIn, async(req, res) => {
 
var all_categories = await BlogCategory.find()

console.log({all_categories})


    res.render("dashboard/create_category", {
      // editor

      message: req.flash("error"),
      successMessage: req.flash("success"),
    })
})





router.post('/admin-panel/upload_image', parser.single("file"),  (req, res)=> {


  var data = {
    link : req.file.path
  }

  return res.send(data);

  // cloudinary.uploader.upload("sample.jpg", {"crop":"limit","tags":"samples","width":3000,"height":2000}, function(result) { console.log(result) });
  // cloudinary.uploader.upload(image, function(error, result) { 
    
  //   if(error){
  //     console.log({error})
  //     return res.redirect("/admin-panel")
  //   }
    
    
  //   console.log({result}) });
 
  //   return res.redirect("/admin-panel-success")
  // Store image.
  // FroalaEditor.Image.upload(req, '/uploads/', function(err, data) {
  //   // Return data.
  //   if (err) {
  //     console.log({err})
  //     return res.send(JSON.stringify(err));
  //   }
    

  //   console.log(data)
  //   res.send(data);
  // });
});



// downloadables
router.get('/admin-panel/downloadables', isLoggedIn, async (req, res) => {


  const { page = 1} = req.query;
  const limit = 5
 
  const downloadables = await Downloadables.find()
                          .limit(limit * 1)
                          .skip((page - 1) * limit)
                          .exec()

                          const count = await Downloadables.countDocuments();

          
  const toalPages = Math.ceil(count / limit) 
  console.log("TOTAL PAGES", toalPages)

    res.render("dashboard/downloadables", {
      downloadables,
      message: req.flash("error"),
      successMessage: req.flash("success"),
      toalPages,
      currentPage: page
    })
});


// downloadables
router.get('/admin-panel/create-downloadable', isLoggedIn, async (req, res) => {


  var categories = await BlogCategory.find()
  // Store image.
  res.render("dashboard/create_downloadable", {
    // editor
    categories,
    message: req.flash("error"),
    successMessage: req.flash("success"),
  })
});


router.post("/admin-panel/create-downloadable", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")


  try {
    const {title, link, category,content  } = req.body

  if(!title || !link || !category || !content){
req.flash("error" , "Please enter all fields")
   return res.redirect("/admin-panel/create-downloadable")
  }


  var new_post = new Downloadables({
    title,category,link, content
  })
  // console.log(title, category, content)
  await new_post.save()
  req.flash("success" , "Downloadable material created successfully. Publish it to make it visible to users")
  return res.redirect("/admin-panel/create-downloadable")  
  } catch (error) {
    req.flash("error" , "Something went wrong. Please contact the developer")
   return res.redirect("/admin-panel/create-downloadable")
  }

})


// downloadables publish
// publish blog
router.put("/admin-panel/downloadable/:id/publish", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

  try {
    const {id} = req.params

    if(!id){
      req.flash("error" , "Something went wrong. Please contact developer")
      return res.redirect("/admin-panel/downloadables")
    }

    await Downloadables.findByIdAndUpdate(id, {
      $set:{
        status : "published"
      }
    }) 
    req.flash("success" , "Downloadable material published successfully and is now visible to users")
    return res.redirect("/admin-panel/downloadables")
  } catch (error) {
    req.flash("error" , "Something went wrong. Please contact developer")
    return res.redirect("/admin-panel/downloadables")
  }

})
// Un publish downloadable
router.put("/admin-panel/downloadable/:id/unpublish", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

  try {
    const {id} = req.params

    if(!id){
      req.flash("error" , "Something went wrong. Please contact developer")
      return res.redirect("/admin-panel/downloadables")
    }

    await Downloadables.findByIdAndUpdate(id, {
      $set:{
        status : "draft"
      }
    }) 
    req.flash("success" , "Downloadable material unpublished successfully and is no longer visible to users")
    return res.redirect("/admin-panel/downloadables")
  } catch (error) {
    req.flash("error" , "Something went wrong. Please contact developer")
    return res.redirect("/admin-panel/downloadables")
  }

})
router.post("/admin-panel/downloadable/:id/delete", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

  try {
    const {id} = req.params

    if(!id){
      req.flash("error" , "Something went wrong. Please contact developer")
      return res.redirect("/admin-panel/downloadables")
    }

    await Downloadables.findByIdAndDelete(id) 
    req.flash("success" , "Downloadable material deleted successfully and is no longer visible to users")
    return res.redirect("/admin-panel/downloadables")
  } catch (error) {
    req.flash("error" , "Something went wrong. Please contact developer")
    return res.redirect("/admin-panel/downloadables")
  }

})




// ############################ NEWS ENDPOINTS ################################################
router.get("/admin-panel/create-news", isLoggedIn, async(req, res) => {
  // var editor =  FroalaEditor("#example")

  try {


    const { page = 1} = req.query;
    const limit = 5
   
    const news = await News.find()
                            .limit(limit * 1)
                            .skip((page - 1) * limit)
                            .exec()
  
                            const count = await News.countDocuments();
  
            
    const toalPages = Math.ceil(count / limit) 
    console.log("TOTAL PAGES", toalPages)
  
      res.render("dashboard/news", {
        news,
        message: req.flash("error"),
        successMessage: req.flash("success"),
        toalPages,
        currentPage: page
      })
    // const {id} = req.params



    // if(!id){
    //   req.flash("error" , "Something went wrong. Please contact developer")
    //   return res.redirect("/admin-panel/downloadables")
    // }

    // await Downloadables.findByIdAndDelete(id) 
    // req.flash("success" , "Downloadable material deleted successfully and is no longer visible to users")
    // return res.redirect("/admin-panel/downloadables")
  } catch (error) {
    req.flash("error" , "Something went wrong. Please contact developer")
    return res.redirect("/admin-panel")
  }

})




router.post("/newsletter", async(req, res) => {
    const {email} = req.body
    
    const data = {
        members:[
          {
            email_address:req.body.email,
            status:"subscribed",
            // merge_fields:{
            //     FNAME:username,
            // }
          }
        ]
      }
      const postData = JSON.stringify(data) 
      const options = {
        url :"https://us19.api.mailchimp.com/3.0/lists/02e1d16e87",
        method:'POST',
        headers:{
          Authorization:"auth API_KEY"
        },
        body:postData
      };
  
      request(options, (err, response,body)=>{
        if(err){
          console.log("MAILCHIMP: ERROR", err)
        } else{
          if(response.statusCode === 200){
            console.log("SUCCESS")
          } else {
            console.log("FAILED")
          }
        }
      })
      
})

module.exports = router