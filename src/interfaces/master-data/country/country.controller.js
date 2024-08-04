const router = require('express').Router()
const service = require('./country.service')

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
        
module.exports = router