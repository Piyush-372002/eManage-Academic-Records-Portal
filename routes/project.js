const express = require("express");
const router = express.Router();
const Project = require("../models/project.js");
const Faculty = require("../models/faculty.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { validateProject, isLoggedIn } = require("../middleware.js");


//publication project page
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
    const projects = await Project.find({});
    res.render("projects/projects.ejs", { projects });
}))
//project add
router.get("/new", isLoggedIn, async (req, res) => {
    const facultys = await Faculty.find({});
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (req.user.role === 'admin') {
        res.render("projects/new.ejs", { user: req.user, facultys });
    } else {
        res.render("projects/new.ejs", { user: req.user, currfac });
    }
})
router.post("/", isLoggedIn, validateProject, wrapAsync(async (req, res) => {
    const newProject = new Project(req.body.project);
    if (req.user.role === "admin") {
        newProject.owner = req.user._id;  // Admin who added it
        newProject.assignedTo = req.body.project.assignedTo; // Admin assigns teacher
        await newProject.save();
        res.redirect("/index/projects");
    } else {
        newProject.owner = req.user._id;  // Teacher who added it
        newProject.assignedTo = req.body.project.assignedTo; // Automatically assign to themself
        await newProject.save();
        const currFaculty = await Faculty.findOne({ user: req.user._id });
        if (currFaculty) {
            return res.redirect(`/index/facultys/${currFaculty._id}`);
        } else {
            req.flash("error", "Faculty profile not found!");
            return res.redirect("/index/patents");
        }
    }
}))
//project show
router.get("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let project = await Project.findById(id);
    if (!project) {
        req.flash("error", "Record Not Found!!");
        return res.redirect("/index/projects");
    }
    res.render("projects/show.ejs", { project, user: req.user });
}))
//project edit
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const project = await Project.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!project) {
        req.flash("error", "Record Not Found!!");
        return res.redirect("/index/projects");
    }
    if (req.user.role === "admin" || project.assignedTo.equals(currfac._id)) {
        return res.render("projects/edit.ejs", { project });
    }
    req.flash("error", "Unauthorized access!");
    res.redirect("/index/projects");
    // res.render("projects/edit.ejs",{project});
}))
router.put("/:id", isLoggedIn, validateProject, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const project = await Project.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!project) {
        req.flash("error", "Record not found!");
        return res.redirect("/index/projects");
    }
    if (req.user.role === "admin" || project.assignedTo.equals(currfac._id)) {
        await Project.findByIdAndUpdate(id, { ...req.body.project });
        req.flash("success", "Record updated successfully!");
        return res.redirect(`/index/projects/${id}`);
    }
    req.flash("error", "Unauthorized action!");
    res.redirect("/index/projects");
    // let project=await Project.findByIdAndUpdate(id,{...req.body.project});
    // await project.save();
    // res.redirect("/index/projects");
}))
//projects delete
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const project = await Project.findById(id);
    const currfac = await Faculty.findOne({ user: req.user._id });
    if (!project) {
        req.flash("error", "Record not found!");
        return res.redirect("/index/projects");
    }

    if (req.user.role === "admin" || project.assignedTo.equals(currfac._id)) {
        await Project.findByIdAndDelete(id);
        req.flash("success", "Record deleted successfully!");
        if (req.user.role === "admin") {
            return res.redirect("/index/projects");
        } else {
            const currFaculty = await Faculty.findOne({ user: req.user._id });
            if (currFaculty) {
                return res.redirect(`/index/facultys/${currFaculty._id}`);
            } else {
                req.flash("error", "Faculty profile not found!");
                return res.redirect("/index/projects");
            }
        }
    }
}))

module.exports = router;