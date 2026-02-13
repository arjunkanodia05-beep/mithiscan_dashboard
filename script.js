const DB =
"https://mithiscan-default-rtdb.asia-southeast1.firebasedatabase.app";

// MAP
const map = L.map("map").setView([19.085, 72.875], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
.addTo(map);

let heatLayer;

// LOAD STATUS
function loadStatus() {
  fetch(DB + "/system_status.json")
    .then(r => r.json())
    .then(status => {
      const el = document.getElementById("systemStatus");

      if (status === "ON") {
        el.textContent = "ONLINE";
        el.style.color = "lime";
      } else {
        el.textContent = "OFFLINE";
        el.style.color = "red";
      }
    });
}

// LOAD SENSOR DATA
function loadData() {
  fetch(DB + "/sensor_readings.json")
    .then(r => r.json())
    .then(data => {

      if (!data) return;

      const readings = Object.values(data);

      // REMOVE invalid objects
      const valid = readings.filter(r =>
        r.timestamp &&
        r.pH !== undefined &&
        r.turbidity !== undefined &&
        r.temperature !== undefined &&
        r.conductivity !== undefined &&
        r.latitude !== undefined &&
        r.longitude !== undefined
      );

      buildTable(valid);
      buildCharts(valid);
      buildHeatmap(valid);
    });
}

function buildTable(readings) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  readings.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td>${r.timestamp}</td>
        <td>${r.pH}</td>
        <td>${r.turbidity}</td>
        <td>${r.temperature}</td>
        <td>${r.conductivity}</td>
        <td>${r.latitude}</td>
        <td>${r.longitude}</td>
      </tr>
    `;
  });
}

function buildCharts(readings) {

  const labels = readings.map(r => r.timestamp);

  new Chart(
    document.getElementById("turbidityChart"),
    {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Turbidity",
          data: readings.map(r => r.turbidity),
          borderColor: "red"
        }]
      }
    }
  );

  new Chart(
    document.getElementById("temperatureChart"),
    {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Temperature",
          data: readings.map(r => r.temperature),
          borderColor: "orange"
        }]
      }
    }
  );

  new Chart(
    document.getElementById("conductivityChart"),
    {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Conductivity",
          data: readings.map(r => r.conductivity),
          borderColor: "blue"
        }]
      }
    }
  );

  new Chart(
    document.getElementById("phChart"),
    {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "pH",
          data: readings.map(r => r.pH),
          borderColor: "green"
        }]
      }
    }
  );
}

function buildHeatmap(readings) {

  const heatData = readings.map(r => [
    r.latitude,
    r.longitude,
    r.turbidity / 500
  ]);

  if (heatLayer) map.removeLayer(heatLayer);

  heatLayer = L.heatLayer(heatData, {
    radius: 30
  }).addTo(map);

  map.invalidateSize();
}

loadStatus();
loadData();
