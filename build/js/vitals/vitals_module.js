import { fb } from "../livepage/database_function.js";

var uid = localStorage.getItem("patient_unique_id");
console.log("vitals id", uid);

var vitals_data = fb.database().ref().child("Threshold_Default").child(uid);

vitals_data.once("value", function (snapshot) {
  console.log("vitals_data", snapshot.val());

  // Spo2
  var spo2min = snapshot.val()?.spo2?.Min;
  console.log("spo2min:", spo2min);
  var spo2max = snapshot.val()?.spo2?.Max;
  console.log("spo2max:", spo2max);
  var spo2 = document.getElementById("spo2min");
  spo2.value = spo2min;
  var spo21 = document.getElementById("spo2max");
  spo21.value = spo2max;

  // Heart Rate
  var hrmin = snapshot.val()?.hr?.Min;
  console.log("hrmin:", hrmin);
  var hrmax = snapshot.val()?.hr?.Max;
  console.log("hrmax:", hrmax);
  var hr = document.getElementById("hrmin");
  hr.value = hrmin;
  var hr1 = document.getElementById("hrmax");
  hr1.value = hrmax;

  // Temperature
  var tempmin = snapshot.val()?.temp?.Min;
  console.log("tempmin:", tempmin);
  var tempmax = snapshot.val()?.temp?.Max;
  console.log("tempmax:", tempmax);
  var temp = document.getElementById("tempmin");
  temp.value = tempmin;
  var temp1 = document.getElementById("tempmax");
  temp1.value = tempmax;

  // Blood Pressure
  var bpmin = snapshot.val()?.bp?.Min;
  bpmin = bpmin.toString().split("/");
  var bpmin1 = bpmin[0];
  var bpmin2 = bpmin[1];

  console.log("bpmin:", bpmin);
  var bpmax = snapshot.val()?.bp?.Max?.toString();
  bpmax = bpmax.split("/");
  var bpmax1 = bpmax[0];
  var bpmax2 = bpmax[1];
  var sbpmin = document.getElementById("sbpmin");
  var sbpmax = document.getElementById("sbpmax");
  sbpmin.value = bpmin1;
  sbpmax.value = bpmax1;
  var dbpmin = document.getElementById("dbpmin");
  var dbpmax = document.getElementById("dbpmax");
  dbpmin.value = bpmin2;
  dbpmax.value = bpmax2;

  // Respiratory Rate
  var rrmin = snapshot.val()?.rr?.Min;
  console.log("rrmin:", rrmin);
  var rrmax = snapshot.val()?.rr?.Max;
  console.log("rrmax:", rrmax);
  var rr = document.getElementById("rrmin");
  rr.value = rrmin;
  var rr1 = document.getElementById("rrmax");
  rr1.value = rrmax;

  // Disable input fields initially
  disableInputFields();
});

function disableInputFields() {
  var inputs = document.querySelectorAll(".vitals-inputs input");
  var inputtext = document.querySelectorAll('.vitals-inputs input[type="text"]');
  inputs.forEach(function (input) {
    input.disabled = true;
  });
}

function enableInputFields() {
  var inputs = document.querySelectorAll(".vitals-inputs input");
  inputs.forEach(function (input) {
    input.disabled = false;
  });
}

// Function to save data to the database
function saveData() {
  // Retrieve values from input fields
  var spo2min = parseInt(document.getElementById("spo2min").value);
  var spo2max = parseInt(document.getElementById("spo2max").value);
  var hrmin = parseInt(document.getElementById("hrmin").value);
  var hrmax = parseInt(document.getElementById("hrmax").value);
  var tempmin = parseInt(document.getElementById("tempmin").value);
  var tempmax = parseInt(document.getElementById("tempmax").value);
  var sbpmin = parseInt(document.getElementById("sbpmin").value);
  var sbpmax = parseInt(document.getElementById("sbpmax").value);
  var dbpmin = parseInt(document.getElementById("dbpmin").value);
  var dbpmax = parseInt(document.getElementById("dbpmax").value);
  var rrmin = parseInt(document.getElementById("rrmin").value);
  var rrmax = parseInt(document.getElementById("rrmax").value);

  // Validate min and max values
  if (spo2min > spo2max || hrmin > hrmax || tempmin > tempmax || sbpmin > sbpmax || dbpmin > dbpmax || rrmin > rrmax) {
    alert("Minimum value cannot be greater than Maximum value");
    return;
  }

  // Update the database node
  var updates = {};
  updates["/Threshold_Default/" + uid + "/spo2/Min"] = spo2min.toString();
  updates["/Threshold_Default/" + uid + "/spo2/Max"] = spo2max.toString();
  updates["/Threshold_Default/" + uid + "/hr/Min"] = hrmin.toString();
  updates["/Threshold_Default/" + uid + "/hr/Max"] = hrmax.toString();
  updates["/Threshold_Default/" + uid + "/temp/Min"] = tempmin.toString();
  updates["/Threshold_Default/" + uid + "/temp/Max"] = tempmax.toString();
  updates["/Threshold_Default/" + uid + "/bp/Min"] = (sbpmin + "/" + dbpmin).toString();
  updates["/Threshold_Default/" + uid + "/bp/Max"] = (sbpmax + "/" + dbpmax).toString();
  updates["/Threshold_Default/" + uid + "/rr/Min"] = rrmin.toString();
  updates["/Threshold_Default/" + uid + "/rr/Max"] = rrmax.toString();

  return fb
    .database()
    .ref()
    .update(updates)
    .then(function () {
      console.log("Data saved successfully!");
      disableInputFields();
      $("#edit").text("Edit");
      // keep inputs in read-only visual state
      $(".vitals-inputs input[type='text']").css("color", "white");
    })
    .catch(function (error) {
      console.error("Error saving data:", error);
    });
}

if ($("#edit").text() === "Edit") {
  $(".vitals-inputs input[type='text']").css("color", "white");
} else if ($("#edit").text() === "Save") {
  $(".vitals-inputs input[type='text']").css("color", "black");
}

$("#edit").on("click", function () {
  console.log("button clicked");
  if ($(this).text() === "Edit") {
    enableInputFields();
    $(this).text("Save");
    $(".vitals-inputs input[type='text']").css("color", "black");
  } else {
    // Save and keep fields disabled afterwards; saveData will also set visual
    saveData();
  }
});
