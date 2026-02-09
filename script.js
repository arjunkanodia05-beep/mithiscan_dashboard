const DATA_URL =
  "https://mithiscan-default-rtdb.asia-southeast1.firebasedatabase.app/sensor_readings.json";

let map;

async function loadData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  const readings = Object.values(data);

  readings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  populateTable(readings);
  updateStatus(readings[readings.length - 1]);
  drawCharts(readings);
  initHeatmap(readings);
}

function populateTable(readings) {
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
      </tr>`;
  });
}

function updateStatus(latest) {
  const box = document.getElementById("statusBox");
  box.textContent =
    `Latest turbidity reading: ${latest.turbidity} (used for hotspot intensity)`;
}

function drawCharts(readings) {
  const labels = readings.map(r => r.timestamp);

  makeChart("turbidityChart", "Turbidity", readings.map(r => r.turbidity));
  makeChart("temperatureChart", "Temperature (°C)", readings.map(r => r.temperature));
  makeChart("conductivityChart", "Conductivity", readings.map(r => r.conductivity));
  makeChart("phChart", "pH", readings.map(r => r.pH));
}

function makeChart(canvasId, label, data) {
  new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        borderWidth: 2,
        fill: false
      }]
    }
  });
}

function initHeatmap(readings) {
  const first = readings[0];

  map = L.map("map").setView([first.latitude, first.longitude], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  const heatPoints = readings.map(r => [
    r.latitude,
    r.longitude,
    r.turbidity / 600   // normalize intensity
  ]);

  L.heatLayer(heatPoints, {
    radius: 25,
    blur: 18,
    maxZoom: 17
  }).addTo(map);

  setTimeout(() => {
  map.invalidateSize();
}, 500);

}

loadData();
