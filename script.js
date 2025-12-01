// script.js

let allEpisodes = [];

// Turn season + number into S01E05
function formatEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

// Render a list of episodes into #root
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // clear old content

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    const title = document.createElement("h2");
    title.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;

    const img = document.createElement("img");
    if (episode.image && episode.image.medium) {
      img.src = episode.image.medium;
    }
    img.alt = episode.name;

    const summarySection = document.createElement("section");
    summarySection.innerHTML = episode.summary; // contains HTML

    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "View on TVMaze";

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summarySection);
    card.appendChild(link);

    rootElem.appendChild(card);
  });
}

// Update the "Showing X / Y episodes" text
function updateCount(showing, total) {
  const searchCount = document.getElementById("searchCount");
  searchCount.textContent = `Showing ${showing} / ${total} episodes`;
}

// Fill the dropdown with all episodes
function populateEpisodeSelect() {
  const episodeSelect = document.getElementById("episodeSelect");
  episodeSelect.innerHTML = ""; // clear old options

  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All episodes";
  episodeSelect.appendChild(defaultOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

// Apply both filters (search + dropdown)
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");

  const term = searchInput.value.trim().toLowerCase();
  const selectedValue = episodeSelect.value;

  let filtered = allEpisodes;

  if (selectedValue !== "all") {
    filtered = filtered.filter(
      (episode) => String(episode.id) === selectedValue
    );
  }

  if (term !== "") {
    filtered = filtered.filter((episode) => {
      const name = episode.name.toLowerCase();
      const summary = (episode.summary || "").toLowerCase();
      return name.includes(term) || summary.includes(term);
    });
  }

  makePageForEpisodes(filtered);
  updateCount(filtered.length, allEpisodes.length);
}

// ⭐ NEW: load episodes using fetch (ONE TIME ONLY)
async function loadEpisodes() {
  const rootElem = document.getElementById("root");

  // Show loading message
  rootElem.innerHTML = "<p>Loading episodes...</p>";

  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    allEpisodes = await response.json();

    // Now we can render everything
    populateEpisodeSelect();
    applyFilters();
  } catch (error) {
    rootElem.innerHTML =
      "<p style='color:red;'>Failed to load data. Please try again later.</p>";
    console.error("Error loading episodes:", error);
  }
}

// -------------------------------
// PAGE LOAD
// -------------------------------
window.onload = function () {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");

  // Load data only ONCE
  loadEpisodes();

  // Filters
  searchInput.addEventListener("input", applyFilters);
  episodeSelect.addEventListener("change", applyFilters);
};
