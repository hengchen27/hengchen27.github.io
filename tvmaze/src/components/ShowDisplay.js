import React, { Component } from 'react';
import 'w3-css/w3.css';
import ShowImage from './ShowImage.js';
import ShowDetails from './ShowDetails.js';
import CastList from './CastList.js';

export default class ShowDisplay extends Component {
   
      render() {
          return(
            <div>
              <div class="w3-row-padding">
              <ShowImage 
              imageURL = {this.props.displayShow.imageURL} />
              <ShowDetails
              displayShow = {this.props.displayShow}
              />
              <CastList 
              displayShow = {this.props.displayShow}
              onClick={()=>this.props.onClick()}
              searchCast = {this.props.searchCast}
              showCast = {this.props.showCast}
              />
              </div>
              
             </div>
           );
         
      }
       
    }



