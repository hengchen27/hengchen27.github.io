class readerHelper {

    //for this helper we don't need input parameter
    constructor(){
        
    }

    dateDiffinMins(startDate, endDate) {
        return ((endDate.getTime() - startDate.getTime()) / (1000*60) );
    }

    getBookContentFromCacheByID(bookID, localDBFromCache){

        let bookContent = "";    
        localDBFromCache.bookList.forEach(function(bookInLocalDB){
            if(bookID == bookInLocalDB.id){
                bookContent = bookInLocalDB.content;
            }
        }); 
    
        return bookContent;
    }

    //this function will update the book list ul on page
    updateBookListInPage(){
        //remove existing ul content
        let ul = document.querySelector("#booklist");
        ul.innerHTML = "";

        //if the local DB is not set, instantiate the value
        if(localDB==null){
            localDB = {
                lastupdate: null,
                bookList: []
            };
        }

        let bookList = localDB.bookList;

        bookList.forEach(function(bookInLocalDB){
            let li = document.createElement("li");

            let bookLiContent = "";

            let bookLiID = "bookchecked" + bookInLocalDB.id;

            //first is the check box which allow user to download book content
            //the input from user will be a list of book ids

            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.name = "bookchecked";
            checkbox.value = bookInLocalDB.id;
            checkbox.id = bookLiID;

            let bookViewerID = "bookToView" + bookInLocalDB.id;
            //the anchor is used for user to trigger local JS to switch view and see book content

            let bookViewerLink = document.createElement('a');
            bookViewerLink.setAttribute('href',"#");
            bookViewerLink.setAttribute('id',bookViewerID);
            bookViewerLink.innerHTML = bookInLocalDB.title;

            //add event
            bookViewerLink.addEventListener('click',function(){ helper.readBook(bookInLocalDB.id) } );

            let icon = document.createElement('span');

            if(bookInLocalDB.downloaded == "Y"){
                icon.innerHTML = " &#128462;";
            }
            else{
                icon.innerHTML = " &#128459;";
            }

            li.appendChild(checkbox);
            li.appendChild(bookViewerLink);
            li.appendChild(icon);
            ul.appendChild(li);

            let anchorID = "#"+bookViewerID ;

        });

        //add download book button
        var downloadBtn = document.createElement("BUTTON");
        var downloadBtnTxt = document.createTextNode("Download Selected Books");
        downloadBtn.appendChild(downloadBtnTxt);
        downloadBtn.setAttribute("id", "downloadBook");

        //add delete cache button
        var removeCacheBtn = document.createElement("BUTTON");
        var removeBtnTxt = document.createTextNode("Remove Books");
        removeCacheBtn.appendChild(removeBtnTxt);
        removeCacheBtn.setAttribute("id", "removeBook");

        //append both buttons to list section

        var br = document.createElement("br");

        let buttonSection =  document.querySelector("#buttonSection");
        buttonSection.innerHTML = "";
        document.querySelector("#buttonSection").appendChild(downloadBtn);
        document.querySelector("#buttonSection").appendChild(document.createTextNode ("   "));
        document.querySelector("#buttonSection").appendChild(removeCacheBtn);

        //add event
        document.querySelector("#downloadBook").addEventListener('click',function(){ helper.downloadBook() });

        document.querySelector("#removeBook").addEventListener('click',function(){ helper.removeBooks() });
    }

    //this function should clear all the cache book content
    //the view will be updated also to clear all the books
    removeBooks(){

        localDB.bookList.forEach(function(bookInLocalDB){

            bookInLocalDB.content = "";
            bookInLocalDB.downloaded = "N";
        });

        localStorage.setItem("localDB", JSON.stringify(localDB) );

        localStorage.removeItem("ManifestDate");

        helper.updateBookListInPage();
    }

    //this function should take manifest file as input
    //and generate the new localDB array with last update date & update cache
    createBookList(booklist){

        //clear the local DB book list first
        localDB.bookList = [];

        //update the new manifest date
        localDB.lastupdate = booklist.lastupdate;
        localStorage.setItem("ManifestDate", localDB.lastupdate);

        //now generate new books and add them to the local DB
        let bookListInJson = booklist.books;

        bookListInJson.forEach(function(bookInJson){
            //create new book and add that to local db
            let newBook = new Book(bookInJson.id, bookInJson.title, bookInJson.author,bookInJson.language, bookInJson.url,bookInJson.lastupdate, null, 'N');
            localDB.bookList.push(newBook);
        });

        //finally, we cache the localDB by Json stringfy
        localStorage.setItem("localDB", JSON.stringify(localDB));

        console.log("The manifest has been reloaded! New update date is " + localDB.lastupdate.toString());
        console.log("Stringfy cache is "+ localStorage.getItem("localDB"));
    }

    showSection(page){

        let listSection = document.querySelector("#home");
        let readSection = document.querySelector("#bookContent");
    
        if(page=="home"){
            readSection.style.display = "none";
            listSection.style.display = "block";
        }else if(page=="bookContent"){
            readSection.style.display = "block";
            listSection.style.display = "none";
        }
    }

    updateBookContent(bookID, bookContent){
        localDB.bookList.forEach(function(bookInLocalDB){
            if(bookID == bookInLocalDB.id){
                bookInLocalDB.content = bookContent;
                //Set downloaded to Y
                bookInLocalDB.downloaded = "Y";
                //Do remember we need to cache the data in local storage also
                //later when we load the book content, we should load from cache
                localStorage.setItem("localDB", JSON.stringify(localDB));
            }
        });
    }

    //this function should download the selected books and write them to local DB / cache
    downloadBook(){
        var checkedBookIDs = document.querySelectorAll("input[name='bookchecked']:checked");

        checkedBookIDs.forEach(function(bookIDNode){

            //first get the book title and book url from local DB
            let bookID = bookIDNode.value;

            let bookTitle = helper.getBookTitleByID(bookID);

            let bookURL = helper.getBookURLByID(bookID);

            //next is to request book download through XHR
            let bookDownloader = new XMLHttpRequest(); //step 1 create downloader
            let fileName = "Books/"+bookURL;

            bookDownloader.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    //don't need to convert this as it is html
                    let bookContent = this.responseText;
                    //now update the bookContent in local DB
                    helper.updateBookContent(bookID, bookContent);

                    helper.updateBookListInPage();

                    console.log("Finish download book: "+ bookTitle + " at URL "+ fileName );

                    //console.log("Book content is " + bookContent );
                }
            };
            bookDownloader.open("GET", fileName, true); //step2
            bookDownloader.send(); //last step

            console.log("Start download book: "+ bookTitle + " at URL "+ fileName );
        });
    }

    //this function should first switch view, then load the book from cache
    readBook(bookID){

        let mode = "bookContent";

        helper.showSection(mode);

        let contentSection = document.querySelector("#contentSection");

        let tocSection = document.querySelector("#tocSection");

        let localDBFromCache = JSON.parse(localStorage.getItem("localDB"));

        let bookContent = helper.getBookContentFromCacheByID(bookID, localDBFromCache);

        //first load TOC using DOM parser, if the book content is not null
        if(bookContent != null && bookContent != ""){

            let parser = new DOMParser();

            let doc = parser.parseFromString(bookContent, "text/html");

            let tocContent = doc.querySelector("#toc").innerHTML;

            tocSection.innerHTML = "<table>" + tocContent + "</table>";

        }else{// if book content is null, we should remove any content that is left in TOC

            tocSection.innerHTML = "";
        }

        contentSection.innerHTML = bookContent;

    }

    getBookTitleByID(bookID){

        let bookTitle = "";

        localDB.bookList.forEach(function(bookInLocalDB){
            if(bookID == bookInLocalDB.id){
                bookTitle = bookInLocalDB.title;
            }
        });

        return bookTitle;
    }

    getBookURLByID(bookID){

        let bookURL = "";

        localDB.bookList.forEach(function(bookInLocalDB){
            if(bookID == bookInLocalDB.id){
                bookURL = bookInLocalDB.url;
            }
        });

        return bookURL;

    }

    downloadManifest(){

        //first check the current manifest date, if expired continue, otherwise return
        let manifestDateString = localStorage.getItem("ManifestDate");

        //for the first load, the manifest string should be empty or null, in which case we don't check expire period
        if(manifestDateString!=null&&manifestDateString!=""){

            //if the manifestDate is set, we should restore the localDB
            localDB = JSON.parse(localStorage.getItem("localDB"));

            helper.updateBookListInPage();

            let manifestDate = new Date(manifestDateString);

            let currentDate = new Date();

            let lastupdateDate = new Date(localDB.lastupdate);

            // this is to check manifest expire date, for now we put 5000 mins as expire period
            if(helper.dateDiffinMins(manifestDate,currentDate)<5000){
                return;
            }

            // this is to check last update date, for now we put 60 mins as the minimal reload interval
            // this is the last update time stamp, we use this ensure the refresh won't happen too frequently
            if(helper.dateDiffinMins(lastupdateDate,currentDate)<60){
                return;
            }
        }

        let manifestDownloader = new XMLHttpRequest(); //step 1 create downloader
        let fileName = "manifest.json";

        manifestDownloader.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                let currentManifestDate = localStorage.getItem("ManifestDate");
                let booklist = JSON.parse(this.responseText);

                //We only reload the manifest if the lastupdate in manifest.json has been changed
                if(currentManifestDate != booklist.lastupdate){
                    helper.createBookList(booklist);
                    helper.updateBookListInPage();

                    //save the date of last update, so that we should check later we don't need refresh within certain period of time
                    localDB.lastupdate = (new Date()).toString();
                    localStorage.setItem("localDB", JSON.stringify(localDB));
                }

            }
        };
        manifestDownloader.open("GET", fileName, true); //step2
        manifestDownloader.send(); //last step

    }
}