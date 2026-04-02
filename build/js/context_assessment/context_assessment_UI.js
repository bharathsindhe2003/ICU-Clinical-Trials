import { fb } from "../firebase/config.js";
import {
  heartrate_data,
  blood_pressure_data,
  respiration_rate_data,
  acceleration_data,
  blood_oxygen_data,
  temperature_data,
  RR_data,
  PPG_data,
  ECG_data,
  ews_value_passing,
} from "./context-custom.js";
import { NoEcgData, NoPpgData, NoRRData } from "../livepage/EchartGraphs.js";

function setEpochSecondsToZero(epoch) {
  if (epoch === undefined || epoch === null) return null;
  const s = String(epoch).trim();
  if (!/^-?\d+$/.test(s)) return null;

  const isMsByLength = s.replace(/^-/, "").length >= 13;
  const num = Number(s);
  const isMs = isMsByLength || Math.abs(num) > 1e11;

  if (isMs) {
    const d = new Date(Math.floor(num));
    d.setSeconds(0, 0);
    return d.getTime();
  } else {
    const d = new Date(Math.floor(num) * 1000);
    d.setSeconds(0, 0);
    return Math.floor(d.getTime() / 1000);
  }
}

document.getElementById("loader").className = "loader";

const urlParams = new URLSearchParams(window.location.search);
const originlalTimestamp = parseInt(atob(urlParams.get("param1")));
const timestamp = setEpochSecondsToZero(originlalTimestamp);
const id = atob(urlParams.get("param2"));
const page = atob(urlParams.get("param3"));
console.log("originlalTimestamp", originlalTimestamp);
console.log("Timestamp:", timestamp);
console.log("ID:", id);

var patientsDataRef;
var ecgref;
var ecgref1;
var ppgref;
var ppgref1;
var rrref;
var rrref1;
const ews_ref = fb.database().ref().child("EWS").child(id);
if (page == "1") {
  patientsDataRef = fb.database().ref().child("Average_complete_Data");
  ecgref1 = fb.database().ref().child("patientecgdata").child(id);
  ppgref1 = fb.database().ref().child("patientppgdata").child(id);
  rrref1 = fb.database().ref().child("patientrrdata").child(id);
} else if (page == "2") {
  patientsDataRef = fb.database().ref().child("patientlivedata");
  ecgref = fb.database().ref().child("patientecgdata").child(id);
  ppgref = fb.database().ref().child("patientppgdata").child(id);
  rrref = fb.database().ref().child("patientrrdata").child(id);
}

const patientRef = patientsDataRef.child(id);

