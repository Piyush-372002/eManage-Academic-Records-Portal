const Joi = require('joi');
module.exports.patentSchema=Joi.object({
    patent:Joi.object({
        facultyName:Joi.string().required(),
        patentTitle:Joi.string().required(),
        patentNumber:Joi.number().required(),
        dateOfAward:Joi.date().required().min(0),
        grantingBody:Joi.string().required(),
        status:Joi.string().required(),
        certificate:Joi.string().allow("",null),
        assignedTo: Joi.string().optional()
    }).required(),
});


module.exports.projectSchema=Joi.object({
    project:Joi.object({
        name:Joi.string().required(),
        designation:Joi.string().required(),
        title:Joi.string().required(),
        conferenceName:Joi.string().required().min(0),
        year:Joi.number().required(),
        volume:Joi.number().required(),
        page:Joi.number().required(),
        issn:Joi.number().required(),
        ugc:Joi.string().required(),
        month:Joi.string().required(),
        paid:Joi.string().required(),
        indexing:Joi.string().required(),
        email:Joi.string().required(),
        assignedTo: Joi.string().optional()
    }).required(),
});


module.exports.workshopSchema=Joi.object({
    workshop:Joi.object({
        facultyName:Joi.string().required(),
        workshopName:Joi.string().required(),
        mode:Joi.string().required(),
        from:Joi.date().required().min(0),
        to:Joi.date().required(),
        organiser:Joi.string().required(),
        participant:Joi.string().required(),
        year:Joi.number().required(),
        amountPaid:Joi.string().required(),
        fundingAgency:Joi.string().required(),
        summary:Joi.string().required(),
        certificate:Joi.string().allow("",null),
        assignedTo: Joi.string().optional()
    }).required(),
});


module.exports.facultySchema=Joi.object({
    faculty:Joi.object({
        facultyName:Joi.string().required(),
        employeeId:Joi.string().required(),
        designation:Joi.string().required(),
        dateOfBirth:Joi.date().required(),
        dateOfJoining:Joi.date().required(),
        email:Joi.string().required(),
        alternateEmail:Joi.string().optional(),
        mobile:Joi.number().required(),
        user: Joi.string().hex().length(24).required()
    }).required(),
});
