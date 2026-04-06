import { fb } from "../firebase/config.js";
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
import { installGlobalEchartsAutoResize } from "../utils/echarts-auto-resize.js";

installGlobalEchartsAutoResize();

function init_echarts() {
  $(document).ready(() => {
    var heart_rate;
    var spo2;
    var sbp;
    var dbp;
    var oldtemp;
    var option1;

    var respiration_rate;
    var temp;
    var acc;
    var final_min_ecg;
    var batteryPercentage;
    var value;
    const id = localStorage.getItem("patient_unique_id");
    var ecg_flag = 0;
    let latestPatHr = null;
    let latestPatHrTs = 0;
    if (id != null || id != undefined) {
      // Show live Data
      const ref = fb.database().ref().child("patientlivedata7s").child(id);
      const ref_chart = fb.database().ref().child("ECG_plot").child(id);
      const ppg_ref = fb.database().ref().child("PPG_plot").child(id);
      const rr_ref = fb.database().ref().child("RR_plot").child(id);
      const pat_bp_5sec_ref = fb.database().ref().child("PAT_BP_5s_tree").child(id);

      // Show valid data
      const ecg_min = fb.database().ref().child("patientecgdata").child(id).orderByKey().limitToLast(1); //1 minute data
      const ppg_min = fb.database().ref().child("patientppgdata").child(id).orderByKey().limitToLast(1); //1 minute data
      const rr_min = fb.database().ref().child("patientrrdata").child(id).orderByKey().limitToLast(1); //1 minute data
      const ref_valid = fb.database().ref().child("validpatientlivedata").child(id);
      const ews = fb.database().ref().child("EWS").child(id).limitToLast(1); //ews inititlization

      // Listener on PAT_BP_5s_tree
      pat_bp_5sec_ref
        .orderByKey()
        .limitToLast(1)
        .on("value", function (snapshot) {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const latest = Object.values(val)[0];
            if (latest && typeof latest.ECG_HR === "number") {
              latestPatHr = latest.ECG_HR;
              latestPatHrTs = latest.timestamp; // seconds epoch
            }
          }
        });

      // Listener on patientlivedata7s
      ref.on("value", function (snapshot) {
        if (snapshot.exists()) {
          const data = snapshot.val();

          // Decide heart rate using cached PAT BP HR if recent (<10s)
          const nowSec = Date.now() / 1000;
          let heart_rate;
          if (latestPatHr !== null && Number.isFinite(latestPatHrTs) && nowSec - latestPatHrTs < 10) {
            heart_rate = parseInt(latestPatHr);
          } else {
            heart_rate = parseInt(data.hr);
          }

          respiration_rate = parseInt(data.rr);
          spo2 = parseInt(data.spo) / 100;

          let bp_text = data.bp || "";
          const array = String(bp_text).split("/");
          sbp = parseInt(array[0]);
          dbp = parseInt(array[1]);

          // Robust temperature parsing: strip any units/symbols (F, C, °)
          const rawTemp = String(data.temp ?? "");
          const tempSanitized = rawTemp.replace(/[^0-9.+-]/g, "");
          temp = tempSanitized ? parseFloat(tempSanitized) : null;

          acc = data.acc;
          var f_sensortimestamp = data.timestamp;
          var date = new Date(f_sensortimestamp * 1000);
          batteryPercentage = data.battery;

          var sensordate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var sensortime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          document.getElementById("sensordate").innerHTML = sensordate;
          document.getElementById("sensortime").innerHTML = sensortime;

          heart_rate = parseInt(heart_rate) === 238 ? "--" : String(heart_rate / 100);
          sbp = parseInt(sbp) === 238 ? "--" : String(sbp);
          dbp = parseInt(dbp) === 238 ? "--" : String(dbp);
          respiration_rate = parseInt(respiration_rate) === 238 ? "--" : String(respiration_rate);
          spo2 = parseInt(spo2) === 238 || spo2 === 2.38 ? "--" : String(spo2);
          temp = parseInt(temp) === 238 ? "--" : String(temp);

          // console.log("Listener ID", id, "heart_rate", heart_rate, "sbp", sbp, "dbp", dbp, "respiration_rate", respiration_rate, "acc", acc, "spo2", spo2, "temp", temp, "data", data);
          heartrate_data(heart_rate);
          blood_pressure_data(sbp, dbp);
          respiration_rate_data(respiration_rate);
          acceleration_data(acc);
          blood_oxygen_data(spo2);
          temperature_data(temp);

          var batteryIconMarkup = getBatteryIcon(batteryPercentage);
          var batteryPercentageElement = document.getElementById("battery-percentage");

          batteryPercentageElement.innerHTML = batteryIconMarkup + batteryPercentage + "%";
        }
      });
      // Listener on ECG_plot
      ref_chart.on("value", function (snapshot) {
        if (snapshot.exists()) {
          if (ecg_flag == 1) {
            let chart_json = snapshot.val() || {};
            let type = chart_json.type;
            let final_ecg;
            if (type == "noise" || type == "flat") {
              final_ecg = [];
            } else {
              var ecg_text = chart_json.ecg;
              let result1 = ecg_text.replace(/\]\[/g, ", ").trim();
              result1 = result1.replace(/\]/g, "").trim();
              result1 = result1.replace(/\[/g, "").trim();
              final_ecg = result1.split(",").map(Number);
            }
            var f_ecgtimestamp = chart_json.timestamp;
            var date = new Date(f_ecgtimestamp * 1000);

            var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
            var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
            document.getElementById("ecgdate").innerHTML = ecgdate !== null && ecgdate !== undefined ? ecgdate : "--/--/----";
            document.getElementById("ecgtime").innerHTML = ecgtime !== null && ecgtime !== undefined ? ecgtime : "--:--:--";

            ECG_data_passing(final_ecg, 0);
          } else {
            ecg_flag = 1;
          }
        }
      });
      // Listener on PPG_plot
      ppg_ref.on(
        "value",
        function (snapshot) {
          if (snapshot.exists()) {
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
              console.warn("In HTML, ppgdate and ppgtime ID is not defined");
            }
            var final_ppg;
            if (ppgdata != undefined) {
              let result1 = ppgdata.replace(/\,/g, "").trim();
              final_ppg = result1.split(" ").map(Number);
            }
            PPG_data_passing(final_ppg, 0); // 0 To show live data
          } else {
            console.warn("No PPG data available."); // Log if no data is available
          }
        },
        function (error) {
          console.error("Error fetching PPG data:", error); // Log any errors that occur
        },
      );
      // Listener on RR_plot
      rr_ref.on("value", function (snapshot) {
        if (snapshot.exists()) {
          let rr_json = snapshot.val() || {};
          let rrdata = rr_json.res;
          let rr_timestamp = rr_json.timestamp;

          var date = new Date(rr_timestamp * 1000);
          var rrdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var rrtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          rrdate = date == undefined ? (rrdate = "--/--/----") : rrdate;
          rrtime = date == undefined ? (rrtime = "--:--:--") : rrtime;

          try {
            document.getElementById("rrdate").innerHTML = rrdate;
            document.getElementById("rrtime").innerHTML = rrtime;
          } catch (e) {
            console.warn("In HTML, rrdate and rrtime ID is not defined");
          }
          var final_rr;
          if (rrdata != undefined) {
            let result1 = rrdata.replace(/\]\[/g, ", ").trim();
            result1 = result1.replace(/\[/g, "").trim();
            result1 = result1.replace(/\]/g, "").trim();
            final_rr = result1.split(",").map(Number);
          }
          RR_data_passing(final_rr, 0); // Pass processed array
        }
      });
      ews.on("value", function (snapshot) {
        if (snapshot.exists()) {
          const parsedData = snapshot.val() || {};
          const key = Object.keys(parsedData)[0];
          let ews_value = parsedData[key]?.ews_score || "--";
          let ewscolor = parsedData[key]?.color || "0";
          // console.log("EWS Value:", ews_value, "EWS Color:", ewscolor);
          if (ews_value !== undefined && ews_value !== null) {
            ews_value_passing(ews_value, ewscolor);
          } else {
            ews_value_passing("--", "0");
          }
        } else {
          ews_value_passing("--", "0");
        }
      });
      // Get last valid data from validpatientlivedata, patientecgdata, patientppgdata and patientrrdata
      ref_valid.once("value", function (snapshot) {
        if (snapshot.exists()) {
          const data = snapshot.val() || {};

          respiration_rate = data.rr;
          heart_rate = Number(data.hr) / 100;
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
          // console.log("ID", id, "heart_rate", heart_rate, "sbp", sbp, "dbp", dbp, "respiration_rate", respiration_rate, "acc", acc, "spo2", spo2, "temp", temp);

          heartrate_data(heart_rate);
          blood_pressure_data(sbp, dbp);
          respiration_rate_data(respiration_rate);
          acceleration_data(acc);
          blood_oxygen_data(spo2);
          temperature_data(temp);
        } else {
          document.getElementById("sensordate").innerHTML = "--/--/----";
          document.getElementById("sensortime").innerHTML = "--:--:--";
          heartrate_data(0);
          blood_pressure_data(0, 0);
          respiration_rate_data(0);
          acceleration_data(0);
          blood_oxygen_data(0);
          temperature_data(0);
        }
      });
      ecg_min.once("value", function (snapshot) {
        if (snapshot.exists()) {
          const parsedData = snapshot.val() || {};

          // Accessing the key
          const key = Object.keys(parsedData)[0];
          var ecg = parsedData ? parsedData[key].payload : null;
          let type = parsedData[key].type;

          if (type == "noise" || type == "flat") {
            final_min_ecg = [];
          } else {
            let ecg_result = ecg.replace(/\]\[/g, ", ").trim();
            ecg_result = ecg_result.replace(/\]/g, "").trim();
            ecg_result = ecg_result.replace(/\[/g, "").trim();
            final_min_ecg = ecg_result.split(",").map(Number);
          }

          var f_ecgtimestamp = parsedData[key].timestamp;
          var date = new Date(f_ecgtimestamp * 1000);
          var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
          ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;
          document.getElementById("ecgdate").innerHTML = ecgdate;
          document.getElementById("ecgtime").innerHTML = ecgtime;

          ECG_data_passing(final_min_ecg, 625);
        } else {
          document.getElementById("ecgdate").innerHTML = "--/--/----";
          document.getElementById("ecgtime").innerHTML = "--:--:--";

          const echartLinecontext = echarts.init(document.getElementById("LiveECGId"));
          echartLinecontext.clear();
          echartLinecontext.setOption(NoEcgData);
        }
      });
      ppg_min.once("value", function (snapshot) {
        if (snapshot.exists()) {
          const parsedData = snapshot.val() || {};

          const key = Object.keys(parsedData)[0];

          let ppgdata = parsedData[key].payload;
          var f_ppgtimestamp = parsedData[key].timestamp;
          var date = new Date(f_ppgtimestamp * 1000);
          var ppgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var ppgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          ppgdate = date == undefined ? (ppgdate = "--/--/----") : ppgdate;
          ppgtime = date == undefined ? (ppgtime = "--/--/----") : ppgtime;

          document.getElementById("ppgdate").innerHTML = ppgdate;
          document.getElementById("ppgtime").innerHTML = ppgtime;

          let result1;
          var final_ppg;
          if (ppgdata != undefined) {
            result1 = ppgdata.replace(/\,/g, "").trim();
            final_ppg = result1.split(" ").map(Number);
          }
          PPG_data_passing(final_ppg, 500); // 500 to show 500 point of valid data
        } else {
          document.getElementById("ppgdate").innerHTML = "--/--/----";
          document.getElementById("ppgtime").innerHTML = "--:--:--";

          const echartLinecontext = echarts.init(document.getElementById("LivePPGId"));
          echartLinecontext.clear();
          echartLinecontext.setOption(NoPpgData);
        }
      });
      rr_min.once("value", function (snapshot) {
        if (snapshot.exists()) {
          const parsedData = snapshot.val() || {};
          const key = Object.keys(parsedData)[0];
          let rrdata = parsedData[key].payload; // Use payload instead of res
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
            console.warn("In HTML, rrdate and rrtime ID is not defined");
          }

          let final_rr = [];
          if (rrdata != undefined) {
            let result1 = rrdata.replace(/\]\[/g, ", ").trim();
            result1 = result1.replace(/\[/g, "").trim();
            result1 = result1.replace(/\]/g, "").trim();
            final_rr = result1.split(",").map(Number);
          }
          RR_data_passing(final_rr, 125);
        } else {
          document.getElementById("rrdate").innerHTML = "--/--/----";
          document.getElementById("rrtime").innerHTML = "--:--:--";

          const echartLinecontext = echarts.init(document.getElementById("LiveRRId"));
          echartLinecontext.clear();
          echartLinecontext.setOption(NoRRData);
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
