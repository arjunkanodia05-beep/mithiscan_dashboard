const DATABASE_URL =
  "https://mithiscan-default-rtdb.asia-southeast1.firebasedatabase.app";

let map = L.map("map").setView([19.085, 72.875], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let heatLayer;

function loadSystemStatus() {
  fetch(`${DATABASE_URL}/system_status.json`)
    .then(res => res.json())
    .then(status => {
      const el = document.getElementById("systemStatus");
      if (status === "ON") {
        el.textContent = "ONLINE";
        el.style.color = "#00ff88";
      } else {
        el.textContent = "OFFLINE";
        el.style.color = "#ff4444";
      }
    })
    .catch(() => {
      document.getElementById("systemStatus").textContent = "UNKNOWN";
    });
}

function loadSensorData() {
  fetch(`${DATABASE_URL}/sensor_readings.json`)
    .then(res => res.json())
    .then(data => {
      if (!data) return;

      const readings = Object.values(data);

      readings.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
      );

      const timestamps = readings.map(r => r.timestamp);
      const turbidity = readings.map(r => r.turbidity);
      const temperature = readings.map(r => r.temperature);
      const conductivity = readings.map(r => r.conductivity);
      const ph = readings.map(r => r.pH);

      document.getElementById("latestValue").textContent =
        turbidity[turbidity.length - 1];

      buildTable(readings);
      buildCharts(timestamps, turbidity, temperature, conductivity, ph);
      buildHeatmap(readings);
    });
}

function buildTable(readings) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  readings.forEach(r => {
    const row = `
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
    tbody.innerHTML += row;
  });
}

function buildCharts(t, turb, temp, cond, ph) {
  new Chart(document.getElementById("turbidityChart"), {
    type: "line",
    data: {
      labels: t,
      datasets: [{
        label: "Turbidity",
        data: turb,
        borderColor: "#ff6384",
        tension: 0.3
      }]
    }
  });

  new Chart(document.getElementById("temperatureChart"), {
    type: "line",
    data: {
      labels: t,
      datasets: [{
        label: "Temperature",
        data: temp,
        borderColor: "#36a2eb",
        tension: 0.3
      }]
    }
  });

  new Chart(document.getElementById("conductivityChart"), {
    type: "line",
    data: {
      labels: t,
      datasets: [{
        label: "Conductivity",
        data: cond,
        borderColor: "#4bc0c0",
        tension: 0.3
      }]
    }
  });

  new Chart(document.getElementById("phChart"), {
    type: "line",
    data: {
      labels: t,
      datasets: [{
        label: "pH",
        data: ph,
        borderColor: "#ff9f40",
        tension: 0.3
      }]
    }
  });
}

function buildHeatmap(readings) {
  const heatData = readings.map(r => [
    r.latitude,
    r.longitude,
    r.turbidity / 500
  ]);

  if (heatLayer) {
    map.removeLayer(heatLayer);
  }

  heatLayer = L.heatLayer(heatData, {
    radius: 30,
    blur: 20
  }).addTo(map);

  map.invalidateSize();
}

loadSystemStatus();
loadSensorData();
