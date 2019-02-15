import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

//import Map from './Components/Map';

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
      cooldown: 10,
      errors: [],
      messages: [], 
      opposite_directions: {'n': 's', 's':'n', 'e': 'w', 'w': 'e'}
    };
    this.perambulate = this.perambulate.bind(this);
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
        console.log(currentRoom);
        let coordinates = (response.data.coordinates);
        let x_coord = Number(coordinates.slice(1,3));
        let y_coord = Number(coordinates.slice(4,6));
        let graph = Object.assign({}, this.state.graph);
        let exits = response.data.exits;
        console.log(exits)
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
          console.log(visited);
        } 
        this.setState({ currentRoom: response.data.room_id, exits: response.data.exits, title: response.data.title, graph: graph, description: response.data.description, visited: visited, cooldown: response.data.cooldown });
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
        visited[currentRoom][this.state.opposite_directions[direction]] = this.state.currentRoom;
        visited[this.state.currentRoom][direction] = currentRoom;
        console.log(visited)
        this.save_map('map', visited);
        this.save_map('coordinates', graph);
        this.setState({ ...this.state, currentRoom: response.data.room_id, exits: response.data.exits, title: response.data.title, graph: graph, description: response.data.description, visited: visited, cooldown: response.data.cooldown });
      })
      .catch(err => console.log(err))
  };

  save_map = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));  //pass in a string name, then data being saved wil be value
  };  
  
  cooldown_interval = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  route_finder = (currentRoom, path, graph) => {
    let directions = [];
    for (let i in path) {
      let next_room = path[i];
      for (let direction in graph[currentRoom]) {
        if (graph[currentRoom] === next_room) {
          directions.push(direction);
        }
      }
    }
    return directions;
  };

  backtracker = currentRoom => {
    let queue = [];
    let visited = [];  // can we use visited from outside this function? or call this something else? 
    let graph = Object.assign({}, this.state.visited);
    queue.push([currentRoom]);
    while (queue.length > 0) {
      let path = queue.shift();
      console.log("path: ", path)
      let room_number = path[path.length - 1];
      if (visited.includes(room_number) === false) {
        visited.push(room_number);
        for (let exit in graph[room_number]) {
          console.log('exit', exit);
          if(graph[room_number][exit] === "?") {
            return path;
          } else { 
            let duplicate_path = path.slice();  //slice adds shallow copy
            duplicate_path.push(graph[room_number][exit]);
            queue.push(duplicate_path);
          }
        }
      };
    }
    console.log('no path')
    return []
  };

  direction_choices = currentRoom => {
    console.log(currentRoom);
    console.log(this.state.exits);
    if (this.state.exits.includes('n') && this.state.visited[currentRoom]['n'] === "?") {
      console.log('move north')
      return 'n';
    } else if (this.state.exits.includes('s') && this.state.visited[currentRoom]['s'] === "?") {
      console.log('move south')
      return 's';
    } else if (this.state.exits.includes('e') && this.state.visited[currentRoom]['e'] === "?") {
      console.log('move east')
      return 'e';
    } else if (this.state.exits.includes('w') && this.state.visited[currentRoom]['w'] === "?") {
      console.log('move west')
      return 'w';
    } else {
      console.log('null path')
      return null;
    }
  };

  async perambulate() {
    let currentRoom = this.state.currentRoom;
    console.log('Current room: ', currentRoom)
    let backtrack = [];
    let rooms = [];
    let unexplored_exit = null;
    let traversal_path = [];
    while (Object.keys(this.state.visited).length < 500) {
      const visited = Object.assign({}, this.state.visited);
      currentRoom = this.state.currentRoom
      rooms.push(currentRoom);
      if (backtrack.length === 0) {
        unexplored_exit = this.direction_choices(currentRoom);
      }

      if (backtrack.length === 0 && unexplored_exit === null) {
            console.log('start backtrack')
            let retrace_path = this.backtracker(currentRoom, visited);
            console.log(retrace_path)
            backtrack = this.route_finder(currentRoom, retrace_path, visited);
            console.log(backtrack)
      } 

      if (backtrack.length > 0) {
        console.log(backtrack)
        unexplored_exit = backtrack.shift();
        traversal_path.push(unexplored_exit);
        this.move_request(unexplored_exit);  //response updates
      } else {
        traversal_path.push(unexplored_exit);
        this.move_request(unexplored_exit);  
      }

      if (Object.keys(visited).length === 500) {
        console.log(this.state.graph, this.state.visited);
        break;
      }
      // if (traversal_path.length > 5) {
      //   console.log(traversal_path);
      //   break;
      // }
      await this.cooldown_interval(this.state.cooldown*3000);
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
        <div className="button-wrapper-2">
          <button onClick={this.perambulate}>Automatic Traversal</button>
        </div>
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
