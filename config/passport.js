// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require("../models/Admin");


// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });



    
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    async(req,email, password, done) =>{

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(async() => {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        var lowercase_username = req.body.username.toLowerCase()
        const username_exists = await User.findOne({ 'username' :  lowercase_username})
        console.log(username_exists)
        const phone_exists = await User.findOne({ 'telephone' :  req.body.telephone})
        if( username_exists ){
            return done(null, false, req.flash('signupMessage', 'username already taken'));
        }
        if(phone_exists ){
            return done(null, false, req.flash('signupMessage', 'number already used'));
        }
        const user_exists = await User.findOne({ 'email' :  email })
        if(user_exists){
            return done(null, false, req.flash('signupMessage', 'email already taken'));
        } 
        var newUser    = new User();
        // // set the user's local credentials
        // newUser.local.username = username.toLowerCase()
        newUser.email    = email.toLowerCase();
        newUser.password = newUser.generateHash(password);
        newUser.username = req.body.username.toLowerCase()
        newUser.firstname = req.body.firstname.toLowerCase()
        newUser.lastname = req.body.lastname.toLowerCase()
        newUser.telephone = req.body.telephone
        await newUser.save()
                /** referral */
        if(req.query['ref']){
            console.log(req.query['ref'])
            const updated_user =  await User.findOneAndUpdate({'username':req.query['ref']}, {
                    $push:{
                        "referred_users":newUser._id
                    }
            })
            const referred_by_update = await User.findByIdAndUpdate(newUser._id, {
                $set:{
                    "referredBy":updated_user._id
                }
            }) 
            return done(null, newUser)
        }else{
            return done(null, newUser);
        }

        }
        );

    }));



    passport.use('admin-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    async(req,email, password, done) =>{

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(async() => {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
       
        const user_exists = await User.findOne({ 'email' :  email })
        if(user_exists){
            return done(null, false, req.flash('signupMessage', 'email already taken'));
        } 
        var newUser    = new User();
        // // set the user's local credentials
        // newUser.local.username = username.toLowerCase()
        newUser.email    = email.toLowerCase();
        newUser.password = newUser.generateHash(password);
        newUser.firstname = req.body.firstname.toLowerCase()
        newUser.lastname = req.body.lastname.toLowerCase()
        await newUser.save()
                /** referral */
   
            return done(null, newUser);
        

        }
        );

    }));


    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email.toLowerCase() }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user

           
            return done(null, user);
        });

    }));


    
};