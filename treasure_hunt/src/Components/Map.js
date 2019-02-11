import React, { Component } from 'react';
import axios from 'axios';

class Map extends React.Component {
    constructor() {
        super();
        this.state = {
            map: {},
            currentRoom: 0,
        };
    }

    componentDidMount() {
        this.init();
    }

    init = () => {
        const token = 'token ' + process.env.REACT_APP_TREASURE_HUNT_API_KEY;
        const initUrl = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/init/';

        axios
            .get(initUrl)
            .then(response => {

            })
            .catch(err => console.log(err));
    }

    render() {
        
    }

}

export default Map;