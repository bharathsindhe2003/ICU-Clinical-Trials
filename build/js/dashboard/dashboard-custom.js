import { fb } from "../firebase/config.js";
import { patient_details } from "./Dashboard-UI.js";

document.getElementById("loader").className = "loader";

const ews_list = fb.database().ref().child("EWS");
const ecg_list = fb.database().ref().child("ECG_plot");
const ppg_list = fb.database().ref().child("PPG_plot");
const rr_list = fb.database().ref().child("RR_plot");
const vital_list = fb.database().ref().child("patientlivedata7s");
const pat_bp_5sec_ref = fb.database().ref().child("PAT_BP_5s_tree");

const chartRegistry = new Map();
const DEFAULT_EWS_VALUE = "--";
const DEFAULT_EWS_COLOR = "0";
const PATIENT_ID_INDEX = 4;
const PATIENT_EWS_VALUE_INDEX = 5;
const PATIENT_EWS_COLOR_INDEX = 6;
const PATIENT_HR_INDEX = 7;
const PATIENT_BP_INDEX = 8;
const PATIENT_SPO2_INDEX = 9;
const PATIENT_TEMP_INDEX = 10;
const PATIENT_RR_INDEX = 11;
const PATIENT_ECG_INDEX = 12;
const PATIENT_ECG_TIMESTAMP_INDEX = 13;
const PATIENT_PPG_INDEX = 14;
const PATIENT_PPG_TIMESTAMP_INDEX = 15;
const PATIENT_RR_WAVE_INDEX = 16;
const PATIENT_RR_TIMESTAMP_INDEX = 17;

// let pat_bp_5sec_ref = fb.database().ref().child("PAT_BP_5s_tree");
var doctor_id = localStorage.getItem("doctor_id");
var doctor_name = localStorage.getItem("docname");
var ref_doc_id = localStorage.getItem("doc_registerId");

var DoctorNameElement = document.getElementById("DoctorName");

if (DoctorNameElement && doctor_name) {
  DoctorNameElement.innerHTML = "Dr. " + doctor_name;
  firebase_Data_retrieval(ref_doc_id);
} else {
  console.warn('[dashboard-custom.js] Element with id "DoctorName" not found.');
}

