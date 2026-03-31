importScripts("https://www.gstatic.com/firebasejs/8.6.2/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.6.2/firebase-messaging.js");

const firebaseConfig = {
  // svasthya-icu-clinical-trials
  // apiKey: "AIzaSyBAqVd7OH-L7Zr86aNtIPFMo0SYXVwUoJs",
  // authDomain: "svasthya-icu-clinical-trials.firebaseapp.com",
  // databaseURL: "https://svasthya-icu-clinical-trials-default-rtdb.firebaseio.com",
  // projectId: "svasthya-icu-clinical-trials",
  // storageBucket: "svasthya-icu-clinical-trials.firebasestorage.app",
  // messagingSenderId: "667544106913",
  // appId: "1:667544106913:web:0cfdea8866edfb507abde0",
  // measurementId: "G-ZHLTHLEVCE",

  // svasthya-icu-clinical-trials 2
  apiKey: "AIzaSyBsnDOIETbbYrnIY5ubf8wwUpA6Wr9TGpo",
  authDomain: "phc-testing-c20d5.firebaseapp.com",
  databaseURL: "https://phc-testing-c20d5-default-rtdb.firebaseio.com",
  projectId: "phc-testing-c20d5",
  storageBucket: "phc-testing-c20d5.appspot.com",
  messagingSenderId: "801955076843",
  appId: "1:801955076843:web:9bf242e4293cddae153cae",
  measurementId: "G-WY33YWRX21",
};

const fb = firebase.initializeApp(firebaseConfig);
const messaging = fb.messaging();

/****************************************** showNotification-STARTS *************************************/
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  let calltype = JSON.parse(payload.data.info);
  console.log("payload111", payload);

  var Notificatoinbody;
  var notificatoinType;
  var actionType;
  var titleType;
  if (calltype.type == "call") {
    console.trace("calltype", calltype);
    notificatoinType = "incoming call";
    let caller_info = JSON.parse(payload.data.call_info);
    Notificatoinbody = "From: " + caller_info.name;
  } else if (calltype.type == "context") {
    console.log("calltype", calltype);
    notificatoinType = " New context Assessment";
    let context_info = JSON.parse(payload.data.context_info);
    let p_info = JSON.parse(payload.data.u_info);

    Notificatoinbody = ContextPatientSymptomsRawConversion(p_info.username, context_info.symptoms, context_info.scale);
  }

  const notificationTitle = "Svasthya:" + notificatoinType;
  const notificationOptions = {
    body: Notificatoinbody,
    icon: "svasthya/production/images/login_icon.png",
    badge: "svasthya/production/images/login_icon.png",
    requireInteraction: true,
    data: payload,
    actions: actionType,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

/****************************************** showNotification-ENDS *************************************/

/*********************************** Onclick Notification *******************************/
addEventListener("notificationclick", (event) => {
  console.log("On notification click: ", event.notification.tag);
  event.notification.close();
  let payload = event.notification.data;
  let calltype = JSON.parse(payload.data.info);
  console.log("payload info", calltype.type);

  if (calltype.type == "call") {
    const notification = event.notification;
    let payload = event.notification.data;
    let caller_info = JSON.parse(payload.data.call_info);
    let u_info = JSON.parse(payload.data.u_info);

    const channeId = btoa(caller_info.channel_id);
    const uid = btoa(caller_info.from);
    const name = btoa(u_info.username);
    console.log("context_info", caller_info.channel_id);
    const url = "svasthya/production/index.html?openpage=backgroundnotification" + "&channelid=" + channeId + "&uid=" + uid + "&name=" + name;

    event.waitUntil(
      (async () => {
        const allClients = await clients.matchAll({
          includeUncontrolled: true,
        });

        let chatClient;

        // Let's see if we already have a chat window open:
        for (const client of allClients) {
          const url = new URL(client.url);
          console.log("URL Path Name: ", url.pathname);
          if (url.pathname === "http://localhost:5500/production/index.html" || "http://localhost:5500/production/dashboard.html") {
            // Excellent, let's use it!
            client.focus();
            chatClient = client;
          }
        }

        // If we didn't find an existing chat window,
        // open a new one:
        if (!chatClient) {
          chatClient = await clients.openWindow(url);
        }

        // Message the client:
        chatClient.postMessage({
          msg: "New message",
          url: url,
        });
      })(),
    );
  } else if (calltype.type == "context") {
    let payload = event.notification.data;
    console.log("payload", payload);
    let context_info = JSON.parse(payload.data.context_info);
    var u_info = JSON.parse(payload.data.u_info);

    const param1 = btoa(context_info.timestamp);
    const param2 = btoa(u_info.id);

    event.waitUntil(
      (async () => {
        const allClients = await clients.matchAll({
          includeUncontrolled: true,
        });

        let chatClient;

        // Let's see if we already have a chat window open:
        for (const client of allClients) {
          const url = new URL(client.url);
          console.log("URL Path Name: ", url.pathname);
          if (url.pathname === "/production/index.html" && !client.focused) {
            // const url = 'context_assment.html' + '?param1=' + param1+ '&param2=' + param2;
            // window.open(url,"Context Assessment","width=1050,height=670,left=150,top=200,titlebar=0,toolbar=0,status=0");

            client.focus();
            chatClient = client;
            var newurl = "context_assment.html" + "?" + "&param1=" + param1 + "&param2=" + param2;
            console.log("context_info", newurl);

            // Message the client:
            chatClient.postMessage({
              msg: "New message",
              url: newurl,
            });
          } else if (url.pathname === "/production/dashboard.html" && !client.focused) {
            client.focus();
            chatClient = client;
            var newurl = "index.html?" + "&id=" + param2 + "&timestamp=" + param1;
            console.log("context_info", newurl);

            // Message the client:
            chatClient.postMessage({
              msg: "New message",
              url: newurl,
            });
          }

          if (!chatClient) {
            chatClient = await clients.openWindow(url);
          }
        }
      })(),
    );
  }
});
/*********************************** Onclick Notification Ends *******************************/

function ContextPatientSymptomsRawConversion(PatientName, RawSymptoms, RawScale) {
  RawScale = RawScale.replace(/ ||/gi, "");
  RawSymptoms = RawSymptoms.replace("_", " ");

  var scale = RawScale.split(",");
  scale = scale.map(Number);
  console.log("scale", typeof scale[0]);

  let symptoms = RawSymptoms.split(",");
  //parseInt(scale[i]).push("");
  let sequel = [];
  for (let i = 0; i < scale.length; i++) {
    if (scale[i] == 0) {
      sequel.push(symptoms[i]);
    } else if (scale[i] >= 1 && scale[i] <= 3) {
      sequel.push("Maild " + symptoms[i]);
    } else if (scale[i] >= 4 && scale[i] <= 6) {
      sequel.push("Moderate " + symptoms[i]);
    } else if (scale[i] >= 7 && scale[i] <= 10) {
      sequel.push("Severe " + symptoms[i]);
    } else {
      sequel.push(symptoms[i]);
    }
  }
  let SymptomsMerged = sequel.join(",");
  return PatientName + " has " + SymptomsMerged;
}
