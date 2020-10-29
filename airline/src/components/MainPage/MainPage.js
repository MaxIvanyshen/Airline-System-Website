import React, {Component} from 'react';
import logo from './free-airplane-icon-1755-thumb.png';
import './style.css'
import 'bootstrap/dist/css/bootstrap.css';

class MainPage extends Component {
    state = {
        loggedIn: false
    }

    render() {
        const logoIcon = <img className="logoIcon" src={logo} alt="airplane"/>;
        return (
            <header>
                <div className="logo">
                    <h1 style={{color: 'white'}} className="name">UAirlines</h1>
                    {logoIcon}
                </div>
                <div className="logInOrSingIn">
                    <a href="#"><button className="logInBtn">Login In</button></a>
                    <p className="slash">/</p>
                    <a href="#"><button className="SignInBtn">Sign In</button></a>
                </div>
            </header>
        );
    }

}

export default MainPage;