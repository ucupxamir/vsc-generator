const _ = require('lodash')
const path = require('path')
const fs = require('fs')

class Api {
    constructor(module, name, attributes) {
        this.module = module
        this.name = name
        this.attributes = attributes
        this.model = _(name).startCase().replace(' ', '')
        this.path = `./src/interfaces/${module}/${name}`
        this.name_snake_case = _(name).snakeCase()
        this.message_name = _(name).replace('-', ' ')
    }

    generateController() {
        const filepath = path.join(__dirname, `${this.path}/${this.name}.controller.js`)
        const content = `const router = require('express').Router()
const service = require('./${this.name}.service')

router.post('/', async (req, res, next) => {
    try {
        const data = await service.create({ ...req.body, created_by: res.locals.user })

        res.status(200).send({ data })
    } catch (e) {
        next(e)
    }    
})

router.get('/', async (req, res, next) => {
    try {
        const data = await service.create(req.query)

        res.status(200).send({ data })
    } catch (e) {
        next(e)
    }    
})

router.post('/:id', async (req, res, next) => {
    try {
        const data = await service.findById(req.params.id)

        res.status(200).send({ data })
    } catch (e) {
        next(e)
    }    
})

router.put('/:id', async (req, res, next) => {
    try {
        const data = await service.create({ ...req.body, updated_by: res.locals.user }, req.params.id)

        res.status(200).send({ data })
    } catch (e) {
        next(e)
    }    
})

router.delete('/:id', async (req, res, next) => {
    try {
        const data = await service.create({ deleted_by: res.locals.user }, req.params.id)

        res.status(200).send({ data })
    } catch (e) {
        next(e)
    }    
})
        
module.exports = router`

        try {
            fs.writeFileSync(filepath, content, 'utf-8')
            console.log(`Success creating controller ${this.name}`)
        } catch (err) {
            console.error(`Failed creating service ${this.name}: ${err.message}`)
        }
    }

    generateService() {
        const filepath = path.join(__dirname, `${this.path}/${this.name}.service.js`)

        const content = 
        `const { Op } = require('sequelize')
const global = require('../../utils/global')
const ResponseError = require('../../errors/response.error')
const { ${this.model}, sequelize } = require('../../models')
const ${this.name_snake_case}_validation = require('./${this.name}.validation')

const unique_keys = ['']

exports.create = async (request) => {
    let t = await sequelize.transaction()
    try {
        const ${this.name_snake_case}_request = global.validate(${this.name_snake_case}_validation.insert_validation, request)

        const existing_${this.name_snake_case} = await ${this.model}.findOne({
            where: unique_keys.reduce((acc, key) => {
                acc[key] = ${this.name_snake_case}_request[key]
                return acc
            }, {})
        }, { transaction: t })

        if (existing_${this.name_snake_case}) throw new ResponseError(409, '${this.name_snake_case} already exists')

        await ${this.model}.create(${this.name_snake_case}_request, { transaction: t })
        
        await t.commit()

        return '${this.message_name} has been successfully created'
    } catch (e) {
        await t.rollback()
        throw e
    }
}
    
exports.findAll = async (request) => {
    const filter = global.validate(${this.name_snake_case}_validation.filter_validation, request)
    
    return ${this.model}.findAll({
        where: filter
    })
}
    
exports.findById = async (request) => {
    const id = global.validation(${this.name_snake_case}_validation.id_validation, request)

    const ${this.name_snake_case}_by_id = await ${this.model}.findByPk(id)

    if (${this.name_snake_case}_by_id) throw new ResponseError(404, '${this.message_name} with this id was not found')

    return ${this.name_snake_case}_by_id
}
    
exports.update = async (request, requestId) => {
    let t = await sequelize.transaction()
    try {
        const id = global.validation(${this.name_snake_case}_validation.id_validation, requestId)

        const ${this.name_snake_case}_request = global.validate(${this.name_snake_case}_validation.update_validation, request)

        const ${this.name_snake_case}_by_id = await ${this.model}.findByPk(id, {
            attributes: ['id']
        }, { transaction: t })
    
        if (${this.name_snake_case}_by_id) throw new ResponseError(404, '${this.message_name} with this id was not found')
    
        const existing_${this.name_snake_case} = await Model.findOne({
            where: unique_keys.reduce((acc, key) => {
                acc[key] = ${this.name_snake_case}_request[key]
                return acc
            }, {
                id: {
                    [Op.not]: id
                }
            })
        }, { transaction: t })
    
        if (existing_${this.name_snake_case}) throw new ResponseError(409, '${this.name_snake_case} already exists')
    
        await ${this.model}.update(${this.name_snake_case}_request, { 
            where: { id }
        }, { transaction: t })

        await t.commit()

        return '${this.message_name} has been successfully updated'
    } catch (e) {
        await t.rollback()
        throw (e)
    }
}
    
exports.destroy = async (request, requestId) => {
    let t = await sequelize.transaction()
    try {
        const id = global.validation(${this.name_snake_case}_validation.id_validation, requestId)

        const ${this.name_snake_case}_request = global.validate(${this.name_snake_case}_validation.destroy_validation, request)

        const ${this.name_snake_case}_by_id = await ${this.model}.findByPk(id, {
            attributes: ['id']
        }, { transaction: t })
    
        if (${this.name_snake_case}_by_id) throw new ResponseError(404, '${this.message_name} with this id was not found')
    
        await ${this.model}.update(${this.name_snake_case}_request, { 
            where: { id }
        }, { transaction: t })

        await ${this.model}.destroy({
            where: { id }
        }, { transaction: t })

        await t.commit()

        return '${this.message_name} has been successfully deleted'
    } catch (e) {
        await t.rollback()
        throw (e)
    }
}`

        try {
            fs.writeFileSync(filepath, content, 'utf-8')
            console.log(`Success creating service ${this.name}`)
        } catch (err) {
            console.error(`Failed creating service ${this.name}: ${err.message}`)
        }
    }

