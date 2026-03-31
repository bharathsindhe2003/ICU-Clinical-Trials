import { firebase } from "./history_fb_module.js";
import { fb } from "../livepage/database_function.js";
import { showToast } from "../backend/toastmsg.js";

//console.log("fb",fb);

const element1 = document.getElementById("onehourbutton");
const element2 = document.getElementById("onedaybutton");
const element3 = document.getElementById("oneweekbutton");
const applybutton = document.getElementById("apply");
const cancelbutton = document.getElementById("cancel");

element1.addEventListener("click", onehourclick);
element2.addEventListener("click", onedayclick);
element3.addEventListener("click", oneweekclick);
applybutton.addEventListener("click", applyfunction);
cancelbutton.addEventListener("click", cancelfunction);
document.getElementById("onehourbutton").click();

export function onehourclick() {
  //$("#graphs").load(" #graphs > *");
  //$( "#graphs" ).load(window.location.href + " #graphs" );

  var max_time = Math.floor(Date.now() / 1000);
  max_time = Math.floor(max_time / 60);
  max_time = max_time * 60;
  var min_time = max_time - 3600;

  var localarray = [];
  var y = min_time * 1000;
  for (var i = 0; i < 60; i++) {
    localarray.push([y, null]);
    var x = y + 60000; //1000*60;
    y = x;
  }

  //console.log("localarray",localarray);
  document.getElementById("loader").className = "loader";
  firebase(min_time, max_time, localarray, 0);
}

export function onedayclick() {
  var max_time = Math.floor(Date.now() / 1000);
  max_time = Math.floor(max_time / 60);
  max_time = max_time * 60;
  console.log("max time on one day click:", max_time);
  var min_time = max_time - 3600 * 24; //(3600*24);
  console.log("min time on one day click:", min_time);

  var localarray = [];
  var y = min_time * 1000;
  for (var i = 0; i < 1440; i++) {
    localarray.push([y, null]);
    y = y + 60000;
  }
  console.log("localarray", localarray);
  document.getElementById("loader").className = "loader";
  firebase(min_time, max_time, localarray, 7);
}

export function oneweekclick() {
  var max_time = Math.floor(Date.now() / 1000);
  max_time = Math.floor(max_time / 60);
  max_time = max_time * 60;
  var min_time = max_time - 3600 * 168; //(3600*168);
  var localarray = [];
  var y = min_time * 1000;
  for (var i = 0; i < 168; i++) {
    localarray.push([y, null]);
    y = y + 3600000;
  }
  // console.log("localarray",localarray);
  document.getElementById("loader").className = "loader";
  firebase(min_time, max_time, localarray, 7);
}

function applyfunction() {
  var fromdate = document.getElementById("fromdate").value;
  var todate = document.getElementById("todate").value;
  var fromdate_timestamp = Date.parse(fromdate);
  console.log("mix time: ", fromdate_timestamp);
  var todate_timestamp = Date.parse(todate);
  console.log("mix time: ", todate_timestamp);
  var min_time = fromdate_timestamp / 1000;
  console.log("mix time: ", min_time);
  var max_time = todate_timestamp / 1000 + 86340;
  console.log("mix time: ", max_time);
  max_time = Math.floor(max_time / 60);
  max_time = max_time * 60;
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  currentDate = Math.floor(currentDate.setHours(0, 0, 0) / 1000);

  var SetTotality = (max_time - min_time) / 60;

  //console.log("range is : ",(min_time-max_time));
  if (max_time > currentDate) {
    showToast("Please select the To date until the present day");
  } else if (min_time > max_time) {
    showToast("'To' date should be greater than 'From' date, Kindly enter valid days");
  } else if (max_time - min_time > 604800) {
    showToast("Select only between 7 days");
  }
  //if((max_time-min_time)<=604800 && !(min_time>max_time) )
  else {
    var localarray = [];
    var y = min_time * 1000;
    console.log("total", SetTotality);
    for (var i = 0; i < SetTotality; i++) {
      localarray.push([y, "-"]);
      y = y + 60000;
    }
    console.log("localarray1", localarray);
    document.getElementById("loader").className = "loader";
    firebase(min_time, max_time, localarray, 7);
  }

  /*   switch(min_time){
        case (max_time-min_time)<= 3600:
            firebase(min_time,max_time,localarray,0);
            break;
        case (max_time-min_time)<= 7200 && (max_time-min_time)>3600:
            firebase(min_time,max_time,localarray,0);
            break;
        case (max_time-min_time)<= 10800 && (max_time-min_time)>7200:
            firebase(min_time,max_time,localarray,7);
            break;
        case (max_time-min_time)<= 14400 && (max_time-min_time)>10800:
            firebase(min_time,max_time,localarray,7);
            break;
        case (max_time-min_time)<= 18000 && (max_time-min_time)>14400://3600000  15552000
             firebase(min_time,max_time,localarray,7);
            break;
        case (max_time-min_time)<= 21600 && (max_time-min_time)>18000://3600000  
            firebase(min_time,max_time,localarray,7);
             break;
        default :
            firebase(min_time,max_time,localarray,0);
            break; 
    } */
}

function cancelfunction() {
  var fromdate = document.getElementById("fromdate");
  var todate = document.getElementById("todate");
  fromdate.value = "";
  todate.value = "";
}

/* switch (option_clicked) {
	
    case "want_hour":
        mintime=max_time-3200;//1637585100;
        break;
    case "want_day":
        mintime=max_time-(3200*24);
        break;
    case "want_week":
        mintime=max_time-(3200*168);
        break;
    
    case "want_custom":
        var fromdate = document.getElementById("fromdate").value;
        var todate = document.getElementById("todate").value;
        var fromdate_timestamp = Date.parse(fromdate);
        var todate_timestamp = Date.parse(todate);
        mintime=fromdate_timestamp;
        max_time=todate_timestamp;
    break;
} */
