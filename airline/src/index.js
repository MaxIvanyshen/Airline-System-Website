import React, {Component} from 'react';
import {render} from 'react-dom';
import MainPage from './components/MainPage/MainPage'

import {
    BrowserRouter as Router, Route, Switch, Link, Redirect
} from 'react-router-dom'

class App extends Component {
    render() {
        return (
            <Router>
                <Route path="/" component={MainPage}/>
            </Router>
        );
    }
}
render(<App/>, document.getElementById("root"));