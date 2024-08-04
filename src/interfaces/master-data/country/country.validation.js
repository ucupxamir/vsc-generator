const Joi = require('joi')
        
exports.insert_validation = Joi.object({
    name: Joi.string().required(),
    created_by: Joi.string().required()
})
  
exports.filter_validation = Joi.object({
    name: Joi.string()
})

exports.id_validation = Joi.number().required()
    
exports.update_validation = Joi.object({
    name: Joi.string().required(),
    updated_by: Joi.string().required()
})
    
exports.destroy_validation = Joi.object({
    deleted_by: Joi.string().required()
})