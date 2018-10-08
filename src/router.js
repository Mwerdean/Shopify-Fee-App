import React from 'react'
import { Route, Switch } from 'react-router-dom'
import AddFee from './components/addFee'
import RemoveFee from './components/removeFee'

export default (
    <Switch>
        <Route exact path='/' component = { AddFee } />
        <Route path='/removefee' component = { RemoveFee } />
    </Switch>
)