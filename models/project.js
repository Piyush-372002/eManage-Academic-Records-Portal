const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const projectSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    designation:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    conferenceName:{
        type:String,
        required:true,
    },
    year:{
        type:Number,
        required:true,
    },
    volume:{
        type:Number,
        required:true,
    },
    page:{
        type:Number,
        required:true,
    },
    issn:{
        type:String,
        required:true,
    },
    ugc:{
        type:String,
        required:true,
    },
    month:{
        type:String,
        required:true,
    },
    paid:{
        type:String,
        required:true,
    },
    indexing:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    assignedTo: { // The teacher the project is assigned to
        type: Schema.Types.ObjectId,
        ref: "User",
    }
})

module.exports=mongoose.model("Project",projectSchema);