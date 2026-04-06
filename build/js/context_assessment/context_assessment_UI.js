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

document.getElementById("loader").className = "loader";

const urlParams = new URLSearchParams(window.location.search);
const originlalTimestamp = parseInt(atob(urlParams.get("param1")));
const timestamp = new Date(originlalTimestamp * 1000);
const str_timestamp = originlalTimestamp.toString();
const str_end_timestamp = (originlalTimestamp + 60000).toString();
const id = atob(urlParams.get("param2"));
const page = atob(urlParams.get("param3"));
console.log("originlalTimestamp", originlalTimestamp);
console.log("Timestamp:", timestamp);
console.log("ID:", id);

const ews_ref = fb.database().ref().child("EWS").child(id).child(str_timestamp);
const patientsDataRef = fb.database().ref().child("patientlivedata").child(id).child(str_timestamp);
const ecgref1 = fb.database().ref().child("patientecgdata").child(id).child(str_timestamp);
const ppgref1 = fb.database().ref().child("patientppgdata").child(id).child(str_timestamp);
const rrref1 = fb.database().ref().child("patientrrdata").child(id).child(str_timestamp);
const lead_config = fb.database().ref("LEAD_config").child(id).orderByKey().startAt(str_timestamp).endAt(str_end_timestamp).limitToLast(1);
patientsDataRef
  .once("value", function (snapshot) {
    if (snapshot.exists()) {
      const patientData = snapshot.val();
      console.log("Raw patient data:", patientData);
      if (patientData) {
        // Vitals
        console.log("patient data snapshot:", patientData);

        var heart_rate = patientData.hr ? parseFloat(patientData.hr) / 100 : NaN;
        // console.log("heart_rate:", heart_rate);

        var spo2 = patientData.spo / 100;
        // console.log("spo2 raw value:", spo2);

        var temp = patientData.temp ? parseFloat(patientData.temp) : NaN;
        // console.log("temp:", temp);

        var acc = patientData.acc !== undefined ? patientData.acc : NaN;
        // console.log("acc:", acc);

        var bp = patientData.bp ? patientData.bp : undefined;
        // console.log("bp:", bp);

        let [contextsbp, contextdbp] = bp && bp.includes("/") ? bp.split("/") : ["-", "-"];
        // console.log("contextsbp:", contextsbp);
        // console.log("contextdbp:", contextdbp);

        var respiration_rate = patientData.rr !== undefined ? patientData.rr : NaN;
        // console.log("respiration_rate:", respiration_rate);

        heart_rate = isNaN(heart_rate) ? "-" : heart_rate;
        respiration_rate = isNaN(respiration_rate) ? "-" : respiration_rate;
        temp = isNaN(temp) ? "-" : temp;
        spo2 = isNaN(spo2) ? "-" : spo2;
        bp = bp === undefined ? "-/-" : bp;
        acc = isNaN(acc) ? "-" : acc;
        // console.log("Processed patient data: 1", { heart_rate, respiration_rate, temp, spo2, contextsbp, contextdbp, acc });

        heart_rate = parseInt(heart_rate) === 238 || heart_rate === 2.38 ? "--" : heart_rate;
        respiration_rate = parseInt(respiration_rate) === 238 ? "--" : respiration_rate;
        temp = parseInt(temp) === 238 || temp === 2.38 ? "--" : temp.toFixed(2);
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

        var ContextSensorDate = ("0" + timestamp.getDate()).slice(-2) + "/" + ("0" + (timestamp.getMonth() + 1)).slice(-2) + "/" + timestamp.getFullYear();
        var ContextSensorTime = ("0" + timestamp.getHours()).slice(-2) + ":" + ("0" + timestamp.getMinutes()).slice(-2) + ":" + ("0" + timestamp.getSeconds()).slice(-2);

        document.getElementById("contextsensordate").innerHTML = ContextSensorDate;
        document.getElementById("contextsensortime").innerHTML = ContextSensorTime;

        Promise.all([
          // EWS
          ews_ref.once("value", function (snapshot) {
            if (snapshot.exists()) {
              const ewsData = snapshot.val();
              const ews_score = ewsData?.ews_score || "--";
              const ews_color = ewsData?.color || "0";
              if (ewsData) {
                ews_value_passing(ews_score, ews_color);
              } else {
                ews_value_passing("--", "0");
              }
            } else {
              ews_value_passing("--", "0");
            }
          }),
          // ECG
          ecgref1.once("value", function (snapshot) {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const ecg = data?.payload ? data.payload : null;

              if (ecg != null) {
                var ContextEcgDate = ("0" + timestamp.getDate()).slice(-2) + "/" + ("0" + (timestamp.getMonth() + 1)).slice(-2) + "/" + timestamp.getFullYear();
                var ContextEcgTime = ("0" + timestamp.getHours()).slice(-2) + ":" + ("0" + timestamp.getMinutes()).slice(-2) + ":" + ("0" + timestamp.getSeconds()).slice(-2);
                document.getElementById("contextecgdate").innerHTML = ContextEcgDate;
                document.getElementById("contextecgtime").innerHTML = ContextEcgTime;

                let result1 = ecg.replace(/\]\[/g, ", ").trim();
                result1 = result1.replace(/\]/g, "").trim();
                result1 = result1.replace(/\[/g, "").trim();
                var final_ecg = result1.split(",").map(Number);

                ECG_data(final_ecg);
              } else {
                document.getElementById("contextecgdate").innerHTML = "";
                document.getElementById("contextecgtime").innerHTML = "";
                var echartLinecontext = echarts.init(document.getElementById("context_ecg"));
                echartLinecontext.clear();
                echartLinecontext.setOption(NoEcgData);
              }
            } else {
              document.getElementById("contextecgdate").innerHTML = "";
              document.getElementById("contextecgtime").innerHTML = "";
              var echartLinecontext = echarts.init(document.getElementById("context_ecg"));
              echartLinecontext.clear();
              echartLinecontext.setOption(NoEcgData);
            }
          }),
          // LEAD
          lead_config.once("value", function (snapshot) {
            if (snapshot.exists()) {
              const data = snapshot.val() || {};
              console.log("LEAD ", data);
              const key = Object.keys(data)[0];
              if (key) {
                const lead = data[key];
                document.getElementById("contextecglead").innerHTML = lead;
              }
            }
          }),
          // PPG
          ppgref1.once("value", function (snapshot) {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const ppg = data?.payload ? data.payload : null;

              if (ppg != null) {
                var ContextPpgDate = ("0" + timestamp.getDate()).slice(-2) + "/" + ("0" + (timestamp.getMonth() + 1)).slice(-2) + "/" + timestamp.getFullYear();
                var ContextPpgTime = ("0" + timestamp.getHours()).slice(-2) + ":" + ("0" + timestamp.getMinutes()).slice(-2) + ":" + ("0" + timestamp.getSeconds()).slice(-2);

                document.getElementById("contextppgdate").innerHTML = ContextPpgDate;
                document.getElementById("contextppgtime").innerHTML = ContextPpgTime;

                let result1 = ppg.replace(/\,/g, "").trim();
                var final_ppg = result1.split(" ").map(Number);
                PPG_data(final_ppg);
              } else {
                document.getElementById("contextppgdate").innerHTML = "";
                document.getElementById("contextppgtime").innerHTML = "";

                var echartLinecontext = echarts.init(document.getElementById("context_ppg"));
                echartLinecontext.clear();
                echartLinecontext.setOption(NoPpgData);
              }
            } else {
              document.getElementById("contextppgdate").innerHTML = "";
              document.getElementById("contextppgtime").innerHTML = "";

              var echartLinecontext = echarts.init(document.getElementById("context_ppg"));
              echartLinecontext.clear();
              echartLinecontext.setOption(NoPpgData);
            }
          }),

          rrref1.once("value", function (snapshot) {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const rr = data?.payload ? data.payload : null;

              if (rr != null) {
                var ContextRrDate = ("0" + timestamp.getDate()).slice(-2) + "/" + ("0" + (timestamp.getMonth() + 1)).slice(-2) + "/" + timestamp.getFullYear();
                var ContextRrTime = ("0" + timestamp.getHours()).slice(-2) + ":" + ("0" + timestamp.getMinutes()).slice(-2) + ":" + ("0" + timestamp.getSeconds()).slice(-2);
                document.getElementById("contextrrdate").innerHTML = ContextRrDate;
                document.getElementById("contextrrtime").innerHTML = ContextRrTime;

                let result1 = rr.replace(/\,/g, "").trim();
                var final_rr = result1.split(" ").map(Number);
                RR_data(final_rr);
              } else {
                document.getElementById("contextrrdate").innerHTML = "";
                document.getElementById("contextrrtime").innerHTML = "";

                var echartLinecontext = echarts.init(document.getElementById("context_rr"));
                echartLinecontext.clear();
                echartLinecontext.setOption(NoRRData);
              }
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
