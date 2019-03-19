import React, { Component } from 'react';
import 'w3-css/w3.css';

export default class ShowDetails extends Component {

    render() {

      if(this.props.displayShow.showName!==""){
      return(
        <div class="w3-col s4">
         <h1>{this.props.displayShow.showName}</h1>
         <h3>
         {this.props.displayShow.showChannel!=="" ? this.props.displayShow.showChannel + " " : ""}
         {this.props.displayShow.showCountry!=="" ? "(" + this.props.displayShow.showCountry + ")" : ""}
         </h3>
         {/* render raw html using dangerouslySetInnerHTML */}
         <div dangerouslySetInnerHTML={{__html: this.props.displayShow.showDescription}} />
           {this.props.displayShow.showGenres!=="" ? <div><strong>Genres:</strong>{" "}{this.props.displayShow.showGenres}</div> : ""}
           {this.props.displayShow.showType!=="" ? <div><strong>Type:</strong>{" "}{this.props.displayShow.showType}</div> : ""}
           {this.props.displayShow.showLanguage!=="" ? <div><strong>Language:</strong>{" "}{this.props.displayShow.showLanguage}</div> : ""}
           {this.props.displayShow.showDate!=="" ? <div><strong>Premiered:</strong>{" "}{this.props.displayShow.showDate}</div> : ""}
           {this.props.displayShow.showStatus!=="" ? <div><strong>Status:</strong>{" "}{this.props.displayShow.showStatus}</div> : ""}
           {this.props.displayShow.showLink!=="" ? <a href={this.props.displayShow.showLink} target="new">Visit Official Site</a> : ""}
        </div>
       );
      }
      else{
        return(
          <div class="w3-col s4">
          </div>
         );
      }
       
    }
     
  }

