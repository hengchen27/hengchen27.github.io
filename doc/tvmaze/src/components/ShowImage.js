import React, { Component } from 'react';
import 'w3-css/w3.css';

export default class ShowImage extends Component {
   
    render() {
        return(
          <div className="w3-col s4">
          <img src={this.props.imageURL} alt="" class="w3-threequarter w3-margin-top"></img>
          </div>
         );
       
    }
     
  }
