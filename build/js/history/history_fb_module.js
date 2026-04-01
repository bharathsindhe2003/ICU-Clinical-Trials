import { history_context_assessment, history_ECG } from "./history_UI_module.js";
import { showToast } from "../backend/toastmsg.js";
import { fb } from "../firebase/config.js";

export function firebase(min_time, max_time, localarray, trim) {
  try {
    const start_index = min_time.toString();
    const end_index = max_time.toString();

    const id = localStorage.getItem("patient_unique_id");
    console.log("id", id);

    const context_assessment = fb.database().ref().child("context_assessment").child(id).orderByKey().startAt(start_index).endAt(end_index);
    const context_timestamp = [];

    const averageCompleteDataRef = fb.database().ref().child("Average_complete_Data").child(id).orderByKey().startAt(start_index).endAt(end_index);

    const ecg_time = fb.database().ref().child("one_min_average").child(id).orderByKey().startAt(start_index).endAt(end_index);
    const ecg_timestamp = [];

    function init_echarts() {
      if (typeof echarts === "undefined") {
        return;
      }

      context_assessment.once("value", function (snapshot) {
        if (snapshot.val() != null) {
          snapshot.forEach((data) => {
            const tme_in_ms = data.key * 1000;
            context_timestamp.push([parseInt(tme_in_ms), parseInt(5)]);
          });
        }
        history_context_assessment(min_time, max_time, id, context_timestamp);
      });

      averageCompleteDataRef.once("value", function (snapshot) {
        if (snapshot.exists()) {
          snapshot.forEach(function (data) {
            const timestamp = parseInt(data.key); // Assuming timestamps are integers
            const timestampInMs = timestamp * 1000; // Convert timestamp to milliseconds
            context_timestamp.push([timestampInMs, parseInt(5)]); // Assuming the value is 5 for now
          });
          // Call the function to render the graph after fetching timestamps from Average_complete_Data
          history_context_assessment(min_time, max_time, id, context_timestamp);
        }
      });

      ecg_time
        .once("value", function (snapshot) {
          if (snapshot.val() != null) {
            snapshot.forEach((data) => {
              var tme_in_ms = data.key * 1000;
              ecg_timestamp.push([parseInt(tme_in_ms), parseInt(5)]);
            });
          }

          history_ECG(min_time, max_time, ecg_timestamp, id);
        })
        .catch((error) => {
          console.error("Error fetching Firebase data:", error);
        });
    }

    $(document).ready(function () {
      init_echarts();
    });
  } catch (error) {
    showToast("Error fetching Firebase data");
    console.error("Error initializing Firebase module:", error);
  } finally {
    const loader = document.querySelector(".loader");
    loader.classList.add("loader--hidden");
  }
}
