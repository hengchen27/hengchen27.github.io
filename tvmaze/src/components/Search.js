import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';
import 'w3-css/w3.css';

 export default class Search extends Component {

    constructor(props) {
      super(props);
   
      // This binding is necessary to make `this` work in the callback
      this.onChange = this.onChange.bind(this); 
      this.debouncedOnChange = _.debounce(this.debouncedOnChange.bind(this), 500); 
    }
    onChange(event) {
      this.debouncedOnChange(event.target.value); // sending only the values not the entire event
    }
   
    debouncedOnChange(value) {
      this.search(value); // perform a search only once every 500ms
    }
   
    search(value) {
      // fetch objects from web service
      axios.get("http://api.tvmaze.com/search/shows?q="+value)
      .then (response => {
      const shows = response.data;
      this.props.callbackFromParent(shows);
      console.log(shows);
    })
    }
   componentDidMount(){
     this.textInput.focus();
     
   }
    
    render() {
        return(
          <div>
            {/* add ref to bind the input field to this.textInput, so that it can be focused after mount */}
            <input className="w3-bar-item w3-input w3-border" placeholder="Enter search text..." ref={(input) => {this.textInput = input;}}
            defaultValue="" onChange={this.onChange}/>
            {/* <span class = "w3-padding-large w3-bar-item">No results found...</span> */}
           </div>
         );
       
    }
     
  }
