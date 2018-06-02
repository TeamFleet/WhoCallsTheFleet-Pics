const fs = require('fs-extra')
const path = require('path')

module.exports = (dbname) => {
    let arr = []

    fs.readFileSync(path.resolve(__dirname, `../../node_modules/whocallsthefleet-database/db/${dbname}.nedb`), 'utf-8')
        .split(/\r?\n/)
        .forEach(item => {
            if (!item) return
            arr.push(JSON.parse(item))
        })
    
    return arr
}