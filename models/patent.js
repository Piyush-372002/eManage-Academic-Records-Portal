const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const patentSchema=new Schema({
    facultyName:{
        type:String,
        required:true,
    },
    patentTitle:{
        type:String,
        required:true,
    },
    patentNumber:{
        type:Number,
        required:true,
    },
    dateOfAward:{
        type:Date,
        required:true,
    },
    grantingBody:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,
    },
    certificate:{
        url:String,
        filename: String
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    assignedTo: { // The teacher the patent is assigned to
        type: Schema.Types.ObjectId,
        ref: "User",
    }
})

module.exports=mongoose.model("Patent",patentSchema);