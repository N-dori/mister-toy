const fs = require('fs')
const toys = require('../data/toy.json')

module.exports = {
    query,
    getById,
    save,
    remove,
}
  
function query(filterBy) {
    if (!filterBy) return Promise.resolve(toys)
    const filteredToys = _filterToys(toys, filterBy)
    return Promise.resolve(filteredToys)
}

function getById(toyId) {
    return new Promise((resolve, reject) => {
        if (!toyId) reject('No toy Id')

        const toy = toys.find(bug => bug._id === toyId)
        if (!toy) reject('toy not found')
        resolve(toy)
    })
}

function remove(toyId) {
    if (!toyId) return Promise.reject('No toy Id')

    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('Toy not found')
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(newToy) {
    if (newToy._id) {
        const idx = toys.findIndex(toy => toy._id === newToy._id)
        if (idx === -1) return Promise.reject('Toy not found')
        toys.splice(idx, 1, newToy)
    } else {
        newToy._id = _makeId()
        newToy.createdAt = Date.now()
        toys.unshift(newToy)
    }
    return _saveToysToFile()
        .then(() => newToy)
}

function _filterToys(toys, filterBy) {
    const { labels, sortBy } = filterBy
    let filteredToys = toys.filter(toy => {

        if (filterBy.name) {
            const regex = new RegExp(filterBy.name, 'i')
            if (!regex.test(toy.name)) return false
        }

        if (filterBy.inStock==='true' && !toy.inStock) {
            return false
        }

        if (labels.length) {
            const hasLabel = labels.some(label => toy.labels.includes(label))
            if (!hasLabel) return false
        }
        return true
    })
console.log('',filterBy.sortBy);

    if (sortBy.by==='name') {
        filteredToys = toys.sort((a, b) => a.name.localeCompare(b.name))
    }
    if (sortBy.by==='price') {
        filteredToys = toys.sort((a, b) => (a.price - b.price) )
    }
    if (sortBy.by==='created') {
        filteredToys = toys.sort((a, b) => (a.createAt - b.createAt) )
    }

    return filteredToys
}

function _makeId(length = 5) {
    let txt = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return txt
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const content = JSON.stringify(toys, null, 2)
        fs.writeFile('./data/toy.json', content, err => {
            if (err) return reject(err)
            resolve()
        })
    })
}

