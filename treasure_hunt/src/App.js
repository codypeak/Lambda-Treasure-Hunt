import React, { Component } from 'react';
import './App.css';

console.log(process.env.REACT_APP_TREASURE_HUNT_API_KEY)

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graph: {},
    };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        
        </header>
      </div>
    );
  }
}

export default App;
