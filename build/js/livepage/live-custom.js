import { NoEcgData, NoPpgData } from "./EchartGraphs.js";

/**************************** EWS on live page **********************************/
function ews_value_passing(ews_value, ews_color) {
  try {
    document.getElementById("ews_id1").className = "ews_card_js";
    console.log("ewsvalue" + ews_value.color);
    if (ews_value == "--") {
      document.getElementById("ews_id1").innerHTML = "";
      document.getElementById("ews_color1").style.backgroundColor = "#ffffff00";
    } else {
      document.getElementById("ews_color1").style.backgroundColor = ews_color;
      document.getElementById("ews_id1").innerHTML = "EWS Score - " + ews_value;
    }
  } catch (e) {
    console.log("e.message:", e.message);
  }
}
/***************************EOF of EWS on live page*****************************/

/****************************Electrocardiogram(ECG)***********************************/
function ECG_data_passing(LiveEcgValues, ecgdate, ecgtime, option1, value, ecgdata, endzoom) {
  console.log("EcgValues in echarts", LiveEcgValues, "context:", ecgdata);
  var EcgData;
  var contextECG;
  var echartLine;
  var value1;
  var echartLinecontext;

  if ($("#LiveECGId").length) {
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
      top: 5,
      left: 40,
      right: 40,
      bottom: 52,
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
        //endValue:[],
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
        show: false, // Hide full Line
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
      //scale: true ,
      //splitNumber:8,
      splitLine: {
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      /* min: function (value) {
						return value.min -40;
					}, */
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
        show: false, // Hide full Line
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
        //symbol: 'emptyCircle' ,
        //hoverAnimation: false,
        data: data,
        animation: false,
        smooth: false,
        lineStyle: {
          color: "#ffffff",
          width: 1.6,
          //miterLimit: 10 ,
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
      if ($("#LiveECGId").length) {
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
/***************************EOF of Electrocardiogram(ECG)*****************************/

/**************************** Photoplethysmogram (PPG)***********************************/
function PPG_data_passing(LivePpgValues, ecgdate, ecgtime, option1, value, ppgdata, endzoom) {
  if (window.location.pathname.includes("context_assment.html")) return;
  console.log("PPG_data_passing called with:", {
    LivePpgValues: LivePpgValues ? LivePpgValues.length : "null/undefined",
    ppgdata: ppgdata ? ppgdata.length : "null/undefined",
    endzoom: endzoom,
  });

  var PpgData;
  var echartLine;
  var echartLinecontext;
  var value1;
  var ppgOption; // Renamed to avoid conflict with parameter
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
    if (PpgData.length < 500) {
      ppgOption = {
        title: {
          text: "WAITING FOR VALID PPG",
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

      if ($("#context_ppg").length && echartLinecontext) {
        echartLinecontext.clear();
        echartLinecontext.setOption(ppgOption);
      } else if ($("#LivePPGId").length) {
        echartLine.clear();
        echartLine.setOption(ppgOption);
      }
    } else {
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
            //endValue:[],
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
            show: true, // Hide full Line
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
          // min:Math.min(...data) -20,
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
            show: true, // Hide full Line
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
            //symbol: 'emptyCircle' ,
            //hoverAnimation: false,
            data: data,
            animation: false,
            smooth: false,
            lineStyle: {
              color: "#FFFFFF",
              width: 1.6,
              //miterLimit: 10 ,
            },
            labelLine: {
              show: false,
            },
            seriesLayoutBy: "column",
          },
        ],
      };
      if ($("#context_ppg").length && echartLinecontext) {
        console.log("PPG: Setting option for context PPG");
        echartLinecontext.clear();
        echartLinecontext.setOption(ppgOption);
        if (endzoom !== 0) {
          echartLinecontext.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      } else if ($("#LivePPGId").length) {
        console.log("PPG: Setting option for Live PPG");
        echartLine.clear();
        echartLine.setOption(ppgOption);
        if (endzoom !== 0) {
          echartLine.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      }
    }
  } catch (e) {
    console.log("PPG building chart:", e.message);
  }
}
/***************************EOF of Photoplethysmogram (PPG)*****************************/

/**************************** Respiration Rate ******************************/
function RR_data_passing(LiveRrValues) {
  if (!$("#LiveRRId").length) return;
  const echartLine = echarts.init(document.getElementById("LiveRRId"));

  const RrData = Array.isArray(LiveRrValues) ? LiveRrValues : [];

  function randomData() {
    if (RrData.length === 0) return { value: [0, 0] };
    value1 = RrData[counter % RrData.length];
    counter++;
    return {
      value: [counter % RrData.length, Math.round(value1)],
    };
  }
  var data = [];
  try {
    for (var i = 1; i < RrData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.log("RR error:", e.message);
  }
  echartLine.clear();
  let option;
  if (data.length === 0) {
    option = {
      title: {
        text: "NO RR DATA",
        textStyle: {
          fontSize: "18",
          fontFamily: "Verdana",
          color: "#0686AF",
        },
        left: "center",
        top: "middle",
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: [],
    };
  } else if (data.length < 120) {
    option = {
      title: {
        text: "WAITING FOR VALID RR",
        textStyle: {
          fontSize: "18",
          fontFamily: "Verdana",
          color: "#0686AF",
        },
        left: "center",
        top: "middle",
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: [],
    };
  } else {
    option = {
      grid: { top: 5, left: 10, right: 10, bottom: 52 },
      toolbox: {
        orient: "vertical",
        right: 5,
        feature: {
          myTool1: {
            show: true,
            title: "Reset",
            icon: "image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PgogICAgICAgIDwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgCiAgICAgICAgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+ICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgPiA8cGF0aCBkPSJNMTAgMmg0IiAvPiA8cGF0aCBkPSJNMTIgMTR2LTQiIC8+IDxwYXRoIGQ9Ik00IDEzYTggOCAwIDAgMSA4LTcgOCA4IDAgMSAxLTUuMyAxNEw0IDE3LjYiIC8+IDxwYXRoIGQ9Ik05IDE3SDR2NSIgLz4gPC9zdmc+ICA=",
            onclick: function () {
              echartLine.dispatchAction({ type: "dataZoom", start: 0, endValue: endzoom });
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
          showDetail: false,
          height: 25,
          handleIcon: "pin",
          handleStyle: { color: "#0865C1", borderColor: "#ACB8D1", borderWidth: 1 },
        },
      ],
      xAxis: {
        type: "value",
        show: false,
        min: "dataMin",
        max: "dataMax",
        boundaryGap: false,
        splitLine: { show: false },
        axisLine: { show: false },
      },
      yAxis: {
        type: "value",
        show: false,
        min: function (value) {
          return value.min - 10;
        },
        max: function (value) {
          return value.max + 100;
        },
        splitLine: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          name: "RR",
          type: "line",
          showSymbol: false,
          data: data,
          animation: false,
          smooth: true,
          lineStyle: { color: "#FFFFFF", width: 2 },
          connectNulls: true,
          clip: true,
        },
      ],
    };
  }
  echartLine.setOption(option, true);
}
/*********************** EOF of Respiration Rate ****************************/

/**************************** Heart Rate ******************************/

function heartrate_data(LiveHeartrate, ContextHeartrate) {
  console.log("Calling Heart rate *******88", ContextHeartrate);
  var LiveHRId;
  var ContextHRId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["49%", "51%"],
        radius: "100%",
        min: 0,
        max: 1.8,
        splitNumber: 8,

        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.225, "#D56868"], //40-red
              [0.28, "#F5DB00"], //50-yello
              [0.5, "#98BF64"], //90-Green
              [0.615, "#F5DB00"], //110-yello
              [0.725, "#FFB601"], //130-orange
              [1, "#D56868"], //150-red
            ],
          },
        },
        pointer: {
          show: true,
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 15,
          offsetCenter: [0, "10%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = Math.round(value * 100);
            return (data = data == 0 || isNaN(data) ? (data = "- -") : data + " bpm");
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "HR",
          },
        ],
      },
    ],
  };

  if ($("#ContextHeartRateId").length) {
    ContextHRId = echarts.init(document.getElementById("ContextHeartRateId"));
    if (ContextHeartrate !== "") {
      var echartGauge1 = RawechartGauge;
      console.log("d1 data is :", d1);
      var d1 = ContextHeartrate;
      echartGauge1.series[0].data[0].value[0] = d1;

      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
      } else {
        echartGauge1.series[0].pointer.show = true;
      }

      ContextHRId.setOption(echartGauge1);
    }
  } else if ($("#LiveHeartRateId").length) {
    LiveHRId = echarts.init(document.getElementById("LiveHeartRateId"));
    var echartGauge2 = RawechartGauge;
    var d = LiveHeartrate;
    echartGauge2.series[0].data[0].value[0] = d;

    if (isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }

    LiveHRId.setOption(echartGauge2);
  }
}
/*********************** EOF of Heart Rate ****************************/

/***************************  BloodOxygen(spo2) ***********************/
function blood_oxygen_data(LiveBloodOxygen, ContextBloodOxygen) {
  console.log("Calling blood_oxygen_data", ContextBloodOxygen);

  var LiveBloodOxygenId;
  var ContextBloodOxygenId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["49%", "51%"],
        radius: "100%",
        min: 0.9,
        max: 0.96,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#D56868"], //40-red
              [0.55, "#FFB601"], //130-orange
              [0.85, "#F5DB00"], //50-yello
              [1.05, "#98BF64"], //90-green
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 15,
          offsetCenter: [0, "10%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = Math.round(value * 100);
            return (data = data == 0 || isNaN(data) ? "- -" : data + " %");
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "SPO2",
          },
        ],
      },
    ],
  };
  if ($("#ContextBloodOxygenId").length) {
    ContextBloodOxygenId = echarts.init(document.getElementById("ContextBloodOxygenId"));
    var echartGauge1 = RawechartGauge;
    var d1 = ContextBloodOxygen;
    if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
      echartGauge1.series[0].pointer.show = false;
    } else {
      echartGauge1.series[0].pointer.show = true;
    }
    echartGauge1.series[0].data[0].value[0] = d1;
    ContextBloodOxygenId.setOption(echartGauge1);
  } else if ($("#LiveBloodOxygenId").length) {
    LiveBloodOxygenId = echarts.init(document.getElementById("LiveBloodOxygenId"));
    var echartGauge2 = RawechartGauge;
    var d = LiveBloodOxygen;
    console.log("LiveBloodOxygen", LiveBloodOxygen);
    if (isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }
    echartGauge2.series[0].data[0].value[0] = d;
    LiveBloodOxygenId.setOption(echartGauge2);
  }
}
/************************* EOF of BloodOxygen(spo2) ********************/

