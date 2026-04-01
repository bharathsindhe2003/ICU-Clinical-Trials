import { firebase } from "./history_fb_module.js";
import { showToast } from "../backend/toastmsg.js";

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
  document.getElementById("loader").className = "loader";
  firebase(min_time, max_time, localarray, 7);
}

export function oneweekclick() {
  var max_time = Math.floor(Date.now() / 1000);
  max_time = Math.floor(max_time / 60);
  max_time = max_time * 60;
  var min_time = max_time - 3600 * 168;
  var localarray = [];
  var y = min_time * 1000;
  for (var i = 0; i < 168; i++) {
    localarray.push([y, null]);
    y = y + 3600000;
  }
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

  if (max_time > currentDate) {
    showToast("Please select the To date until the present day");
  } else if (min_time > max_time) {
    showToast("'To' date should be greater than 'From' date, Kindly enter valid days");
  } else if (max_time - min_time > 604800) {
    showToast("Select only between 7 days");
  } else {
    var localarray = [];
    var y = min_time * 1000;
    for (var i = 0; i < SetTotality; i++) {
      localarray.push([y, "-"]);
      y = y + 60000;
    }
    document.getElementById("loader").className = "loader";
    firebase(min_time, max_time, localarray, 7);
  }
}

function cancelfunction() {
  var fromdate = document.getElementById("fromdate");
  var todate = document.getElementById("todate");
  fromdate.value = "";
  todate.value = "";
}
