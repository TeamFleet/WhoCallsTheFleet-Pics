const path = require('path')
const fs = require('fs-extra')
const gm = require('gm')
const glob = require('glob')
const getDb = require('./helper/get-db.js')
const exec = require('child_process').exec

const dirEntities = path.join(__dirname, '../dist/entities')

const pathMask = {
    0: path.join(__dirname, './mask/mask-0.png'),
    1: path.join(__dirname, './mask/mask-entity-1.png'),
    2: path.join(__dirname, './mask/mask-entity-2.png')
}

let entities = {}

const qualityWebP = 100

const convert = async (id) => {
    const dir = path.join(dirEntities, '' + id)

    console.log(`  ├── ${dir}`)

    const fileAvatarJPG = path.join(dir, `2.jpg`)
    if (!fs.existsSync(fileAvatarJPG)) {
        console.log(`  │       extracting picture...`)
        let base64Data,
            binaryData;

        base64Data = entities[id].picture.avatar
            .replace(/^data:image\/png;base64,/, "")
            .replace(/^data:image\/jpeg;base64,/, "");
        base64Data += base64Data.replace('+', ' ');
        binaryData = new Buffer(base64Data, 'base64').toString('binary');

        // console.log(entities[id].picture.avatar, base64Data)

        await new Promise((resolve, reject) => {
            fs.writeFile(
                fileAvatarJPG,
                binaryData,
                'binary',
                err => {
                    if (err) reject(err)
                    console.log(`  │           2.jpg`)
                    resolve()
                }
            )
        })
    }

    const fileAvatarThumbnail = path.join(dir, `0.png`)
    const masks = [0, 1, 2]
    if (!fs.existsSync(fileAvatarThumbnail)) {
        for (let maskname of masks) {
            let fileName = maskname ? `0-${maskname}.png` : `0.png`
            const filePNG = path.join(dir, `${fileName}`)
            const fileMask = pathMask[maskname]
            const fileGeometry = path.join(dir, 'geometry.txt')
            let geometry = '90x90+37-17'

            if (fs.existsSync(filePNG)) continue
            if (fs.existsSync(fileGeometry)) {
                geometry = fs.readFileSync(fileGeometry)
            }

            console.log(`  │       applying mask to 0.png...`)
            await new Promise((resolve, reject) => {
                exec(`composite -geometry ${geometry} -compose in "${fileAvatarJPG}" ${fileMask} ${filePNG}`,
                    err => {
                        if (err) reject(err)
                        console.log(`  │           ${fileName}.png`)
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
    console.log('  Processing all entities\' pictures...')

    fs.ensureDirSync(dirEntities)

    getDb('entities').forEach(data => {
        if (!data.picture || !data.picture.avatar) return

        entities[data.id] = data
        fs.ensureDirSync(
            path.join(dirEntities, '' + data.id)
        )
    })

    for (let id of fs.readdirSync(dirEntities).sort((a, b) => parseInt(a) - parseInt(b))) {
        await convert(id)
    }

    console.log(`  DONE!`)
}

run()