patientRef
  .once("value", function (snapshot) {
    console.log("Fetching live patient data...");
    var patientData = snapshot.val();
    console.log("Raw patient data:", patientData);

    const found = Object.entries(patientData || {}).find(([key, entry]) => {
      const entryTs = entry && entry.timestamp !== undefined ? setEpochSecondsToZero(parseInt(entry.timestamp)) : null;
      const keyTs = setEpochSecondsToZero(parseInt(key));

      return entryTs === timestamp || keyTs === timestamp;
    });
    if (found) {
      const [foundKey, foundEntry] = found;
      console.log("Matched patient data entry:", { [foundKey]: foundEntry });
      patientData = foundEntry;
    } else {
      console.log("No matching patient data entry found for the given timestamp.");
      patientData = null;
    }

    if (patientData) {
      // EWS
      ews_ref.once("value", function (snapshot) {
        const ewsData = snapshot.val();
        const found_ews = Object.entries(ewsData || {}).find(([key, entry]) => {
          const entryTs = entry && entry.timestamp !== undefined ? setEpochSecondsToZero(parseInt(entry.timestamp)) : null;
          const keyTs = setEpochSecondsToZero(parseInt(key));

          return entryTs === timestamp || keyTs === timestamp;
        });
        console.log("EWS data:", ewsData);
        const ews_score = found_ews ? found_ews[1].score : "--";
        const ews_color = found_ews ? found_ews[1].color : "0";
        if (found_ews) {
          ews_value_passing(ews_score, ews_color);
        }
      });

      // Vitals
      console.log("patient data snapshot:", patientData);

      var heart_rate = patientData.hr ? parseFloat(patientData.hr) / 100 : NaN;
      console.log("heart_rate:", heart_rate);

      var spo2 = NaN;
      if (patientData.hasOwnProperty("spo")) {
        var spoRaw = parseFloat(patientData.spo);
        console.log("spo raw value:", spoRaw);
        if (!isNaN(spoRaw)) {
          spo2 = spoRaw / 100;
        } else {
          console.log("spo is NaN after parsing.");
        }
      } else if (patientData.hasOwnProperty("spo2")) {
        var spo2Raw = parseFloat(patientData.spo2);
        console.log("spo2 raw value:", spo2Raw);
        if (!isNaN(spo2Raw)) {
          spo2 = spo2Raw / 100;
        } else {
          console.log("spo2 is NaN after parsing.");
        }
      } else {
        console.log("Neither spo nor spo2 key found in patientData.");
      }
      console.log("spo2 final value:", spo2);

      var temp = patientData.temp ? parseFloat(patientData.temp) : NaN;
      console.log("temp:", temp);

      var acc = patientData.acc !== undefined ? patientData.acc : NaN;
      console.log("acc:", acc);

      var bp = patientData.bp ? patientData.bp : undefined;
      console.log("bp:", bp);

      let [contextsbp, contextdbp] = bp && bp.includes("/") ? bp.split("/") : ["-", "-"];
      console.log("contextsbp:", contextsbp);
      console.log("contextdbp:", contextdbp);

      var respiration_rate = patientData.rr !== undefined ? patientData.rr : NaN;
      console.log("respiration_rate:", respiration_rate);

      heart_rate = isNaN(heart_rate) ? "-" : heart_rate;
      respiration_rate = isNaN(respiration_rate) ? "-" : respiration_rate;
      temp = isNaN(temp) ? "-" : temp;
      spo2 = isNaN(spo2) ? "-" : spo2;
      bp = bp === undefined ? "-/-" : bp;
      acc = acc === NaN ? "-" : acc;
      console.log("Processed patient data: 1", { heart_rate, respiration_rate, temp, spo2, contextsbp, contextdbp, acc });

      heart_rate = parseInt(heart_rate) === 238 || heart_rate === 2.38 ? "--" : heart_rate;
      respiration_rate = parseInt(respiration_rate) === 238 ? "--" : respiration_rate;
      temp = parseInt(temp) === 238 || temp === 2.38 ? "--" : temp;
      spo2 = parseInt(spo2) === 238 || spo2 === 2.38 ? "--" : spo2;
      contextsbp = parseInt(contextsbp) === 238 ? "--" : contextsbp;
      contextdbp = parseInt(contextdbp) === 238 ? "--" : contextdbp;
      acc = parseInt(acc) === 238 ? "--" : acc;

      console.log("Processed patient data: 2", { heart_rate, respiration_rate, temp, spo2, contextsbp, contextdbp, acc });

      heartrate_data(heart_rate);
      respiration_rate_data(respiration_rate);
      temperature_data(temp);
      blood_oxygen_data(spo2);
      blood_pressure_data(contextsbp, contextdbp);
      acceleration_data(acc);

      console.log("Live patient data processed and passed successfully.");

      var f_SensorTimestamp = timestamp;
      var SensorDateTime = new Date(f_SensorTimestamp * 1000);
      var ContextSensorDate = ("0" + SensorDateTime.getDate()).slice(-2) + "/" + ("0" + (SensorDateTime.getMonth() + 1)).slice(-2) + "/" + SensorDateTime.getFullYear();
      var ContextSensorTime = ("0" + SensorDateTime.getHours()).slice(-2) + ":" + ("0" + SensorDateTime.getMinutes()).slice(-2) + ":" + ("0" + SensorDateTime.getSeconds()).slice(-2);

      document.getElementById("contextsensordate").innerHTML = ContextSensorDate;
      document.getElementById("contextsensortime").innerHTML = ContextSensorTime;
      if (page == "1") {
        console.log("Fetching Vital data...");

        Promise.all([
          ecgref1.once("value", function (snapshot) {
            var newts = null;
            var ecg = null;

            if (snapshot.exists()) {
              const parsedData = snapshot.val();
              console.log("Parsed ECG data: 1", parsedData);
              const found = Object.entries(parsedData).find(([key, entry]) => {
                const entryTs = entry && entry.timestamp !== undefined ? setEpochSecondsToZero(parseInt(entry.timestamp)) : null;
                const keyTs = setEpochSecondsToZero(parseInt(key));

                return entryTs === timestamp || keyTs === timestamp;
              });
              if (found) {
                const [foundKey, foundEntry] = found;
                console.log("Parsed ECG data: 2", { [foundKey]: foundEntry });
                newts = foundEntry && foundEntry.timestamp !== undefined ? setEpochSecondsToZero(foundEntry.timestamp) : setEpochSecondsToZero(Number(foundKey));
                ecg = foundEntry && foundEntry.payload !== undefined ? foundEntry.payload : null;
              } else {
                console.log("Parsed ECG data: 2 []");
                newts = null;
                ecg = null;
              }
            }
            console.log("newts ecg", newts);

            if (ecg != null) {
              var ECGDateTime = new Date(newts * 1000);
              var ContextEcgDate = ("0" + ECGDateTime.getDate()).slice(-2) + "/" + ("0" + (ECGDateTime.getMonth() + 1)).slice(-2) + "/" + ECGDateTime.getFullYear();
              var ContextEcgTime = ("0" + ECGDateTime.getHours()).slice(-2) + ":" + ("0" + ECGDateTime.getMinutes()).slice(-2) + ":" + ("0" + ECGDateTime.getSeconds()).slice(-2);
              document.getElementById("contextecgdate").innerHTML = ContextEcgDate;
              document.getElementById("contextecgtime").innerHTML = ContextEcgTime;

              let result1 = ecg.replace(/\]\[/g, ", ").trim();
              result1 = result1.replace(/\]/g, "").trim();
              result1 = result1.replace(/\[/g, "").trim();
              var final_ecg = result1.split(",").map(Number);

              console.log("ECG data passed successfully.", final_ecg);
              ECG_data(final_ecg);
            } else {
              document.getElementById("contextecgdate").innerHTML = "";
              document.getElementById("contextecgtime").innerHTML = "";
              var echartLinecontext = echarts.init(document.getElementById("context_ecg"));
              echartLinecontext.clear();
              echartLinecontext.setOption(NoEcgData);
            }
          }),

          ppgref1.once("value", function (snapshot) {
            var newts = null;
            var ppg = null;

            if (snapshot.exists()) {
              const parsedData = snapshot.val();
              console.log("Parsed PPG data: 1", parsedData);
              const found = Object.entries(parsedData).find(([key, entry]) => {
                const entryTs = entry && entry.timestamp !== undefined ? setEpochSecondsToZero(parseInt(entry.timestamp)) : null;
                const keyTs = setEpochSecondsToZero(parseInt(key));

                return entryTs === timestamp || keyTs === timestamp;
              });

              if (found) {
                const [foundKey, foundEntry] = found;
                console.log("Parsed PPG data: 2", { [foundKey]: foundEntry });
                newts = foundEntry && foundEntry.timestamp !== undefined ? foundEntry.timestamp : Number(foundKey);
                ppg = foundEntry && foundEntry.payload !== undefined ? foundEntry.payload : null;
              } else {
                console.log("Parsed PPG data: 2 []");
                newts = null;
                ppg = null;
              }
            }
            console.log("newts ecg", newts, ppg);
            if (ppg != null) {
              var PpgDateTime = new Date(newts * 1000);
              var ContextPpgDate = ("0" + PpgDateTime.getDate()).slice(-2) + "/" + ("0" + (PpgDateTime.getMonth() + 1)).slice(-2) + "/" + PpgDateTime.getFullYear();
              var ContextPpgTime = ("0" + PpgDateTime.getHours()).slice(-2) + ":" + ("0" + PpgDateTime.getMinutes()).slice(-2) + ":" + ("0" + PpgDateTime.getSeconds()).slice(-2);
              console.log("newts ecg", newts, ContextPpgDate, ContextPpgTime);

              document.getElementById("contextppgdate").innerHTML = ContextPpgDate;
              document.getElementById("contextppgtime").innerHTML = ContextPpgTime;
              let result1 = ppg.replace(/\,/g, "").trim();
              var final_ppg = result1.split(" ").map(Number);
              PPG_data(final_ppg);
              console.log("PPG data passed successfully.");
            } else {
              console.log("PPG data is null, displaying No Data chart.");
              document.getElementById("contextppgdate").innerHTML = "";
              document.getElementById("contextppgtime").innerHTML = "";

              var echartLinecontext = echarts.init(document.getElementById("context_ppg"));
              echartLinecontext.clear();
              echartLinecontext.setOption(NoPpgData);
            }
          }),

          rrref1.once("value", function (snapshot) {
            var newts = null;
            var rr = null;
            if (snapshot.exists()) {
              const parsedData = snapshot.val();
              console.log("Parsed RR data: 1", parsedData);
              const found = Object.entries(parsedData).find(([key, entry]) => {
                const entryTs = entry && entry.timestamp !== undefined ? setEpochSecondsToZero(parseInt(entry.timestamp)) : null;
                const keyTs = setEpochSecondsToZero(parseInt(key));

                return entryTs === timestamp || keyTs === timestamp;
              });
              if (found) {
                const [foundKey, foundEntry] = found;
                console.log("Parsed RR data: 2", { [foundKey]: foundEntry });
                newts = foundEntry && foundEntry.timestamp !== undefined ? foundEntry.timestamp : Number(foundKey);
                rr = foundEntry && foundEntry.payload !== undefined ? foundEntry.payload : null;
              } else {
                console.log("Parsed RR data: 2 []");
                newts = null;
                rr = null;
              }
            }
            console.log("newts ecg", newts);
            if (rr != null) {
              var RrDateTime = new Date(newts * 1000);
              var ContextRrDate = ("0" + RrDateTime.getDate()).slice(-2) + "/" + ("0" + (RrDateTime.getMonth() + 1)).slice(-2) + "/" + RrDateTime.getFullYear();
              var ContextRrTime = ("0" + RrDateTime.getHours()).slice(-2) + ":" + ("0" + RrDateTime.getMinutes()).slice(-2) + ":" + ("0" + RrDateTime.getSeconds()).slice(-2);
              document.getElementById("contextrrdate").innerHTML = ContextRrDate;
              document.getElementById("contextrrtime").innerHTML = ContextRrTime;

              let result1 = rr.replace(/\,/g, "").trim();
              var final_rr = result1.split(" ").map(Number);
              RR_data(final_rr);
              console.log("RR data passed successfully.");
            } else {
              document.getElementById("contextrrdate").innerHTML = "";
              document.getElementById("contextrrtime").innerHTML = "";
              var echartLinecontext = echarts.init(document.getElementById("context_rr"));
              echartLinecontext.clear();
              echartLinecontext.setOption(NoRRData);
            }
          }),
        ])
          .then(() => {
            console.log("Vital data fetched successfully.");
          })
          .catch((error) => {
            console.error("Error fetching Vital data:", error);
          });
      } else if (page == "2") {
        console.log("Fetching Alert History data...");

        Promise.all([
          ecgref.once("value", function (snapshot) {
            var ecg = null;
            var newts = null;
            if (snapshot.exists()) {
              const parsedData = snapshot.val();
              console.log("Parsed ECG data:", parsedData);
              const found = Object.entries(parsedData).find(([key, entry]) => {
                const entryTs = entry && entry.timestamp !== undefined ? setEpochSecondsToZero(parseInt(entry.timestamp)) : null;
                const keyTs = setEpochSecondsToZero(parseInt(key));

                return entryTs === timestamp || keyTs === timestamp;
              });
              if (found) {
                const [foundKey, foundEntry] = found;
                console.log("Parsed ECG data after filter:", { [foundKey]: foundEntry });
                newts = foundEntry && foundEntry.timestamp !== undefined ? foundEntry.timestamp : Number(foundKey);
                ecg = foundEntry && foundEntry.payload !== undefined ? foundEntry.payload : null;
              } else {
                console.log("Parsed ECG data after filter: []");
                newts = null;
                ecg = null;
              }
            }

            if (ecg != null) {
              var ECGDateTime = new Date(newts * 1000);
              var ContextEcgDate = ("0" + ECGDateTime.getDate()).slice(-2) + "/" + ("0" + (ECGDateTime.getMonth() + 1)).slice(-2) + "/" + ECGDateTime.getFullYear();
              var ContextEcgTime = ("0" + ECGDateTime.getHours()).slice(-2) + ":" + ("0" + ECGDateTime.getMinutes()).slice(-2) + ":" + ("0" + ECGDateTime.getSeconds()).slice(-2);
              document.getElementById("contextecgdate").innerHTML = ContextEcgDate;
              document.getElementById("contextecgtime").innerHTML = ContextEcgTime;

              let result1 = ecg.replace(/\]\[/g, ", ").trim();
              result1 = result1.replace(/\]/g, "").trim();
              result1 = result1.replace(/\[/g, "").trim();
              var final_ecg = result1.split(",").map(Number);

              ECG_data(final_ecg);
              console.log("ECG data passed successfully.");
            } else {
              document.getElementById("contextecgdate").innerHTML = "";
              document.getElementById("contextecgtime").innerHTML = "";
              var echartLinecontext = echarts.init(document.getElementById("context_ecg"));
              echartLinecontext.clear();
              echartLinecontext.setOption(NoEcgData);
            }
          }),

          ppgref.once("value", function (snapshot) {
            var ppg = null;
            var newts = null;
            if (snapshot.exists()) {
              const parsedData = snapshot.val();
              console.log("Parsed PPG data:", parsedData);
              const found = Object.entries(parsedData).find(([key, entry]) => {
                const entryTs = entry && entry.timestamp !== undefined ? setEpochSecondsToZero(parseInt(entry.timestamp)) : null;
                const keyTs = setEpochSecondsToZero(parseInt(key));

                return entryTs === timestamp || keyTs === timestamp;
              });
              if (found) {
                const [foundKey, foundEntry] = found;
                console.log("Parsed PPG data after filter:", { [foundKey]: foundEntry });
                newts = foundEntry && foundEntry.timestamp !== undefined ? foundEntry.timestamp : Number(foundKey);
                ppg = foundEntry && foundEntry.payload !== undefined ? foundEntry.payload : null;
              } else {
                console.log("Parsed PPG data after filter: []");
                newts = null;
                ppg = null;
              }
            }

            if (ppg != null) {
              var PpgDateTime = new Date(newts * 1000);
              var ContextPpgDate = ("0" + PpgDateTime.getDate()).slice(-2) + "/" + ("0" + (PpgDateTime.getMonth() + 1)).slice(-2) + "/" + PpgDateTime.getFullYear();
              var ContextPpgTime = ("0" + PpgDateTime.getHours()).slice(-2) + ":" + ("0" + PpgDateTime.getMinutes()).slice(-2) + ":" + ("0" + PpgDateTime.getSeconds()).slice(-2);
              document.getElementById("contextppgdate").innerHTML = ContextPpgDate;
              document.getElementById("contextppgtime").innerHTML = ContextPpgTime;

              let result1 = ppg.replace(/\,/g, "").trim();
              console.log("ppg_data from replace", result1);
              var final_ppg = result1.split(" ").map(Number);

              PPG_data(final_ppg);
              console.log("PPG data passed successfully.");
              document.getElementById("contextppgdate").innerHTML = "";
              document.getElementById("contextppgtime").innerHTML = "";
            } else {
              document.getElementById("contextppgdate").innerHTML = "";
              document.getElementById("contextppgtime").innerHTML = "";
              var echartLinecontext = echarts.init(document.getElementById("context_ppg"));
              echartLinecontext.clear();
              echartLinecontext.setOption(NoPpgData);
            }
          }),

          rrref.once("value", function (snapshot) {
            var rr = null;
            var newts = null;
            if (snapshot.exists()) {
              const parsedData = snapshot.val();
              console.log("Parsed RR data:", parsedData);
              const found = Object.entries(parsedData).find(([key, entry]) => {
                const entryTs = entry && entry.timestamp !== undefined ? setEpochSecondsToZero(parseInt(entry.timestamp)) : null;
                const keyTs = setEpochSecondsToZero(parseInt(key));

                return entryTs === timestamp || keyTs === timestamp;
              });
              if (found) {
                const [foundKey, foundEntry] = found;
                console.log("Parsed RR data after filter:", { [foundKey]: foundEntry });
                newts = foundEntry && foundEntry.timestamp !== undefined ? foundEntry.timestamp : Number(foundKey);
                rr = foundEntry && foundEntry.payload !== undefined ? foundEntry.payload : null;
              } else {
                console.log("Parsed RR data after filter: []");
                newts = null;
                rr = null;
              }
            }
            if (rr != null) {
              var RrDateTime = new Date(newts * 1000);
              var ContextRrDate = ("0" + RrDateTime.getDate()).slice(-2) + "/" + ("0" + (RrDateTime.getMonth() + 1)).slice(-2) + "/" + RrDateTime.getFullYear();
              var ContextRrTime = ("0" + RrDateTime.getHours()).slice(-2) + ":" + ("0" + RrDateTime.getMinutes()).slice(-2) + ":" + ("0" + RrDateTime.getSeconds()).slice(-2);
              document.getElementById("contextrrdate").innerHTML = ContextRrDate;
              document.getElementById("contextrrtime").innerHTML = ContextRrTime;

              let result1 = rr.replace(/\,/g, "").trim();
              var final_rr = result1.split(" ").map(Number);
              RR_data(final_rr);
              console.log("RR data passed successfully.");
            } else {
              document.getElementById("contextrrdate").innerHTML = "";
              document.getElementById("contextrrtime").innerHTML = "";
              console.warn("RR data is null or undefined.");
              var echartLinecontext = echarts.init(document.getElementById("context_rr"));
              echartLinecontext.clear();
              echartLinecontext.setOption(NoRRData);
            }
          }),
        ])
          .then(() => {
            console.log("Alert History data fetched successfully.");
          })

          .catch((error) => {
            console.error("Error fetching Alert History data:", error);
          });
      }
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  })
  .finally(() => {
    const loader = document.querySelector(".loader");
    loader.classList.add("loader--hidden");
  });
