// Initialize map
const map = L.map("map").setView([20.5937, 78.9629], 5); // Center of India
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

// Sample hazard markers
const hazards = [
    {
        type: "tsunami",
        coords: [13.0827, 80.2707],
        desc: "High tsunami alert near Chennai coast",
    },
    {
        type: "storm",
        coords: [19.076, 72.8777],
        desc: "Severe storm surge reported in Mumbai",
    },
    {
        type: "waves",
        coords: [8.5241, 76.9366],
        desc: "Unusually high waves at Trivandrum",
    },
    {
        type: "flooding",
        coords: [22.5726, 88.3639],
        desc: "Coastal flooding reported in Kolkata",
    },
];
let currentMarkers = [];

// Add hazard markers
function addSampleMarkers(filter = "all") {
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];
    hazards.forEach(h => {
        if (filter === "all" || h.type === filter) {
            const marker = L.marker(h.coords, { icon: hazardIcons[h.type] })
                .addTo(map)
                .bindPopup(`<b>${h.type.toUpperCase()}</b><br>${h.desc}`);
            currentMarkers.push(marker);
        }
    });
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

// Dummy data for Reports Table
function loadReportsTable() {
    const reports = [
        {
            id: 1,
            type: "Tsunami",
            severity: "Critical",
            location: "Chennai",
            time: "2025-09-03 14:20",
            status: "Verified",
        },
        {
            id: 2,
            type: "Storm Surge",
            severity: "High",
            location: "Mumbai",
            time: "2025-09-03 13:50",
            status: "Verified",
        },
        {
            id: 3,
            type: "High Waves",
            severity: "Medium",
            location: "Kerala",
            time: "2025-09-03 13:10",
            status: "Pending",
        },
    ];
    const tableBody = document.getElementById("reportsTableBody");
    tableBody.innerHTML = "";
    reports.forEach(r => {
        const row = `<tr>
            <td>${r.id}</td>
            <td>${r.time}</td>
            <td>${r.location}</td>
            <td>${r.type}</td>
            <td>${r.severity}</td>
            <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
            <td><button onclick="viewReportDetails(${r.id})">Details</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Dummy data for Social Feed
function loadSocialFeed() {
    const posts = [
        {
            user: "@coastal_watch",
            text: "Huge waves observed at Marina Beach 🌊 #Chennai",
        },
        {
            user: "@fisherman_alert",
            text: "Storm surge flooding in Mumbai suburbs ⚠️",
        },
        {
            user: "@kerala_updates",
            text: "Fishermen advised not to venture into the sea 🚤",
        },
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

// Dummy data for Activity Feed
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

// Handle file selection
function handleFileSelect(event) {
    const files = event.target.files;
    const preview = document.getElementById("filePreview");
    preview.innerHTML = "";
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const media = file.type.startsWith("image")
                ? `<img src="${e.target.result}" style="max-width:100px;border-radius:8px;">`
                : `<video src="${e.target.result}" style="max-width:100px;border-radius:8px;" controls></video>`;
            preview.innerHTML += `<div>${media}</div>`;
        };
        reader.readAsDataURL(file);
    });
}

// Handle report submission
function handleReportSubmit(event) {
    event.preventDefault();
    alert("Report submitted successfully!");
    document.getElementById("reportForm").reset();
    document.getElementById("filePreview").innerHTML = "";
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const userType = document.getElementById("userType").value;
    const email = document.getElementById("email").value;
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

// Show notifications (placeholder)
function showNotifications() {
    alert("Notifications: 3 new alerts (Tsunami, Storm Surge, High Waves)");
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
                alert("Unable to retrieve location: " + error.message);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// View report details (placeholder)
function viewReportDetails(id) {
    alert(`Viewing details for report ID: ${id}`);
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
                data: [12, 19, 8, 5],
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
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
}

// Initialize everything
window.onload = function () {
    addSampleMarkers();
    loadReportsTable();
    loadSocialFeed();
    loadActivityFeed();
    initAnalyticsChart();
};