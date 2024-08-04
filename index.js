const Api = require('./Api')

const country = {
    id: { primary_key: true, type: 'number', filter: false },
    name: { type: 'string', required: true, filter: true },
}

const newApi = new Api('master-data', 'country', country)

newApi.generate()