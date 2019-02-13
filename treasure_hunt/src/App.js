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
      graph: {},  //can use for coordinates
      visited: {},  //tracks where weve been
      currentRoom: '',
      prevRoom: '',
      room_id: '',
      title: '',
      description: '', 
      coordinates: '',
      players: [],
      items: [],
      exits: [],  //holds currentRoom exits.  this.state.exits.map so only create button if there is an exit that direction.
      cooldown: '',
      errors: [],
      messages: [], 
      opposite_directions: {'n': 's', 's':'n', 'e': 'w', 'w': 'e'}
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
        let currentRoom = (response.data.room_id);
        let coordinates = (response.data.coordinates);
        let x_coord = Number(coordinates.slice(1,3));
        let y_coord = Number(coordinates.slice(4,6));
        let graph = Object.assign({}, this.state.graph);
        let exits = response.data.exits;
        if (!(currentRoom in graph) ) {
          graph[currentRoom] = [x_coord, y_coord]
        }
        console.log(graph);
        let visited = Object.assign({}, this.state.visited);
        let cardinal_directions = ['n', 's', 'e', 'w']
        if (!(currentRoom in visited) ) {
          //if not in visited then dont have ? associated with each direction
          let temp = {};
          for (let direction of cardinal_directions) {
            if (exits.includes(direction)) {
              temp[direction] = '?'; //initialize question mark
            } else {
              temp[direction] = null;
            }
          }
          graph[currentRoom] = temp; //first time visit room update it with ?
        } else {
          //if currentRoom is in visited update. return exit directions, set to next room
          let next_room_id = null;
          next_room_id = visited[this.state.currentRoom.room_id];
          //data[next_room_id] = next_room_id;
        }
        this.setState({ ...this.state, currentRoom: response.data.room_id, exits: response.data.exits, title: response.data.title, graph: graph, description: response.data.description });
      })
      .catch(err => console.log(err));
  };

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
        let currentRoom = (response.data.room_id);
        let coordinates = (response.data.coordinates);
        let x_coord = Number(coordinates.slice(1,3));
        let y_coord = Number(coordinates.slice(4,6));
        let graph = Object.assign({}, this.state.graph);
        let exits = response.data.exits;
        if (!(currentRoom in graph) ) {
          graph[currentRoom] = [x_coord, y_coord]
        }
        console.log(graph);
        let visited = Object.assign({}, this.state.visited);
        let cardinal_directions = ['n', 's', 'e', 'w']
        if (!(currentRoom in visited) ) {
          //if not in visited then dont have ? associated with each direction
          let temp = {};
          for (let direction of cardinal_directions) {
            if (exits.includes(direction)) {
              temp[direction] = '?'; //initialize question mark
            } else {
              temp[direction] = null;
            }
          }
          graph[currentRoom] = temp; //first time visit room update it with ?
        } else {
          //if currentRoom is in visited update. return exit directions, set to next room
          let next_room_id = null;
          next_room_id = visited[this.state.currentRoom.room_id];
          //data[next_room_id] = next_room_id;
        }
        this.setState({ ...this.state, currentRoom: response.data.room_id, exits: response.data.exits, title: response.data.title, graph: graph, description: response.data.description });
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

  //opposite directions

  //bfs

  render() {
    return (
      <div className="App">
        <header className="App-header">
          Lambda Treasure Hunt
        </header>
        <div className="button-wrapper">
          <button onClick={() => this.move_request('n')}>North</button>
          <button onClick={() => this.move_request('s')}>South</button>
          <button onClick={() => this.move_request('e')}>East</button>
          <button onClick={() => this.move_request('w')}>West</button>
        </div>
        {/* <div className="button-wrapper-2">
          <button onClick={this.move_request}>Automatic Traversal</button>
        </div> */}
        <div className="room-info">
          <h3>You are here:</h3>
          <p>The room you are currently in is: {this.state.currentRoom.title} {this.state.currentRoom.room_id}</p>
          <p>Room description: {this.state.currentRoom.description}</p>
          <p>Exits: </p>
          <p>Cooldown: {this.state.currentRoom.cooldown}</p>
        </div>
      </div>
    );
  }
}

export default App;
