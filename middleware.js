const Patent=require("./models/patent.js");
const Workshop=require("./models/workshop.js");
const Project=require("./models/project.js");
const ExpressError=require("./utils/ExpressError.js");
const {patentSchema, workshopSchema, projectSchema, facultySchema}=require("./schema.js");


module.exports.validatePatent=(req,res,next)=>{
    let {error}=patentSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }
};


module.exports.validateWorkshop=(req,res,next)=>{
    let {error}=workshopSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }
};


module.exports.validateProject=(req,res,next)=>{
    let {error}=projectSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }
};


module.exports.validateFaculty=(req,res,next)=>{
    let {error}=facultySchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }
};




module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","login first to view details");
        return res.redirect("/login");
    }
    next();
}
module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return next();
    }
    req.flash("error", "Access Denied");
    res.redirect("/");
};

module.exports.isTeacher = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "teacher") {
        return next();
    }
    req.flash("error", "Access Denied");
    res.redirect("/");
};
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}