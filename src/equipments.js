const path = require('path')
const fs = require('fs-extra')
const gm = require('gm')
const glob = require('glob')

const dirEquipments = path.join(__dirname, '../dist/equipments')

const qualityWebP = 100

const convert = async (id) => {
    const dir = path.join(dirEquipments, '' + id)

    console.log(`  ├── ${dir}`)

    for (let file of glob.sync(path.join(dir, '*.png'))) {
        const parse = path.parse(file)
        const fileWEBP = path.join(dir, `${parse.name}.webp`)

        if (fs.existsSync(fileWEBP)) continue

        console.log(`  │       converting .png to .webp...`)
        await new Promise((resolve, reject) => {
            gm(file)
                .quality(qualityWebP)
                .write(fileWEBP, err => {
                    if (err) reject(err)
                    console.log(`  │           ${parse.name}.webp`)
                    resolve()
                })
        })
    }

    // console.log(`  │       DONE!`)
}

const run = async () => {
    console.log('')
    console.log('  Processing all equipments\' illustrations...')

    for (let id of fs.readdirSync(dirEquipments).sort((a, b) => parseInt(a) - parseInt(b))) {
        await convert(id)
    }

    console.log(`  DONE!`)
}

run()