import { fb } from "../livepage/database_function.js";
import { patient_details } from "./Dashboard-UI.js";

document.getElementById("loader").className = "loader";

let ews_list = fb.database().ref().child("EWS");

let ecg_list = fb.database().ref().child("ECG_plot");
let ppg_list = fb.database().ref().child("PPG_plot");
let rr_list = fb.database().ref().child("RR_plot");
let vital_list = fb.database().ref().child("patientlivedata7s");

var obj = {};

let pat_bp_5sec_ref = fb.database().ref().child("PAT_BP_5s_tree");

var doctor_id = localStorage.getItem("doctor_id");
var ref_doc_id = localStorage.getItem("doc_ref_id");
firebase_Data_retrieval(ref_doc_id);
document.getElementById("DoctorName").innerHTML = "Welcome Dr. " + localStorage.getItem("docname");

function firebase_Data_retrieval(ref_doc_id) {
  var patient_list = fb.database().ref().child("patients");
  patient_list.on("value", function (snapshot) {
    document.getElementById("p_details").innerHTML = "";

    var patient_info = [];
    snapshot.forEach((data) => {
      let patients_json = data.val();

      var doc_id = patients_json.docId;
      if (doc_id === ref_doc_id) {
        patient_info.push([patients_json.username, patients_json.age, patients_json.gender, patients_json.ailment, patients_json.id]);
      }
    });

    for (var i = 0; i < patient_info.length; i++) {}
    var NewPatientInfo = [];
    var ews_value = "";
    var ews_color = "";
    var ID;
    const Obtain_ews = new Promise((resolve, reject) => {
      for (let i = 0; i < patient_info.length; i++) {
        const uuid = patient_info[i][4];
        ews_list
          .child(uuid)
          .limitToLast(1)
          .on("value", function (snapshot) {
            if (snapshot.val() != null) {
              snapshot.forEach((data) => {
                ID = uuid;
                obj[ID] = ID;
                let ews_json = data.val();
                ews_value = ews_json.ews_score.toString();
                obj[ID + "ewsv"] = ews_value;
                ews_color = ews_json.color.toString();
                obj[ID + "ewsc"] = ews_color;

                NewPatientInfo.push([patient_info[i][0], patient_info[i][1], patient_info[i][2], patient_info[i][3], uuid, ews_value, ews_color]);
              });
            } else {
              obj[ID + "ewsv"] = "--";
              obj[ID + "ewsc"] = "0";
              NewPatientInfo.push([patient_info[i][0], patient_info[i][1], patient_info[i][2], patient_info[i][3], uuid, "--", "0"]);
            }
            refreshews(obj[ID + "ewsv"], obj[ID + "ewsc"], ID);
            if (i == patient_info.length - 1) {
              resolve(NewPatientInfo);
            }
          });
      }
    });
    var ID;

    var ecg_info = [];
    const Obtain_ecg = new Promise((resolve, reject) => {
      for (let i = 0; i < patient_info.length; i++) {
        const uuid = patient_info[i][4];
        ecg_list.child(uuid).on("value", function (snapshot) {
          if (snapshot.val() != null) {
            ID = uuid;
            obj[ID] = ID;

            let ecg_json = snapshot.val();
            let type = ecg_json.type;
            let ecg1 = ecg_json.ecg;
            let timestamp = ecg_json.timestamp;

            if (type == "noise" || type == "flat") {
              obj[ID + "final_min_ecg"] = [];
            } else {
              var ecg_text = ecg1;
              let ecg_result = ecg_text.replace(/\]\[/g, ", ").trim();
              ecg_result = ecg_result.replace(/\]/g, "").trim();
              ecg_result = ecg_result.replace(/\[/g, "").trim();
              var ecgvalue = ecg_result.split(",").map(Number);
              obj[ID + "final_min_ecg"] = ecgvalue;
            }

            var f_ecgtimestamp = timestamp;
            var date = new Date(f_ecgtimestamp * 1000);
            var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
            var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
            ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
            ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;

            var dt = ecgdate + " " + ecgtime;
            obj[ID + "dt"] = dt;
          } else {
            obj[ID + "final_min_ecg"] = [];
            obj[ID + "dt"] = "";
          }

          createECGchart(obj[ID + "final_min_ecg"], ID);
          if (i == ecg_info.length - 1) {
            resolve(ecg_info);
          }
        });
      }
    });

    const ppg_info = [];
    const Obtain_ppg = new Promise((resolve, reject) => {
      for (let i = 0; i < patient_info.length; i++) {
        const uuid = patient_info[i][4];
        let promise = new Promise((resolve, reject) => {
          ppg_list.child(uuid).on("value", function (snapshot) {
            let ID = uuid;
            let obj = {};

            if (snapshot.val() != null) {
              obj[ID] = ID;
              let ppg_json = snapshot.val();
              let ppg_data = ppg_json.ppg;

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

              obj[ID + "ppg"] = final_ppg;

              var f_ecgtimestamp = ppg_json.timestamp;
              var date = new Date(f_ecgtimestamp * 1000);
              var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
              var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
              ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
              ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;

              var dt = ecgdate + " " + ecgtime;
              obj[ID + "dt"] = dt;
            } else {
              obj[ID + "ppg"] = [];
              obj[ID + "dt"] = "";
            }
            createPPGchart(obj[ID + "ppg"], ID);
            if (i == ppg_info.length - 1) {
              resolve(ppg_info);
            }
          });
        });
      }
    });

    const rr_info = [];
    const Obtain_rr = new Promise((resolve, reject) => {
      for (let i = 0; i < patient_info.length; i++) {
        const uuid = patient_info[i][4];
        let promise = new Promise((resolve, reject) => {
          rr_list.child(uuid).on("value", function (snapshot) {
            let ID = uuid;
            let obj = {};
            if (snapshot.val() != null) {
              obj[ID] = ID;
              let rr_json = snapshot.val();
              let rr_data = rr_json.res;
              let rr_timestamp = rr_json.timestamp;

              let result1 = "";
              if (typeof rr_data === "string") {
                result1 = rr_data.replace(/\,/g, "").trim();
              } else {
                result1 = "";
              }
              var final_rr = result1
                .split(" ")
                .map(Number)
                .filter((n) => !isNaN(n));
              obj[ID + "rr"] = final_rr;

              var date = new Date(rr_timestamp * 1000);
              var rrdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
              var rrtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
              rrdate = date == undefined ? (rrdate = "--/--/----") : rrdate;
              rrtime = date == undefined ? (rrtime = "--/--/----") : rrtime;
              var dt = rrdate + " " + rrtime;
              obj[ID + "dt"] = dt;
            } else {
              obj[ID + "rr"] = [];
              obj[ID + "dt"] = "";
            }
            createRRchart(obj[ID + "rr"], ID);
            if (i == rr_info.length - 1) {
              resolve(rr_info);
            }
          });
        });
      }
    });
    const latest5secHR = [];
    const obtain_5sec_HR = new Promise((resolve, reject) => {
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
    });
    const Obtain_vitals = new Promise((resolve, reject) => {
      var ID;
      var vitalinfo = [];
      const nowSec = Date.now() / 1000;
      for (let i = 0; i < patient_info.length; i++) {
        const uuid = patient_info[i][4];
        vital_list.child(uuid).on("value", (snapshot) => {
          if (snapshot.val() != null) {
            const data = snapshot.val();
            ID = data.userId;
            obj[ID] = data.userId;

            const latest = latest5secHR.find((entry) => entry.patientId === ID);
            const latestPatHr = latest ? latest.HR : null;
            const latestPatHrTs = latest ? latest.timestamps : null;

            if (latestPatHr !== null && typeof latestPatHrTs === "number" && Number.isFinite(latestPatHrTs) && !isNaN(latestPatHrTs) && nowSec - latestPatHrTs < 10) {
              obj[ID + "hr"] = latestPatHr;
            } else {
              obj[ID + "hr"] = data.hr === "00" || data.hr === "0" || data.hr === 0 ? "--" : data.hr;
            }

            if (data.bp == "0/0") {
              obj[ID + "bp"] = "--/--";
            } else {
              obj[ID + "bp"] = data.bp;
            }
            if (data.spo == "00") {
              obj[ID + "spo"] = "--";
            } else {
              obj[ID + "spo"] = data.spo;
            }
            if (parseFloat(data.temp) == 0.0 || parseFloat(data.temp) >= 238.48) {
              obj[ID + "temp"] = "--";
            } else {
              obj[ID + "temp"] = parseFloat(data.temp).toFixed(2);
            }
            if (data.rr == "0") {
              obj[ID + "rr"] = "--";
            } else {
              obj[ID + "rr"] = data.rr;
            }
          } else {
            obj[ID + "hr"] = "--";
            obj[ID + "bp"] = "--/--";
            obj[ID + "spo"] = "--";
            obj[ID + "temp"] = "--";
            obj[ID + "rr"] = "--";
            vitalinfo.push([obj[ID + "hr"], obj[ID + "rr"], obj[ID + "temp"], obj[ID + "spo"], obj[ID + "bp"]]);
          }

          refreshvitals(obj[ID + "hr"], obj[ID + "bp"], obj[ID + "temp"], obj[ID + "rr"], obj[ID + "spo"], obj[ID]);

          if (i == vitalinfo.length - 1) {
            resolve(vitalinfo);
          }
        });
      }
    });

    Obtain_ews.then((value) => {
      if (NewPatientInfo.length == value.length) {
        patient_details(value);
      }
    });
  });
}
function refreshews(ews_value, ews_color, ID) {
  var ewsvId = "ewsv" + ID;
  var ewscId = "ewsc" + ID;

  var ews_v = document.getElementById(ewsvId);
  var ews_c = document.getElementById(ewscId);
  if (ews_v === null) {
  } else {
    ews_v.textContent = ews_value;
    ews_c.style.background = ews_color;
  }
}

