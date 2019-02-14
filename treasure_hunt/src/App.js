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

  save_map = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));  //pass in a string name, then data being saved wil be value
  };  
  
  cooldown_interval = () => {
    setInterval(() => {
      this.perambulate();
      console.log('cooldown: ', this.state.currentRoom.cooldown);
    }, 4000); //un-hard code this. set it to response data for penalties etc? 
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  route_finder = (currentRoom, path, graph) => {
    let directions = [];
    for (let i in path) {
      next_room = path[i];
      for (let direction in graph[this.state.currentRoom]) {
        if (graph[this.state.currentRoom] === next_room) {
          directions.push(direction);
        }
      }
      let currentRoom = visited[this.state.currentRoom][directions.length - 1];  
      //return directions?
    }
  };

  backtracker = currentRoom => {
    let queue = [];
    let visited = [];  // can we use visited from outside this function? or call this something else? 
    let map = JSON.parse(localStorage.getItem('map'));
    queue.push([currentRoom]);
    while (queue.length > 0) {
      let path = queue.shift();
      console.log("path: ", path)
      let room_number = path[path.length - 1];
      if (!visited.includes(room_number)) {
        visited.push(room_number);
        for (let exit of Object.entries(map[room_number])) {
          console.log('exit', exit);
          if(map[room_number][exit] === "?") {
            return path;
          } else { 
            let duplicate_path = path.slice();  //slice adds shallow copy
            duplicate_path.push(map[room_number][exit]);
            queue.push(duplicate_path);
          }
        }
      };
    }
  };

  direction_choices = currentRoom => {
    if ('n' in visited[this.state.currentRoom] && visited[this.state.currentRoom]['n'] === "?") {
      return 'n';
    } else if ('s' in visited[this.state.currentRoom] && visited[this.state.currentRoom]['s'] === "?") {
      return 's';
    } else if ('e' in visited[this.state.currentRoom] && visited[this.state.currentRoom]['e'] === "?") {
      return 'e';
    } else if ('w' in visited[this.state.currentRoom] && visited[this.state.currentRoom]['w'] === "?") {
      return 'w';
    }
  };

  perambulate = () => {
    let currentRoom = this.state.currentRoom;
    console.log('Current room: ', currentRoom.room_id)
    let backtrack = [];
    let rooms = [];
    let traversal_path = [];
    while (visited.length < 500) {
      rooms.push(currentRoom);
      if (backtrack.length === 0) {
        let unexplored_exit = direction_choices(currentRoom);
          if (!unexplored_exit) {
            let retrace_path = this.backtracker(currentRoom, visited);
            let backtrack = this.route_finder()
          } else {
            traversal_path.append(unexplored_exit);
            let next_room = graph[currentRoom.length - 1][unexplored_exit];  //this.state?  
            let prev_direction = this.state.opposite_directions[unexplored_exit];
            let next_room = visited[currentRoom][unexplored_exit];
            let currentRoom = visited[next_room][prev_direction];
            let currentRoom = next_room;
          }
      } else {
        let unexplored_exit = this.backtrack.unshift();
        //copy paste
      }
    };
  };

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
  };
};

export default App;
