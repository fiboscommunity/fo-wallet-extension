import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Routers from './routers/index'
import configureStore from '../store/index'
import '../style/index'

ReactDOM.render(
    <Provider store={configureStore()}>
        <Routers />
    </Provider>,
    document.getElementById('root') as HTMLElement
)
