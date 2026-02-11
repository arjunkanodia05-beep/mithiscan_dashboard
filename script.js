const DATA_URL =
  "https://mithiscan-default-rtdb.asia-southeast1.firebasedatabase.app/sensor_readings.json";

let map;

async function loadData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  const readings = Object.values(data);

  readings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  populateTable(readings);
  document.getElementById("latestValue").innerText =
    readings[readings.length - 1].turbidity;

  initMap(readings);
  drawCharts(readings);
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

function initMap(readings) {
  const center = readings[0];

  map = L.map("map").setView([center.latitude, center.longitude], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  const heatData = readings.map(r => [
    r.latitude,
    r.longitude,
    r.turbidity / 800
  ]);

  L.heatLayer(heatData, {
    radius: 35,
    blur: 25,
    maxZoom: 17
  }).addTo(map);

  // Glow circles (guaranteed visible)
  readings.forEach(r => {
    L.circle([r.latitude, r.longitude], {
      radius: 80,
      color: r.turbidity > 500 ? "red" :
             r.turbidity > 350 ? "orange" : "green",
      fillOpacity: 0.3
    }).addTo(map);
  });

  setTimeout(() => map.invalidateSize(), 500);
}

function drawCharts(readings) {
  const labels = readings.map(r => r.timestamp);

  makeChart("turbidityChart", "Turbidity", readings.map(r => r.turbidity), "#ef4444");
  makeChart("temperatureChart", "Temperature", readings.map(r => r.temperature), "#22d3ee");
  makeChart("conductivityChart", "Conductivity", readings.map(r => r.conductivity), "#a78bfa");
  makeChart("phChart", "pH", readings.map(r => r.pH), "#34d399");
}

function makeChart(id, label, data, color) {
  new Chart(document.getElementById(id), {
    type: "line",
    data: {
      labels: data.map((_, i) => i + 1),
      datasets: [{
        label: label,
        data: data,
        borderColor: color,
        borderWidth: 3,
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { labels: { color: "#e2e8f0" } } },
      scales: {
        x: { ticks: { color: "#e2e8f0" } },
        y: { ticks: { color: "#e2e8f0" } }
      }
    }
  });
}

loadData();
