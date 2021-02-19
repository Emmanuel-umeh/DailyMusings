const express = require('express')
const request= require("request")


var FroalaEditor = require("wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const router = express.Router()


const BlogCategory = require("../models/BlogCategory");
const Downloadables = require("../models/Downloadable");
const Post = require('../models/Post');

router.get("/", async(req, res) => {
    res.render("index")
})
router.get("/about", async(req, res) => {
    res.render("about")
})

router.get("/gallery", async(req, res) => {
    res.render("gallery")
})

router.get("/contact", async(req, res) => {
    res.render("contact")
})
router.get("/blog", async(req, res) => {
    res.render("blog")
})
router.get("/single-blog", async(req, res) => {
    res.render("single_blog")
})


// admin routes
router.get("/admin-panel", async(req, res) => {

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
router.get("/admin-panel/blogs", async(req, res) => {


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
router.get("/admin-panel/downloadables", async(req, res) => {
    res.render("dashboard/downloadables")
})
router.get("/admin-panel/downloadables", async(req, res) => {
    res.render("dashboard/downloadables")
})
router.get("/admin-panel/create-blog", async(req, res) => {
  // var editor =  FroalaEditor("#example")

  var categories = await BlogCategory.find()


    res.render("dashboard/create_post", {
      // editor

      categories: categories,
      message: req.flash("error"),
      successMessage: req.flash("success"),
    })
})
router.post("/admin-panel/create-blog", async(req, res) => {
  // var editor =  FroalaEditor("#example")


  const {title, category,content  } = req.body

  if(!title || !category || !content){
req.flash("error" , "Please enter all fields")
   return res.redirect("/admin-panel/create-blog")
  }


  var new_post = new Post({
    title,category, content
  })
  // console.log(title, category, content)
  await new_post.save()
  req.flash("success" , "Blog post created successfully. Publish it to make it visible to users")
  return res.redirect("/admin-panel/create-blog")
})


// publish blog
router.put("/admin-panel/:id/publish", async(req, res) => {
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
router.put("/admin-panel/:id/unpublish", async(req, res) => {
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


router.post("/admin-panel/create-category", async(req, res) => {
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

router.get("/admin-panel/create-category", async(req, res) => {
 
var all_categories = await BlogCategory.find()

console.log({all_categories})


    res.render("dashboard/create_category", {
      // editor

      message: req.flash("error"),
      successMessage: req.flash("success"),
    })
})





router.post('/admin-panel/upload_image', function (req, res) {

  // Store image.
  FroalaEditor.Image.upload(req, '/uploads/', function(err, data) {
    // Return data.
    if (err) {
      console.log({err})
      return res.send(JSON.stringify(err));
    }
    

    console.log(data)
    res.send(data);
  });
});



// downloadables
router.get('/admin-panel/downloadables', async (req, res) => {


  var categories = await BlogCategory.find()
  // Store image.
  res.render("dashboard/create_downloadable", {
    // editor
    categories,
    message: req.flash("error"),
    successMessage: req.flash("success"),
  })
});


// downloadables
router.get('/admin-panel/create-downloadable', async (req, res) => {


  var categories = await BlogCategory.find()
  // Store image.
  res.render("dashboard/create_downloadable", {
    // editor
    categories,
    message: req.flash("error"),
    successMessage: req.flash("success"),
  })
});


router.post("/admin-panel/create-downloadable", async(req, res) => {
  // var editor =  FroalaEditor("#example")


  try {
    const {title, link, category,content  } = req.body

  if(!title || !link || !category || !content){
req.flash("error" , "Please enter all fields")
   return res.redirect("/admin-panel/create-downloadable")
  }


  var new_post = new Post({
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