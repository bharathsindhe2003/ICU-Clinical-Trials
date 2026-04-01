import {
  //history_ews,
  history_context_assessment,
  history_ECG,
  // history_Heart_Rate,
  // history_Blood_Oxygen,
  // history_temperature,
  // history_Blood_presure,
  //history_Respiration_Rate,
} from "./history_UI_module.js";
import { showToast } from "../backend/toastmsg.js";
import { fb } from "../firebase/config.js";

var button_clicked = "want_hour";

export function firebase(min_time, max_time, localarray, trim) {
  var start_index = min_time.toString();
  var end_index = max_time.toString();

  var id = localStorage.getItem("patient_unique_id");
  console.log("id", id);

  /**Obtaining the sensor data  */
  let sensor_data = fb.database().ref().child("patientlivedata").child(id).orderByKey().startAt(start_index).endAt(end_index);
  var sensor_timestamp = [];
  var sensor_hr = [];
  var sensor_spo2 = [];
  var sensor_temp = [];
  var sensor_rr = [];
  var sensor_sbp = [];
  var sensor_dbp = [];

  var context_assessment = fb.database().ref().child("context_assessment").child(id).orderByKey().startAt(start_index).endAt(end_index);
  var context_timestamp = [];
  var context_scale = [];
  var context_symptoms = [];

  function init_echarts() {
    if (typeof echarts === "undefined") {
      return;
    }

    sensor_data.once("value", function (snapshot) {
      snapshot.forEach((data) => {
        var tme_in_ms = data.key * 1000;
        sensor_timestamp.push(tme_in_ms);
        let sensor_string = JSON.stringify(data.val(), null, 2);
        let sensor_json = JSON.parse(sensor_string);

        sensor_hr.push([parseInt(tme_in_ms), parseFloat(sensor_json.hr).toFixed(1)]);
        sensor_spo2.push([parseInt(tme_in_ms), parseFloat(sensor_json.spo).toFixed(1)]);
        sensor_temp.push([parseInt(tme_in_ms), parseFloat(sensor_json.temp).toFixed(2)]);
        var stringArray = sensor_json.bp.split("/");
        sensor_sbp.push([parseInt(tme_in_ms), parseFloat(stringArray[0]).toFixed(1)]);
        sensor_dbp.push([parseInt(tme_in_ms), parseFloat(stringArray[1]).toFixed(1)]);

        sensor_rr.push([parseInt(tme_in_ms), parseFloat(sensor_json.rr).toFixed(1)]);
      });
    });

    context_assessment.once("value", function (snapshot) {
      if (snapshot.val() != null) {
        snapshot.forEach((data) => {
          var tme_in_ms = data.key * 1000;
          context_timestamp.push([parseInt(tme_in_ms), parseInt(5)]);
          let context_string = JSON.stringify(data.val(), null, 2);
          let context_json = JSON.parse(context_string);

          context_scale.push(context_json.scale);
          context_symptoms.push(context_json.symptoms);
        });
      } else {
        context_timestamp.push("");
      }
      history_context_assessment(min_time, max_time, id, context_timestamp);
    });

    var id = localStorage.getItem("patient_unique_id");
    console.log("ID", id);

    var averageCompleteDataRef = fb.database().ref().child("Average_complete_Data").child(id).orderByKey().startAt(start_index).endAt(end_index);

    averageCompleteDataRef.once("value", function (snapshot) {
      if (snapshot.exists()) {
        snapshot.forEach(function (data) {
          var timestamp = parseInt(data.key); // Assuming timestamps are integers
          var timestampInMs = timestamp * 1000; // Convert timestamp to milliseconds
          context_timestamp.push([timestampInMs, parseInt(5)]); // Assuming the value is 5 for now
        });
        // Call the function to render the graph after fetching timestamps from Average_complete_Data
        history_context_assessment(min_time, max_time, id, context_timestamp);
      } else {
        console.log("No data available in Average_complete_Data");
      }
    });

    var ecg_timestamp = [];

    var id = localStorage.getItem("patient_unique_id");
    console.log("ID", id);

    var ecg_time = fb.database().ref().child("one_min_average").child(id).orderByKey().startAt(start_index).endAt(end_index);

    ecg_time
      .once("value", function (snapshot) {
        if (snapshot.val() != null) {
          snapshot.forEach((data) => {
            var tme_in_ms = data.key * 1000;
            ecg_timestamp.push([parseInt(tme_in_ms), parseInt(5)]);
            // console.log("Added ecg_timestamp:", [parseInt(tme_in_ms), parseInt(5)]);
          });
        }
        // console.log("ecg timestamp....", ecg_timestamp);

        history_ECG(min_time, max_time, ecg_timestamp, id);
        // console.log("History ECG function called with parameters:", min_time, max_time, ecg_timestamp, id);

        const loader = document.querySelector(".loader");
        loader.classList.add("loader--hidden");
      })
      .catch((error) => {
        showToast("Error fetching Firebase data");
        // Handle any errors that occur during the fetch operation
        console.error("Error fetching Firebase data:", error);
        const loader = document.querySelector(".loader");
        loader.classList.add("loader--hidden");
      });
  }

  $(document).ready(function () {
    init_echarts();
  });
}