/************************ Temperature  ********************************/
function temperature_data(LiveTemperature, ContextTemperature) {
  LiveTemperature = String(LiveTemperature);
  ContextTemperature = String(ContextTemperature);

  var LiveTemperatureId;
  var ContextTemperatureId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "58%"],
        radius: "100%",
        min: 30,
        max: 45,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#D56868"],
              [0.5, "#F5DB00"],
              [0.8, "#98BF64"],
              [1, "#FFB601"],
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 15,
          offsetCenter: [0, "20%"],
          valueAnimation: true,
          formatter: function (value) {
            const v = Number(value);
            if (!isFinite(v) || v <= 0) return "--";
            return v.toFixed(2) + "\u2103";
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "Temperature",
          },
        ],
      },
    ],
  };

  if ($("#ContextTemperatureId").length) {
    ContextTemperatureId = echarts.init(document.getElementById("ContextTemperatureId"));
    console.log("the ContextTemperature ** is: ", ContextTemperature);
    if (ContextTemperature !== "") {
      var echartGauge1 = RawechartGauge;
      var d1 = parseFloat(ContextTemperature);

      if (d1 === null || isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
        d1 = 0; //if the data one is NaN or 0.00 or undefined or "" or a null, then setting to 0
      } else {
        echartGauge1.series[0].pointer.show = true;
      }
      console.log("d1", d1);
      // Assign numeric value directly (ECharts gauge expects a number)
      echartGauge1.series[0].data[0].value = d1;
      ContextTemperatureId.setOption(echartGauge1);
    }
  } else if ($("#LiveTemperatureId").length) {
    LiveTemperatureId = echarts.init(document.getElementById("LiveTemperatureId"));
    var echartGauge2 = RawechartGauge;
    var d = parseFloat(LiveTemperature);
    // var d = LiveTemperature;
    if (d === null || isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
      d = 0;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }
    // Assign numeric value directly (ECharts gauge expects a number)
    echartGauge2.series[0].data[0].value = d;
    LiveTemperatureId.setOption(echartGauge2);
  }
}
/*********************** EOF of Temperature  ****************************/

