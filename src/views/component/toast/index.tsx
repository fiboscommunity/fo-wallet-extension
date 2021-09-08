import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './toast'

enum ToastEnum {
    info,
    fail,
    success,
    loading,
    offline
}

interface IToastComponentProps {
    type: ToastEnum,
    content: string
}

class ToastComponent extends Component<IToastComponentProps> {

    renderIcon(type: ToastEnum) {
        switch (type) {
            case ToastEnum.loading:
                return <svg className='icon rotate' viewBox="0 -2 59.75 60.25"><path fill="#ccc" d="M29.69-.527C14.044-.527 1.36 12.158 1.36 27.806S14.043 56.14 29.69 56.14c15.65 0 28.334-12.686 28.334-28.334S45.34-.527 29.69-.527zm.185 53.75c-14.037 0-25.417-11.38-25.417-25.417S15.838 2.39 29.875 2.39s25.417 11.38 25.417 25.417-11.38 25.416-25.417 25.416z" /><path fill="none" stroke="#108ee9" strokeWidth="3" strokeLinecap="round" strokeMiterlimit="10" d="M56.587 29.766c.37-7.438-1.658-14.7-6.393-19.552" /></svg>
            case ToastEnum.fail:
                return <svg className='icon' viewBox="0 0 72 72"><g fill="none" fillRule="evenodd"><path d="M36 72c19.882 0 36-16.118 36-36S55.882 0 36 0 0 16.118 0 36s16.118 36 36 36zm0-2c18.778 0 34-15.222 34-34S54.778 2 36 2 2 17.222 2 36s15.222 34 34 34z" fill="#FFF" /><path d="M22 22l28.304 28.304m-28.304 0L50.304 22" stroke="#FFF" strokeWidth="2" /></g></svg>
            case ToastEnum.offline:
                return <svg className='icon' viewBox="0 0 72 72"><g fill="none" fillRule="evenodd"><path d="M36 72c19.882 0 36-16.118 36-36S55.882 0 36 0 0 16.118 0 36s16.118 36 36 36zm0-2c18.778 0 34-15.222 34-34S54.778 2 36 2 2 17.222 2 36s15.222 34 34 34z" fill="#FFF" /><path fill="#FFF" d="M47 22h2v6h-2zm-24 0h2v6h-2z" /><path d="M21 51s4.6-7 15-7 15 7 15 7" stroke="#FFF" strokeWidth="2" /></g></svg>
            case ToastEnum.success:
                return <svg className='icon' viewBox="0 0 72 72"><g fill="none" fillRule="evenodd"><path d="M36 72c19.882 0 36-16.118 36-36S55.882 0 36 0 0 16.118 0 36s16.118 36 36 36zm0-2c18.778 0 34-15.222 34-34S54.778 2 36 2 2 17.222 2 36s15.222 34 34 34z" fill="#FFF" /><path stroke="#FFF" strokeWidth="2" d="M19 34.54l11.545 11.923L52.815 24" /></g></svg>
            default:
                return null
        }
    }

    render() {
        const { type, content } = this.props
        return (
            <div
                className={type === ToastEnum.info ? 'base' : 'mask'}
                style={{ opacity: 1 }}
            >
                {this.renderIcon(type)}
                <div className='content'>
                    {content}
                </div>
            </div>
        )
    }
}

export default class Toast {
    private static div: HTMLDivElement
    private static timer: number = null

    /**
     * 纯文本提示框
     * @param content 文本
     * @param duration 时长
     */
    static info(content: string, duration: number) {
        this.create()
        ReactDOM.render(<ToastComponent type={ToastEnum.info} content={content} />, this.div)
        this.registTimer(duration)
    }

    /**
     * 失败
     * @param content 文本
     * @param duration 时长
     */
    static fail(content: string, duration: number) {
        this.create()
        ReactDOM.render(<ToastComponent type={ToastEnum.fail} content={content} />, this.div)
        this.registTimer(duration)
    }

    /**
     * 成功
     * @param content 文本
     * @param duration 时长
     */
    static success(content: string, duration: number) {
        this.create()
        ReactDOM.render(<ToastComponent type={ToastEnum.success} content={content} />, this.div)
        this.registTimer(duration)
    }

    /**
     * 加载中
     * @param content 文本
     * @param duration 时长
     */
    static loading(content: string, duration: number) {
        this.create()
        ReactDOM.render(<ToastComponent type={ToastEnum.loading} content={content} />, this.div)
        this.registTimer(duration)
    }

    /**
     * 离线
     * @param content 文本
     * @param duration 时长
     */
    static offline(content: string, duration: number) {
        this.create()
        ReactDOM.render(<ToastComponent type={ToastEnum.offline} content={content} />, this.div)
        this.registTimer(duration)
    }

    /**
     * 隐藏
     */
    static hide() {
        this.destory()
    }

    /**
     * 创建
     */
    private static create() {
        this.destory()
        this.div = document.createElement('div')
        this.div.id = 'toast'
        document.body.appendChild(this.div)
    }

    /**
     * 销毁
     */
    private static destory() {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = 0
        }
        if (this.div) {
            ReactDOM.unmountComponentAtNode(this.div)
            document.body.removeChild(this.div)
            this.div = null
        }
    }

    /**
     * 注册隐藏销毁Toast的定时器
     * @param duration 
     */
    private static registTimer(duration: number) {
        if (duration > 0)
            this.timer = window.setTimeout(() => this.destory(), duration * 1000)
    }
}
