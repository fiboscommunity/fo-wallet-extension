import React, { Component, ReactNode, CSSProperties } from 'react'
import ReactDOM from 'react-dom'
import './modal'

interface Action<T> {
    text: string
    onPress?: (...args: any[]) => void | Promise<any>
    style?: T
}

interface IModalComponentProps {
    title: ReactNode
    message: ReactNode
    actions?: Array<Action<CSSProperties>>
    onClose: () => void
}

class ModalComponent extends Component<IModalComponentProps> {
    renderFooter() {
        const { actions = [], onClose } = this.props
        if (actions.length > 5) {
            throw new Error('too many button to render')
        }
        if (actions.length === 0) {
            return (
                <div className='footer_row'>
                    <span
                        className='footer_item_row'
                        onClick={() => onClose()}
                    >OK</span>
                </div>
            )
        }
        if (actions.length <= 2) {
            return (
                <div className='footer_row'>
                    {
                        actions.map(act => (
                            <span
                                className='footer_item_row'
                                style={act.style}
                                key={act.text}
                                onClick={() => {
                                    act.onPress && act.onPress()
                                    onClose()
                                }}
                            >
                                {act.text}
                            </span>
                        ))
                    }
                </div>
            )
        }
        return (
            <div className='footer_column'>
                {
                    actions.map(act => (
                        <span
                            className='footer_item_column'
                            style={act.style}
                            key={act.text}
                            onClick={() => {
                                act.onPress && act.onPress()
                                onClose()
                            }}
                        >
                            {act.text}
                        </span>
                    ))
                }
            </div>
        )
    }

    render() {
        const { title, message } = this.props
        return (
            <div className='mask'>
                <div className='title'>
                    {title}
                </div>
                <div className='content'>
                    {message}
                </div>
                {this.renderFooter()}
            </div>
        )
    }
}

export default class Modal {
    private static div: HTMLDivElement

    static alert(title: ReactNode, message: ReactNode, actions?: Array<Action<CSSProperties>>) {
        this.create()
        ReactDOM.render(<ModalComponent title={title} message={message} actions={actions} onClose={() => this.destory()} />, this.div)
    }

    private static create() {
        this.destory()
        this.div = document.createElement('div')
        this.div.id = 'modal'
        document.body.appendChild(this.div)
    }

    private static destory() {
        if (this.div) {
            ReactDOM.unmountComponentAtNode(this.div)
            document.body.removeChild(this.div)
            this.div = null
        }
    }
}
