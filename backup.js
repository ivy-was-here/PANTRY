// Backup.js - Handles data backup and restoration

// Export data to a JSON file
function exportData() {
  const data = {
    pantry: JSON.parse(localStorage.getItem("pantry")) || [],
    recipes: JSON.parse(localStorage.getItem("recipes")) || [],
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a temporary link and trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = "pantry_backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import data from a JSON file
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // Validate and store data in localStorage
      if (data.pantry && Array.isArray(data.pantry)) {
        localStorage.setItem("pantry", JSON.stringify(data.pantry));
      }
      if (data.recipes && Array.isArray(data.recipes)) {
        localStorage.setItem("recipes", JSON.stringify(data.recipes));
      }

      alert("Data successfully imported!");
    } catch (error) {
      alert("Failed to import data. Please ensure the file format is correct.");
    }
  };

  reader.readAsText(file);
}

// Add event listeners for export and import
document.getElementById("exportData").addEventListener("click", exportData);
document.getElementById("importFile").addEventListener("change", importData);
