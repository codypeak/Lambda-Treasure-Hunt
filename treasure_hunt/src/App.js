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
      room_id: '',
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
    let prevRoom = this.state.currentRoom;
  
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
  //   }, 4000); //un-hard code this
  // };

  // componentWillUnmount() {
  //   clearInterval(this.interval);
  // }

  // perambulate = () => {
  //   let currentRoom = this.state.currentRoom;
  //   console.log('Current room: ', currentRoom.room_id)
  // }

  save_map = (direction, currentRoom, prevRoom) => {
    localStorage.setItem('map', JSON.stringify(map));

    let map = JSON.parse(localStorage.getItem('map'));
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          Lambda Treasure Hunt
        </header>
        <div className="button-wrapper">
          <button onClick={this.move_request('n')}>North</button>
          <button onClick={this.move_request('s')}>South</button>
          <button onClick={this.move_request('e')}>East</button>
          <button onClick={this.move_request('w')}>West</button>
        </div>
        <div className="button-wrapper-2">
          <button onClick={this.move_request()}>Automatic Traversal</button>
        </div>
        <div className="room-info">
          <h3>You are here:</h3>
          <p>The room you are currently in is: ${this.state.currentRoom.title} ${this.state.currentRoom.room_id}</p>
          <p>Room description: ${this.state.currentRoom.description}</p>
          <p>Exits: </p>
          <p>Cooldown: ${this.state.currentRoom.cooldown}</p>
        </div>
      </div>
    );
  }
}

export default App;
