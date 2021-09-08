import React, { Component } from 'react'
import '../../style/pop'

interface IPopParams {
    r: number
    y: number
    w?: number
    hash?: any
    options: Array<IOption>
}

interface IPopProps {
    ref?: (e: Pop2) => void
    callback?: (index: number, hash?: any) => void
}

interface IPopState {
    visible: boolean
}

interface IOption {
    icon?: any
    title: string
}

/**
 * 非受控组件
 */
export default class Pop2 extends Component<IPopProps, IPopState> {
    private timer: number
    private r: number
    private y: number
    private w: number = 110
    private hash: any
    private options: Array<IOption>

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
        this.w = params.w || 120
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
        const { r, y, options } = this
        const style: any = { top: y, right: r }
        return (
            <div id='pop_mask' onClick={() => this.hide()}>
                <div id='pop2' style={style}>
                    {
                        options.map((opt, idx) => (
                            <div
                                key={opt.title}
                                className='item'
                                onClick={() => this.itemClick(idx)}
                            >
                                {
                                    opt.icon ? (<img className='icon' src={opt.icon} />) : ""
                                }
                                {opt.title}
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }
}
