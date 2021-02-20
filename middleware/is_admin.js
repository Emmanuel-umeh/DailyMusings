function admin(req, res, next) {
    // if user is authenticated in the session, carry on
    console.log({req})
    if (req.isAuthenticated()) return next();
    // if they aren't redirect them to the home page
    // res.redirect("/login");
    console.log("Only Admins can perform this function")
  }

  module.exports = admin;
