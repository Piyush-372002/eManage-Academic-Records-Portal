const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const Faculty=require("../models/faculty.js");
const Patent=require("../models/patent.js");
const Project=require("../models/project.js");
const Workshop=require("../models/workshop.js");
const wrapAsync=require("../utils/wrapAsync");
const passport = require("passport");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})
router.post("/signup",wrapAsync(async(req,res)=>{
    try{
        let {username,email,password,role}=req.body;
        // Only allow a specific email to become admin
        const allowedAdminEmail = "gargpiyush764@gmail.com"; // change to your real admin's email

        // Downgrade role to "teacher" unless email matches allowed admin
        if (role === "admin" && email !== allowedAdminEmail) {
            role = "teacher";
            req.flash("error", "You are not authorized to sign up as admin. Registered as teacher instead.");
        }
        
        const newUser=new User({email,username,role});
        const registeredUser=await User.register(newUser,password);
        

        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","user registered successfully");
            if (role === "admin") {
                return res.redirect("/index");
            } else if (role === "teacher") {
                return res.redirect(`/index/facultys/new?user=${registeredUser._id}&new=true`);
            }
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}))

router.get("/login",(req,res)=>{
    const role = req.query.role || "teacher";
    res.render("users/login.ejs",{role});
})
router.post("/login",passport.authenticate("local",{failureRedirect:'/login', failureFlash: true}),async(req,res)=>{
    if (req.user.role === "admin") {
        req.flash("success","logged in successfully");
        return res.redirect("/index");
    } else if (req.user.role === "teacher") {
        const faculty = await Faculty.findOne({ user: req.user._id });
        if (faculty) {
            const patents = await Patent.find({ assignedTo: faculty._id });
            const projects = await Project.find({ assignedTo: faculty._id });
            const workshops = await Workshop.find({ assignedTo: faculty._id });
            req.flash("success","logged in successfully");
            return res.render("facultys/show.ejs", { faculty, patents, projects,workshops,currUser: req.user });
        } else {
            req.flash("error", "Profile not found!");
            return res.redirect("/login");
        }
    }
    res.redirect("/");
})


router.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/");
    })
})

module.exports=router;