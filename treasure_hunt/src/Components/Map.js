import React, { Component } from 'react';
import axios from 'axios';
require("dotenv").config();


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
        return(
            <div>

            </div>
        )
    }

}

export default Map;