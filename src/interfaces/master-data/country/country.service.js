const { Op } = require('sequelize')
const global = require('../../utils/global')
const ResponseError = require('../../errors/response.error')
const { Country, sequelize } = require('../../models')
const country_validation = require('./country.validation')

const unique_keys = ['']

exports.create = async (request) => {
    let t = await sequelize.transaction()
    try {
        const country_request = global.validate(country_validation.insert_validation, request)

        const existing_country = await Country.findOne({
            where: unique_keys.reduce((acc, key) => {
                acc[key] = country_request[key]
                return acc
            }, {})
        }, { transaction: t })

        if (existing_country) throw new ResponseError(409, 'country already exists')

        await Country.create(country_request, { transaction: t })
        
        await t.commit()

        return 'country has been successfully created'
    } catch (e) {
        await t.rollback()
        throw e
    }
}
    
exports.findAll = async (request) => {
    const filter = global.validate(country_validation.filter_validation, request)
    
    return Country.findAll({
        where: filter
    })
}
    
exports.findById = async (request) => {
    const id = global.validation(country_validation.id_validation, request)

    const country_by_id = await Country.findByPk(id)

    if (country_by_id) throw new ResponseError(404, 'country with this id was not found')

    return country_by_id
}
    
exports.update = async (request, requestId) => {
    let t = await sequelize.transaction()
    try {
        const id = global.validation(country_validation.id_validation, requestId)

        const country_request = global.validate(country_validation.update_validation, request)

        const country_by_id = await Country.findByPk(id, {
            attributes: ['id']
        }, { transaction: t })
    
        if (country_by_id) throw new ResponseError(404, 'country with this id was not found')
    
        const existing_country = await Model.findOne({
            where: unique_keys.reduce((acc, key) => {
                acc[key] = country_request[key]
                return acc
            }, {
                id: {
                    [Op.not]: id
                }
            })
        }, { transaction: t })
    
        if (existing_country) throw new ResponseError(409, 'country already exists')
    
        await Country.update(country_request, { 
            where: { id }
        }, { transaction: t })

        await t.commit()

        return 'country has been successfully updated'
    } catch (e) {
        await t.rollback()
        throw (e)
    }
}
    
exports.destroy = async (request, requestId) => {
    let t = await sequelize.transaction()
    try {
        const id = global.validation(country_validation.id_validation, requestId)

        const country_request = global.validate(country_validation.destroy_validation, request)

        const country_by_id = await Country.findByPk(id, {
            attributes: ['id']
        }, { transaction: t })
    
        if (country_by_id) throw new ResponseError(404, 'country with this id was not found')
    
        await Country.update(country_request, { 
            where: { id }
        }, { transaction: t })

        await Country.destroy({
            where: { id }
        }, { transaction: t })

        await t.commit()

        return 'country has been successfully deleted'
    } catch (e) {
        await t.rollback()
        throw (e)
    }
}