/************************  Activity Monitor ****************************/
function acceleration_data(LiveAcc, ContextAcc) {
  console.log("Calling acceleration_data", ContextAcc);

  var LiveAccId;
  var ContextAccId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "58%"],
        radius: "100%",
        min: 4000,
        max: 15000,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.09095, "#D56868"], //red
              [0.3181, "#FFB601"], //orange
              [0.5454, "#F5DB00"], //yello
              [1.0, "#98BF64"], //green
            ],
          },
        },
        pointer: {
          show: true,
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 15,
          offsetCenter: [0, "10%"],
          valueAnimation: true,
          color: "white",
          formatter: function (value) {
            return (value = value == 0 || isNaN(value) ? "--" : value);
          },
        },
        data: [
          {
            value: [],
            name: "RR",
          },
        ],
      },
    ],
  };

  if ($("#ContextAccelrationId").length) {
    ContextAccId = echarts.init(document.getElementById("ContextAccelrationId"));
    if (ContextAcc != "") {
      var echartGauge1 = RawechartGauge;
      var d1 = ContextAcc;
      console.log("ContextAcc", ContextAcc);
      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
        d1 = "- -";
      } else {
        echartGauge1.series[0].pointer.show = true;
      }
      echartGauge1.series[0].data[0].value[0] = d1;
      ContextAccId.setOption(echartGauge1);
    }
  } else if ($("#LiveAccelrationId").length) {
    LiveAccId = echarts.init(document.getElementById("LiveAccelrationId"));
    var echartGauge2 = RawechartGauge;
    var d = LiveAcc;
    console.log("activityM", d);
    if (isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
      d = "- -";
    } else {
      echartGauge2.series[0].pointer.show = true;
    }
    echartGauge2.series[0].data[0].value[0] = d;
    LiveAccId.setOption(echartGauge2);
  }
}
/*********************EOF of Activity Monitor ************************/