    generate_validation() {
        const filepath = path.join(__dirname, `${this.path}/${this.name}.validation.js`)

        const attributes_keys = Object.keys(this.attributes)

        let insert_validation = []
        let filter_validation = []
        let id_validation = []
        let update_validation = []
        for (let i = 0; i < attributes_keys.length; i++) {
            const attributes = `${attributes_keys[i]}: Joi.${this.attributes[attributes_keys[i]].type}()`

            const is_required = `.required()`

            if (attributes_keys[i] !== 'id') {
                insert_validation.push(`${attributes}${this.attributes[attributes_keys[i]].required ? is_required : ''}`)
                update_validation.push(`${attributes}${this.attributes[attributes_keys[i]].required ? is_required : ''}`)
            } else {
                id_validation += `Joi.${this.attributes[attributes_keys[i]].type}().required()`
            }
            if (this.attributes[attributes_keys[i]].filter) {
                filter_validation.push(attributes)
            }
        }

        console.log(insert_validation.join(', \n'))

        const content = 
        `const Joi = require('joi')
        
exports.insert_validation = Joi.object({
    ${insert_validation.join(', \n \t')},
    created_by: Joi.string().required()
})
  
exports.filter_validation = Joi.object({
    ${filter_validation.join(', \n \t')}
})

exports.id_validation = ${id_validation}
    
exports.update_validation = Joi.object({
    ${update_validation.join(', \n \t')},
    updated_by: Joi.string().required()
})
    
exports.destroy_validation = Joi.object({
    deleted_by: Joi.string().required()
})`
        try {
            fs.writeFileSync(filepath, content, 'utf-8')
            console.log(`Success creating validation ${this.name}`)
        } catch (err) {
            console.error(`Failed creating validation ${this.name}: ${err.message}`)
        }
    }

    generate() {
        const filepath = path.join(__dirname, this.path)
        if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath, { recursive: true })
            console.log(`Created directory ${filepath}`)
        } else {
            console.log(`Directory already exists`)
        }

        this.generateController()
        this.generateService()
        this.generate_validation()
    }
}

module.exports = Api
