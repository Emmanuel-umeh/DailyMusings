const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var bcrypt   = require('bcrypt-nodejs');
// Create Schema


const AdminSchema = new Schema({



  email: {
    type: String,
    lowercase : true,
    required : true,
    min: [6, 'Too short to be a mail'],
    max: 25
  },
  password :{
    type : String,
    required: true
  },
  firstname: {
      type :String
  },
  lastname: {
      type :String
  }






});

AdminSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

module.exports = Admin = mongoose.model('admin', AdminSchema);