import {
  heartrate_data,
  blood_pressure_data,
  respiration_rate_data,
  acceleration_data,
  blood_oxygen_data,
  temperature_data,
  ews_value_passing,
  ECG_data_passing,
  PPG_data_passing,
  RR_data_passing,
} from "./live-custom.js";
import { NoEcgData, NoData, NoPpgData, NoRRData } from "./EchartGraphs.js";

import { fb } from "../firebase/config.js";

function init_echarts() {
  $(document).ready(() => {
    var PatientName;
    var heart_rate;
    var spo2;
    var sbp;
    var dbp;
    var oldtemp;
    var option1;
    var newTemp;
    var sbp_dbp;
    var respiration_rate;
    var temp;
    var acc;
    var final_min_ecg;
    var batteryPercentage;
    var value;
    var scale;
    var symptoms;
    var pain_spot;
    var flag = false;
    var id = localStorage.getItem("patient_unique_id");
    var ref;
    let ref_chart;
    let ecg_min;
    let ppg_min;
    let rr_min;
    let ews;
    var ref_valid;
    var context_assessment;
    var patients;
    var ecg_flag = 0;
    var ppg_ref;
    var rr_ref;
    var pat_bp_5sec_ref;
    let latestPatHr = null;
    let latestPatHrTs = 0;
    if (id != null || id != undefined) {
      // Show live Data
      ref = fb.database().ref().child("patientlivedata7s").child(id);
      ref_chart = fb.database().ref().child("ECG_plot").child(id);
      ppg_ref = fb.database().ref().child("PPG_plot").child(id);
      rr_ref = fb.database().ref().child("RR_plot").child(id);
      pat_bp_5sec_ref = fb.database().ref().child("PAT_BP_5s_tree").child(id);

      // Show valid data
      ecg_min = fb.database().ref().child("patientecgdata").child(id).limitToLast(1); //1 minute data
      ppg_min = fb.database().ref().child("patientppgdata").child(id).limitToLast(1); //1 minute data
      rr_min = fb.database().ref().child("patientrrdata").child(id).limitToLast(1); //1 minute data
      ref_valid = fb.database().ref().child("validpatientlivedata").child(id);
      ews = fb.database().ref().child("EWS").child(id).limitToLast(1); //ews inititlization

      pat_bp_5sec_ref.on("value", function (snapshot) {
        const val = snapshot.val();
        if (!val) return;
        const timestamps = Object.keys(val)
          .map((k) => Number(k))
          .filter((n) => Number.isFinite(n));
        if (timestamps.length === 0) return;
        const maxTs = Math.max(...timestamps);
        const latest = val[maxTs];
        if (latest && typeof latest.ECG_HR === "number") {
          latestPatHr = latest.ECG_HR / 100;
          latestPatHrTs = maxTs; // seconds epoch
        }
      });

      let listener = ref.on("value", function (snapshot) {
        const live = snapshot.val();
        if (live != null) {
          counter++;

          // Avoid unnecessary stringify/parse
          const data1 = live;

          // Decide heart rate using cached PAT BP HR if recent (<10s)
          const nowSec = Date.now() / 1000;
          let heart_rate;
          if (latestPatHr !== null && Number.isFinite(latestPatHrTs) && nowSec - latestPatHrTs < 10) {
            heart_rate = latestPatHr;
          } else {
            heart_rate = (data1.hr ?? 0) / 100;
          }

          let presentTimestamp = data1.timestamp;

          respiration_rate = data1.rr;
          spo2 = (data1.spo ?? 0) / 100;

          let bp_text = data1.bp || "";
          const array = String(bp_text).split("/");
          sbp = array[0];
          dbp = array[1];

          // Robust temperature parsing: strip any units/symbols (F, C, °)
          const rawTemp = String(data1.temp ?? "");
          const tempSanitized = rawTemp.replace(/[^0-9.+-]/g, "");
          temp = tempSanitized ? parseFloat(tempSanitized) : null;

          acc = data1.acc;
          var f_sensortimestamp = data1.timestamp;
          var date = new Date(f_sensortimestamp * 1000);
          batteryPercentage = data1.battery;

          var sensordate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var sensortime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          document.getElementById("sensordate").innerHTML = sensordate;
          document.getElementById("sensortime").innerHTML = sensortime;

          heart_rate = parseInt(heart_rate) === 238 || heart_rate === 2.38 ? "--" : heart_rate;
          sbp = parseInt(sbp) === 238 ? "--" : sbp;
          dbp = parseInt(dbp) === 238 ? "--" : dbp;
          respiration_rate = parseInt(respiration_rate) === 238 ? "--" : respiration_rate;
          spo2 = parseInt(spo2) === 238 || spo2 === 2.38 ? "--" : spo2;
          temp = parseInt(temp) === 238 ? "--" : temp;

          console.log("LiveTemperature 7s", temp);

          heartrate_data(heart_rate, "");
          blood_pressure_data(sbp, dbp, "", "");
          respiration_rate_data(respiration_rate, "");
          acceleration_data(acc, "");
          blood_oxygen_data(spo2, "");
          temperature_data(temp, "");

          var batteryIconMarkup = getBatteryIcon(batteryPercentage);
          var batteryPercentageElement = document.getElementById("battery-percentage");

          batteryPercentageElement.innerHTML = batteryIconMarkup + batteryPercentage + "%";
        }
      });

      let listener1 = ref_chart.on("value", function (snapshot) {
        if (snapshot.val() != null) {
          if (ecg_flag == 1) {
            let chart_json = snapshot.val() || {};
            let type = chart_json.type;
            let final_ecg;
            if (type == "noise" || type == "flat") {
              final_ecg = [];
            } else {
              var ecg_text = chart_json.ecg;
              let result1 = ecg_text.replace(/\]\[/g, ", ").replace(/\]/g, "").replace(/\[/g, "").trim();
              final_ecg = result1.split(",").map(Number);
            }
            var f_ecgtimestamp = chart_json.timestamp;
            var date = new Date(f_ecgtimestamp * 1000);

            var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
            var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
            document.getElementById("ecgdate").innerHTML = ecgdate !== null && ecgdate !== undefined ? ecgdate : "--/--/----";
            document.getElementById("ecgtime").innerHTML = ecgtime !== null && ecgtime !== undefined ? ecgtime : "--:--:--";

            ECG_data_passing(final_ecg, ecgdate, ecgtime, option1, value, "", 0);
          } else {
            ecg_flag = 1;
          }
        }
      });
      let listener2 = ppg_ref.on(
        "value",
        function (snapshot) {
          if (snapshot.val() !== null) {
            let ppg_json = snapshot.val() || {};
            let ppgdata = ppg_json.ppg;

            var f_ppgtimestamp = ppg_json.timestamp;
            var date = new Date(f_ppgtimestamp * 1000);
            var ppgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
            var ppgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
            ppgdate = date == undefined ? (ppgdate = "--/--/----") : ppgdate;
            ppgtime = date == undefined ? (ppgtime = "--/--/----") : ppgtime;
            try {
              document.getElementById("ppgdate").innerHTML = ppgdate;
              document.getElementById("ppgtime").innerHTML = ppgtime;
            } catch (e) {
              console.log("In HTML, ppgdate and ppgtime ID is not defined");
            }
            var final_ppg;
            if (ppgdata != undefined) {
              let result1 = ppgdata.replace(/\,/g, "").trim();
              final_ppg = result1.split(" ").map(Number);
            }
            PPG_data_passing(final_ppg, "", "", "", "", "", 0);
          } else {
            console.log("No PPG data available."); // Log if no data is available
          }
        },
        function (error) {
          console.error("Error fetching PPG data:", error); // Log any errors that occur
        },
      );

      let listener4 = rr_ref.on("value", function (snapshot) {
        if (snapshot.val() != null) {
          let rr_json = snapshot.val() || {};
          let rrdata = rr_json.res;
          let rr_timestamp = rr_json.timestamp;
          var date = new Date(rr_timestamp * 1000);
          var rrdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var rrtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          rrdate = date == undefined ? (rrdate = "--/--/----") : rrdate;
          rrtime = date == undefined ? (rrtime = "--/--/----") : rrtime;
          try {
            document.getElementById("rrdate").innerHTML = rrdate;
            document.getElementById("rrtime").innerHTML = rrtime;
          } catch (e) {
            console.log("In HTML, rrdate and rrtime ID is not defined");
          }
          var final_rr;
          if (rrdata != undefined) {
            let result1 = rrdata.replace(/\,/g, "").trim();
            final_rr = result1.split(" ").map(Number);
          }
          RR_data_passing(final_rr); // Pass processed array
        }
      });

      var list = ref_valid.once("value", function (snapshot) {
        if (snapshot.val() != null) {
          let data = snapshot.val() || {};
          ValidpatientLiveTimestamp = data.timestamp;
          respiration_rate = data.rr;
          heart_rate = data.hr / 100;
          spo2 = data.spo / 100;
          let bp_text = data.bp;
          const array = bp_text.split("/");
          sbp = array[0];
          dbp = array[1];
          respiration_rate = data.rr;
          oldtemp = data.temp;
          temp = parseFloat(String(oldtemp).replace(/[^0-9.+-]/g, ""));

          acc = data.acc;
          var f_sensortimestamp = data.timestamp;
          var date = new Date(f_sensortimestamp * 1000);
          batteryPercentage = data.battery;

          var sensordate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var sensortime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

          document.getElementById("sensordate").innerHTML = sensordate;
          document.getElementById("sensortime").innerHTML = sensortime;

          heartrate_data(heart_rate, "");
          blood_pressure_data(sbp, dbp, "", "");
          respiration_rate_data(respiration_rate, "");
          acceleration_data(acc, "");
          blood_oxygen_data(spo2, "");
          temperature_data(temp, "");
        }
      });

      var counter = 0;

      var list2 = ecg_min.once("value", function (snapshot) {
        if (snapshot.val() != null) {
          const parsedData = snapshot.val() || {};

          // Accessing the key
          const key = Object.keys(parsedData)[0];
          var ecg = parsedData ? parsedData[key].payload : null;
          let type = parsedData[key].type;

          if (type == "noise" || type == "flat") {
            final_min_ecg = [];
          } else {
            let ecg_result = ecg.replace(/\]\[/g, ", ").replace(/\]/g, "").replace(/\[/g, "").trim();
            final_min_ecg = ecg_result.split(",").map(Number);
          }

          var f_ecgtimestamp = parsedData[key].timestamp;
          var date = new Date(f_ecgtimestamp * 1000);
          var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
          ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;
          try {
            document.getElementById("ecgdate").innerHTML = ecgdate;
            document.getElementById("ecgtime").innerHTML = ecgtime;
          } catch (e) {
            console.log("In HTML, ecgdate and ecgtime ID is not defined");
          }
          ECG_data_passing(final_min_ecg, ecgdate, ecgtime, option1, value, "", 625);
        } else {
          var echartLinecontext = echarts.init(document.getElementById("LiveECGId"));
          echartLinecontext.clear();
          echartLinecontext.setOption(NoEcgData);
        }
      });

      var list3 = ppg_min.once("value", function (snapshot) {
        if (snapshot.val() != null) {
          const parsedData = snapshot.val() || {};

          const key = Object.keys(parsedData)[0];

          let ppgdata = parsedData[key].payload;
          console.log("Fetching live patient PPG data...", ppgdata);
          var f_ppgtimestamp = parsedData[key].timestamp;
          var date = new Date(f_ppgtimestamp * 1000);
          var ppgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var ppgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          ppgdate = date == undefined ? (ppgdate = "--/--/----") : ppgdate;
          ppgtime = date == undefined ? (ppgtime = "--/--/----") : ppgtime;
          try {
            document.getElementById("ppgdate").innerHTML = ppgdate;
            document.getElementById("ppgtime").innerHTML = ppgtime;
          } catch (e) {
            console.log("In HTML, ppgdate and ppgtime ID is not defined");
          }
          let result1;
          var final_ppg;
          if (ppgdata != undefined) {
            result1 = ppgdata.replace(/\,/g, "").trim();
            final_ppg = result1.split(" ").map(Number);
          }
          console.log("ppg data passed successfully ", final_ppg);
          PPG_data_passing(final_ppg, "", "", "", "", "", 500);
        } else {
          var echartLinecontext = echarts.init(document.getElementById("LivePPGId"));
          echartLinecontext.clear();
          echartLinecontext.setOption(NoPpgData);
        }
      });

      var list4 = rr_min.once("value", function (snapshot) {
        if (snapshot.val() != null) {
          const parsedData = snapshot.val() || {};
          const key = Object.keys(parsedData)[0];
          let rrdata = parsedData[key].res; // Use payload instead of res
          let rr_timestamp = parsedData[key].timestamp;
          var date = new Date(rr_timestamp * 1000);
          var rrdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var rrtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

          rrdate = date == undefined ? (rrdate = "--/--/----") : rrdate;
          rrtime = date == undefined ? (rrtime = "--/--/----") : rrtime;

          try {
            document.getElementById("rrdate").innerHTML = rrdate;
            document.getElementById("rrtime").innerHTML = rrtime;
          } catch (e) {
            console.log("In HTML, rrdate and time ID is not defined");
          }

          let final_rr = [];
          if (rrdata != undefined) {
            let result1 = rrdata.replace(/\]\[/g, ", ").replace(/\[/g, "").replace(/\]/g, "");
            final_rr = result1.split(",").map(Number);
          }
          if (final_rr.length) {
            RR_data_passing(final_rr);
          }
        } else {
          var echartLinecontext = echarts.init(document.getElementById("LiveRRId"));
          echartLinecontext.clear();
          echartLinecontext.setOption(NoRRData);
        }
      });

      let listener3 = ews.on("value", function (snapshot) {
        const parsedData = snapshot.val() || {};
        const key = Object.keys(parsedData)[0];

        console.log("ews_value" + parsedData);
        let ews_value = parsedData[key].ews_score;
        let ewscolor = parsedData[key].color;
        console.log("ews_value" + ews_value);
        if (ews_value !== undefined && ews_value !== null) {
          ews_value_passing(ews_value, ewscolor);
        } else {
          console.log("ews_value", ews_value);
          ews_value_passing(NoData);
        }
      });
    }
  });
}

function getBatteryIcon(batteryPercentage) {
  if (batteryPercentage >= 90) {
    return '<i class="fa fa-battery-full" aria-hidden="true"></i> ';
  } else if (batteryPercentage >= 60) {
    return '<i class="fa fa-battery-three-quarters" aria-hidden="true"></i> ';
  } else if (batteryPercentage >= 30) {
    return '<i class="fa fa-battery-half" aria-hidden="true"></i> ';
  } else if (batteryPercentage >= 10) {
    return '<i class="fa fa-battery-quarter" aria-hidden="true"></i> ';
  } else {
    return '<i class="fa fa-battery-empty" aria-hidden="true"></i> ';
  }
}

window.onload = () => {
  init_echarts();
};

export { init_echarts };
