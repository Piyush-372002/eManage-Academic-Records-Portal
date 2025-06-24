const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const workshopSchema=new Schema({
    facultyName:{
        type:String,
        required:true,
    },
    workshopName:{
        type:String,
        required:true,
    },
    mode:{
        type:String,
        required:true,
    },
    from:{
        type:Date,
        required:true,
    },
    to:{
        type:Date,
        required:true,
    },
    organiser:{
        type:String,
        required:true,
    },
    participant:{
        type:String,
        required:true,
    },
    year:{
        type:Number,
        required:true,
    },
    amountPaid:{
        type:Number,
        required:true,
    },
    fundingAgency:{
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
    assignedTo: { // The teacher the project is assigned to
        type: Schema.Types.ObjectId,
        ref: "User",
    }
})

module.exports=mongoose.model("Workshop",workshopSchema);