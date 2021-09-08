const exec = require('child_process').exec
const fs = require('fs')

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

function createDir(path) {
    cleanDistDir(path)
    fs.mkdirSync(path)
}

function execCmd() {
    createDir('./zip')
    exec('cd dist && zip -q -r fibos.zip ./* && mv fibos.zip ../zip/fibos.zip', (err) => {
        if (!err) {
            console.log('zip success')
        } else {
            console.log('zip dist failed')
        }
    })
}

cleanDistDir('./zip')
execCmd()
