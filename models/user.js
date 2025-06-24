const { required } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");


const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    role: { 
        type: String, 
        enum: ["admin", "teacher"], 
        required: true 
    },
    resetToken: String,
    resetTokenExpiration: Date,

});
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);