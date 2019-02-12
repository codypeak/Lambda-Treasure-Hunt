
import Map from './Components/Map';

import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
require("dotenv").config();



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graph: {},
    };
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    const Token = 'Token ' + process.env.REACT_APP_TREASURE_HUNT_API_KEY;
    console.log(Token)
    console.log(process.env)
    const initUrl = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/init/';
    const reqOptions = {
        headers: {
            Authorization: Token,
        }
    }

    axios
        .get(initUrl, reqOptions)
        .then(response => {
            console.log(response)
        })
        .catch(err => console.log(err));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">

        </header>
        <Map graph={this.state.graph}/> 
      </div>
    );
  }
}

export default App;
