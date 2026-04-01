import { fb } from "../firebase/config.js";

var docId = localStorage.getItem("doctor_id");
var lightbox = document.getElementById("lightbox");
const lightboxContainer = document.getElementById("lightboxcontainer");
const closeButton = document.getElementById("closebutton");

if (closeButton != null) {
  closeButton.addEventListener("click", closeLightbox);
}
var answeringTimer;

export function loadIncoming(payload) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      lightboxContainer.innerHTML = this.responseText;
      displayLightbox();
      const answeringTimer = setTimeout(closeLightbox, 30000);
      let parsedpayload = JSON.parse(payload.data.call_info);

      const pname = document.getElementById("PnameId");
      pname.innerHTML = parsedpayload.name;

      $("#liftcall").on("click", function () {
        console.log("in click evemt");

        localStorage.setItem("incomingchannel_id", parsedpayload.channel_id);
        localStorage.setItem("patient_unique_id", parsedpayload.from);
        location.replace("index.html?openpage=outgoing");

        flag1 = false;
        flag2 = false;
      });

      $("#decline").on("click", function () {
        fb.database().ref().child("video_call").child(docId).child("call_decline").set("1");
        closeLightbox();
      });
    }
  };
  xhttp.open("GET", "incoming.php", true);
  xhttp.send();
}

export function loadIncomingBg(pnameBg, channelid, uid) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      lightboxContainer.innerHTML = this.responseText;
      displayLightbox();
      answeringTimer = setTimeout(closeLightbox, 30000);
      const pname = document.getElementById("PnameId");
      pname.innerHTML = pnameBg;

      $("#liftcall").on("click", function () {
        localStorage.setItem("incomingchannel_id", channelid);
        localStorage.setItem("patient_unique_id", uid);
        location.replace("index.html?openpage=outgoing");

        flag1 = false;
        flag2 = false;
      });

      $("#decline").on("click", function () {
        fb.database().ref().child("video_call").child(docId).child("call_decline").set("1");
        closeLightbox();
      });
    }
  };
  xhttp.open("GET", "incoming.php", true);
  xhttp.send();
}

export function displayLightbox() {
  lightbox.style.display = "block";
}

export function closeLightbox() {
  lightbox.style.display = "none";
  clearTimeout(answeringTimer);
}
