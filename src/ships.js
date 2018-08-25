const path = require('path')
const fs = require('fs-extra')
const gm = require('gm')
const exec = require('child_process').exec
const glob = require('glob')
const sizeOf = require('image-size')

const dirShips = path.join(__dirname, '../dist/ships')
// const pathMask = {
//     1: path.join(__dirname, './mask/mask-1.png'),
//     2: path.join(__dirname, './mask/mask-2.png')
// }
const pathnameMasks = {
    '160x40': {
        1: path.resolve(__dirname, './mask/ship-banner-160x40-mask-1.png'),
        2: path.resolve(__dirname, './mask/ship-banner-160x40-mask-2.png'),
    },
    '240x60': {
        1: path.resolve(__dirname, './mask/ship-banner-240x60-mask-1.png'),
        2: path.resolve(__dirname, './mask/ship-banner-240x60-mask-2.png'),
    }
}

const qualityWebP = 100

// 'gm composite -compose in "' + source + '" ' + mask + ' ' + target_mask_1

const convert = async (id) => {
    const dir = path.join(dirShips, '' + id)
    const filenamesAvatar = [
        '0.png',
        '1.png'
    ]
    const masks = [1, 2]

    console.log(`  ├── ${dir}`)

    for (let file of glob.sync(path.join(dir, '*.jpg'))) {
        const parse = path.parse(file)
        const filePNG = path.join(dir, `${parse.name}.png`)

        if (fs.existsSync(filePNG)) continue

        console.log(`  │       converting .jpg to .png...`)
        await new Promise((resolve, reject) => {
            gm(file)
                .write(filePNG, err => {
                    if (err) reject(err)
                    console.log(`  │           ${parse.name}.png`)
                    resolve()
                })
        })
    }

    // for (let filename of filenamesAvatar) {
    //     const parse = path.parse(filename)
    //     const filePNG = path.join(dir, `${parse.name}.png`)
    //     const fileJPG = path.join(dir, `${parse.name}.jpg`)

    //     if (fs.existsSync(fileJPG)) continue

    //     console.log(`  │       converting 0.png/1.png to .jpg...`)
    //     await new Promise((resolve, reject) => {
    //         gm(filePNG)
    //             .quality(75)
    //             .write(fileJPG, err => {
    //                 if (err) reject(err)
    //                 console.log(`  │           ${parse.name}.jpg`)
    //                 resolve()
    //             })
    //     })
    // }

    for (let filename of filenamesAvatar) {
        const parse = path.parse(filename)
        const fileOriginal = path.join(dir, `${parse.name}.png`)
        const dimensions = sizeOf(fileOriginal)
        const size = `${dimensions.width}x${dimensions.height}`
        const pathnameMask = typeof pathnameMasks[size] === 'object'
            ? pathnameMasks[size]
            : pathnameMasks["160x40"]
        for (let maskname of masks) {
            const filePNG = path.join(dir, `${parse.name}-${maskname}.png`)
            const fileMask = pathnameMask[maskname]

            if (fs.existsSync(filePNG)) continue

            console.log(`  │       applying mask to 0.png/1.png...`)
            await new Promise((resolve, reject) => {
                exec(`gm composite -compose in "${fileOriginal}" ${fileMask} ${filePNG}`,
                    err => {
                        if (err) reject(err)
                        console.log(`  │           ${parse.name}-${maskname}.png`)
                        resolve()
                    }
                )
            })
        }
    }

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
    console.log('  Processing all ships\' illustrations...')

    for (let id of fs.readdirSync(dirShips).sort((a, b) => parseInt(a) - parseInt(b))) {
        await convert(id)
    }

    console.log(`  DONE!`)
}

run()
