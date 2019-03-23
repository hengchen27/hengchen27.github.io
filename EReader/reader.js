'use strict';

//create helper class
let  helper = new readerHelper();

//define book class
//id is the unique id that we use to identify the book
//content is the actual string in the html file for book
class Book {
    constructor(id, title, author, language, url, lastupdate, content, downloaded) {
      this.id = id;
      this.title = title;
      this.author = author;
      this.language = language;
      this.url = url;
      this.lastupdate = lastupdate;
      this.content = content;
      this.downloaded = downloaded;
    }

  }

//database obj to store all the books 
let localDB = {
        lastupdate: null,
        bookList: []
};

//this is the timer for continuously pulling data
let getDataTimer;

window.addEventListener('load', function() {

    document.querySelector("#books").addEventListener('click',function(){ helper.showSection('home') });
    document.querySelector("#currentBook").addEventListener('click',function(){ helper.showSection('bookContent') });

    //the first download is mandatory
    helper.downloadManifest();

    //here we do periodically checking of the manifest, and download only if it is expired
    //please notice that we only download the links, not the content
    //we only download the content if user requested the download by click download button
    getDataTimer = setInterval(function(){ helper.downloadManifest() }, 30000);

});

