import React, { Component } from 'react'
import '../../style/pop'

interface IPopParams {
    r?: number
    y: number
    x?: number
    w?: number
    hash?: any
    options: Array<string>
}

interface IPopProps {
    ref?: (e: Pop) => void
    callback?: (index: number, hash?: any) => void
}

interface IPopState {
    visible: boolean
}

/**
 * 非受控组件
 */
export default class Pop extends Component<IPopProps, IPopState> {
    private timer: number
    private r?: number
    private y: number
    private x?: number
    private w: number = 110
    private hash: any
    private options: Array<string>

    constructor(props: IPopProps) {
        super(props)
        this.state = {
            visible: false
        }
    }

    public show(params: IPopParams) {
        this.r = params.r
        this.y = params.y
        this.hash = params.hash
        this.w = params.w || 110
        this.x = params.x
        this.options = params.options

        this.setState({ visible: true })
    }

    public hide() {
        this.setState({ visible: false })
    }

    private itemClick(idx: number) {
        this.hide()
        const { callback } = this.props
        callback && callback(idx, this.hash)
    }

    render() {
        const { visible } = this.state
        if (!visible) {
            return null
        }
        const { r, y, options, w, x } = this
        const style: any = { top: y, right: r }
        if (x !== undefined) {
            style.left = x
        }
        if (y !== undefined) {
            style.right = r
        }
        if (w !== undefined) {
            style.width = w
        }
        return (
            <div id='pop_mask' onClick={() => this.hide()}>
                <div id='pop' style={style}>
                    {
                        options.map((opt, idx) => (
                            <div
                                key={opt}
                                className='item'
                                onClick={() => this.itemClick(idx)}
                            >
                                {opt}
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }
}
