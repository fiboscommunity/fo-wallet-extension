import React, { Component } from 'react'
import { Router, Route, Switch, Redirect } from 'react-router-dom'

import NotFound from '../notfound/index'

import { createBrowserHistory } from 'history'

// views component
import Entry from '../entry/index'
import Main from '../main/index'
import Import from '../main/import'
import SelectAccount from '../main/SelectAccount'
import AccountManager from '../main/accountManager'
import ExportPrivateKey from '../main/exportPrivatekey'
import ShowPrivatekey from '../main/showPrivateKey'
import Language from '../main/language'
import Create from '../main/create'
import BackUp from '../main/backup'
import ChainList from '../main/chainlist'
import NetworkAdd from '../main/networkAdd'

class MainView extends Component {
    render() {
        return (
            <Switch>
                <Route path="/index.html" exact component={Entry} />
                <Route path="/main" exact component={Main} />
                <Route path="/import" exact component={Import} />
                <Route path="/language" exact component={Language} />
                <Route path="/selectaccount" exact component={SelectAccount} />
                <Route path="/accountmanager/:hash" exact component={AccountManager} />
                <Route path="/exportpk/:hash" exact component={ExportPrivateKey} />
                <Route path="/showpk/:hash" exact component={ShowPrivatekey} />
                <Route path="/create" exact component={Create} />
                <Route path="/backup" exact component={BackUp} />
                <Route path="/chain" exact component={ChainList} />
                <Route path="/add" exact component={NetworkAdd} />
                <Route path="/" exact component={Entry} />
                <Redirect to="/404" />
            </Switch>
        )
    }
}

export default class Routers extends Component {
    render() {
        return (
            <Router history={createBrowserHistory()}>
                <Switch>
                    <Route path='/404' exact component={NotFound} />
                    <Route path='*' exact component={MainView} />
                </Switch>
            </Router>
        )
    }
}