var fs = require('fs')
function createTypesIfNeeded() {
    const basePath = './node_modules/@types'
    const dirs = ['eos-rc-parser', 'extension-streams', 'fibos.js']
    dirs.forEach(elem => {
        const path = `${basePath}/${elem}`
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
            const data = `declare module "${elem}"`
            fs.writeFileSync(`${path}/index.d.ts`, data)
        }
    })
}

function cleanDistDir(path) {
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path)
        files.forEach(file => {
            const _path = `${path}/${file}`
            if (fs.statSync(_path).isDirectory())
                cleanDistDir(_path)
            else
                fs.unlinkSync(_path)
        })
        fs.rmdirSync(path)
    }
}

function createDist() {
    const dist = './dist'
    if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist)
    }
}

function copyAssets() {
    createDist()
    const base = './public'
    const files = fs.readdirSync(base)
    files.forEach(file => {
        const source = `${base}/${file}`
        const desc = `./dist/${file}`
        fs.copyFileSync(source, desc)
    })
}

createTypesIfNeeded()
cleanDistDir('./dist')
copyAssets()

