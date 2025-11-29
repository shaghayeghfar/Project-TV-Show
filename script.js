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
    // summary may contain HTML from TVMaze
    summarySection.innerHTML = episode.summary;

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

// ⭐ NEW: fill the dropdown with all episodes
function populateEpisodeSelect() {
  const episodeSelect = document.getElementById("episodeSelect");
  episodeSelect.innerHTML = ""; // clear old options

  // Default option: All episodes
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All episodes";
  episodeSelect.appendChild(defaultOption);

  // One option per episode
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id; // use unique id from TVMaze data
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

// ⭐ NEW: apply BOTH filters (search + dropdown)
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");

  const term = searchInput.value.trim().toLowerCase();
  const selectedValue = episodeSelect.value;

  let filteredEpisodes = allEpisodes;

  // 1) Dropdown filter: if not "all", keep only that episode
  if (selectedValue !== "all") {
    filteredEpisodes = filteredEpisodes.filter(
      (episode) => String(episode.id) === String(selectedValue)
    );
  }

  // 2) Search filter: name OR summary (case-insensitive)
  if (term !== "") {
    filteredEpisodes = filteredEpisodes.filter((episode) => {
      const name = episode.name.toLowerCase();
      const summary = (episode.summary || "").toLowerCase();
      return name.includes(term) || summary.includes(term);
    });
  }

  // Render result + update count
  makePageForEpisodes(filteredEpisodes);
  updateCount(filteredEpisodes.length, allEpisodes.length);
}

// Set everything up once the page has loaded
window.onload = function () {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");

  // getAllEpisodes is defined in episodes.js
  allEpisodes = getAllEpisodes();

  // Fill dropdown with all episodes
  populateEpisodeSelect();

  // Initial render: show all episodes
  applyFilters(); // this will show all + correct count

  // Live search: runs on every key press
  searchInput.addEventListener("input", function () {
    applyFilters();
  });

  // Dropdown change: runs whenever user selects a new option
  episodeSelect.addEventListener("change", function () {
    applyFilters();
  });
};
