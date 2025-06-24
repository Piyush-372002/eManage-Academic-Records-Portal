if(process.env.NODE_ENV !="production"){
    require("dotenv").config();  // loads your .env file
}


const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const Faculty=require("../models/faculty.js");
const Patent=require("../models/patent.js");
const Project=require("../models/project.js");
const Workshop=require("../models/workshop.js");
const wrapAsync=require("../utils/wrapAsync");
const passport = require("passport");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS  // Use the app password here, NOT your real email password
    }
});


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




// GET: forgot password form
router.get("/forgot-password", (req, res) => {
    res.render("users/forgot-password.ejs");
});

// POST: send reset email
router.post("/forgot-password", wrapAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        req.flash("error", "No account found with that email.");
        return res.redirect("/forgot-password");
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expire = Date.now() + 3600000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiration = expire;
    await user.save();


    const baseURL = process.env.BASE_URL;
    const resetURL = `${baseURL}/reset-password/${token}`;

    

    await transporter.sendMail({
        to: user.email,
        from: 'no-reply@electronicsdept.com',
        subject: 'Password Reset Request',
        html: `
            <p>Hello ${user.username},</p>
            <p>You requested a password reset. Click below to reset your password:</p>
            <p><a href="${resetURL}">${resetURL}</a></p>
            <p>If you did not request this, ignore this email.</p>
        `
    });

    req.flash("success", "Password reset link sent to your email.");
    res.redirect("/login");
}));

// GET: reset form
router.get("/reset-password/:token", wrapAsync(async (req, res) => {
    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
        req.flash("error", "Reset link expired or invalid.");
        return res.redirect("/forgot-password");
    }
    res.render("users/reset-password.ejs", { token: req.params.token });
}));

// POST: handle password reset
router.post("/reset-password/:token", wrapAsync(async (req, res) => {
    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiration: { $gt: Date.now() }
    });
    if (!user) {
        req.flash("error", "Token expired or invalid.");
        return res.redirect("/forgot-password");
    }

    const { password } = req.body;
    await user.setPassword(password); // passport-local-mongoose method
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    req.flash("success", "Password reset successfully. You can now login.");
    res.redirect("/login");
}));

module.exports=router;