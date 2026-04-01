import { fb } from "../firebase/config.js";

var toggleButton = null;
var statusLabel = null;
var vitalInputs = [];
var vitalCards = [];

function getPatientUid() {
  return localStorage.getItem("patient_unique_id") || "";
}

function setStatus(message, isError) {
  if (!statusLabel) {
    return;
  }

  statusLabel.textContent = message || "";
  statusLabel.classList.toggle("is-error", Boolean(isError));
}

function setInputValue(id, value) {
  var input = document.getElementById(id);

  if (!input) {
    return;
  }

  input.value = value === undefined || value === null ? "" : value.toString();
}

function splitBloodPressureValue(value) {
  if (value === undefined || value === null || value === "") {
    return ["", ""];
  }

  var parts = value.toString().split("/");
  return [parts[0] || "", parts[1] || ""];
}

function populateVitals(data) {
  var vitals = data || {};
  var bloodPressureMin = splitBloodPressureValue(vitals.bp?.Min);
  var bloodPressureMax = splitBloodPressureValue(vitals.bp?.Max);

  setInputValue("spo2min", vitals.spo2?.Min);
  setInputValue("spo2max", vitals.spo2?.Max);
  setInputValue("hrmin", vitals.hr?.Min);
  setInputValue("hrmax", vitals.hr?.Max);
  setInputValue("tempmin", vitals.temp?.Min);
  setInputValue("tempmax", vitals.temp?.Max);
  setInputValue("rrmin", vitals.rr?.Min);
  setInputValue("rrmax", vitals.rr?.Max);
  setInputValue("sbpmin", bloodPressureMin[0]);
  setInputValue("dbpmin", bloodPressureMin[1]);
  setInputValue("sbpmax", bloodPressureMax[0]);
  setInputValue("dbpmax", bloodPressureMax[1]);
}

function setEditMode(isEditing) {
  vitalInputs.forEach(function (input) {
    input.disabled = !isEditing;
  });

  vitalCards.forEach(function (card) {
    card.classList.toggle("is-active", Boolean(isEditing));
  });

  if (toggleButton) {
    toggleButton.textContent = isEditing ? "Save" : "Edit";
    toggleButton.setAttribute("aria-pressed", isEditing ? "true" : "false");
  }
}

function setButtonDisabled(isDisabled) {
  if (toggleButton) {
    toggleButton.disabled = Boolean(isDisabled);
  }
}

function getFieldState(id) {
  var input = document.getElementById(id);
  var rawValue = input ? input.value.trim() : "";
  var numericValue = rawValue === "" ? null : Number(rawValue);

  return {
    rawValue: rawValue,
    numericValue: numericValue,
  };
}

function focusField(id) {
  var input = document.getElementById(id);

  if (input) {
    input.focus();
  }
}

function validateRange(label, minId, maxId) {
  var minField = getFieldState(minId);
  var maxField = getFieldState(maxId);
  var hasMin = minField.rawValue !== "";
  var hasMax = maxField.rawValue !== "";

  if (hasMin !== hasMax) {
    return {
      error: label + " requires both Min and Max values or leave both empty.",
      focusId: hasMin ? maxId : minId,
    };
  }

  if (!hasMin) {
    return {
      minValue: null,
      maxValue: null,
    };
  }

  if (!Number.isFinite(minField.numericValue) || !Number.isFinite(maxField.numericValue)) {
    return {
      error: "Enter valid numbers for " + label + ".",
      focusId: !Number.isFinite(minField.numericValue) ? minId : maxId,
    };
  }

  if (minField.numericValue > maxField.numericValue) {
    return {
      error: label + " Min cannot be greater than Max.",
      focusId: minId,
    };
  }

  return {
    minValue: minField.rawValue,
    maxValue: maxField.rawValue,
  };
}

