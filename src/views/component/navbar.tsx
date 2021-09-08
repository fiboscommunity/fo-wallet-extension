import React, { Component } from "react"
import { History } from 'history'

export interface INavBarProps {
    history?: History
    left?: string
    title?: string
    right?: string
    contentColor?: string
    leftHandle?: () => void
    rightHandle?: () => void
}

export default class NavBar extends Component<INavBarProps> {
    leftDidClick() {
        const { leftHandle, history } = this.props
        if (leftHandle) {
            leftHandle()
        } else {
            history.goBack()
        }
    }

    rightDidClick() {
        const { rightHandle } = this.props
        rightHandle && rightHandle()
    }

    renderLeft(left?: string) {
        if (!left) {
            return <span className='back' />
        }
        if (left.startsWith('ttf')) { // 字体
            const splits = left.split('.')
            return (
                <span className='back' onClick={() => this.leftDidClick()}>
                    <i className={`iconfont ${splits[1]} fonticon`}></i>
                </span>
            )
        }
        if (left.startsWith('txt')) { // 文字
            const splits = left.split('.')
            return (
                <span className='back_text' onClick={() => this.leftDidClick()}>
                    {splits[1]}
                </span>
            )
        }
        return (
            <span className='back' onClick={() => this.leftDidClick()}>
                <img className='back_icon' src={left} />
            </span>
        )
    }

    renderRight(right?: string) {
        if (!right) {
            return <span className='right' />
        }
        if (right.startsWith('ttf')) { // 字体
            const splits = right.split('.')
            return (
                <span className='right' onClick={() => this.rightDidClick()}>
                    <i className={`iconfont ${splits[1]} fonticon`}></i>
                </span>
            )
        }
        if (right.startsWith('txt')) { // 文字
            const splits = right.split('.')
            return (
                <span className='right_text' onClick={() => this.rightDidClick()}>
                    {splits[1]}
                </span>
            )
        }
        return (
            <span className='right' onClick={() => this.rightDidClick()}>
                <img className='back_icon' src={right} />
            </span>
        )
    }

    renderTitle(title: string) {
        if (!title) {
            return null
        }
        return (
            <span className='title'>
                {title}
            </span>
        )
    }

    render() {
        const { left, title, right } = this.props
        if (!left && !title && !right) {
            return null
        }
        return (
            <div className='navbar'>
                {this.renderLeft(left)}
                {this.renderTitle(title)}
                {this.renderRight(right)}
            </div>
        )
    }
}