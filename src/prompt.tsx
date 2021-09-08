import React from 'react'
import ReactDOM from 'react-dom'

import apis from './utils/ApiHelper'
import PromptMain from './views/prompt/prompt'

class PromptWindow {
    constructor() {
        let win: any = window
        const prompt = win.data || apis.extension.getBackgroundPage().notification || null

        ReactDOM.render(
            <PromptMain prompt={prompt} />,
            document.getElementById('prompt') as HTMLElement
        );

    }
}

new PromptWindow()