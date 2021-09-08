import { applyMiddleware, createStore } from 'redux'
import thunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'
import reducers from '../reducer/index'

export default function() {
    if (process.env.NODE_ENV === 'production') {
        window.console.log = () => {}
        window.console.warn = () => {}
        window.console.error = () => {}
        window.console.info = () => {}
        return applyMiddleware(thunkMiddleware)(createStore)(reducers)
    }
    return applyMiddleware(thunkMiddleware, logger)(createStore)(reducers)
}