function firebase_Data_retrieval(ref_doc_id) {
  try {
    var patient_list = fb.database().ref().child("patients");
    patient_list.on(
      "value",
      function (snapshot) {
        try {
          var patient_info = [];

          snapshot.forEach((data) => {
            let patients_string = JSON.stringify(data.val(), null, 2);
            let patients_json = JSON.parse(patients_string);

            var doc_id = patients_json.docId;
            if (doc_id === ref_doc_id) {
              var id = patients_json.id.toString();
              patient_info.push([patients_json.username, patients_json.age, patients_json.gender, patients_json.ailment, id]);
            }
          });

          localStorage.setItem("patient_info", JSON.stringify(patient_info));

          const Obtain_ews = new Promise((resolve, reject) => {
            if (patient_info.length === 0) {
              resolve(patient_info);
              return;
            }

            const loadedEwsPatients = new Set();

            for (let i = 0; i < patient_info.length; i++) {
              const currentPatient = patient_info[i];
              const currentPatientId = currentPatient[PATIENT_ID_INDEX];

              ews_list
                .child(currentPatientId)
                .orderByKey()
                .limitToLast(1)
                .on("value", function (snapshot) {
                  let nextEwsValue = DEFAULT_EWS_VALUE;
                  let nextEwsColor = DEFAULT_EWS_COLOR;

                  if (snapshot.val() != null) {
                    snapshot.forEach((data) => {
                      let ews_string = JSON.stringify(data.val(), null, 2);
                      let ews_json = JSON.parse(ews_string);
                      nextEwsValue = ews_json.ews_score.toString();
                      nextEwsColor = ews_json.color.toString();
                    });
                  }

                  currentPatient[PATIENT_EWS_VALUE_INDEX] = nextEwsValue;
                  currentPatient[PATIENT_EWS_COLOR_INDEX] = nextEwsColor;
                  refreshews(nextEwsValue, nextEwsColor, currentPatientId);

                  if (!loadedEwsPatients.has(currentPatientId)) {
                    loadedEwsPatients.add(currentPatientId);
                  }

                  if (loadedEwsPatients.size === patient_info.length) {
                    resolve(patient_info);
                  }
                });
            }
          });
          Obtain_ews.then((value) => {
            if (patient_info.length == value.length) {
              patient_details(value);
            }
          });
          const latest5secHR = [];

          for (let i = 0; i < patient_info.length; i++) {
            const uuid = patient_info[i][4];
            pat_bp_5sec_ref.child(uuid).on("value", (snapshot) => {
              var ID = uuid;
              const val = snapshot.val();
              if (val != null) {
                const timestamps = Object.keys(val)
                  .map((k) => Number(k))
                  .filter((n) => Number.isFinite(n));
                if (timestamps.length === 0) return;
                const maxTs = Math.max(...timestamps);
                const latest = val[maxTs];
                if (latest && typeof latest.ECG_HR === "number") {
                  // Find existing entry
                  const idx = latest5secHR.findIndex((entry) => entry.patientId === ID);
                  if (idx !== -1) {
                    // Update existing
                    latest5secHR[idx] = {
                      patientId: ID,
                      HR: latest.ECG_HR,
                      timestamps: maxTs,
                    };
                  } else {
                    latest5secHR.push({
                      patientId: ID,
                      HR: latest.ECG_HR,
                      timestamps: maxTs,
                    });
                  }
                }
              }
            });
          }

          var vitalinfo = [];
          for (let i = 0; i < patient_info.length; i++) {
            const currentPatient = patient_info[i];
            const currentPatientId = currentPatient[PATIENT_ID_INDEX];
            vital_list.child(currentPatientId).on("value", (snapshot) => {
              let patientId = currentPatientId;
              let patientlivedata7s_timestamp = null;
              if (snapshot.val() != null) {
                const data = snapshot.val() || {};
                patientId = data.userId || currentPatientId;
                patientlivedata7s_timestamp = data.timestamp || null;

                const latest = latest5secHR.find((entry) => entry.patientId === currentPatientId);
                const latestPatHr = latest ? latest.HR : null;
                const latestPatHrTs = latest ? latest.timestamps : null;

                if (latestPatHr !== null && typeof latestPatHrTs === "number" && Number.isFinite(latestPatHrTs) && !isNaN(latestPatHrTs) && Date.now() / 1000 - latestPatHrTs < 10) {
                  currentPatient[PATIENT_HR_INDEX] = data.hr === "00" || data.hr === "0" || data.hr === 0 ? "--" : latestPatHr;
                } else {
                  currentPatient[PATIENT_HR_INDEX] = data.hr === "00" || data.hr === "0" || data.hr === 0 ? "--" : data.hr;
                }

                if (data.bp == "0/0") {
                  currentPatient[PATIENT_BP_INDEX] = "--/--";
                } else {
                  currentPatient[PATIENT_BP_INDEX] = data.bp;
                }
                if (data.spo == "00") {
                  currentPatient[PATIENT_SPO2_INDEX] = "--";
                } else {
                  currentPatient[PATIENT_SPO2_INDEX] = data.spo;
                }
                if (parseFloat(data.temp) == 0.0 || parseFloat(data.temp) >= 238.48) {
                  currentPatient[PATIENT_TEMP_INDEX] = "--";
                } else {
                  currentPatient[PATIENT_TEMP_INDEX] = parseFloat(data.temp).toFixed(2);
                }
                if (data.rr == "0") {
                  currentPatient[PATIENT_RR_INDEX] = "--";
                } else {
                  currentPatient[PATIENT_RR_INDEX] = data.rr;
                }
              } else {
                currentPatient[PATIENT_HR_INDEX] = "--";
                currentPatient[PATIENT_BP_INDEX] = "--/--";
                currentPatient[PATIENT_SPO2_INDEX] = "--";
                currentPatient[PATIENT_TEMP_INDEX] = "--";
                currentPatient[PATIENT_RR_INDEX] = "--";
                vitalinfo.push([
                  currentPatient[PATIENT_HR_INDEX],
                  currentPatient[PATIENT_RR_INDEX],
                  currentPatient[PATIENT_TEMP_INDEX],
                  currentPatient[PATIENT_SPO2_INDEX],
                  currentPatient[PATIENT_BP_INDEX],
                ]);
              }

              refreshvitals(
                currentPatient[PATIENT_HR_INDEX],
                currentPatient[PATIENT_BP_INDEX],
                currentPatient[PATIENT_TEMP_INDEX],
                currentPatient[PATIENT_RR_INDEX],
                currentPatient[PATIENT_SPO2_INDEX],
                patientId,
              );
              ews_list
                .child(currentPatientId)
                .orderByKey()
                .limitToLast(1)
                .once("value", (snapshot) => {
                  const data = snapshot.val() || {};
                  const key = Object.keys(data)[0];
                  const timestamp = data[key].timestamp || null;
                  if (timestamp != null && patientlivedata7s_timestamp != null) {
                    const nexttimestampdiffernce = patientlivedata7s_timestamp - timestamp;
                    if (nexttimestampdiffernce > 70) {
                      refreshews("--", "0", currentPatientId);
                    }
                  }
                });
            });
          }
          var ecg_info = [];
          for (let i = 0; i < patient_info.length; i++) {
            const currentPatient = patient_info[i];
            const currentPatientId = currentPatient[PATIENT_ID_INDEX];

            ecg_list.child(currentPatientId).on("value", function (snapshot) {
              const ecgData = snapshot.val() || {};
              if (ecgData != null) {
                let type = ecgData.type;
                let ecg1 = ecgData.ecg || "";
                let timestamp = ecgData.timestamp;

                if (type == "noise" || type == "flat") {
                  currentPatient[PATIENT_ECG_INDEX] = [];
                } else {
                  var ecg_text = ecg1;
                  let ecg_result = ecg_text.replace(/\]\[/g, ", ").trim();
                  ecg_result = ecg_result.replace(/\]/g, "").trim();
                  ecg_result = ecg_result.replace(/\[/g, "").trim();
                  var ecgvalue = ecg_result.split(",").map(Number);

                  currentPatient[PATIENT_ECG_INDEX] = ecgvalue;
                }

                var f_ecgtimestamp = timestamp;
                var date = new Date(f_ecgtimestamp * 1000);
                var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
                ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
                ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;

                var dt = ecgdate + " " + ecgtime;
                currentPatient[PATIENT_ECG_TIMESTAMP_INDEX] = dt;
              } else {
                currentPatient[PATIENT_ECG_INDEX] = [];
                currentPatient[PATIENT_ECG_TIMESTAMP_INDEX] = "";
              }

              createECGchart(currentPatient[PATIENT_ECG_INDEX], currentPatientId);
            });
          }

          const ppg_info = [];
          for (let i = 0; i < patient_info.length; i++) {
            const currentPatient = patient_info[i];
            const currentPatientId = currentPatient[PATIENT_ID_INDEX];

            ppg_list.child(currentPatientId).on("value", function (snapshot) {
              const ppgData = snapshot.val() || {};
              if (ppgData != null) {
                let ppg_data = ppgData.ppg;

                let result1;
                if (typeof ppg_data === "string") {
                  result1 = ppg_data.replace(/\,/g, "").trim();
                } else {
                  result1 = "";
                }

                var final_ppg = result1
                  .split(" ")
                  .map(Number)
                  .filter((n) => !isNaN(n));

                currentPatient[PATIENT_PPG_INDEX] = final_ppg;

                var f_ecgtimestamp = ppgData.timestamp;
                var date = new Date(f_ecgtimestamp * 1000);
                var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
                ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
                ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;

                var dt = ecgdate + " " + ecgtime;
                currentPatient[PATIENT_PPG_TIMESTAMP_INDEX] = dt;
              } else {
                currentPatient[PATIENT_PPG_INDEX] = [];
                currentPatient[PATIENT_PPG_TIMESTAMP_INDEX] = "";
              }
              createPPGchart(currentPatient[PATIENT_PPG_INDEX], currentPatientId);
            });
          }
          const rr_info = [];
          for (let i = 0; i < patient_info.length; i++) {
            const currentPatient = patient_info[i];
            const currentPatientId = currentPatient[PATIENT_ID_INDEX];

            rr_list.child(currentPatientId).on("value", function (snapshot) {
              const rrdata = snapshot.val();
              if (snapshot.val() != null) {
                let rr_data = rrdata.res;
                let rr_timestamp = rrdata.timestamp;

                let result1 = rr_data.replace(/\,/g, "").trim();
                var final_rr = result1.split(" ").map(Number);
                currentPatient[PATIENT_RR_WAVE_INDEX] = final_rr;

                var date = new Date(rr_timestamp * 1000);
                var rrdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                var rrtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
                rrdate = date == undefined ? (rrdate = "--/--/----") : rrdate;
                rrtime = date == undefined ? (rrtime = "--/--/----") : rrtime;
                var dt = rrdate + " " + rrtime;
                currentPatient[PATIENT_RR_TIMESTAMP_INDEX] = dt;
              } else {
                currentPatient[PATIENT_RR_WAVE_INDEX] = [];
                currentPatient[PATIENT_RR_TIMESTAMP_INDEX] = "";
              }
              createRRchart(currentPatient[PATIENT_RR_WAVE_INDEX], currentPatientId);
            });
          }

          // Use limittolast logic
          // for (let i = 0; i < patient_info.length; i++) {
          //   const patientId = patient_info[i][4];
          //   // console.log("LOOPING", patientId);
          //   const ref_valid = fb.database().ref().child("validpatientlivedata").child(patientId).orderByKey().limitToLast(1); //1 minute data
          //   const ecg_min = fb.database().ref().child("patientecgdata").child(patientId).orderByKey().limitToLast(1);
          //   const ppg_min = fb.database().ref().child("patientppgdata").child(patientId).orderByKey().limitToLast(1);
          //   const rr_min = fb.database().ref().child("patientrrdata").child(patientId).orderByKey().limitToLast(1);
          //   Promise.all([ecg_min.once("value"), ppg_min.once("value"), rr_min.once("value"), ref_valid.once("value")])
          //     .then(([ecgSnapshot, ppgSnapshot, rrSnapshot, refValidSnapshot]) => {
          //       const data = refValidSnapshot.val() || {};
          //       const key = Object.keys(data)[0];
          //       // vitals
          //       const data1 = data[key] || {};
          //       const lastTimestamp = data1.timestamp;
          //       console.log("LOOPING valid data", patientId, data, lastTimestamp);
          //       let respiration_rate = data1.rr === "00" || data1.rr === "0" || data1.rr === 0 ? "--" : data1.rr;

          //       let heart_rate = data1.hr === "00" || data1.hr === "0" || data1.hr === 0 ? "--" : data1.hr;
          //       let spo2 = data1.spo === "00" || data1.spo === "0" || data1.spo === 0 ? "--" : data1.spo;
          //       let bp_text = data1.bp === 0 / 0 || data1.bp === "0/0" || data1.bp === "--/--" ? "--/--" : data1.bp;

          //       let oldtemp = data1.temp;
          //       let parsedTemp = parseFloat(String(oldtemp).replace(/[^0-9.+-]/g, ""));
          //       let temp = isNaN(parsedTemp) ? "--" : parsedTemp;

          //       console.log("LOOPING vitals", heart_rate, bp_text, oldtemp, respiration_rate, spo2, patientId);
          //       refreshvitals(heart_rate, bp_text, temp, respiration_rate, spo2, patientId);
          //       // ecg
          //       const ecgData = ecgSnapshot.val() || {};
          //       const ecgKey = Object.keys(ecgData)[0];
          //       const ecg = ecgData[ecgKey].payload;
          //       const type = ecgData[ecgKey].type;
          //       let final_min_ecg = [];

          //       if (typeof ecg === "string" && type !== "noise" && type !== "flat") {
          //         let ecg_result = ecg.replace(/\]\[/g, ", ").trim();
          //         ecg_result = ecg_result.replace(/\]/g, "").trim();
          //         ecg_result = ecg_result.replace(/\[/g, "").trim();
          //         final_min_ecg = ecg_result
          //           .split(",")
          //           .map(Number)
          //           .filter((value) => !isNaN(value));
          //       }

          //       if (final_min_ecg.length > 625) {
          //         final_min_ecg = final_min_ecg.slice(-625);
          //       }
          //       createECGchart(final_min_ecg, patientId);

          //       // ppg
          //       const ppgDataValue = ppgSnapshot.val() || {};
          //       // const latestPPGEntry = getLatestSnapshotEntry(ppgDataValue);
          //       // const PPGkey = latestPPGEntry.key;
          //       // const latestPPG = latestPPGEntry.value;
          //       const ppgDataKey = Object.keys(ppgDataValue)[0];
          //       const ppgdata = ppgDataValue[ppgDataKey].payload;
          //       let final_ppg = [];

          //       if (typeof ppgdata === "string") {
          //         let result1 = ppgdata.replace(/\,/g, "").trim();
          //         final_ppg = result1
          //           .split(" ")
          //           .map(Number)
          //           .filter((value) => !isNaN(value));
          //       }

          //       if (final_ppg.length > 500) {
          //         final_ppg = final_ppg.slice(-500);
          //       }
          //       createPPGchart(final_ppg, patientId);

          //       // RR
          //       const rrDataValue = rrSnapshot.val() || {};
          //       const rrDataKey = Object.keys(rrDataValue)[0];
          //       const rrdata = rrDataValue[rrDataKey].payload;
          //       let final_rr = [];

          //       if (typeof rrdata === "string") {
          //         final_rr = rrdata
          //           .replace(/,/g, " ")
          //           .trim()
          //           .split(/\s+/)
          //           .map(Number)
          //           .filter((value) => Number.isFinite(value));
          //       }

          //       if (final_rr.length > 125) {
          //         final_rr = final_rr.slice(-125);
          //       }
          //       createRRchart(final_rr, patientId);
          //     })
          //     .catch((error) => {
          //       console.error("[dashboard-custom.js] Error retrieving chart/vital snapshots for patient:", patientId, error);
          //     });
          // }
        } catch (e) {
          console.error("[dashboard-custom.js] Error processing patient data:", e);
        }
      },
      function (error) {
        console.error("[dashboard-custom.js] Error retrieving patient data:", error);
      },
    );
  } catch (e) {
    console.error("[dashboard-custom.js] Error in firebase_Data_retrieval:", e);
  }
}
function refreshews(ews_value, ews_color, ID) {
  var ewsvId = "ewsv" + ID;
  var ewscId = "ewsc" + ID;

  var ews_v = document.getElementById(ewsvId);
  var ews_c = document.getElementById(ewscId);
  console.log("[dashboard-custom.js]  refreshews", ID, ews_value, ews_color);
  if (ews_v === null) {
  } else {
    ews_v.textContent = ews_value;
    ews_c.style.background = ews_color;
  }
}

