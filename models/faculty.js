const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const facultySchema=new Schema({
    facultyName:{
        type:String,
        required:true,
    },
    employeeId:{
        type:String,
        required:true,
    },
    designation:{
        type:String,
        required:true,
    },
    dateOfBirth:{
        type:Date,
        required:true,
    },
    dateOfJoining:{
        type:Date,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    alternateEmail:{
        type:String,
        required:false,
    },
    mobile:{
        type:String,
        required:true,
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }
})

module.exports=mongoose.model("Faculty",facultySchema);