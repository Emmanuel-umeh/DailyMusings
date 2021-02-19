const express = require('express')
const request= require("request")


var FroalaEditor = require("wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const router = express.Router()


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
    res.render("dashboard/index")
})
router.get("/admin-panel/blogs", async(req, res) => {
    res.render("dashboard/blog")
})
router.get("/admin-panel/downloadables", async(req, res) => {
    res.render("dashboard/downloadables")
})
router.get("/admin-panel/downloadables", async(req, res) => {
    res.render("dashboard/downloadables")
})
router.get("/admin-panel/create-blog", async(req, res) => {
  // var editor =  FroalaEditor("#example")
    res.render("dashboard/create_post", {
      // editor
    })
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