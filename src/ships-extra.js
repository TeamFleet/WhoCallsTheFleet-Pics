const path = require('path')
const fs = require('fs-extra')
const gm = require('gm')
const glob = require('glob')

const dirShipsExtra = path.join(__dirname, '../dist/ships-extra')

const qualityWebP = 100

const convert = async (id) => {
    const dir = path.join(dirShipsExtra, '' + id)
    const filenamesNeedConvert = [
        '8.png',
        '9.png'
    ]

    console.log(`  ├── ${dir}`)

    for (let filename of filenamesNeedConvert) {
        const parse = path.parse(filename)
        const filePNG = path.join(dir, `${parse.name}.png`)
        const fileWEBP = path.join(dir, `${parse.name}.webp`)

        if (!fs.existsSync(filePNG)) continue
        if (fs.existsSync(fileWEBP)) continue

        console.log(`  │       converting 8.png/9.png to .webp...`)
        await new Promise((resolve, reject) => {
            gm(filePNG)
                .quality(qualityWebP)
                .write(fileWEBP, err => {
                    if (err) reject(err)
                    console.log(`  │           ${parse.name}.jpg`)
                    resolve()
                })
        })
    }

    // console.log(`  │       DONE!`)
}

const run = async () => {
    console.log('')
    console.log('  Processing all ships-extra\' illustrations...')

    for (let id of fs.readdirSync(dirShipsExtra).sort((a, b) => parseInt(a) - parseInt(b))) {
        await convert(id)
    }

    console.log(`  DONE!`)
}

run()