function getOrCreateChart(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    return null;
  }

  let chart = echarts.getInstanceByDom(container);
  if (!chart) {
    chart = echarts.init(container);
  }

  chartRegistry.set(containerId, chart);
  return chart;
}

function resizeAllCharts() {
  chartRegistry.forEach((chart, containerId) => {
    const container = document.getElementById(containerId);

    if (!container) {
      chartRegistry.delete(containerId);
      return;
    }

    chart.resize();
  });
}

window.addEventListener("resize", resizeAllCharts);
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    setTimeout(resizeAllCharts, 0);
  }
});

function createECGchart(ecg, Id) {
  var LiveECGId = "chart" + Id;
  var chart = getOrCreateChart(LiveECGId);

  if (!chart) {
    console.warn("[dashboard-custom.js] ECG container not found for ID:", LiveECGId);
    return;
  }

  var ecgData = ecg;
  var reference_data = [
    [-20, 100],
    [-30, 100],
    [-30, 201],
    [-50, 201],
    [-50, 100],
    [-60, 100],
  ];
  var counter = 0;
  var value;
  function randomData() {
    value = ecgData[counter % ecgData.length];

    counter++;
    return {
      value: [counter % ecgData.length, Math.round(value)],
    };
  }

  var data = [];

  try {
    for (var i = 1; i < ecgData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.error("[dashboard-custom.js] EcgData.length:", e);
  }
  if (ecgData.length < 625) {
    chart.clear();

    option1 = {
      title: {
        text: "WAITING FOR VALID ECG",
        textStyle: {
          fontSize: "10",
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
    chart.setOption(option1, true);
  } else {
    var endzoom = 0;
    var option1 = {
      title: {
        top: "0px",
        left: "15px",
        text: "",
        textStyle: {
          fontSize: 12,
          fontStyle: "normal",
        },
      },
      grid: {
        top: 5,
        left: 10,
        right: 10,
        bottom: 8,
      },
      toolbox: {
        orient: "vertical",
        right: 5,
        feature: {
          myTool1: {
            show: false,

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
          show: false,
          type: "slider",
          xAxisIndex: [0],
          filterMode: "none",
          zoomLock: false,
          showDetail: false,
          height: 10,
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

        splitLine: {
          lineStyle: {
            color: "#0686AF",
            width: 1.2,
          },
        },
        grid: {
          show: false,
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
            color: "#37FD12",
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
            color: "#37FD12",
            width: 1.5,
          },
          label: {
            show: false,
          },
        },
      ],
    };

    if (endzoom !== 0) {
      chart.dispatchAction({
        type: "dataZoom",
        endValue: endzoom,
      });
    }
    chart.setOption(option1, true);
  }
}
function createPPGchart(ppg, ID) {
  var LivePPGId = "ppgchart" + ID;
  var chart = getOrCreateChart(LivePPGId);

  if (!chart) {
    console.error("PPG container not found for ID:", LivePPGId);
    return;
  }

  var ppgData = ppg;

  var counter = 0;
  var value;
  function randomData() {
    value = ppgData[counter % ppgData.length];

    counter++;
    return {
      value: [counter % ppgData.length, value],
    };
  }

  var data = [];

  try {
    for (var i = 1; i < ppgData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.error("[dashboard-custom.js] EcgData.length:", e);
  }
  if (ppgData.length < 500) {
    chart.clear();

    option1 = {
      title: {
        text: "WAITING FOR VALID PPG",
        textStyle: {
          fontSize: "10",
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
    chart.setOption(option1, true);
  } else {
    var endzoom = 0;
    var option1 = {
      title: {
        top: "0px",
        left: "15px",
        text: "",
        textStyle: {
          fontSize: 12,
          fontStyle: "normal",
        },
      },
      grid: {
        top: 5,
        left: 10,
        right: 10,
        bottom: 8,
      },
      toolbox: {
        orient: "vertical",
        right: 5,
        feature: {
          myTool1: {
            show: false,

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
          show: false,
          type: "slider",
          xAxisIndex: [0],
          filterMode: "none",
          zoomLock: false,
          showDetail: false,
          height: 10,
          handleIcon: "pin",
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
        },
      ],
      xAxis: {
        show: false,
        type: "value",

        splitLine: {
          lineStyle: {
            color: "#0686AF",
            width: 1.2,
          },
        },
        grid: {
          show: false,
        },

        axisLine: {
          show: true,
          onZero: true,
          lineStyle: {
            color: "#FFFFFF",
            width: 1.2,
            opacity: 1,
          },
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
          return value.min - 40;
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
          onZero: true,
          lineStyle: {
            color: "#0686AF",
            width: 1.2,
          },
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
            color: "#37FD12",
            width: 1.6,
          },
          labelLine: {
            show: false,
          },
          seriesLayoutBy: "column",
        },
      ],
    };

    if (endzoom !== 0) {
      chart.dispatchAction({
        type: "dataZoom",
        endValue: endzoom,
      });
    }
    chart.setOption(option1, true);
  }
}
function createRRchart(rr, ID) {
  var LiveRRId = "rrchart" + ID;
  var chart = getOrCreateChart(LiveRRId);

  if (!chart) {
    console.error("[dashboard-custom.js] RR container not found for ID:", LiveRRId);
    return;
  }

  var rrData = rr;

  var counter = 0;
  function randomData() {
    var value = rrData[counter % rrData.length];
    counter++;
    return { value: [counter % rrData.length, value] };
  }
  console.log("[dashboard-custom.js] rrdata length", rrData.length);
  var data = [];
  try {
    for (var i = 1; i < rrData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.error("[dashboard-custom.js] RRData.length error:", e);
  }
  let option;
  chart.clear();
  if (rrData.length < 125) {
    option = {
      title: {
        text: "WAITING FOR VALID RR",
        textStyle: {
          fontSize: "10",
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
            //xAxisIndex: [0, 1],
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
  } else {
    option = {
      grid: { top: 5, left: 10, right: 10, bottom: 8 },
      xAxis: {
        type: "value",
        show: false,
        splitLine: { lineStyle: { color: "#0686AF", width: 1.2 } },
        axisLine: { show: true, lineStyle: { color: "#FFFFFF", width: 1.2 } },
      },
      yAxis: {
        type: "value",
        show: false,
        splitLine: { lineStyle: { color: "#0686AF", width: 1.2 } },
        axisLine: { show: true, lineStyle: { color: "#0686AF", width: 1.2 } },
      },
      series: [
        {
          name: "RR",
          type: "line",
          showSymbol: false,
          data: data,
          animation: false,
          smooth: true,
          lineStyle: { color: "#37FD12", width: 2.0 },
          connectNulls: true,
        },
      ],
    };
  }
  chart.setOption(option, true);
}
function refreshvitals(hr, bp, temp, rr, spo, ID) {
  var hrId = "hr" + ID;
  var bpId = "bp" + ID;
  var spoId = "spo" + ID;
  var rrId = "rr" + ID;
  var tempId = "temp" + ID;

  var hrv = document.getElementById(hrId);
  var bpv = document.getElementById(bpId);
  var rrv = document.getElementById(rrId);
  var spov = document.getElementById(spoId);
  var tempv = document.getElementById(tempId);

  function formatValue(val) {
    const value = Number(val);
    return value !== 0 && !isNaN(value) ? val : "--";
  }
  function formatValueV2(val) {
    return val === 0 || val ? val : "--/--";
  }

  hr = formatValue(hr);
  bp = formatValueV2(bp);
  rr = formatValue(rr);
  spo = formatValue(spo);
  temp = formatValue(temp);

  if (hrv) hrv.textContent = hr + " bpm";
  if (bpv) bpv.textContent = bp + " mmHg";
  if (rrv) rrv.textContent = rr + " rpm";
  if (spov) spov.textContent = spo + " %";
  if (tempv) tempv.textContent = temp + " ˚C";
}
