export async function patient_details(patient_info) {
  console.log("[Dashboard-UI.js] patient_info before in array: ", patient_info.length);
  const normalizedPatientInfo = Array.isArray(patient_info)
    ? patient_info.map((patient) => {
        const nextPatient = patient.slice(0, 7);
        let sortOrder = 6;

        switch (nextPatient[6]) {
          case "#EE4B2B":
            sortOrder = 1;
            break;

          case "#ff781f":
            sortOrder = 2;
            break;

          case "#ffaf7a":
            sortOrder = 3;
            break;

          case "#76B947":
            sortOrder = 4;
            break;

          case "#d4d4d3":
            sortOrder = 5;
            break;

          default:
            break;
        }

        nextPatient.push(sortOrder);
        return nextPatient;
      })
    : [];

  // console.log("[Dashboard-UI.js] patient_info before in array: ", normalizedPatientInfo);
  normalizedPatientInfo.sort(sortFunction);

  function sortFunction(a, b) {
    if (a[5] === b[5]) {
      return 0;
    } else {
      return a[5] > b[5] ? -1 : 1;
    }
  }
  // console.log("[Dashboard-UI.js] patient_info after in array: ", normalizedPatientInfo);

  // console.log("[Dashboard-UI.js] Data before creating charts:", normalizedPatientInfo);

  var modal = document.getElementById("myModal");

  var span = document.getElementsByClassName("close")[0];

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  if ($("#p_details").length) {
    const products = document.getElementById("p_details");

    if (!products) {
      return;
    }

    products.innerHTML = "";

    for (var i = 0; i < normalizedPatientInfo.length; i++) {
      console.log("[Dashboard-UI.js] Creating card for:", normalizedPatientInfo[i]);
      let LiveECGId = "chart" + normalizedPatientInfo[i][4];
      let LivePPGId = "ppgchart" + normalizedPatientInfo[i][4];
      let LiveRRId = "rrchart" + normalizedPatientInfo[i][4];
      let hrId = "hr" + normalizedPatientInfo[i][4];
      let spoId = "spo" + normalizedPatientInfo[i][4];
      let bpId = "bp" + normalizedPatientInfo[i][4];
      let rrId = "rr" + normalizedPatientInfo[i][4];
      let tempId = "temp" + normalizedPatientInfo[i][4];
      let ewsvId = "ewsv" + normalizedPatientInfo[i][4];
      let ewscId = "ewsc" + normalizedPatientInfo[i][4];
      let borderId = "border" + normalizedPatientInfo[i][4];
      let hrBorderId = "hrBorder" + normalizedPatientInfo[i][4];
      let spo2BorderId = "spo2Border" + normalizedPatientInfo[i][4];
      let tempBorderId = "tempBorder" + normalizedPatientInfo[i][4];
      let rrBorderId = "rrBorder" + normalizedPatientInfo[i][4];
      let bpBorderId = "bpBorder" + normalizedPatientInfo[i][4];

      createCard(normalizedPatientInfo[i], LiveECGId, LivePPGId, LiveRRId, hrId, spoId, bpId, rrId, tempId, ewsvId, ewscId, borderId, hrBorderId, spo2BorderId, tempBorderId, rrBorderId, bpBorderId);

      console.log("[Dashboard-UI.js] Created card for:", normalizedPatientInfo[i]);
    }

    function createCard(patientDetails, LiveECGId, LivePPGId, LiveRRId, hrId, spoId, bpId, rrId, tempId, ewsvId, ewscId, borderId, hrBorderId, spo2BorderId, tempBorderId, rrBorderId, bpBorderId) {
      const [name, age, gender, ailment, patient_id_no, ews, color] = patientDetails;
      console.log("[Dashboard-UI.js] Creating card with IDs:", ewsvId, ewscId);

      const ageLabel = age === undefined || age === null || age === "" ? "--" : `${age}Y`;
      const genderLabel = gender === undefined || gender === null || gender === "" ? "--" : gender;

      let code = `
          <div class="well profile_view patient-card" id="${borderId}">
            <div class="border_1 patient-card__shell">
              <div class="patient-card__header animated flipInY">
                <div class="patient-card__identity">
                  <span class="patient-card__caption">Name</span>
                  <div class="patient-card__name-row">
                    <h2 class="patient-card__name">${name}</h2>
                    <div class="patient-card__meta patient-card__meta--badges">
                      <span>${ageLabel}</span>
                      <span>${genderLabel}</span>
                    </div>
                  </div>
                </div>
                <div class="patient-card__ews" id="${ewscId}">
                  <span class="patient-card__ews-label">EWS</span>
                  <h2 id="${ewsvId}" class="patient-card__ews-value">${ews ?? "--"}</h2>
                </div>
              </div>
              <div class="patient-card__content">
                <div class="patient-card__waveforms">
                  <div class="wave-card wave-card--ecg">
                    <h3 class="wave-card__title">ECG</h3>
                    <div class="wave-card__chart wave-card__chart--ecg" id="${LiveECGId}"></div>
                  </div>
                  <div class="wave-card wave-card--ppg">
                    <h3 class="wave-card__title">PPG</h3>
                    <div class="wave-card__chart wave-card__chart--ppg" id="${LivePPGId}"></div>
                  </div>
                  <div class="wave-card wave-card--rr">
                    <h3 class="wave-card__title">RR</h3>
                    <div class="wave-card__chart wave-card__chart--rr" id="${LiveRRId}"></div>
                  </div>
                </div>
                <div class="patient-card__vitals-panel">
                  <ul class="vitals-list">
                    <li class="vital vital--hr" id="${hrBorderId}">
                      <span class="vital-label">HR</span>
                      <div class="vital-main">
                        <h1 id="${hrId}" class="vital-value"></h1>
                      </div>
                    </li>
                    <li class="vital vital--spo2" id="${spo2BorderId}">
                      <span class="vital-label">SPO2</span>
                      <div class="vital-main">
                        <h1 id="${spoId}" class="vital-value"></h1>
                      </div>
                    </li>
                    <li class="vital vital--temp" id="${tempBorderId}">
                      <span class="vital-label">TEMP</span>
                      <div class="vital-main">
                        <h1 id="${tempId}" class="vital-value"></h1>
                      </div>
                    </li>
                    <li class="vital vital--rr" id="${rrBorderId}">
                      <span class="vital-label">RR</span>
                      <div class="vital-main">
                        <h1 id="${rrId}" class="vital-value"></h1>
                      </div>
                    </li>
                    <li class="vital vital--bp vital--wide" id="${bpBorderId}">
                      <span class="vital-label">BP</span>
                      <div class="vital-main">
                        <h1 id="${bpId}" class="vital-value"></h1>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          `;

      products.insertAdjacentHTML("beforeend", code);
    }

    const items = products.children;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      item.addEventListener("click", function (index) {
        console.log("[Dashboard-UI.js] Clicked on " + i, normalizedPatientInfo[i][4]);
        history.pushState({ page: "index" }, "Title", "../production/index.html");
        cardclick(normalizedPatientInfo[i][4]);
      });
    }
    for (let i = 0; i < normalizedPatientInfo.length; i++) {
      // patient_info[i][4] = patient_id, [5] = ews value, [6] = color
      refreshews(normalizedPatientInfo[i][5], normalizedPatientInfo[i][6], normalizedPatientInfo[i][4]);
    }

    if (typeof window.flushPendingBlinkAlerts === "function") {
      window.flushPendingBlinkAlerts();
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
