// Initialize map
const map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Custom hazard marker icons
const hazardIcons = {
    tsunami: L.icon({
        iconUrl: "https://img.icons8.com/color/48/tsunami.png",
        iconSize: [32, 32],
    }),
    storm: L.icon({
        iconUrl: "https://img.icons8.com/color/48/storm.png",
        iconSize: [32, 32],
    }),
    waves: L.icon({
        iconUrl: "https://img.icons8.com/color/48/water.png",
        iconSize: [32, 32],
    }),
    flooding: L.icon({
        iconUrl: "https://img.icons8.com/color/48/flood.png",
        iconSize: [32, 32],
    }),
};

// Layer for markers
const markerLayer = L.layerGroup().addTo(map);

// Fetch and display hazard markers
async function addSampleMarkers(filter = "all") {
    try {
        const response = await fetch('http://localhost:8080/api/reports');
        const hazards = await response.json();
        markerLayer.clearLayers();
        hazards.forEach(h => {
            if (filter === "all" || h.hazardType.toLowerCase() === filter) {
                // Parse location (assuming stored as "lat, lon")
                const [lat, lon] = h.location.split(',').map(coord => parseFloat(coord.trim()));
                if (!isNaN(lat) && !isNaN(lon)) {
                    const marker = L.marker([lat, lon], { icon: hazardIcons[h.hazardType.toLowerCase()] || hazardIcons.waves })
                        .bindPopup(`<b>${h.hazardType}</b><br>${h.description}`);
                    markerLayer.addLayer(marker);
                }
            }
        });
    } catch (error) {
        console.error('Error fetching hazards:', error);
    }
}

// Filter map markers
function filterMap(type) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
    addSampleMarkers(type);
}

// Handle tab switching
function switchTab(tabId) {
    document.querySelectorAll(".section").forEach(sec => {
        sec.style.display = "none";
    });
    document.getElementById(tabId + "-section").style.display = "block";
    document.querySelectorAll(".nav-tab").forEach(btn => {
        btn.classList.remove("active");
    });
    const targetButton = event.target.closest('.nav-tab');
    if (targetButton) {
        targetButton.classList.add("active");
    }
}

