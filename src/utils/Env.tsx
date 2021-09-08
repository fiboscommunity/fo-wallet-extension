export default class Env {
  /**
   * 是否在chrome插件环境下
   */
  static isInCrx(): boolean {
    const win: any = window
    return !!(win.chrome && win.chrome.storage)
  }
}