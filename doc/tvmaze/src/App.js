import React, { Component } from 'react';
import 'w3-css/w3.css';
import axios from 'axios';
import Search from './components/Search.js';
import SearchResults from './components/SearchResults.js';
import ShowDisplay from './components/ShowDisplay.js';

class App extends Component {

  constructor(props){
    super(props)
    this.state={
      //this is the search result array returned by api services
      searchResults: [],
      //this is array for storing all shows' cast list (10) 
      searchCastList:Array(10).fill(null),
      //set this to Y if user click the button from cast list
      showCast: Array(10).fill("N"),
      //this is the show object to render the showImage, showDetails and castList
      displayShow: {
        showIndex : "",
        showID : "",
        imageURL : "",
        showName : "",
        showChannel: "",
        showCountry: "",
        showDescription:"",
        showGenres: "",
        showType: "",
        showLanguage: "",
        showDate: "",
        showStatus: "",
        showLink: "",
      },
    }
  }
  //this is for handling clicking on castlist button
  displayCastList(){
   //cast result for a show
   let castResult = [];
   let currentIndex = this.state.displayShow.showIndex;
   //Set the showCast[index] to true
   const showCastCopy = this.state.showCast;
   //replace the current index of showcast to "Y"
   showCastCopy.splice(currentIndex, 1, "Y"); 
   
    axios.get("http://api.tvmaze.com/shows/"+this.state.displayShow.showID + "/cast")
      .then (response => {
      castResult = response.data;
      console.log(castResult);

      //replace the show cast list at this index
      const searchCastListCopy = this.state.searchCastList;
      searchCastListCopy.splice(currentIndex, 1, castResult);

      this.setState({ 
        searchCastList: searchCastListCopy,
        showCast: showCastCopy,
       });
    })
    
  }

  // datafromChild is the searchResults received from api call in search Component
  myCallback = (dataFromChild) => {
    this.setState({ searchResults: dataFromChild,
      //clear the searchCastList and showCast when the new shows info are received by search
                    searchCastList:Array(10).fill(null),
                    showCast: Array(10).fill("N"),
    });
  }
//this is for handling clicking on result list
  handleClick(i){
    let url = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.image!=null&&
      this.state.searchResults[i].show.image.original!=null){
        url = this.state.searchResults[i].show.image.original;
    }else{
        url = "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
    }

    let tvName = "";
    if(this.state.searchResults[i].show!=null){
      tvName = this.state.searchResults[i].show.name;
    }
    
    let tvChannel = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.network!=null&&
      this.state.searchResults[i].show.network.name!=null){
      tvChannel = this.state.searchResults[i].show.network.name;
    }
    
    let tvCountry = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.network!=null&&
      this.state.searchResults[i].show.network.country!=null
      &&this.state.searchResults[i].show.network.country.name!=null){
      tvCountry = this.state.searchResults[i].show.network.country.name;  
    }
     
    let tvDescription = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.summary!=null){
       tvDescription = this.state.searchResults[i].show.summary;
       tvDescription = tvDescription.replace(/"/g, '');
      }

    let tvGenres = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.genres!=null){
      tvGenres = this.state.searchResults[i].show.genres.join();
    }  

    let tvType = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.type!=null){
      tvType = this.state.searchResults[i].show.type;
    }

    let tvLanguage = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.language!=null){
      tvLanguage = this.state.searchResults[i].show.language;
    }

    let tvDate = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.premiered!=null){
      tvDate = this.state.searchResults[i].show.premiered;
    }

    let tvStatus = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.status!=null){
      tvStatus = this.state.searchResults[i].show.status;
    }

    let tvLink = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.officialSite!=null){
      tvLink = this.state.searchResults[i].show.officialSite;
    }
    let tvID = "";
    if(this.state.searchResults[i].show!=null&&this.state.searchResults[i].show.id!=null){
      tvID = this.state.searchResults[i].show.id;
    }

    this.setState({
      displayShow: {
        showIndex: i,
        showID: tvID,
        imageURL: url,
        showName: tvName,
        showChannel: tvChannel,
        showCountry: tvCountry,
        showDescription: tvDescription,
        showGenres: tvGenres,
        showType: tvType,
        showLanguage: tvLanguage,
        showDate: tvDate,
        showStatus: tvStatus,
        showLink: tvLink,
      },
    });


  }

  render() {
    return (
      <div>
        <div className="w3-sidebar w3-light-grey w3-bar-block w3-card-4" style={{ width:'20%' }}>
          <img style={{width:'100%'}} src="https://static.tvmaze.com/images/tvm-header-logo.png" alt='' />
          {/* pass down the myCallback to search component, to get the searchresults when search input changes */}
          <Search callbackFromParent={this.myCallback}/>
          <SearchResults 
          onClick = {(i) => this.handleClick(i)}
          searchResults={this.state.searchResults}/>
        </div>         
        <div style={{ marginLeft:'20%' }}>
          <div className="w3-container">
          <ShowDisplay
           displayShow = {this.state.displayShow}
           onClick = {() => this.displayCastList()}
           //  pass down the cast list for the selected show
           searchCast = {this.state.searchCastList[this.state.displayShow.showIndex]}
           showCast = {this.state.showCast}
           />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
