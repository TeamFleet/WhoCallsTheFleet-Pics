const path = require('path')
const fs = require('fs-extra')
const glob = require('glob')

const dirPics = path.join(__dirname, '../dist')
const dirTarget = path.join(__dirname, '../../yuubari/dist-web/public/pics')

const run = async () => {
    console.log('')
    console.log('  Copying all necessary files...')

    fs.ensureDirSync(dirTarget)

    for (let type of fs.readdirSync(dirPics).sort((a, b) => parseInt(a) - parseInt(b))) {
        console.log(type)
        if (typeof func[type] === 'undefined')
            return await func._default(type)
        return await func[type]()
    }

    console.log(`  DONE!`)
}

let func = {}

func._default = async (type) => {
    const dir = path.join(dirPics, type)
    return await fs.copy(
        path.join(dirPics, type),
        path.join(dirTarget, type),
        {
            preserveTimestamps: true,
            filter: (src, dest) => {
                console.log(src, dest)
                return false
            }
        }
    ).then(() => {
        console.log(`  ├── ${type} DONE!`)
    })
}

run()