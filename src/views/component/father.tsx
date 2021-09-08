import React, { Component } from "react"
import NavBar from './navbar'
import { INavBarProps } from './navbar'

export default class Father extends Component<INavBarProps> {
    render() {
        const { children, left, title, right, contentColor } = this.props
        const height = (!left && !title && !right)
            ? 'calc(100vh)'
            : 'calc(100vh - 44px)'
        return (
            <div className="flex">
                <NavBar {...this.props} />
                <div className="content scroll" style={{ height, backgroundColor: contentColor || '#FFFFFF' }}>
                    {children}
                </div>
            </div>
        )
    }
}