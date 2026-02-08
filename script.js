const DATA_URL =
  "https://mithiscan-default-rtdb.asia-southeast1.firebasedatabase.app/sensor_readings.json";

async function loadData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();

  const readings = Object.values(data);

  // Sort by timestamp (important for charts)
  readings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  populateTable(readings);
  drawCharts(readings);
}

function populateTable(readings) {
  const tbody = document.querySelector("#data-table tbody");
  tbody.innerHTML = "";

  readings.forEach(r => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${r.timestamp}</td>
      <td>${r.pH}</td>
      <td>${r.turbidity}</td>
      <td>${r.temperature}</td>
      <td>${r.conductivity}</td>
      <td>${r.latitude}</td>
      <td>${r.longitude}</td>
    `;

    tbody.appendChild(row);
  });
}

function drawCharts(readings) {
  const labels = readings.map(r => r.timestamp);
  const phData = readings.map(r => r.pH);
  const turbidityData = readings.map(r => r.turbidity);

  new Chart(document.getElementById("phChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "pH",
        data: phData,
        borderWidth: 2,
        fill: false
      }]
    }
  });

  new Chart(document.getElementById("turbidityChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Turbidity",
        data: turbidityData,
        borderWidth: 2,
        fill: false
      }]
    }
  });
}

loadData();
