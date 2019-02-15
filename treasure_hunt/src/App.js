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
      cooldown: '',
      errors: [],
      messages: [], 
      opposite_directions: {'n': 's', 's':'n', 'e': 'w', 'w': 'e'}
    };
    // this.perambulate = this.perambulate.bind(this);
    // this.move_request = this.move_request.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    const Token = `Token ${process.env.REACT_APP_TREASURE_HUNT_API_KEY}`;
    // console.log(Token)
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
        this.setState({ currentRoom: response.data.room_id, exits: response.data.exits, title: response.data.title, graph: graph, description: response.data.description, visited: visited, cooldown: response.data.cooldown});
      })
      .catch(err => console.log(err));
  };

  move_request = (direction) => {
    console.log(`Attempting to go in the following direction ${direction}`)
    // await this.cooldown_interval(ms)

    // console.log(`Just paused for ${ms} milliseconds`)
    const moveUrl = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/move/';
    const Token = `Token ${process.env.REACT_APP_TREASURE_HUNT_API_KEY}`;
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
        this.setState({currentRoom: response.data.room_id, exits: response.data.exits, title: response.data.title, graph: graph, description: response.data.description, visited: visited, cooldown: response.data.cooldown });
        if(Object.keys(this.state.visited).length < 500){
          setTimeout(this.perambulate, this.state.cooldown * 1000)
        }
      })
      .catch(err => {
        /*If there is an error log the response and set the cool down to the newly likely penalized cooldown */
        console.log(err.response)
        this.setState({cooldown : err.response.data.cooldown})
        setTimeout(this.perambulate, this.state.cooldown * 1000)
      })

      
  };

  save_map = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));  //pass in a string name, then data being saved wil be value
  };  
  
  cooldown_interval = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  route_finder = (currentRoom, path, graph) => {
    console.log(`The path is set: ${path}`)
    let room = currentRoom;
    const directions = [] 
    let count = 1 
    while (count < path.length){
      for(let exit in graph[room]){
        if(graph[room][exit] === path[count]){
          directions.push(exit)
          break; 
        }
      }
      room = path[count]
      count += 1
    }
    return directions
  };
/*BFS path */
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
    console.log(currentRoom, "currentRoom");
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
  
  perambulate = () => {
    let currentRoom = this.state.currentRoom;
    console.log('Current room: ', currentRoom)
    let backtrack = [];
    let rooms = [];
    let unexplored_exit = null;
    let traversal_path = [];
    // while (rooms.length < 500) {
      const visited = Object.assign({}, this.state.visited);
      // const ms = (this.state.cooldown * 1000) + 750
      

      if (traversal_path.length > 50) {
        console.log(traversal_path);
        // break;
      }
      /*Get the currentRoom */
      currentRoom = this.state.currentRoom

      /*check of the currentRoom is in rooms array if it is not add it */
      if(rooms.includes(currentRoom) === false){
        rooms.push(currentRoom);
      }

      /*After pushing the room check if we have reached 500 */
      if (rooms.length === 500) {
        console.log(this.state.graph, this.state.visited);
        // break;
        console.log("All finished")
        return 
      }

      /*check if a there is a set path already if it not find out if there is a direction untraveled */
      if (backtrack.length === 0) {
        console.log("find solo direction")
        unexplored_exit = this.direction_choices(currentRoom);
      }
      /*if there is no set path and after checking for a direction untraveled is null create a set path to a room with an untraveled exit */
      if (backtrack.length === 0 && unexplored_exit === null) {
            console.log('start backtrack')
            let retrace_path = this.backtracker(currentRoom, visited);
            console.log(retrace_path)
            backtrack = this.route_finder(currentRoom, retrace_path, visited);
            console.log(backtrack)
      } 

      /*This part of the code will make the move  if backtrack is greater than 0 we already have a preset path to follow take it
        else  use the direction returned from the direction_choices function. 
      */
      if (backtrack.length > 0) {
        console.log("traveling set path")
        console.log(backtrack)
        unexplored_exit = backtrack.shift();
        traversal_path.push(unexplored_exit);
        this.move_request(unexplored_exit);  //response updates
        // setTimeout(this.move_request(unexplored_exit), ms)
      } else {
        /*if there is no path*/
        if(unexplored_exit === null || unexplored_exit === undefined){
          /*The above is checking to make sure unexplored_exit is an actual direction if it is not return out of the function after console logging */
          console.log("SOMETHING IS WRONG")
          // break 
          return 
        } else {
          console.log("traveling one direction")
          traversal_path.push(unexplored_exit);
  
          this.move_request(unexplored_exit);
        }
        // setTimeout(this.move_request(unexplored_exit), ms)
      }

      
    // };
  };

  render() {
    let map = JSON.parse(localStorage.getItem('map'));
    console.log(map)
    let coordinates = JSON.parse(localStorage.getItem('coordinates'));
    console.log(coordinates)
    if(map){
      console.log(`Rooms visited so far: ${Object.keys(map).length}`)
    }
    console.log('Total rooms visited: ', Object.keys(this.state.visited).length);
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
          <p>Exits: {this.state.exits}</p>
          <p>Cooldown:{this.state.cooldown}</p>
        </div>
      </div>
    );
  };
};

export default App;