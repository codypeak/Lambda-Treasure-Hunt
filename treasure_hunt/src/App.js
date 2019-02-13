import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import IntervalTimer from 'react-interval-timer';

import Map from './Components/Map';

require("dotenv").config();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graph: {},
      map: {},
      currentRoom: '',
      prevRoom: '',
      description: '', 
      coordinates: '',
      players: [],
      items: [],
      exits: [],
      cooldown: '',
      errors: [],
      messages: []
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
          //save map here? 
      })
      .catch(err => console.log(err));
  }

  move_request = direction => {
    const moveUrl = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/move/';
    const Token = 'Token ' + process.env.REACT_APP_TREASURE_HUNT_API_KEY;
    const reqOptions = {
        headers: {
          Authorization: Token,
        }   
    }
    const data = { direction: direction };
    let prevRoom = this.currentRoom;
  
    axios
      .post(moveUrl, data, reqOptions)
      .then(response => {
        console.log(response.data)
        let currentRoom = (response.data);
        this.setState({ ...this.state, currentRoom: response.data });
      })
      .catch(err => console.log(err))
  };

  // cooldown_interval = () => {
  //   setInterval(() => {
  //     this.perambulate();
  //   }, 6000); //un-hard code this
  // };

  // componentWillUnmount() {
  //   clearInterval(this.interval);
  // }

  perambulate = () => {
    let currentRoom = this.currentRoom;
    console.log('Current room: ', currentRoom.room_id)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        </header>
        <div className="button-wrapper">
          <button onClick={this.move_request('n')}>North</button>
          <button onClick={this.move_request('s')}>South</button>
          <button onClick={this.move_request('e')}>East</button>
          <button onClick={this.move_request('w')}>West</button>
        </div>
      </div>
    );
  }
}

export default App;
