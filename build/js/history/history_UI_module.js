var context_assment_opt;
var ECG_scatter_opt;

const context_assment_graph = echarts.init(document.getElementById("echart_context"));
const ECG_scatter_graph = echarts.init(document.getElementById("echart_ecg"));

function history_context_assessment(min_time, max_time, id, context_timestamp) {
  if ($("#echart_context").length) {
    var context_data = context_timestamp; //replace_zero.apply(this,context_timestamp);
    context_data.unshift([min_time * 1000, null]);
    context_data.push([max_time * 1000, null]);

    context_assment_opt = {
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

    var url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
    openModal(url);
  });
}
function history_ECG(min_time, max_time, ecg_timestamp, id) {
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
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
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

export { history_context_assessment, history_ECG };
