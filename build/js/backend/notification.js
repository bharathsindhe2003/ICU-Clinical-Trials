import { fb } from "../livepage/database_function.js";

if (fb !== undefined) {
  console.log("Firebase initialized successfully.");

  const messaging = fb.messaging();
  console.log("Messaging initialized successfully.");

  navigator.serviceWorker
    .register("../../../firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service worker registered successfully.");
      messaging.useServiceWorker(registration);

      return messaging.requestPermission();
    })
    .then(() => {
      console.log("Permission requested successfully.");

      var docid = localStorage.getItem("doctor_id");
      console.log("Doctor ID retrieved from local storage:", docid);

      return messaging.getToken({ vapidKey: "BN0RxqABNgv0WPRmYtNw1tXkyaDeRf1Q5adqVLCaGe_SbhJsyy9LNHt30VXmwKRxA3cDTBnMKdCa4k0zMCbPxkI" });
    })
    .then((currentToken) => {
      if (currentToken) {
        console.log("Token retrieved successfully:", currentToken);

        var context_assessmenttoken = fb.database().ref().child("FCM_token").child(currentToken);
        context_assessmenttoken.set({
          Id: localStorage.getItem("doctor_id"),
        });

        var docId = localStorage.getItem("doctor_id");
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  messaging.onMessage(function (payload) {
    console.log("Inside onMessage:", payload);

    if (payload.data.timestamp && payload.data.uid) {
      const param1 = btoa(payload.data.timestamp);
      console.log("param1:", param1);

      const param2 = btoa(payload.data.uid);
      console.log("param2:", param2);

      const param3 = btoa("2");

      const url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
      console.log("Constructed URL:", url);

      var childWindow = window.open(url, "Context Assessment", "width=1050,height=670,left=150,top=200,titlebar=0,toolbar=0,status=0");

      setTimeout(function () {
        childWindow.close();
      }, 30000);
    } else {
      console.log("Invalid timestamp or final_patient_uid in payload data");
    }

    console.log("Payload:", payload);
  });
} else {
  console.warn("Firebase not initialized.");
}
