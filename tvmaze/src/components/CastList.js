import React, { Component } from 'react';
import 'w3-css/w3.css';
import '../style.css';
export default class CastList extends Component {
  // constructor(props) {
  //   super(props);
  //   this.myRef = React.createRef();
  // }

  getCastIMG(index){
    let result = null;
    if(this.props.searchCast[index]!=null&&this.props.searchCast[index].person!=null&&this.props.searchCast[index].person.image!=null){
      result = this.props.searchCast[index].person.image.medium;
    }else{
      result = "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
    }
    return result;
  }

  getCastList(){

    let result = null;

    console.log(this.props.searchCast);

    //if searchCast is null or empty, show cast list not available 
    if(this.props.searchCast!==null && this.props.searchCast.length!==0){
      result = this.props.searchCast.map((currElement, castIndex) => 
      <li key={castIndex} class="w3-bar">
      <div className="small-image">
      <img src={this.getCastIMG(castIndex)} class="w3-bar-item w3-hide-small w3-quarter" alt={currElement.person.name} />
      </div>
      <div class="w3-bar-item" className="side-info"><span class="w3-large">
      {currElement.person.name}</span><br/><span>{currElement.character.name}</span></div>
      </li>  
      )
    }else{
      result = "Cast list not available";
    }

    return result;
  }

    render() {
      
      if(this.props.displayShow.showName!==""){
        //if the castlist button is not clicked
        if(this.props.showCast[this.props.displayShow.showIndex]==="N"){
        return(
          <div class="w3-col s4">
            <div class="w3-sidebar">
            <p>
              <button 
                class="w3-button w3-round-large w3-blue-grey" 
                onClick={()=>this.props.onClick()}>
                Retrieve Cast Information</button>
            </p>  
            </div>
    
          </div>
        );}
        else{
          return(
            <div class="w3-col s4">
            <div className="full-width" class="w3-sidebar">
            <h3>Cast List({this.props.searchCast.length})</h3>
            <ul class="w3-ul">
              {this.getCastList()}
            </ul>
            </div>  
            </div>
          );}
    }
    else{
      return(
        <div class="w3-col s4">
          <div class="w3-sidebar">   
          </div>
        </div>
       );
    }
     
  }
}