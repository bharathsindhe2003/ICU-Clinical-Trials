import { fb } from "../firebase/config.js";
import { heartrate_data, blood_pressure_data, respiration_rate_data, acceleration_data, blood_oxygen_data, temperature_data, ews_value_passing } from "../livepage/live-custom.js";
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
var scale;
var option1;
var value;

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

var patientRef = patientsDataRef.child(id);

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

      heartrate_data("", heart_rate);
      respiration_rate_data("", respiration_rate);
      temperature_data("", temp);
      blood_oxygen_data("", spo2);
      blood_pressure_data("", "", contextsbp, contextdbp);
      acceleration_data("", acc);

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
              ECG_data("", ContextEcgDate, ContextEcgTime, option1, value, final_ecg, scale);
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
              PPG_data("", ContextPpgDate, ContextPpgTime, option1, value, final_ppg, scale);
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
              RR_data("", final_rr);
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

              ECG_data("", ContextEcgDate, ContextEcgTime, option1, value, final_ecg, scale);
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

              PPG_data("", ContextPpgDate, ContextPpgTime, option1, value, final_ppg, scale);
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
              RR_data("", final_rr);
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

function logout() {
  console.log("Logging out...");
  localStorage.removeItem("doctor_id");
  window.location.replace("login.html");
}
function ECG_data(LiveEcgValues, ecgdate, ecgtime, option1, value, ecgdata, endzoom) {
  console.log("EcgValues in echarts", "context:", ecgdata);
  var EcgData;
  var contextECG;
  var echartLine;
  var value1;
  var echartLinecontext;
  if ($("#context_ecg").length) {
    echartLinecontext = echarts.init(document.getElementById("context_ecg"));
    EcgData = ecgdata;
    console.log("context_ecg in echarts", EcgData);
  } else if ($("#LiveECGId").length) {
    console.log("Live  in echarts");
    echartLine = echarts.init(document.getElementById("LiveECGId"));
    EcgData = LiveEcgValues;
  }

  var reference_data = [
    [-20, 100],
    [-30, 100],
    [-30, 201],
    [-50, 201],
    [-50, 100],
    [-60, 100],
  ];

  var counter = 0;

  function randomData() {
    value1 = EcgData[counter % EcgData.length];
    counter++;
    return {
      name: counter % EcgData.length,
      value: [counter % EcgData.length, Math.round(value1)],
    };
  }

  var data = [];
  try {
    for (var i = 1; i < EcgData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.log("EcgData.length:", e.message);
  }
  var isZoomed = false;
  console.log("ecg data after push", data);
  var plot = {
    title: {
      top: "0px",
      left: "35px",
      text: "",
      textStyle: {
        fontSize: 12,
        fontStyle: "normal",
      },
    },
    grid: {
      top: 40,
      left: 40,
      right: 20,
      bottom: 52,
      width: "auto",
      height: "auto",
    },
    toolbox: {
      orient: "",
      right: 8,
      feature: {
        myTool1: {
          show: isZoomed,
          title: "Reset",
          icon: "image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PgogICAgICAgIDwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgCiAgICAgICAgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+ICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgPiA8cGF0aCBkPSJNMTAgMmg0IiAvPiA8cGF0aCBkPSJNMTIgMTR2LTQiIC8+IDxwYXRoIGQ9Ik00IDEzYTggOCAwIDAgMSA4LTcgOCA4IDAgMSAxLTUuMyAxNEw0IDE3LjYiIC8+IDxwYXRoIGQ9Ik05IDE3SDR2NSIgLz4gPC9zdmc+ICA=",
          fontSize: 28,
          onclick: function () {
            (echartLinecontext || echartLine).dispatchAction({
              type: "dataZoom",
              start: 0,
              endValue: endzoom,
            });
          },
        },
      },
    },

    dataZoom: [
      {
        id: "dataZoomX",
        type: "slider",
        xAxisIndex: [0],
        filterMode: "none",
        zoomLock: false,
        showDetail: false,
        height: 25,
        handleIcon: "pin",
        handleStyle: {
          color: "#0865C1",
          borderColor: "#ACB8D1",
          borderWidth: 1,
        },
      },
    ],
    xAxis: {
      type: "value",
      splitNumber: 25,
      splitLine: {
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      grid: {
        show: false,
      },
      minorSplitLine: {
        show: true,
        lineStyle: {
          color: "#23B5E4",
          width: 0.5,
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
      },
      alignTicks: false,
    },
    yAxis: {
      type: "value",
      show: true,
      splitLine: {
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      max: function (value) {
        return value.max + 99;
      },
      grid: {
        show: false,
      },
      minorSplitLine: {
        show: true,
        lineStyle: {
          color: "#23B5E4",
          width: 0.5,
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
      },
      alignTicks: false,
    },

    series: [
      {
        name: "????",
        type: "line",
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        data: data,
        animation: false,
        smooth: false,
        lineStyle: {
          color: "#ffffff",
          width: 1.6,
        },
        labelLine: {
          show: false,
        },
        seriesLayoutBy: "column",
      },
      {
        name: "????",
        type: "line",
        showSymbol: false,
        hoverAnimation: false,
        data: reference_data,
        lineStyle: {
          color: "#ffffff",
          width: 1.5,
        },
        label: {
          show: false,
        },
      },
    ],
  };

  try {
    if (EcgData.length < 625 && endzoom == 0) {
      option1 = {
        title: {
          text: "WAITING FOR VALID ECG",
          textStyle: {
            fontSize: "18",
            fontFamily: "Verdana",
            color: "#0686AF",
          },
          left: "center",
          top: "middle",
          dataZoom: [
            {
              type: "inside",
              yAxisIndex: "none",
              xAxisIndex: "none",
              filterMode: "none",
              show: true,
              realtime: true,
              start: 0,
              end: 100,
            },
            {
              type: "slider",
              show: true,
              showDetail: false,
              handleSize: "100%",
              handleColor: "#056F94",
            },
          ],
          series: {
            show: false,
          },
          xaxis: {
            grid: {
              show: false,
            },
          },
          yaxis: {
            grid: {
              show: false,
            },
          },
        },
      };

      if ($("#context_ecg").length) {
        echartLinecontext.clear();
        echartLinecontext.setOption(option1);
      } else if ($("#LiveECGId").length) {
        echartLine.clear();
        echartLine.setOption(option1);
      }
    } else {
      if ($("#context_ecg").length) {
        if (context_ecg.length < 625) {
          echartLinecontext.setOption(NoEcgData);
        } else {
          echartLinecontext.setOption(plot);
        }
        echartLinecontext.dispatchAction({
          type: "dataZoom",
          endValue: 658,
        });
      } else if ($("#LiveECGId").length) {
        echartLine.setOption(plot);
        if (endzoom !== 0) {
          echartLine.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      }
      echartLine.on("dataZoom", function (params) {
        console.log(params.start, params.end);
        if (params.start !== 0 || params.end !== undefined) {
          console.log("in if");
          isZoomed = true;
          plot.toolbox.feature.myTool1.show = isZoomed;
          echartLine.setOption(plot);
          console.log(plot);
        } else {
          isZoomed = false;
          plot.toolbox.feature.myTool1.show = isZoomed;
          echartLine.setOption(plot);
        }
      });
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}

function PPG_data(LivePpgValues, ecgdate, ecgtime, option1, value, ppgdata, endzoom) {
  console.log("PPG_data called with:", {
    LivePpgValues: LivePpgValues ? LivePpgValues.length : "null/undefined",
    ppgdata: ppgdata ? ppgdata.length : "null/undefined",
    endzoom: endzoom,
  });

  var PpgData;
  var echartLine;
  var echartLinecontext;
  var value1;
  var ppgOption;
  var counter = 0;
  console.log(" PPG $('#context_ppg').length", $("#context_ppg").length, "$('#LivePPGId').length", $("#LivePPGId").length);

  if ($("#context_ppg").length) {
    echartLinecontext = echarts.init(document.getElementById("context_ppg"));
    PpgData = ppgdata;
  } else if ($("#LivePPGId").length) {
    console.log("ppg in live", PpgData);
    echartLine = echarts.init(document.getElementById("LivePPGId"));
    PpgData = LivePpgValues;
  }

  function randomData() {
    if (PpgData.length === 0) return { value: [0, 0] };
    value1 = PpgData[counter % PpgData.length];
    counter++;
    return {
      value: [counter % PpgData.length, Math.round(value1)],
    };
  }
  var data = [];
  try {
    for (var i = 1; i < PpgData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.log("PPG error:", e.message);
  }

  console.log("PPG data after push", data.length, data);

  try {
    console.log("PPG condition check: PpgData.length =", PpgData.length, "endzoom =", endzoom);
    // Check if we have insufficient data (less than 500) OR if this is initial load (endzoom == 0)
    // For your case with 599 data points, this should go to the else block
    if (PpgData && PpgData.length > 0) {
      // render chart as before
      ppgOption = {
        grid: {
          top: 5,
          left: 40,
          right: 40,
          bottom: 52,
        },
        toolbox: {
          orient: "vertical",
          right: 5,
          feature: {
            myTool1: {
              show: true,
              title: "Reset",
              icon: "image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PgogICAgICAgIDwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgCiAgICAgICAgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+ICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgPiA8cGF0aCBkPSJNMTAgMmg0IiAvPiA8cGF0aCBkPSJNMTIgMTR2LTQiIC8+IDxwYXRoIGQ9Ik00IDEzYTggOCAwIDAgMSA4LTcgOCA4IDAgMSAxLTUuMyAxNEw0IDE3LjYiIC8+IDxwYXRoIGQ9Ik05IDE3SDR2NSIgLz4gPC9zdmc+ICA=",
              onclick: function () {
                (echartLinecontext || echartLine).dispatchAction({
                  type: "dataZoom",
                  start: 0,
                  endValue: endzoom,
                });
              },
            },
          },
        },
        dataZoom: [
          {
            id: "dataZoomX",
            type: "slider",
            xAxisIndex: [0],
            filterMode: "none",
            zoomLock: false,
            showDetail: false,
            height: 25,
            handleIcon: "pin",
            handleStyle: {
              color: "#0865C1",
              borderColor: "#ACB8D1",
              borderWidth: 1,
            },
          },
        ],
        xAxis: {
          type: "value",
          splitNumber: 25,
          splitLine: {
            show: false,
            lineStyle: {
              color: "#0686AF",
              width: 1.2,
            },
          },
          grid: {
            show: false,
          },
          minorSplitLine: {
            show: false,
            lineStyle: {
              color: "#23B5E4",
              width: 0.5,
            },
          },
          axisLine: {
            show: true,
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          minorTick: {
            show: false,
          },
          alignTicks: false,
        },
        yAxis: {
          type: "value",
          show: false,
          splitLine: {
            lineStyle: {
              color: "#0686AF",
              width: 1.2,
            },
          },
          min: function (value) {
            return value.min - 10;
          },
          max: function (value) {
            return value.max + 100;
          },
          grid: {
            show: false,
          },
          minorSplitLine: {
            show: false,
            lineStyle: {
              color: "#23B5E4",
              width: 0.5,
            },
          },
          axisLine: {
            show: true,
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          minorTick: {
            show: false,
          },
          alignTicks: false,
        },
        series: [
          {
            name: "????",
            type: "line",
            xAxisIndex: 0,
            yAxisIndex: 0,
            showSymbol: false,
            data: data,
            animation: false,
            smooth: false,
            lineStyle: {
              color: "#FFFFFF",
              width: 1.6,
            },
            labelLine: {
              show: false,
            },
            seriesLayoutBy: "column",
          },
        ],
      };
      if ($("#context_ppg").length && echartLinecontext) {
        echartLinecontext.clear();
        echartLinecontext.setOption(ppgOption);
        if (endzoom !== 0) {
          echartLinecontext.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      } else if ($("#LivePPGId").length) {
        echartLine.clear();
        echartLine.setOption(ppgOption);
        if (endzoom !== 0) {
          echartLine.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      }
    } else {
      // No data: clear chart (or optionally show a blank chart)
      if ($("#context_ppg").length && echartLinecontext) {
        echartLinecontext.clear();
      } else if ($("#LivePPGId").length) {
        echartLine.clear();
      }
    }
  } catch (e) {
    console.log("PPG building chart:", e.message);
  }
}

function RR_data(LiveRrValues, rrdata) {
  console.log("RrValues in echarts", LiveRrValues, "context:", rrdata);
  var RrData;
  var echartLine;
  var echartLinecontext;
  var value1;
  if ($("#context_rr").length) {
    echartLinecontext = echarts.init(document.getElementById("context_rr"));
    RrData = rrdata;

    console.log("rr in echarts", RrData);
  } else if ($("#LiveRRId").length) {
    console.log("rr in live", RrData);
    echartLine = echarts.init(document.getElementById("LiveRRId"));
    RrData = LiveRrValues;
  }
  var counter = 0;
  function randomData() {
    value1 = RrData[counter % RrData.length];
    counter++;
    return {
      value: [counter, value1],
    };
  }
  var data = [];
  try {
    for (var i = 1; i < RrData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.log("RrData.length:", e.message);
  }
  console.log("rr data after push", data);
  var plot = {
    title: {
      top: "0px",
      left: "35px",
      text: "",
      textStyle: {
        fontSize: 12,
        fontStyle: "normal",
      },
    },
    grid: {
      top: 40,
      left: 40,
      right: 20,
      bottom: 52,
    },
    toolbox: {
      orient: "vertical",
      right: 5,
      feature: {
        myTool1: {
          show: true,
          title: "Reset",
          icon: "image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PgogICAgICAgIDwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgCiAgICAgICAgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+ICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgPiA8cGF0aCBkPSJNMTAgMmg0IiAvPiA8cGF0aCBkPSJNMTIgMTR2LTQiIC8+IDxwYXRoIGQ9Ik00IDEzYTggOCAwIDAgMSA4LTcgOCA4IDAgMSAxLTUuMyAxNEw0IDE3LjYiIC8+IDxwYXRoIGQ9Ik05IDE3SDR2NSIgLz4gPC9zdmc+ICA=",
          onclick: function () {
            (echartLinecontext || echartLine).dispatchAction({
              type: "dataZoom",
              start: 0,
              endValue: 250,
            });
          },
        },
      },
    },
    dataZoom: [
      {
        id: "dataZoomX",
        type: "slider",
        xAxisIndex: [0],
        filterMode: "none",
        zoomLock: false,
        showDetail: false,
        height: 25,
        handleIcon: "pin",
        handleStyle: {
          color: "#0865C1",
          borderColor: "#ACB8D1",
          borderWidth: 1,
        },
      },
    ],
    xAxis: {
      type: "value",
      splitNumber: 25,
      splitLine: {
        show: false,
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      grid: {
        show: false,
      },
      minorSplitLine: {
        show: false,
        lineStyle: {
          color: "#23B5E4",
          width: 0.5,
        },
      },
      axisLine: {
        show: true,
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
      },
      alignTicks: false,
    },
    yAxis: {
      type: "value",
      show: false,

      splitLine: {
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      min: function (value) {
        return value.min - 10;
      },
      max: function (value) {
        return value.max + 10;
      },
      grid: {
        show: false,
      },

      minorSplitLine: {
        show: false,
        lineStyle: {
          color: "#23B5E4",
          width: 0.5,
        },
      },
      axisLine: {
        show: true,
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
      },
      alignTicks: false,
    },
    series: [
      {
        name: "RR",
        type: "line",
        showSymbol: false,
        data: data,
        animation: false,
        smooth: true,
        lineStyle: { color: "#ffffff", width: 2.0 },
        connectNulls: true,
      },
    ],
  };

  try {
    if (RrData.length < 120) {
      option1 = {
        title: {
          text: "WAITING FOR VALID RR",
          textStyle: {
            fontSize: "18",
            fontFamily: "Verdana",
            color: "#0686AF",
          },
          left: "center",
          top: "middle",
          dataZoom: [
            {
              type: "inside",
              yAxisIndex: "none",
              xAxisIndex: "none",
              filterMode: "none",
              show: true,
              realtime: true,
              start: 0,
              end: 100,
            },
            {
              type: "slider",
              show: true,
              showDetail: false,
              handleSize: "100%",
              handleColor: "#056F94",
            },
          ],

          series: {
            show: false,
          },
          xaxis: {
            grid: {
              show: false,
            },
          },
          yaxis: {
            grid: {
              show: false,
            },
          },
        },
      };
      if ($("#context_rr").length) {
        echartLinecontext.clear();
        echartLinecontext.setOption(option1);
      } else if ($("#LiveRRId").length) {
        echartLine.clear();
        echartLine.setOption(option1);
      }
    } else {
      if ($("#context_rr").length) {
        if (context_rr.length < 120) {
          echartLinecontext.setOption(NoRRData);
        } else {
          echartLinecontext.setOption(plot);
        }
      } else if ($("#LiveRRId").length) {
        echartLine.setOption(plot);
      }
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}
