import React, { Component } from 'react';
import 'w3-css/w3.css';

//<a href="#32469" class="w3-bar-item w3-button w3-border-bottom w3-padding-large"><img src="https://static.tvmaze.com/uploads/images/medium_portrait/130/325068.jpg" alt="Ku Pao Ying Xiong" style="width: 30px; margin-right: 20px;"><img src="https://static.tvmaze.com/uploads/images/original_untouched/130/325068.jpg" alt="Ku Pao Ying Xiong" style="display: none;">Ku Pao Ying Xiong</a>

export default class SearchResults extends Component {

 
   
  getResultURL(index){
    let result = null;
    if(this.props.searchResults[index]!=null){
      result = this.props.searchResults[index].show.url;
    }
    return result;
  }

  getResultIMGMedium(index){
    let result = null;
    //null checking for the search results - show - image
    if(this.props.searchResults[index]!=null&&this.props.searchResults[index].show!=null&&this.props.searchResults[index].show.image!=null){
      result = this.props.searchResults[index].show.image.medium;
    }
    //if we are not getting the result, make it default blank image URL
    if(result===null||result===""){
      result = "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
    }
    return result;
  }

  getResultIMGOriginal(index){
    let result = null;
    if(this.props.searchResults[index]!=null&&this.props.searchResults[index].show!=null&&this.props.searchResults[index].show.image!=null){
      result = this.props.searchResults[index].show.image.original;
    }
    return result;
  }

  getResultName(index){
    let result = null;
    if(this.props.searchResults[index]!=null&&this.props.searchResults[index].show!=null){
      result = this.props.searchResults[index].show.name;
    }
    return result;
  }

  getResultList(){
    
    let result = null;

    if(this.props.searchResults!=null && this.props.searchResults.length!==0){
      result = this.props.searchResults.map((currElement, index) => 
      <a key={index} onClick={() => this.props.onClick(index)} 
      href="#" class="w3-bar-item w3-button w3-border-bottom w3-padding-large">
      <img src={this.getResultIMGMedium(index)} alt="" class="w3-margin-right w3-quarter"/>
      <img src={this.getResultIMGOriginal(index)} alt="" class="w3-hide"/>
      {this.getResultName(index)}
      </a>  )
    }
    else{
      result = "No results found...";
    }

    return result;
  }

    render() {
        return(
          <div><span className = "w3-padding-large w3-bar-item">
            {this.getResultList()}
            {/* <a href={this.getResultId()} class= "w3-bar-item w3-button w3-border-bottom w3-padding-large">
            </a> */}
            </span>
           </div>
           
         );
       
    }
     
  }