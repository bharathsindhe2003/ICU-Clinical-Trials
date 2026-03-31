import { fb } from "../livepage/database_function.js";
import { ECG_data_passing } from "../livepage/live-custom.js";

export function ecg_lineChart(timestamp, id, ECG_scatter_graph, ECG_scatter_opt) {
  console.log("time stamp and id is: ", timestamp, id);

  let ecg_min = fb.database().ref().child("patientecgdata").child(id).child(timestamp);
  /**Obtaining 1min ECG data once*/
  ecg_min.once("value", function (snapshot) {
    console.log("snapshot of 1 min ECG data" + snapshot.ecg);
    if (snapshot.val() != null) {
      let ecg_string = JSON.stringify(snapshot.val(), null, 2);
      let ecg_json = JSON.parse(ecg_string);

      console.log("ecg data timestamp...", ecg_json.timestamp);
      //console.log("ecg data ...",ecg_json.payload);
      //console.log("ecg data type ...",ecg_json.type);

      var ecg_text = ecg_json.payload;
      let ecg_result = ecg_text.replace(/\]\[/g, ", ").trim();
      ecg_result = ecg_result.replace(/\]/g, "").trim();
      ecg_result = ecg_result.replace(/\[/g, "").trim();
      var final_min_ecg = ecg_result.split(",").map(Number);
      //console.log("final ecg array",final_min_ecg);

      /**Timestart to date time conversion*/
      var f_ecgtimestamp = ecg_json.timestamp;
      var date = new Date(f_ecgtimestamp * 1000);
      //console.log("Unix Timestamp:",unixTimestamp*1000)
      //console.log("Date Timestamp:",date.getTime())
      console.log(date);
      console.log("Date and time of ECG: " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());

      var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
      var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
      console.log("ecg data payload ...", final_min_ecg);
      console.log("ecg data date ...", ecgdate);
      console.log("ecg data time ...", ecgtime);

      var counter = 0;

      var reference_data = [
        [-20, 100],
        [-30, 100],
        [-30, 201],
        [-50, 201],
        [-50, 100],
        [-60, 100],
      ];
      function randomData() {
        var value = final_min_ecg[counter % final_min_ecg.length];
        counter++;
        return {
          //name: counter%final_min_ecg.length,
          value: [counter % final_min_ecg.length, Math.round(value)],
        };
      }
      var data_ecg = [];
      for (var i = 1; i < final_min_ecg.length; i++) {
        data_ecg.push(randomData());
      }

      var Lineoption = {
        title: {
          text: "Date:" + ecgdate + "   		                                                             " + "Time:" + ecgtime,

          top: "10",
          left: "10",
          textStyle: {
            color: "#333",
            fontWeight: "normal",
            fontSize: 12,
            fontStyle: "normal",
          },
        },
        grid: {
          top: 30,
          left: 15,
          right: 30,
          bottom: 50,
        },

        toolbox: {
          orient: "vertical",
          right: 3,
          feature: {
            myTool1: {
              show: true,
              title: "Back",
              orient: "horizontal",
              icon: "M125.578,181.333C145.718,144.845,149.112,89.193,70,91.052V136L2,68,70,0V43.985C164.735,41.514,175.286,127.607,125.578,181.333Z",
              onclick: function () {
                ECG_scatter_graph.clear();
                ECG_scatter_graph.setOption(ECG_scatter_opt);
              },
            },
            myTool2: {
              show: true,
              title: "Reset",
              icon: "image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PgogICAgICAgIDwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgCiAgICAgICAgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+ICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgPiA8cGF0aCBkPSJNMTAgMmg0IiAvPiA8cGF0aCBkPSJNMTIgMTR2LTQiIC8+IDxwYXRoIGQ9Ik00IDEzYTggOCAwIDAgMSA4LTcgOCA4IDAgMSAxLTUuMyAxNEw0IDE3LjYiIC8+IDxwYXRoIGQ9Ik05IDE3SDR2NSIgLz4gPC9zdmc+ICA=",
              onclick: function () {
                ECG_scatter_graph.dispatchAction({
                  type: "dataZoom",
                  start: 0,
                  endValue: 658,
                });
              },
            },
          },
        },
        tooltip: {
          show: false,
        },

        xAxis: {
          type: "value",
          splitNumber: 20,
          boundaryGap: false,

          axisLine: {
            show: true, // Hide full Line
            lineStyle: {
              color: "2178a049",
            },
          },
          axisLabel: {
            show: false,
          },
          grid: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            //splitNumber:20,
            lineStyle: {
              color: "#0277ada9",
              width: 1,
            },
          },

          minorSplitLine: {
            show: true,
            lineStyle: {
              color: "#2178a049",
              width: 0.5,
            },
          },
        },
        yAxis: {
          type: "value",
          boundaryGap: [0, "100%"],
          splitLine: {
            show: true,
            //splitNumber:10,
            lineStyle: {
              color: "#0277ada9",
              //width : 1,
            },
          },
          axisLine: {
            show: false, // Hide full Line
            //color:'2178a049'
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },

          minorSplitLine: {
            show: true,
            lineStyle: {
              color: "#2178a049",
              width: 0.5,
            },
          },
        },

        dataZoom: [
          {
            type: "inside",
            show: true,
            filterMode: "none",
            realtime: true,
            start: 0,
            endValue: 658,
            xAxisIndex: [0, 1],
            zoomOnMouseWheel: "alt",
          },
          {
            type: "slider",
            show: true,
            showDetail: false,
            handleSize: "100%",
            handleStyle: {
              color: "#0865C1",
              borderColor: "#ACB8D1",
              borderWidth: 1,
            },
          },
        ],

        series: [
          {
            name: "????",
            type: "line",
            showSymbol: false,
            //hoverAnimation: true,
            data: data_ecg,
            lineStyle: {
              color: "#000",
              width: 1.2,
            },
          },
          {
            name: "????",
            type: "line",
            showSymbol: false,
            hoverAnimation: false,
            data: reference_data,
            lineStyle: {
              color: "#000",
              width: 1.5,
            },
            label: {
              show: false,
            },
          },
        ],
      };

      ECG_scatter_graph.setOption(Lineoption);
    }
  });

  // $(document).ready(() => {

  // 	var option1;
  // 	var final_min_ecg;
  // 	var value;

  // let ecg_min = fb.database().ref().child("patientecgdata").child(id).child(timestamp);
  // ecg_min.once("value", function (snapshot) {
  // 	console.log("snapshot of 1 min ECG data"+snapshot.ecg);
  // 	if(snapshot.val()!=null){
  // 		let ecg_string = JSON.stringify(snapshot.val(),null,2);
  // 		let ecg_json = JSON.parse(ecg_string);

  // 		console.log("ecg data timestamp...",ecg_json.timestamp);
  // 		console.log("ecg data ...",ecg_json.ecg);
  // 		console.log("ecg data type ...",ecg_json.type);

  // 		let type=ecg_json.type;

  // 		if(type=="noise"||type=="flat"){
  // 			console.log("Waiting for the valid ECG")
  // 			final_min_ecg= [];
  // 		}
  // 		else{
  // 		var ecg_text=ecg_json.ecg;
  // 		let ecg_result = ecg_text.replace(/\]\[/g, ", ").trim();
  // 		ecg_result= ecg_result.replace(/\]/g, "").trim();
  // 		ecg_result= ecg_result.replace(/\[/g, "").trim();
  // 		final_min_ecg= ecg_result.split(",").map(Number);
  // 		//console.log("final ecg array",final_min_ecg);
  // 		}

  // 			/**Timestart to date time conversion*/
  // 			var f_ecgtimestamp=ecg_json.timestamp;
  // 			var date = new Date(f_ecgtimestamp*1000);
  // 			//console.log("Unix Timestamp:",unixTimestamp*1000)
  // 			//console.log("Date Timestamp:",date.getTime())
  // 			console.log(date)
  // 			console.log("Date and time of ECG: "+date.getDate()+
  // 					"/"+(date.getMonth()+1)+
  // 					"/"+date.getFullYear()+
  // 					" "+date.getHours()+
  // 					":"+date.getMinutes()+
  // 					":"+date.getSeconds());

  // 			var ecgdate=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
  // 			var ecgtime = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

  // 			ECG_data_passing(final_min_ecg,ecgdate,ecgtime,option1,value);

  // 		}

  // });
  // });
}