function blood_pressure_data(LiveSBP, LiveDBP, ContextSBP, ContextDBP) {
  var ContextBPId;
  var LiveBPId;
  var dbp;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "58%"],
        radius: "100%",
        min: 80,
        max: 230,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.07, "#D56868"], //red
              [0.139, "#FFB601"], //orange
              [0.205, "#F5DB00"], //yello
              [0.93, "#98BF64"], //green
              //[0.63, '#F5DB00'],//yellow
              //[0.75,'#FFB601'],//orange
              [1.0, "#D56868"], //150-red
            ],
          },
        },
        pointer: {
          show: true,
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-50%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 15,
          offsetCenter: [0, "30%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = value ? value + "/" + dbp + " mmHg" : "-- / --";
            return data;
          },

          color: "white",
        },
        data: [
          {
            value: [],
            name: "LiveSBP",
          },
        ],
      },
    ],
  };
  if ($("#ContextBloodPressureId").length) {
    ContextBPId = echarts.init(document.getElementById("ContextBloodPressureId"));
    if (ContextSBP !== "" && ContextDBP !== "") {
      var echartGauge1 = RawechartGauge;
      var d1 = ContextSBP;
      dbp = ContextDBP;
      console.log("ContextBloodPressureId", d1, dbp);
      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
      } else {
        echartGauge1.series[0].pointer.show = true;
      }

      echartGauge1.series[0].data[0].value[0] = d1;
      ContextBPId.setOption(echartGauge1);
    }
  } else if ($("#LiveBloodPressureId").length) {
    LiveBPId = echarts.init(document.getElementById("LiveBloodPressureId"));
    var echartGauge2 = RawechartGauge;
    var d = LiveSBP;
    dbp = LiveDBP;
    if (isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }
    echartGauge2.series[0].data[0].value[0] = d;
    LiveBPId.setOption(echartGauge2);
  }
}

/**************************** Respiration Rate *************************/
function respiration_rate_data(LiveRRData, contextRRData) {
  console.log("Calling LiveRRData in live page", LiveRRData, contextRRData);
  var LiveHRId;
  var ContextHRId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "58%"],
        radius: "100%",
        min: 5,
        max: 28,
        splitNumber: 8,
        // animation: false ,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.15, "#D56868"], //red
              //[0.133,'#FFB601'],//orange
              [0.3, "#F5DB00"], //yello
              [0.75, "#98BF64"], //green
              //[0.63, '#F5DB00'],//yello
              [0.95, "#FFB601"], //orange
              [1, "#D56868"], //150-red
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-50%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 15,
          offsetCenter: [0, "10%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = value == 0 || isNaN(value) || value == undefined ? (data = "- -") : (data = value);
            return data;
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "RR",
          },
        ],
      },
    ],
  };

  if ($("#ContextRespirationRateId").length) {
    ContextHRId = echarts.init(document.getElementById("ContextRespirationRateId"));
    if (contextRRData !== "") {
      var echartGauge1 = RawechartGauge;

      var d1 = contextRRData;
      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
      } else {
        echartGauge1.series[0].pointer.show = true;
      }
      echartGauge1.series[0].data[0].value[0] = d1;
      ContextHRId.setOption(echartGauge1);
    }
  } else if ($("#LiveRespirationRateId").length) {
    LiveHRId = echarts.init(document.getElementById("LiveRespirationRateId"));
    var echartGauge2 = RawechartGauge;
    var d = LiveRRData;
    if (isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }

    echartGauge2.series[0].data[0].value[0] = d;
    LiveHRId.setOption(echartGauge2);
  }
}
/**************************** EOF of Respiration Rate *************************/
export { heartrate_data, blood_pressure_data, respiration_rate_data, acceleration_data, blood_oxygen_data, temperature_data, RR_data_passing, PPG_data_passing, ECG_data_passing, ews_value_passing };
