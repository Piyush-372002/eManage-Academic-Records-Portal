const express = require("express");
const router = express.Router();
const Workshop = require("../models/workshop.js");
const Faculty = require("../models/faculty.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { validateWorkshop, isLoggedIn } = require("../middleware.js");


//STC_FDP_WORKSHOP page
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
    const workshops = await Workshop.find({});
    res.render("workshop/workshop.ejs", { workshops });
}))
//workshop add
router.get("/new", isLoggedIn, async (req, res) => {
    const facultys = await Faculty.find({});
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (req.user.role === 'admin') {
        res.render("workshop/new.ejs", { user: req.user, facultys });
    } else {
        res.render("workshop/new.ejs", { user: req.user, currfac });
    }
})
router.post("/", isLoggedIn, validateWorkshop, wrapAsync(async (req, res) => {
    const newWorkshop = new Workshop(req.body.workshop);
    if (req.user.role === "admin") {
        newWorkshop.owner = req.user._id;  // Admin who added it
        newWorkshop.assignedTo = req.body.workshop.assignedTo; // Admin assigns teacher
        await newWorkshop.save();
        req.flash("success", "Record Added Successfully!!");
        res.redirect("/index/workshop");
    } else {
        newWorkshop.owner = req.user._id;  // Teacher who added it
        newWorkshop.assignedTo = req.body.workshop.assignedTo; // Automatically assign to themself
        await newWorkshop.save();
        const currFaculty = await Faculty.findOne({ user: req.user._id });
        if (currFaculty) {
            return res.redirect(`/index/facultys/${currFaculty._id}`);
        } else {
            req.flash("error", "Faculty profile not found!");
            return res.redirect("/index/workshop");
        }
    }
}))
//workshop show
router.get("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let workshop = await Workshop.findById(id);
    if (!workshop) {
        req.flash("error", "Record Not Found!!");
        return res.redirect("/index/workshop");
    }
    res.render("workshop/show.ejs", { workshop, user: req.user });
}))
//workshop edit
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const workshop = await Workshop.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!workshop) {
        req.flash("error", "Record Not Found!!");
        return res.redirect("/index/workshop");
    }
    if (req.user.role === "admin" || workshop.assignedTo.equals(currfac._id)) {
        return res.render("workshop/edit.ejs", { workshop });
    }
    req.flash("error", "Unauthorized access!");
    res.redirect("/index/workshop");
    // res.render("workshop/edit.ejs",{workshop});
}))
router.put("/:id", isLoggedIn, validateWorkshop, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const workshop = await Workshop.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!workshop) {
        req.flash("error", "Record not found!");
        return res.redirect("/index/workshop");
    }
    if (req.user.role === "admin" || workshop.assignedTo.equals(currfac._id)) {
        await Workshop.findByIdAndUpdate(id, { ...req.body.workshop });
        req.flash("success", "Record updated successfully!");
        return res.redirect(`/index/workshop/${id}`);
    }
    req.flash("error", "Unauthorized action!");
    res.redirect("/index/workshop");
}))
//workshop delete
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const workshop = await Workshop.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!workshop) {
        req.flash("error", "Record not found!");
        return res.redirect("/index/workshop");
    }

    if (req.user.role === "admin" || workshop.assignedTo.equals(currfac._id)) {
        await Workshop.findByIdAndDelete(id);
        req.flash("success", "Record deleted successfully!");
        if (req.user.role === "admin") {
            return res.redirect("/index/workshop");
        } else {
            const currFaculty = await Faculty.findOne({ user: req.user._id });
            if (currFaculty) {
                return res.redirect(`/index/facultys/${currFaculty._id}`);
            } else {
                req.flash("error", "Faculty profile not found!");
                return res.redirect("/index/workshop");
            }
        }
    }
}))
module.exports = router;