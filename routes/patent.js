const express = require("express");
const router = express.Router();
const Patent = require("../models/patent.js");
const Faculty = require("../models/faculty.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { validatePatent, isLoggedIn, isAdmin, isTeacher } = require("../middleware.js");

const multer=require('multer');
const upload=multer({dest: 'uploads/'})

//patent page
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
    const patents = await Patent.find({});
    res.render("patents/patents.ejs", { patents });
}))
//patent add
router.get("/new", isLoggedIn, async (req, res) => {
    const facultys = await Faculty.find({});
    const currfac = await Faculty.findOne({ user: req.user._id });
    res.render("patents/new.ejs", { currfac, user: req.user ,facultys});
})
router.post("/", upload.single("patent[certificate]"), isLoggedIn, validatePatent, wrapAsync(async (req, res) => {
    const newPatent = new Patent(req.body.patent);
    if (req.user.role === "admin") {
        newPatent.owner = req.user._id;  // Admin who added it
        newPatent.assignedTo = req.body.patent.assignedTo; // Admin assigns teacher
        await newPatent.save();
        req.flash("success", "Record Added Successfully!!");
        res.redirect("/index/patents");
    } else {
        newPatent.owner = req.user._id;  // Teacher who added it
        newPatent.assignedTo = req.body.patent.assignedTo; // Automatically assign to themself
        await newPatent.save();
        const currFaculty = await Faculty.findOne({ user: req.user._id });
        if (currFaculty) {
            return res.redirect(`/index/facultys/${currFaculty._id}`);
        } else {
            req.flash("error", "Faculty profile not found!");
            return res.redirect("/index/patents");
        }
    }
}))
//patent show
router.get("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let patent = await Patent.findById(id);
    if (!patent) {
        req.flash("error", "Record Not Found!!");
        return res.redirect("/index/patents");
    }
    res.render("patents/show.ejs", { patent, user: req.user });
}))
//patent edit
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const patent = await Patent.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!patent) {
        req.flash("error", "Record Not Found!!");
        return res.redirect("/index/patents");
    }
    if (req.user.role === "admin" || patent.assignedTo.equals(currfac._id)) {
        return res.render("patents/edit.ejs", { patent });
    }
    req.flash("error", "Unauthorized access!");
    res.redirect("/index/patents");
    // res.render("patents/edit.ejs",{patent});
}))
router.put("/:id", isLoggedIn, validatePatent, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const patent = await Patent.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!patent) {
        req.flash("error", "Patent not found!");
        return res.redirect("/index/patents");
    }
    if (req.user.role === "admin" || patent.assignedTo.equals(currfac._id)) {
        await Patent.findByIdAndUpdate(id, { ...req.body.patent });
        req.flash("success", "Patent updated successfully!");
        return res.redirect(`/index/patents/${id}`);
    }
    req.flash("error", "Unauthorized action!");
    res.redirect("/index/patents");
}))
//patent delete
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const patent = await Patent.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!patent) {
        req.flash("error", "Patent not found!");
        return res.redirect("/index/patents");
    }

    if (req.user.role === "admin" || patent.assignedTo.equals(currfac._id)) {
        await Patent.findByIdAndDelete(id);
        req.flash("success", "Patent deleted successfully!");
        if (req.user.role === "admin") {
            return res.redirect("/index/patents");
        } else {
            const currFaculty = await Faculty.findOne({ user: req.user._id });
            if (currFaculty) {
                return res.redirect(`/index/facultys/${currFaculty._id}`);
            } else {
                req.flash("error", "Faculty profile not found!");
                return res.redirect("/index/patents");
            }
        }
    }
}))
module.exports = router;