// Load reports table from backend
async function loadReportsTable() {
    try {
        const response = await fetch('http://localhost:8080/api/reports');
        const reports = await response.json();
        const tableBody = document.getElementById("reportsTableBody");
        tableBody.innerHTML = "";
        reports.forEach(r => {
            const row = `<tr>
                <td>${r.id}</td>
                <td>${new Date(r.datetime).toLocaleString()}</td>
                <td>${r.location}</td>
                <td>${r.hazardType}</td>
                <td>${r.severity}</td>
                <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
                <td><button onclick="viewReportDetails(${r.id})">Details</button></td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
}

// Dummy social feed (replace with API call if you have a social media endpoint)
function loadSocialFeed() {
    const posts = [
        { user: "@coastal_watch", text: "Huge waves observed at Marina Beach 🌊 #Chennai" },
        { user: "@fisherman_alert", text: "Storm surge flooding in Mumbai suburbs ⚠️" },
        { user: "@kerala_updates", text: "Fishermen advised not to venture into the sea 🚤" },
    ];
    const feed = document.getElementById("socialFeed");
    feed.innerHTML = "";
    posts.forEach(p => {
        const card = `<div class="social-post">
            <div class="social-avatar">${p.user[0]}</div>
            <div class="social-content">
                <div class="social-header">
                    <span class="social-username">${p.user}</span>
                </div>
                <div class="social-text">${p.text}</div>
            </div>
        </div>`;
        feed.innerHTML += card;
    });
}

// Dummy activity feed (replace with API call if needed)
function loadActivityFeed() {
    const activities = [
        "14:20 - Tsunami alert issued near Chennai 🚨",
        "13:50 - Storm surge detected in Mumbai ⚡",
        "13:10 - High waves reported in Kerala 🌊",
    ];
    const feed = document.getElementById("activityFeed");
    feed.innerHTML = "";
    activities.forEach(a => {
        const item = `<div class="social-post">${a}</div>`;
        feed.innerHTML += item;
    });
}

// Handle file selection for preview
function handleFileSelect(event) {
    const files = event.target.files;
    const preview = document.getElementById("filePreview");
    preview.innerHTML = "";
    Array.from(files).slice(0, 5).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const media = file.type.startsWith("image")
                ? `<img src="${e.target.result}" style="max-width:100px;border-radius:8px;" alt="Uploaded media preview">`
                : `<video src="${e.target.result}" style="max-width:100px;border-radius:8px;" controls></video>`;
            preview.innerHTML += `<div>${media}</div>`;
        };
        reader.readAsDataURL(file);
    });
}

// Handle report submission with API call
async function handleReportSubmit(event) {
    event.preventDefault();
    const spinnerContainer = document.getElementById("spinnerContainer");
    const spinnerIcon = document.getElementById("spinnerIcon");
    const spinnerText = document.getElementById("spinnerText");
    const submitBtn = document.querySelector("#reportForm .submit-btn");

    // Prepare form data
    const formData = new FormData();
    const report = {
        hazardType: document.getElementById("hazardType").value,
        severity: document.getElementById("severity").value,
        location: document.getElementById("location").value,
        datetime: document.getElementById("datetime").value,
        description: document.getElementById("description").value,
        contactName: document.getElementById("contactName").value,
        contactPhone: document.getElementById("contactPhone").value
    };
    formData.append("report", new Blob([JSON.stringify(report)], { type: "application/json" }));

    // Add media files
    const files = document.getElementById("media").files;
    for (let file of files) {
        formData.append("media", file);
    }

    // Show spinner
    submitBtn.disabled = true;
    spinnerContainer.style.display = "block";
    spinnerIcon.className = "fas fa-spinner fa-spin spinner-icon";
    spinnerText.textContent = "Submitting report...";
    spinnerText.style.opacity = "1";

    try {
        const response = await fetch('http://localhost:8080/api/reports', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            spinnerIcon.className = "fas fa-check spinner-icon success";
            spinnerText.textContent = "Report submitted successfully";
            spinnerText.classList.add("success");
            document.getElementById("reportForm").reset();
            document.getElementById("filePreview").innerHTML = "";
            // Refresh map and reports table
            addSampleMarkers();
            loadReportsTable();
        } else {
            throw new Error('Submission failed');
        }
    } catch (error) {
        spinnerIcon.className = "fas fa-times spinner-icon failure";
        spinnerText.textContent = "Submission failed. Please try again.";
        spinnerText.classList.add("failure");
    }

    // Hide spinner after 3 seconds
    setTimeout(() => {
        spinnerContainer.style.display = "none";
        spinnerText.style.opacity = "0";
        spinnerIcon.className = "fas fa-spinner fa-spin spinner-icon";
        spinnerText.classList.remove("success", "failure");
        submitBtn.disabled = false;
    }, 3000);
}

// Handle login (placeholder - extend with backend auth)
function handleLogin(event) {
    event.preventDefault();
    const userType = document.getElementById("userType").value;
    const email = document.getElementById("email").value;
    if (!email) return console.error("Email required");
    document.getElementById("userName").textContent = email.split("@")[0];
    document.getElementById("userRole").textContent = userType.charAt(0).toUpperCase() + userType.slice(1);
    closeModal("loginModal");
}

// Toggle login modal
function toggleLogin() {
    const modal = document.getElementById("loginModal");
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Show notifications
function showNotifications() {
    console.log("Notifications: 3 new alerts (Tsunami, Storm Surge, High Waves)");
}

// Get current location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                document.getElementById("location").value = `${latitude}, ${longitude}`;
                map.setView([latitude, longitude], 10);
            },
            error => {
                console.error("Unable to retrieve location: " + error.message);
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// View report details
function viewReportDetails(id) {
    console.log(`Viewing details for report ID: ${id}`);
}

// Initialize Chart.js for Analytics
function initAnalyticsChart() {
    const ctx = document.getElementById("analyticsChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Tsunami", "Storm Surge", "High Waves", "Flooding"],
            datasets: [{
                label: "Reports by Type",
                data: [12, 19, 8, 5], // Replace with API data later
                backgroundColor: [
                    "rgba(167, 139, 250, 0.6)",
                    "rgba(110, 231, 183, 0.6)",
                    "rgba(254, 240, 138, 0.6)",
                    "rgba(248, 113, 113, 0.6)",
                ],
                borderColor: [
                    "rgba(167, 139, 250, 1)",
                    "rgba(110, 231, 183, 1)",
                    "rgba(254, 240, 138, 1)",
                    "rgba(248, 113, 113, 1)",
                ],
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
        },
    });
}

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('#darkModeToggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

// Language change handler
function handleLanguageChange() {
    const lang = document.getElementById('languageSelect').value;
    console.log(`Language changed to: ${lang}`);
}

// Initialize everything
window.onload = function () {
    addSampleMarkers();
    loadReportsTable();
    loadSocialFeed();
    loadActivityFeed();
    initAnalyticsChart();
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('languageSelect').addEventListener('change', handleLanguageChange);
};