function createECGchart(ecg, Id) {
  var LiveECGId = "chart" + Id;

  var ecgContainer = document.getElementById(LiveECGId);

  var chart = echarts.init(ecgContainer);

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
    console.error("EcgData.length:", e.message);
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
    chart.setOption(option1);
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
        bottom: 52,
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
    chart.setOption(option1);
  }
}

function createPPGchart(ppg, ID) {
  var LivePPGId = "ppgchart" + ID;
  var ppgContainer = document.getElementById(LivePPGId);

  if (!ppgContainer) {
    console.error("PPG container not found for ID:", LivePPGId);
    return;
  }

  var chart = echarts.init(ppgContainer);

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
    console.error("EcgData.length:", e.message);
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
    chart.setOption(option1);
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
        bottom: 52,
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
    chart.setOption(option1);
  }
}

function createRRchart(rr, ID) {
  var LiveRRId = "rrchart" + ID;
  var rrContainer = document.getElementById(LiveRRId);
  var value;
  if (!rrContainer) {
    console.error("RR container not found for ID:", LiveRRId);
    return;
  }

  var chart = echarts.init(rrContainer);
  var rrData = rr;

  var counter = 0;
  function randomData() {
    value = rrData[counter % rrData.length];
    counter++;
    return { value: [counter, value] };
  }
  var data = [];
  try {
    for (var i = 0; i < rrData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.error("RRData.length error:", e.message);
  }
  chart.clear();
  let option;
  if (rrData.length < 120) {
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
      grid: { top: 5, left: 10, right: 10, bottom: 52 },
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
  chart.setOption(option);
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

  if (hrv) hrv.textContent = hr + " bpm";
  if (bpv) bpv.textContent = bp + " mmHg";
  if (rrv) rrv.textContent = rr + " rpm";
  if (spov) spov.textContent = spo + " %";
  if (tempv) tempv.textContent = temp + " ˚C";
}

const messaging = fb.messaging();

messaging
  .requestPermission()
  .then(function () {
    var docid = localStorage.getItem("doctor_id");
    return messaging
      .getToken(messaging, { vapidKey: "BIFe69rLA_x7ZgZW9kuRTZ1Z2SD05ltvxpbxgtCuUAEEG085oEKGR0KxOolLbLidL3COAUZ5nXFr0bKpYdicns4" })

      .then((currentToken) => {
        if (currentToken) {
          var context_assessmenttoken = fb.database().ref().child("FCM_token").child(currentToken);

          context_assessmenttoken.set({
            Id: localStorage.getItem("doctor_id"),
          });

          console.log("current token", currentToken);
        } else {
          console.log("No registration token available. Request permission to generate one.");
        }
      })
      .catch(function (err) {
        console.error("Error setting FCM token in database:", err);
      });
  })
  .catch(function (err) {
    console.error("Error requesting permission or getting token:", err);
  });

messaging.onMessage(function (payload) {
  if (payload.data.timestamp && payload.data.patient_info) {
    const param1 = btoa(payload.data.timestamp);
    const param2 = btoa(payload.data.patient_info);
    const param3 = btoa("2");

    const url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;

    var childWindow = window.open(url, "Context Assessment", "width=1050,height=670,left=150,top=200,titlebar=0,toolbar=0,status=0");

    setTimeout(function () {
      if (childWindow && !childWindow.closed) {
        childWindow.close();
      } else {
        console.log("Child window is already closed or not available.");
      }
    }, 30000);
  } else {
    console.log("Invalid timestamp or final_patient_uid in payload data");
  }
});
