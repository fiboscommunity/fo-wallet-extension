import Prompt from '../models/Prompt'
import apis from './ApiHelper'

class NotificationHelper {
    private readonly target: string = 'ScatterPrompt'
    private openedWindow: Window = null

    private destory(): void {
        if (this.openedWindow) {
            this.openedWindow.close()
        }
    }

    private async popUp(notification: Prompt) {
        try {
            const winW = window.screen.availWidth
            const winH = window.screen.availHeight
            // const w = (900 / 1920 * winW) << 0
            // const h = (614 / 1080 * winH) << 0
            const w = 600
            const h = 393
            const topX = (winH - h) / 2
            const leftY = (winW - w) / 2
            const url = apis.runtime.getURL('/prompt.html')
            let win: any = window.open(url, this.target, `width=${w},height=${h},resizable=0,top=${topX},left=${leftY},titlebar=0`)
            win.data = notification
            this.openedWindow = win
            return this.openedWindow
        } catch (e) {
            return null
        }
    }

    /**
     * 打开window
     * @param notification 
     */
    public async openWindow(notification: Prompt) {
        this.destory()
        this.popUp(notification)
    }
}

export default new NotificationHelper()