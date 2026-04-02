function ews_value_passing(ews_value, ews_color) {
  try {
    document.getElementById("ews_id1").className = "ews_card_js";
    if (ews_value == "--") {
      document.getElementById("ews_id1").innerHTML = "";
      document.getElementById("ews_color1").style.backgroundColor = "#ffffff00";
    } else {
      document.getElementById("ews_color1").style.backgroundColor = ews_color;
      document.getElementById("ews_id1").innerHTML = "EWS Score - " + ews_value;
    }
  } catch (e) {
    console.error("[ews_value_passing] Error while updating EWS value:", e);
  }
}
function ECG_data(ecgdata) {
  try {
    if ($("#context_ecg").length) {
      var value1;
      var counter = 0;
      var option1;
      var EcgData = ecgdata;
      const echartLinecontext = echarts.init(document.getElementById("context_ecg"));

      var reference_data = [
        [-20, 100],
        [-30, 100],
        [-30, 201],
        [-50, 201],
        [-50, 100],
        [-60, 100],
      ];

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
        console.error("[ECG_data] Error while pushing random ECG data:", e);
      }
      var isZoomed = false;

      if (data) {
        option1 = {
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
        echartLinecontext.clear();
        echartLinecontext.setOption(option1);
      }
    }
  } catch (e) {
    console.error("[ECG_data] Error while processing ECG data:", e);
  }
}

function PPG_data(ppgdata) {
  try {
    if ($("#context_ppg").length) {
      var PpgData;
      var value1;
      var option1;
      var counter = 0;

      const echartLinecontext = echarts.init(document.getElementById("context_ppg"));
      PpgData = ppgdata;

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
        console.error("[PPG_data] Error while pushing random PPG data:", e);
      }

      if (data) {
        option1 = {
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
        echartLinecontext.clear();
        echartLinecontext.setOption(option1);
      }
    }
  } catch (e) {
    console.error("[PPG_data] Error while building PPG chart:", e);
  }
}

function RR_data(rrdata) {
  try {
    if ($("#context_rr").length) {
      var RrData;
      var value1;
      var counter = 0;
      var option1;
      
      const echartLinecontext = echarts.init(document.getElementById("context_rr"));
      RrData = rrdata;

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
        console.error("[RR_data] Error while pushing random RR data:", e);
      }

      if (data) {
        option1 = {
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
        echartLinecontext.clear();
        echartLinecontext.setOption(option1);
      }
    }
  } catch (e) {
    console.error("[RR_data] Error while processing RR data:", e);
  }
}
function heartrate_data(ContextHeartrate) {
  try {
    if ($("#ContextHeartRateId").length) {
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

      var ContextHRId = echarts.init(document.getElementById("ContextHeartRateId"));
      if (ContextHeartrate !== "") {
        var echartGauge1 = RawechartGauge;
        var d1 = ContextHeartrate;
        echartGauge1.series[0].data[0].value[0] = d1;

        if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
          echartGauge1.series[0].pointer.show = false;
        } else {
          echartGauge1.series[0].pointer.show = true;
        }

        ContextHRId.setOption(echartGauge1);
      }
    }
  } catch (e) {
    console.error("[HR_data] Error while processing HR data:", e);
  }
}
function blood_oxygen_data(ContextBloodOxygen) {
  try {
    if ($("#ContextBloodOxygenId").length) {
      var ContextBloodOxygenId = echarts.init(document.getElementById("ContextBloodOxygenId"));

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
      var echartGauge1 = RawechartGauge;
      var d1 = ContextBloodOxygen;
      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
      } else {
        echartGauge1.series[0].pointer.show = true;
      }
      echartGauge1.series[0].data[0].value[0] = d1;
      ContextBloodOxygenId.setOption(echartGauge1);
    }
  } catch (e) {
    console.error("[BloodOxygen_data] Error while processing Blood Oxygen data:", e);
  }
}
function temperature_data(LiveTemperature, ContextTemperature) {
  try {
    if ($("#ContextTemperatureId").length) {
      ContextTemperature = String(ContextTemperature);

      var ContextTemperatureId = echarts.init(document.getElementById("ContextTemperatureId"));

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

      if (ContextTemperature !== "") {
        var echartGauge1 = RawechartGauge;
        var d1 = parseFloat(ContextTemperature);

        if (d1 === null || isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
          echartGauge1.series[0].pointer.show = false;
          d1 = 0; //if the data one is NaN or 0.00 or undefined or "" or a null, then setting to 0
        } else {
          echartGauge1.series[0].pointer.show = true;
        }
        // Assign numeric value directly (ECharts gauge expects a number)
        echartGauge1.series[0].data[0].value = d1;
        ContextTemperatureId.setOption(echartGauge1);
      }
    }
  } catch (error) {
    console.error("[Temperature_data] Error while processing Temperature data:", error);
  }
}
function acceleration_data(ContextAcc) {
  try {
    if ($("#ContextAccelrationId").length) {
      var ContextAccId = echarts.init(document.getElementById("ContextAccelrationId"));

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

      var echartGauge1 = RawechartGauge;
      var d1 = ContextAcc;
      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
        d1 = "- -";
      } else {
        echartGauge1.series[0].pointer.show = true;
      }
      echartGauge1.series[0].data[0].value[0] = d1;
      ContextAccId.setOption(echartGauge1);
    }
  } catch (error) {
    console.error("[Acceleration_data] Error while processing Acceleration data:", error);
  }
}

function blood_pressure_data(LiveSBP, LiveDBP, ContextSBP, ContextDBP) {
  try {
    if ($("#ContextBloodPressureId").length) {
      var ContextBPId = echarts.init(document.getElementById("ContextBloodPressureId"));

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
      var echartGauge1 = RawechartGauge;
      var d1 = ContextSBP;
      dbp = ContextDBP;
      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
      } else {
        echartGauge1.series[0].pointer.show = true;
      }

      echartGauge1.series[0].data[0].value[0] = d1;
      ContextBPId.setOption(echartGauge1);
    }
  } catch (error) {
    console.error("[BloodPressure_data] Error while processing Blood Pressure data:", error);
  }
}

function respiration_rate_data(LiveRRData, contextRRData) {
  try {
    if ($("#ContextRespirationRateId").length) {
      var ContextHRId = echarts.init(document.getElementById("ContextRespirationRateId"));

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
    }
  } catch (error) {
    console.error("[RespirationRate_data] Error while processing Respiration Rate data:", error);
  }
}
export { heartrate_data, blood_pressure_data, respiration_rate_data, acceleration_data, blood_oxygen_data, temperature_data, RR_data, PPG_data, ECG_data, ews_value_passing };
