const express=require("express");
const router=express.Router();
const Faculty=require("../models/faculty.js");
const Patent=require("../models/patent.js");
const Project=require("../models/project.js");
const Workshop=require("../models/workshop.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {validateFaculty, isLoggedIn}=require("../middleware.js");
const PDFDocument = require("pdfkit");
const excelJS = require("exceljs");




//faculty page
router.get("/",isLoggedIn,wrapAsync(async (req,res)=>{
    const facultys=await Faculty.find({});
    res.render("facultys/facultys.ejs",{facultys});
}))
//faculty add
router.get("/new",isLoggedIn,(req,res)=>{
    const userId = req.query.user || req.user._id;
    res.render("facultys/new.ejs",{userId});
})
router.post("/", isLoggedIn,validateFaculty ,wrapAsync(async(req,res)=>{
    const { faculty } = req.body;
    faculty.user = req.user._id;  
    const newFaculty=new Faculty(faculty);
    await newFaculty.save();
    req.flash("success","Faculty Profile Created Successfully!");
    res.redirect(`/index/facultys/${newFaculty._id}`);
}))
//faculty show
router.get("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let faculty=await Faculty.findById(id);     
    if(!faculty){
        req.flash("error","Record Not Found!!");
        return res.redirect("/index/facultys");
    }
    let patents = await Patent.find({ assignedTo: faculty.user._id });
    let projects = await Project.find({ assignedTo: faculty.user._id });
    let workshops = await Workshop.find({ assignedTo: faculty.user._id });
    res.render("facultys/show.ejs",{faculty,patents,projects,workshops, currUser:req.user});
}))


//faculty edit
router.get("/:id/edit",isLoggedIn,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const faculty=await Faculty.findById(id);
    if(!faculty){
        req.flash("error","Record Not Found!!");
        return res.redirect("/index/facultys");
    }
    if (req.user.role === "admin" || faculty.user.toString() === req.user._id.toString()) {
        return res.render("facultys/edit.ejs", { faculty, currUser: req.user });
    }

    req.flash("error", "Unauthorized access!");
    res.redirect("/index/facultys");
}))
router.put("/:id",isLoggedIn,validateFaculty , wrapAsync(async(req,res)=>{
    let { id } = req.params;
    if (!req.user) {
        req.flash("error", "Unauthorized access!");
        return res.redirect("/index/facultys");
    }

    let faculty = await Faculty.findById(id);
    if (!faculty) {
        req.flash("error", "Faculty not found!");
        return res.redirect("/index/facultys");
    }
    console.log(faculty);
    // Ensure only admins or the assigned user can edit
    if (req.user.role === "admin" || faculty.user.toString() === req.user._id.toString()) {
        let updatedFaculty = { ...req.body.faculty, user: faculty.user };
        await Faculty.findByIdAndUpdate(id, updatedFaculty);

        req.flash("success", "Record Updated Successfully!!");
        return res.redirect(`/index/facultys/${id}`);
    }

    req.flash("error", "Unauthorized action!");
    res.redirect("/index/facultys");
}))
//faculty delete
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const deletedFaculty=await Faculty.findByIdAndDelete(id);
    req.flash("success","Record Deleted Successfully!!");
    res.redirect("/index/facultys");
}))


//pdf download
router.get("/download/pdf", async (req, res) => {
    try {
        const faculties = await Faculty.find({});

        const doc = new PDFDocument({ margin: 30, size: "A4", layout: "portrait" });
        const filename = "FacultyDetails.pdf";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

        doc.pipe(res);

        // **Title**
        doc.fontSize(18).text("Faculty Details", { align: "center" });
        doc.moveDown(2);

        // **Table Headers**
        const tableTop = 100;
        const columnWidths = [100, 80, 80, 100, 120, 80, 100, 80];

        doc.fontSize(10)
            .text("Name", 40, tableTop, { width: columnWidths[0], bold: true })
            .text("Emp ID", 140, tableTop, { width: columnWidths[1] })
            .text("Designation", 220, tableTop, { width: columnWidths[2] })
            .text("DOB", 300, tableTop, { width: columnWidths[3] })
            .text("DOJ", 400, tableTop, { width: columnWidths[4] })
            .text("Email", 520, tableTop, { width: columnWidths[5] })
            .text("Alt Email", 620, tableTop, { width: columnWidths[6] })
            .text("Mobile", 720, tableTop, { width: columnWidths[7] });

        doc.moveTo(40, tableTop + 15).lineTo(800, tableTop + 15).stroke();

        let y = tableTop + 25;

        // **Loop through faculty data**
        faculties.forEach((faculty) => {
            doc.fontSize(9)
                .text(faculty.facultyName, 40, y, { width: columnWidths[0] })
                .text(faculty.employeeId, 140, y, { width: columnWidths[1] })
                .text(faculty.designation, 220, y, { width: columnWidths[2] })
                .text(new Date(faculty.dateOfBirth).toLocaleDateString("en-US"), 300, y, { width: columnWidths[3] })
                .text(new Date(faculty.dateOfJoining).toLocaleDateString("en-US"), 400, y, { width: columnWidths[4] })
                .text(faculty.email, 520, y, { width: columnWidths[5] })
                .text(faculty.alternateEmail || "-", 620, y, { width: columnWidths[6] })
                .text(faculty.mobile.toString(), 720, y, { width: columnWidths[7] });

            doc.moveTo(40, y + 15).lineTo(800, y + 15).stroke();
            y += 25;
        });

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).send("Error generating PDF file");
    }
});

// excel sheet download
router.get("/download/excel", async (req, res) => {
    try {
        const faculties = await Faculty.find({});
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Faculty Data");

        // **Table Headers**
        worksheet.columns = [
            { header: "Name", key: "facultyName", width: 20 },
            { header: "Employee ID", key: "employeeId", width: 15 },
            { header: "Designation", key: "designation", width: 15 },
            { header: "Date of Birth", key: "dateOfBirth", width: 15 },
            { header: "Date of Joining", key: "dateOfJoining", width: 15 },
            { header: "Email", key: "email", width: 25 },
            { header: "Alternate Email", key: "alternateEmail", width: 25 },
            { header: "Mobile No.", key: "mobile", width: 15 },
        ];

        // **Insert Data**
        faculties.forEach((faculty) => {
            worksheet.addRow({
                facultyName: faculty.facultyName,
                employeeId: faculty.employeeId,
                designation: faculty.designation,
                dateOfBirth: new Date(faculty.dateOfBirth).toLocaleDateString("en-US"),
                dateOfJoining: new Date(faculty.dateOfJoining).toLocaleDateString("en-US"),
                email: faculty.email,
                alternateEmail: faculty.alternateEmail || "-",
                mobile: faculty.mobile,
            });
        });

        // **Set Response Headers**
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=FacultyDetails.xlsx");

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error generating Excel file");
    }
});

module.exports = router;

