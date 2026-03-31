export async function patient_details(patient_info) {
  for (var j = 0; j < patient_info.length; j++) {
    switch (patient_info[j][6]) {
      case "#EE4B2B":
        patient_info[j].push(1);
        break;

      case "#ff781f":
        patient_info[j].push(2);
        break;

      case "#ffaf7a":
        patient_info[j].push(3);
        break;

      case "#76B947":
        patient_info[j].push(4);
        break;

      case "#d4d4d3":
        patient_info[j].push(5);
        break;

      default:
        patient_info[j].push(6);
        break;
    }
  }
  patient_info.sort(sortFunction);

  function sortFunction(a, b) {
    if (a[7] === b[7]) {
      return 0;
    } else {
      return a[7] < b[7] ? -1 : 1;
    }
  }

  var modal = document.getElementById("myModal");

  var span = document.getElementsByClassName("close")[0];

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  if ($("#p_details").length) {
    const products = document.querySelector(".patient_details");

    const bg = document.querySelector(".ews_card_js");

    for (var i = 0; i < patient_info.length; i++) {
      let LiveECGId = "chart" + patient_info[i][4];
      let LivePPGId = "ppgchart" + patient_info[i][4];
      let LiveRRId = "rrchart" + patient_info[i][4];
      let hrId = "hr" + patient_info[i][4];
      let spoId = "spo" + patient_info[i][4];
      let bpId = "bp" + patient_info[i][4];
      let rrId = "rr" + patient_info[i][4];
      let tempId = "temp" + patient_info[i][4];
      let ewsvId = "ewsv" + patient_info[i][4];
      let ewscId = "ewsc" + patient_info[i][4];
      createCard(patient_info[i], LiveECGId, LivePPGId, LiveRRId, hrId, spoId, bpId, rrId, tempId, ewsvId, ewscId);
    }

    function createCard([name, age, gender, ailment, patient_id_no, ews, color], LiveECGId, LivePPGId, LiveRRId, hrId, spoId, bpId, rrId, tempId, ewsvId, ewscId) {
      let code = `
          <div class="well profile_view col-sm-6 col-md-6 col-lg-8">
            <div class="border_1" >
              <!-- Ews card -->
              <div class="animated flipInY col-lg-12 col-md-12 col-sm-12">
                <div class="ews_bar_1">
                  <div class="row" style="margin-left: 1px">
                    <div class="col-sm-6">
                      Name:
                      <h2>${name}</h2>
                    </div>
                    <div class="col-sm-5" id="${ewscId}" >
                      EWS:
                      <h2 id="${ewsvId}">${ews ?? "--"}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row" style="margin-left: 0px; margin-right: 0px">
              <div class="col-sm-5 col-md-6 col-lg-6">
                <div style="margin-bottom: 0px">
                  <h3 style="color: #37fd12; margin-bottom: 2px">ECG</h3>
                  <div class="container" id="${LiveECGId}" style="width: 100%; height: 100%; margin-bottom: 0px"></div>
                </div>
                <div style="margin-bottom: 0px">
                  <h3 style="color: #37fd12; margin-bottom: 2px">RR</h3>
                  <div class="container" id="${LiveRRId}" style="width: 100%; height: 100%; margin-bottom: 0px"></div>
                </div>
                <div style="margin-bottom: 0px">
                  <h3 style="color: #37fd12; margin-bottom: 2px">PPG</h3>
                  <div class="container" id="${LivePPGId}" style="width: 100%; height: 100%;margin-bottom: 0px"></div>
                </div>
              </div>
              <div class="col-sm-7 col-md-6 col-lg-6" style="border-left: 1px solid #ffffff">
                <ul class="vitals-list">
                  <li class="vital vital--hr">
                    <span class="vital-label">HR</span>
                    <div class="vital-main">
                      <h1 id="${hrId}" class="vital-value" style="white-space: nowrap;"></h1>
                      
                    </div>
                  </li>
                  <li class="vital vital--spo2">
                    <span class="vital-label">SPO2</span>
                    <div class="vital-main">
                      <h1 id="${spoId}" class="vital-value" style="white-space: nowrap;"></h1>
                      
                    </div>
                  </li>
                  <li class="vital vital--temp">
                    <span class="vital-label">TEMP</span>
                    <div class="vital-main">
                      <h1 id="${tempId}" class="vital-value" style="white-space: nowrap;"></h1>
                    </div>
                  </li>
                  <li class="vital vital--rr">
                    <span class="vital-label">RR</span>
                    <div class="vital-main">
                      <h1 id="${rrId}" class="vital-value" style="white-space: nowrap;"></h1>
                    
                    </div>
                  </li>
                  <li class="vital vital--bp">
                    <span class="vital-label">BP</span>
                    <div class="vital-main">
                      <h1 id="${bpId}" class="vital-value" style="white-space: nowrap;"></h1>
                      
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          `;

      products.innerHTML += code;
    }

    const items = products.children;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      item.addEventListener("click", function (index) {
        history.pushState({ page: "index" }, "Title", "../production/index.html");
        cardclick(patient_info[i][4]);
      });
    }
    for (let i = 0; i < patient_info.length; i++) {
      refreshews(patient_info[i][5], patient_info[i][6], patient_info[i][4]);
    }

    const loader = document.querySelector(".loader");
    loader.classList.add("loader--hidden");
  }
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
    ews_c.style.borderRadius = "10px";
  }
}
