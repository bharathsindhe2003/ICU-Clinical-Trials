import { ecg_lineChart } from "./Ecg_line_chart.js";
//mport {context_assessment_operation} from '../context_assessment/context_assessment_operation.js';
var EWS_Score_opt;
var context_assment_opt;
var ECG_scatter_opt;
var Heart_rate_graph_opt;
var blood_oxygen_opt;
var temperature_opt;
var blood_pressure_opt;
var Respiration_opt;

var context_assment_graph = echarts.init(document.getElementById("echart_context"));
var ECG_scatter_graph = echarts.init(document.getElementById("echart_ecg"));

function history_context_assessment(min_time, max_time, id, context_timestamp) {
  if ($("#echart_context").length) {
    // console.log("context assessment is : ",context_timestamp,id);

    var context_data = context_timestamp; //replace_zero.apply(this,context_timestamp);
    //var finaldata=join(static_data,context_data,trim);
    context_data.unshift([min_time * 1000, null]);
    context_data.push([max_time * 1000, null]);
    //////console.log("dataset scnned of context ass data outcome: "+outcome_data);

    //console.log("context_data: "+context_data);

    context_assment_opt = {
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          // allow zoom with mouse wheel and dragging
          zoomOnMouseWheel: "ctrl", // use "ctrl" or "alt" or "shift" or true depending on desired modifier
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],

      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 1,
        type: "time",
        //splitNumber: 12,
        boundaryGap: true,
        scale: true,
        min: "dataMin",
        max: "dataMax",
        axisTick: {
          show: false,
        },
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },

      yAxis: {
        type: "value",
        boundaryGap: [0, "100%"],
        min: function (finaldata) {
          return finaldata.min - 5;
        },
        max: function (finaldata) {
          return finaldata.max + 5;
        },
        splitLine: {
          show: false,
          //splitNumber:10,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        axisLine: {
          show: true, // Hide full Line
        },
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: false,
        },

        minorSplitLine: {
          show: false,
          lineStyle: {
            color: "#2178a049",
          },
        },
      },
      tooltip: {
        trigger: "axis",
        formatter: "Time : {dd}/{MM}/{yy}" + "\n" + "{HH}:{mm}",
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },

      series: [
        {
          name: "Time:",
          type: "scatter",
          showSymbol: false,
          data: context_data,
          symbol: "circle",
          symbolSize: 10,
        },
      ],
    };
  }
  context_assment_graph.setOption(context_assment_opt);

  if (typeof context_assment_graph.off === "function") {
    context_assment_graph.off("click");
  }

  context_assment_graph.on("click", function (params) {
    var timestamp_c = params.data[0];
    var param2 = btoa(id);
    var param3 = btoa("1");
    var param1 = btoa(timestamp_c / 1000);
    console.log("OPEN MODEL");

    var url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
    openModal(url);
  });
}
function history_ECG(min_time, max_time, ecg_timestamp, id) {
  // console.log("history_ECG is : ", ecg_timestamp, id);

  if ($("#echart_ecg").length) {
    var ECG_scatter_data = ecg_timestamp;
    ECG_scatter_data.unshift([min_time * 1000, null]);
    ECG_scatter_data.push([max_time * 1000, null]);

    ECG_scatter_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      tooltip: {
        trigger: "axis",
        formatter: "Time : {dd}/{MM}/{yy}" + "\n" + "{HH}:{mm}",
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          // allow zoom with mouse wheel and dragging
          zoomOnMouseWheel: "ctrl", // use "ctrl" or "alt" or "shift" or true depending on desired modifier
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],

      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 3,
        type: "time",
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },
      yAxis: {
        type: "value",
        splitNumber: 8,
        boundaryGap: [0, "100%"],
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
      },
      series: [
        {
          name: "Fake Data",
          type: "scatter",
          showSymbol: false,
          data: ECG_scatter_data,
          lineStyle: {
            color: "#026492",
            width: 1.5,
          },
        },
      ],
    };

    ECG_scatter_graph.on("click", function (params) {
      var timestamp_c = params.data[0];

      var param2 = btoa(id);
      var param1 = btoa(timestamp_c / 1000);
      var param3 = btoa("2");
      var url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
      openModal(url);
      //   var childWindow=  window.open(url, "Context Assessment", "width=1100,height=670,left=150,top=200,resizable=no,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,copyhistory=no");
      //   childWindow.addEventListener('load', function() {
      // // Access the child window's document and remove the minimize and maximize buttons
      // childWindow.document.body.style.setProperty("overflow", "hidden", "important");
      //});
    });
  }
  ECG_scatter_graph.clear();
  ECG_scatter_graph.setOption(ECG_scatter_opt);
}
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.querySelector("button");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

span.addEventListener("click", closeModal);
function openModal(pageUrl) {
  var iframe = document.getElementById("iframeContent");
  console.log("pageurl", pageUrl);
  iframe.src = pageUrl;
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
function closeModal() {
  var iframe = document.getElementById("iframeContent");
  iframe.src = "";
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
};

function join(static_data, fb_data, trim) {
  var joineddata = [];
  var fb_data_presence;
  for (var i = 0; i < static_data.length; i++) {
    var x = static_data[i][0] / 1000;
    fb_data_presence = 0;
    for (var j = 0; j < fb_data.length; j++) {
      //var x= (static_data[i][0].toString()).slice(0,6);
      //var y= (fb_data[j][0].toString()).slice(0,6);
      //var str = fb_data[j][0];

      var y = fb_data[j][0] / 1000;
      //  x= (static_data[i][0].toString()).slice(0,6);
      //  y= (fb_data[j][0].toString()).slice(0,6);
      // ////console.log("data pushing X,Y:",x,y);
      if (x == y) {
        joineddata.push(fb_data[j]);
        fb_data_presence = 1;
        break;
      }
    }
    if (fb_data_presence == 0) {
      //console
      joineddata.push(static_data[i]);
    }
  }

  return joineddata;
}

function replace_zero() {
  var i = 0;
  var j = 0;
  var newdataset;
  //////console.log("arguments are : ",arguments);
  const newdataset1 = [];
  for (i = 0; i < arguments.length; i++) {
    var d = arguments[i];
    var newd;
    for (j = 0; j < d.length; j++) {
      if (d[1] == 0) {
        d.splice(0, 2, d[0], null);
        newd = d;
        //////console.log('updated dataset', newd.length,newd);
      }
    }
    //////console.log("the d value is: ",d);
    newdataset = d.splice(d, 2, newd);
    newdataset1.push(newdataset);
    //////console.log('new dataset', newdataset.length,newdataset);
  }
  //////console.log('new dataset', newdataset1.length,newdataset1);
  return newdataset1;
}

/* EWS_Score_graph.setOption(EWS_Score_opt);
	context_assment_graph.setOption(context_assment_opt);
	ECG_scatter_graph.setOption(ECG_scatter_opt);
	Heart_rate_graph.setOption(Heart_rate_graph_opt);
	blood_oxygen_graph.setOption(blood_oxygen_opt);
	temperature_graph.setOption(temperature_opt);
	blood_pressure_graph.setOption(blood_pressure_opt);
	Respiration_graph.setOption(Respiration_opt); */

/*************************** Echarts initilization (Do not touch this portion!!) ********************/
//////console.log("independ",sensor_data);

/********************* End of Echarts initilization (Do not touch this portion!!) *****************/

export {
  //history_ews,
  history_context_assessment,
  history_ECG,
  // history_Heart_Rate,
  // history_Blood_Oxygen,
  // history_temperature,
  // history_Blood_presure,
  //history_Respiration_Rate,
};
