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
          visited[currentRoom] = temp; //first time visit room update it with ?
        } 
        this.setState({ ...this.state, currentRoom: response.data.room_id, exits: response.data.exits, title: response.data.title, graph: graph, description: response.data.description, visited: visited });
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
    //let prevRoom = this.state.currentRoom;
  
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
        console.log(visited);
        let cardinal_directions = ['n', 's', 'e', 'w']
        if (!(currentRoom in visited) ) {
          console.log('visited conditional')
          //if not in visited then dont have ? associated with each direction
          let temp = {};
          for (let d of cardinal_directions) {
            if (exits.includes(d)) {
              temp[d] = '?'; //initialize question mark
            } else {
              temp[d] = null;
            }
          }
          visited[currentRoom] = temp; //first time visit room update it with ?
        };
        console.log(visited[currentRoom]);
        console.log(visited[this.state.currentRoom]);
        visited[currentRoom][this.state.opposite_directions[direction]] = this.state.currentRoom;
        visited[this.state.currentRoom][direction] = currentRoom;
        this.save_map('map', visited);
        this.save_map('coordinates', graph);
        this.setState({ ...this.state, currentRoom: response.data.room_id, exits: response.data.exits, title: response.data.title, graph: graph, description: response.data.description, visited: visited });
      })
      .catch(err => console.log(err))
  };
//   `graph[response.data.room_id][opposite] = this.state.roomId;`
// `graph[this.state.roomId][direction] = response.data.room_d`
// `opposite = inverse[direction]`

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

  save_map = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));  //pass in a string name, then data being saved wil be value
  };  

  //bfs

  render() {
    let map = JSON.parse(localStorage.getItem('map'));
    console.log(map)
    let coordinates = JSON.parse(localStorage.getItem('coordinates'));
    console.log(coordinates)
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
          <p>The room you are currently in is: {this.state.title} {this.state.room_id}</p>
          <p>Room description: {this.state.description}</p>
          <p>Exits: </p>
          <p>Cooldown: {this.state.cooldown}</p>
        </div>
      </div>
    );
  }
}

export default App;
