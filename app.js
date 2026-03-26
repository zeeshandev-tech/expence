document.addEventListener("DOMContentLoaded", () => {
  const expenseForm = document.getElementById("expense-form");
  const monthSelect = document.getElementById("month");
  const yearSelect = document.getElementById("year");
  const amountInput = document.getElementById("amount");
  const chartCanvas = document.getElementById("expense-chart");
  const totalDisplay = document.getElementById("total-amount");

  let activeChart = null;

  const CATEGORIES = ["Housing", "Food", "Transportation", "Bills", "Miscellaneous"];
  const CHART_COLORS = ["#e53b3b", "#1daa51", "#f1a116", "#0e5cf8", "#f510ed"];

  // Build an empty category object â€” avoids repeating this 12 times
  function emptyCategories() {
    return CATEGORIES.reduce((obj, cat) => {
      obj[cat] = 0;
      return obj;
    }, {});
  }

  // --- LocalStorage helpers ---

  function loadMonth(month, year) {
    const key = `expenses-${month}-${year}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : emptyCategories();
  }

  function saveMonth(month, year, data) {
    const key = `expenses-${month}-${year}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Year dropdown ---

  function populateYears() {
    const currentYear = new Date().getFullYear();
    for (let year = 2020; year <= 2040; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
  }

  // --- Default month & year on load ---

  function setDefaultMonthYear() {
    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" }).toLowerCase();
    monthSelect.value = monthName;
    yearSelect.value = now.getFullYear();
  }

  // --- Chart rendering ---

  function renderChart(data) {
    const values = Object.values(data);
    const total = values.reduce((sum, val) => sum + val, 0);

    // Update total display
    if (totalDisplay) {
      totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Destroy old chart before creating a new one
    if (activeChart) {
      activeChart.destroy();
    }

    const ctx = chartCanvas.getContext("2d");

    activeChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            data: values,
            backgroundColor: CHART_COLORS,
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "65%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              padding: 16,
              font: { size: 13 },
            },
          },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.label}: $${item.raw.toFixed(2)}`,
            },
          },
        },
      },
    });
  }

  function refreshChart() {
    const month = monthSelect.value;
    const year = yearSelect.value;

    if (!month || !year) {
      alert("Please select both a month and a year.");
      return;
    }

    const data = loadMonth(month, year);
    renderChart(data);
  }

  // --- Form submission ---

  function handleSubmit(event) {
    event.preventDefault();

    const month = monthSelect.value;
    const year = yearSelect.value;

    if (!month || !year) {
      alert("Please select both a month and a year.");
      return;
    }

    const category = event.target.category.value;
    const amount = parseFloat(event.target.amount.value);

    if (isNaN(amount) || amount === 0) {
      alert("Please enter a valid non-zero amount.");
      return;
    }

    const data = loadMonth(month, year);
    const current = data[category] ?? 0;
    const updated = current + amount;

    if (updated < 0) {
      alert("Invalid amount: this would reduce the category below zero.");
      return;
    }

    data[category] = updated;
    saveMonth(month, year, data);

    amountInput.value = "";
    renderChart(data);
  }

  // --- Month/year change refreshes chart automatically ---

  monthSelect.addEventListener("change", refreshChart);
  yearSelect.addEventListener("change", refreshChart);
  expenseForm.addEventListener("submit", handleSubmit);

  // --- Init ---
  populateYears();
  setDefaultMonthYear();
  refreshChart();
});