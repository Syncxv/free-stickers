const { Plugin } = require("powercord/entities");
const {getModule, messages} = require('powercord/webpack')
const {inject, uninject} = require('powercord/injector')
const fs = require('fs')
const PNG = require('png-js')
const request = require('request').defaults({ encoding: null });
const path = require("path");
const { upload } = getModule(["upload", "cancel"], false);
module.exports = class hehenigga extends Plugin {
    constructor(props) {
        super(props)
        this.prefix = 'sticker-'
        this.old = messages.sendStickers
    }
    async startPlugin() {
        const {getStickerById} = getModule(['getStickerById'],false)
        const {getStickerAssetUrl} = getModule(['getStickerAssetUrl'],false)
        messages.sendStickers = (sendStickers => async(channel_id, [id],...params) => {
            try {
                console.log(id, ...params)
                const url = getStickerAssetUrl(getStickerById(id))
                const cached = await this.saveSticker(url, id)
                const buf = fs.readFileSync(path.resolve(__dirname, 'cached-gifs', `${id}.gif`))
                const file = new File([buf], `${id}.gif`, {type: "image/gif"})
                console.log(file,buf)
                upload(channel_id, file,)
            } catch(e) {
                console.error(e)
            }
           
        })(messages.sendStickers)
    }

    async saveSticker(url, id) {
        return new Promise((resolve, reject) => {
            if(fs.existsSync(path.resolve(__dirname, 'cached-gifs', `${id}.gif`))) {
                resolve(true)
            }
            request.get(url, function (err, res, body) {
                var ok = new PNG(body)
                console.log(ok, typeof ok.data, ok.data)
                fs.writeFileSync(path.resolve(__dirname, 'cached-gifs', `${id}.gif`,), ok.data)
                resolve(true)
            });
        })
        
    }
    pluginWillUnload() {
        require('powercord/webpack').messages.sendStickers = this.old
    }
}