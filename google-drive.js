/*****
Bytutorial.com - online community to share articles for web and mobile programming and designers.
Author: Andy Suwandy

NOTE: Please change the CLIENT ID by creating your own app in google.
In order to work in your local computer, please change the client ID in the code and set the url of where the google drive app will be loaded.
otherwise you should get an error message saying the url you try to load does not match.
****/

/******************** GLOBAL VARIABLES ********************/
var SCOPES = ['https://www.googleapis.com/auth/drive.readonly','profile'];
var CLIENT_ID = '188213722395-8esls22msc5lh8jg5a5op7kl295461as.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBJWkkB9pbWWeW0jYPuE_Cl6dsF00xY2yk';
var FOLDER_NAME = "";
var FOLDER_ID = "1N4FuIVey9NQyzBaew3w9p2G0-6kNxc7u";//best "1bh7FKcJQWgzN1Qq0NQca_WEgCuHa9dUj"; //"root";
var FOLDER_PERMISSION = true;
var NO_OF_FILES = 1000;
var DRIVE_FILES = [];
var FILE_COUNTER = 0;
var FOLDER_ARRAY = [];

/******************** AUTHENTICATION ********************/

 function handleClientLoad() {
	// Load the API client and auth2 library
	gapi.load('client:auth2', initClient);
}

//authorize apps
 function initClient() {
	gapi.client.init({
		//apiKey: API_KEY, //THIS IS OPTIONAL AND WE DONT ACTUALLY NEED THIS, BUT I INCLUDE THIS AS EXAMPLE
		clientId: CLIENT_ID,
		scope: SCOPES.join(' ')
	}).then(function () {
	  // Listen for sign-in state changes.
	  gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
	  // Handle the initial sign-in state.
	  updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	});
}


//check the return authentication of the login is successful, we display the drive box and hide the login box.
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
	    $("#drive-box").show();
	    $("#drive-box").css("display","inline-block");
            $("#login-box").hide();
            getDriveFiles();
	} else {
	    $("#login-box").show();
            $("#drive-box").hide();
	}
}

function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
	if(confirm("Are you sure you want to logout?")){
		gapi.auth2.getAuthInstance().signOut();
	}
}

/******************** END AUTHENTICATION ********************/


/******************** PAGE LOAD ********************/
$(function(){
	
});

/******************** END PAGE LOAD ********************/

/******************** DRIVER API ********************/
function getDriveFiles(){
	showStatus("Loading Google Drive files...");
    gapi.client.load('drive', 'v2', getFiles);
}

function getFiles(){
	var query = "";
    query = "trashed=false and '" + FOLDER_ID + "' in parents";

    var request = gapi.client.drive.files.list({
        'maxResults': NO_OF_FILES,
        'q': query,
	'fields': 'items(id, mimeType, shortcutDetails, parents, thumbnailLink, alternateLink, title)'
    });

    request.execute(function (resp) {
       if (!resp.error) {
            DRIVE_FILES = resp.items;
           buildFiles();
	   getAllThumbnails();
       }else{
            showErrorMessage("Error: " + resp.error.message);
       }
    });
}

var thumbnailLinks = [];

function getThumbnail(thumbnailIndex) {
    var request = gapi.client.drive.files.get({
        'fileId': DRIVE_FILES[thumbnailIndex].shortcutDetails.targetId,
	'fields': 'id, mimeType, thumbnailLink, title'
    });

    request.execute(function (resp) {
       if (!resp.error) {
	   var previewImages = document.getElementsByClassName("image-preview");
	   var thumbnailLink = resp.thumbnailLink;
	   previewImages[thumbnailIndex].innerHTML = "<a href='" + thumbnailLink.replace("s220", "s1600") +
	       "' data-lightbox='image-" + thumbnailIndex + "'><img src='" + thumbnailLink + "'/></a>";
       }else{
            showErrorMessage("Error: " + resp.error.message);
       }
    });

}


function getAllThumbnails() {
    var len = DRIVE_FILES.length;
    for(var i = 0; i < len; i++) {
	getThumbnail(i);
    }
}

function buildFiles(){
	var fText = "";
    if (DRIVE_FILES.length > 0) {
        for (var i = 0; i < DRIVE_FILES.length; i++) {
	    DRIVE_FILES[i].parentID = (DRIVE_FILES[i].parents.length > 0) ? DRIVE_FILES[i].parents[0].id : "";
	    DRIVE_FILES[i].thumbnailLink = DRIVE_FILES[i].thumbnailLink || '';
	    DRIVE_FILES[i].fileType =  (DRIVE_FILES[i].mimeType === "application/vnd.google-apps.folder") ? "folder" : "file";
	    var textTitle = DRIVE_FILES[i].title;
	    
            fText += "<div class='" + DRIVE_FILES[i].fileType + "-box'>";
	    if (DRIVE_FILES[i].fileType == "file") {
		if (DRIVE_FILES[i].thumbnailLink) {
		    fText += "<div class='image-icon'><div class='image-preview'><a href='" +
			DRIVE_FILES[i].thumbnailLink.replace("s220", "s800") +
			"' data-lightbox='image-" + i + "'><img src='" +
			DRIVE_FILES[i].thumbnailLink + "'/></a></div></div>";
		}else {
		    var altLink = DRIVE_FILES[i].alternateLink;
		    altLink = altLink.replace(/\/view.*/, "");

		    var imgElement = "<img src='images/undefined-icon.png' alt='Image: " + textTitle + "' > </img>";
		    fText += "<div class='file-icon'><div class='image-preview'>" + imgElement + "</div></div>";
		}
	    }
	    fText += "<div class='item-title'>" + DRIVE_FILES[i].title + "</div>";

	    //button actions
	    var id = DRIVE_FILES[i].id;
	    
	    //closing div    
	    fText += "</div>";
        }
    } else {
        fText = 'No files found.';
    }
    hideStatus();
    $("#drive-content").html(fText);
}

var slidesInited = false;
function openImageDetail(imageIndex) {
    var win = window.open('slide.html', 'slide_window', 'width=500,height=500');
    var len = DRIVE_FILES.length;
    if (!slidesInited) {
	var imageLinks = [];
	for (var i = 0; i < len; i++) {
	    var altLink = DRIVE_FILES[i].shortcutDetails.targetId;
	    imageLinks[i] = altLink;
	}
	win.imageLinks = imageLinks;
	win.console = console;
	win.onload = function () {
	    win.init();
	}
	slidesInited = true;
    }
    //win.showSlide(imageIndex);
}



/******************** END DRIVER API ********************/



/******************** NOTIFICATION ********************/

//show status message
function showStatus(text) {
    $("#status-message").show();
    $("#status-message").html(text);
}

//hide status message
function hideStatus() {
    $("#status-message").hide();
    $("#status-message").html("");
}


//show error message
function showErrorMessage(errorMessage) {
    $("#error-message").html(errorMessage);
    $("#error-message").show(100);
    setTimeout(function () {
        $("#error-message").hide(100);
    }, 3000);
}

/******************** END NOTIFICATION ********************/
