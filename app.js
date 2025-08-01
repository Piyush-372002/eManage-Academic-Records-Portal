if(process.env.NODE_ENV !="production"){
    require("dotenv").config();  // loads your .env file
}


const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const patentRouter=require("./routes/patent.js");
const workshopRouter=require("./routes/workshop.js");
const projectRouter=require("./routes/project.js");
const facultyRouter=require("./routes/faculty.js");
const userRouter=require("./routes/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, 'public')));



// const mongo_URL="mongodb://127.0.0.1:27017/Electronics";
const dbUrl=process.env.ATLASDB_URL
main().then((res)=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(dbUrl);
}
console.log("ATLASDB_URL from env:", process.env.ATLASDB_URL);
console.log("SECRET from env:", process.env.SECRET);

const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SECRET, 
    },
    touchAfter: 24*3600,
});
store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE", err);
});
const sessionOptions={
    store,
    secret:process.env.SECRET, 
    resave:false, 
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};



app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done) => {
    done(null, { id: user._id, role: user.role }); // Store both ID and role
});
passport.deserializeUser(async (data, done) => {
    try {
        const user = await User.findById(data.id); // Fetch full user from DB
        done(null, user); // Attach full user object to req.user
    } catch (err) {
        done(err);
    }
});

    






app.use((req,res,next)=>{
    res.locals.succMsg=req.flash("success");
    res.locals.errMsg=req.flash("error");
    res.locals.currUser=req.user;
    next();
})

app.get("/",(req,res)=>{
    res.render("root.ejs");
})
//home page
app.get("/index",(req,res)=>{
    res.render("index.ejs");
})



app.use("/index/patents",patentRouter);
app.use("/index/workshop",workshopRouter);
app.use("/index/projects",projectRouter);
app.use("/index/facultys",facultyRouter);
app.use("/",userRouter);








app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})
app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
});
app.listen(8080,()=>{
    console.log("app is listening");
})