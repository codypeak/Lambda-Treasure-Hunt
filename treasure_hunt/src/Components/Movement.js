import React, { Component } from 'react';
import axios from 'axios';
import ReactTimeout from 'react-timeout';



class Movement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    move = () => {
        const moveUrl = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/move/'
    }
}

export default Movement;

// {
//     "room_id": 0,
//     "title": "Room 0",
//     "description": "You are standing in an empty room.",
//     "coordinates": "(60,60)",
//     "players": [],
//     "items": ["small treasure"],
//     "exits": ["n", "s", "e", "w"],
//     "cooldown": 60.0,
//     "errors": [],
//     "messages": []
//   }