function validateBloodPressure() {
  var sbpMin = getFieldState("sbpmin");
  var dbpMin = getFieldState("dbpmin");
  var sbpMax = getFieldState("sbpmax");
  var dbpMax = getFieldState("dbpmax");
  var rawValues = [sbpMin.rawValue, dbpMin.rawValue, sbpMax.rawValue, dbpMax.rawValue];
  var filledValues = rawValues.filter(function (value) {
    return value !== "";
  }).length;

  if (filledValues > 0 && filledValues < rawValues.length) {
    return {
      error: "Blood Pressure requires SBP and DBP Min/Max values, or leave all four empty.",
      focusId: rawValues[0] === "" ? "sbpmin" : rawValues[1] === "" ? "dbpmin" : rawValues[2] === "" ? "sbpmax" : "dbpmax",
    };
  }

  if (filledValues === 0) {
    return {
      minValue: null,
      maxValue: null,
    };
  }

  if (!Number.isFinite(sbpMin.numericValue)) {
    return {
      error: "Enter a valid SBP Min value.",
      focusId: "sbpmin",
    };
  }

  if (!Number.isFinite(dbpMin.numericValue)) {
    return {
      error: "Enter a valid DBP Min value.",
      focusId: "dbpmin",
    };
  }

  if (!Number.isFinite(sbpMax.numericValue)) {
    return {
      error: "Enter a valid SBP Max value.",
      focusId: "sbpmax",
    };
  }

  if (!Number.isFinite(dbpMax.numericValue)) {
    return {
      error: "Enter a valid DBP Max value.",
      focusId: "dbpmax",
    };
  }

  if (sbpMin.numericValue > sbpMax.numericValue) {
    return {
      error: "Systolic Blood Pressure Min cannot be greater than Max.",
      focusId: "sbpmin",
    };
  }

  if (dbpMin.numericValue > dbpMax.numericValue) {
    return {
      error: "Diastolic Blood Pressure Min cannot be greater than Max.",
      focusId: "dbpmin",
    };
  }

  return {
    minValue: sbpMin.rawValue + "/" + dbpMin.rawValue,
    maxValue: sbpMax.rawValue + "/" + dbpMax.rawValue,
  };
}

function buildUpdates(patientUid) {
  var spo2 = validateRange("SpO2", "spo2min", "spo2max");
  var hr = validateRange("Heart Rate", "hrmin", "hrmax");
  var temp = validateRange("Temperature", "tempmin", "tempmax");
  var rr = validateRange("Respiratory Rate", "rrmin", "rrmax");
  var bp = validateBloodPressure();
  var results = [spo2, hr, temp, rr, bp];
  var updates = {};
  var prefix = "/Threshold_Default/" + patientUid;

  for (var index = 0; index < results.length; index += 1) {
    if (results[index].error) {
      return results[index];
    }
  }

  updates[prefix + "/spo2/Min"] = spo2.minValue;
  updates[prefix + "/spo2/Max"] = spo2.maxValue;
  updates[prefix + "/hr/Min"] = hr.minValue;
  updates[prefix + "/hr/Max"] = hr.maxValue;
  updates[prefix + "/temp/Min"] = temp.minValue;
  updates[prefix + "/temp/Max"] = temp.maxValue;
  updates[prefix + "/rr/Min"] = rr.minValue;
  updates[prefix + "/rr/Max"] = rr.maxValue;
  updates[prefix + "/bp/Min"] = bp.minValue;
  updates[prefix + "/bp/Max"] = bp.maxValue;

  return {
    updates: updates,
  };
}

function loadVitals() {
  var patientUid = getPatientUid();

  populateVitals({});
  setEditMode(false);

  if (!patientUid) {
    setButtonDisabled(true);
    setStatus("Select a patient to edit configuration.", true);
    return;
  }

  setButtonDisabled(true);
  setStatus("", false);

  fb.database()
    .ref()
    .child("Threshold_Default")
    .child(patientUid)
    .once("value")
    .then(function (snapshot) {
      populateVitals(snapshot.val() || {});
      setStatus("", false);
    })
    .catch(function (error) {
      populateVitals({});
      setStatus("Unable to load configuration values.", true);
      console.error("Error loading configuration:", error);
    })
    .then(function () {
      setButtonDisabled(false);
    });
}

function saveVitals() {
  var patientUid = getPatientUid();
  var payload;

  if (!patientUid) {
    setStatus("Select a patient before saving configuration.", true);
    return;
  }

  payload = buildUpdates(patientUid);

  if (payload.error) {
    setStatus(payload.error, true);
    focusField(payload.focusId);
    return;
  }

  setButtonDisabled(true);
  setStatus("Saving...", false);

  fb.database()
    .ref()
    .update(payload.updates)
    .then(function () {
      setEditMode(false);
      setStatus("Configuration saved.", false);
    })
    .catch(function (error) {
      setStatus("Unable to save configuration.", true);
      console.error("Error saving configuration:", error);
    })
    .then(function () {
      setButtonDisabled(false);
    });
}

function handleButtonClick() {
  if (!toggleButton) {
    return;
  }

  if (toggleButton.textContent === "Edit") {
    setEditMode(true);
    setStatus("", false);
    return;
  }

  saveVitals();
}

function initializeVitalsConfiguration() {
  toggleButton = document.getElementById("saveVitalsConfig");
  statusLabel = document.getElementById("vitalsSaveStatus");
  vitalInputs = Array.prototype.slice.call(document.querySelectorAll("#VitalsComponents .vital-field input"));
  vitalCards = Array.prototype.slice.call(document.querySelectorAll("#VitalsComponents .vital-card"));

  if (!toggleButton || vitalInputs.length === 0) {
    return;
  }

  toggleButton.addEventListener("click", handleButtonClick);
  loadVitals();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeVitalsConfiguration);
} else {
  initializeVitalsConfiguration();
}
