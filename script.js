// script.js

const SHOWS_API_URL = "https://api.tvmaze.com/shows";
const EPISODES_API_URL = (showId) =>
  `https://api.tvmaze.com/shows/${showId}/episodes`;

let allShows = []; // list of all shows
let episodesCache = {}; // { [showId]: [episodes...] }
let allEpisodes = []; // episodes for the currently selected show
let currentShowId = null; // which show is active right now

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

  if (!episodeList || episodeList.length === 0) {
    rootElem.innerHTML =
      '<p class="status-message">No episodes to display.</p>';
    return;
  }

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
  if (!searchCount) return;

  if (total === 0) {
    searchCount.textContent = "No episodes loaded.";
  } else {
    searchCount.textContent = `Showing ${showing} / ${total} episodes`;
  }
}

// Show a loading message while we wait for data
function showLoadingMessage(message = "Loading, please wait…") {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `<p class="status-message">${message}</p>`;
}

// Show an error message
function showErrorMessage(message) {
  const rootElem = documenconst SHOWS_API_URL = "https://api.tvmaze.com/shows";
const EPISODES_API_URL = (id) => `https://api.tvmaze.com/shows/${id}/episodes`;

let allShows = [];
let allEpisodes = [];
let episodesCache = {};
let currentShowId = null;

/* ------------------- VIEW SWITCH ------------------- */

function showMainUI() {
  document.getElementById("backButton").style.display = "none";
  document.getElementById("controls").style.display = "flex";
  document.getElementById("root").style.display = "block";
}

function showFrontPage() {
  document.getElementById("backButton").style.display = "inline-block";
  document.getElementById("controls").style.display = "none";
  document.getElementById("root").innerHTML = "";
  document.getElementById("root").style.display = "none";
}

function showShowsPage() {
  document.getElementById("showsListing").style.display = "grid";
  document.getElementById("showSearchSection").style.display = "block";

  document.getElementById("controls").style.display = "none";
  document.getElementById("root").style.display = "none";
  document.getElementById("backToShows").style.display = "none";

  // Reset show search input
  document.getElementById("showSearchInput").value = "";
  renderShowsListing(allShows);
}

function showEpisodesPage() {
  document.getElementById("showsListing").style.display = "none";
  document.getElementById("showSearchSection").style.display = "none";

  document.getElementById("controls").style.display = "flex";
  document.getElementById("root").style.display = "grid";
  document.getElementById("backToShows").style.display = "inline-block";

  // Reset episode search and dropdown
  document.getElementById("searchInput").value = "";
  populateEpisodeDropdown();
  renderEpisodes(allEpisodes);
  document.getElementById("searchCount").textContent = "";
}

/* ------------------- RENDER SHOWS ------------------- */

function renderShowsListing(shows) {
  const container = document.getElementById("showsListing");
  container.innerHTML = "";

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "show-card";

    const image = show.image ? show.image.medium : "";

    card.innerHTML = `
      <img src="${image}" alt="${show.name}">
      <div class="show-info">
        <h3>${show.name}</h3>
        <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
        <p><strong>Status:</strong> ${show.status || "N/A"}</p>
        <p><strong>Rating:</strong> ${show.rating.average || "N/A"}</p>
        <p><strong>Runtime:</strong> ${show.runtime || "?"} mins</p>
        <p>${show.summary || ""}</p>
      </div>
    `;

    card.addEventListener("click", async () => {
      currentShowId = show.id;
      document.getElementById("showSelect").value = show.id;

      await loadEpisodesForShow(show.id);
      showEpisodesPage();
    });

    container.appendChild(card);
  });
}

/* ------------------- RENDER EPISODES ------------------- */

function formatCode(ep) {
  return `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
}

function renderEpisodes(list) {
  const root = document.getElementById("root");
  root.innerHTML = "";

  list.forEach((ep) => {
    const div = document.createElement("div");
    div.className = "episode-card";

    div.innerHTML = `
      <h3>${formatCode(ep)} - ${ep.name}</h3>
      <img src="${ep.image ? ep.image.medium : ""}">
      ${ep.summary || ""}
    `;

    root.appendChild(div);
  });
}

/* ------------------- DROPDOWNS ------------------- */

function populateShowDropdown() {
  const sel = document.getElementById("showSelect");
  sel.innerHTML = `<option value="">Select show...</option>`;

  [...allShows]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((show) => {
      const opt = document.createElement("option");
      opt.value = show.id;
      opt.textContent = show.name;
      sel.appendChild(opt);
    });

  // Handle show selection
  sel.addEventListener("change", async (e) => {
    const showId = e.target.value;
    if (!showId) return;

    currentShowId = showId;
    await loadEpisodesForShow(showId);
    showEpisodesPage();
  });
}

function populateEpisodeDropdown() {
  const sel = document.getElementById("episodeSelect");
  sel.innerHTML = `<option value="all">All episodes</option>`;

  allEpisodes.forEach((ep) => {
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = `${formatCode(ep)} - ${ep.name}`;
    sel.appendChild(opt);
  });

  // Handle episode selection
  sel.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "all") {
      renderEpisodes(allEpisodes);
    } else {
      const ep = allEpisodes.find((ep) => ep.id == val);
      renderEpisodes([ep]);
    }
  });
}

/* ------------------- SEARCH ------------------- */

function setupEpisodeSearch() {
  document.getElementById("searchInput").addEventListener("input", () => {
    const term = document.getElementById("searchInput").value.toLowerCase();

    const filtered = allEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(term) ||
        (ep.summary?.toLowerCase().includes(term))
    );

    renderEpisodes(filtered);
    document.getElementById(
      "searchCount"
    ).textContent = `Showing ${filtered.length}/${allEpisodes.length}`;
  });
}

function setupShowSearch() {
  document.getElementById("showSearchInput").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();

    const filtered = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(term) ||
        show.genres.join(" ").toLowerCase().includes(term) ||
        (show.summary?.toLowerCase().includes(term))
    );

    renderShowsListing(filtered);
  });
}

/* ------------------- LOAD EPISODES ------------------- */

async function loadEpisodesForShow(id) {
  if (!episodesCache[id]) {
    const res = await fetch(EPISODES_API_URL(id));
    episodesCache[id] = await res.json();
  }

  allEpisodes = episodesCache[id];

  populateEpisodeDropdown();
  renderEpisodes(allEpisodes);
}

/* ------------------- INIT ------------------- */

document.getElementById("backButton").addEventListener("click", showMainUI);
document.getElementById("backToShows").addEventListener("click", showShowsPage);

async function initialize() {
  const res = await fetch(SHOWS_API_URL);
  allShows = await res.json();

  populateShowDropdown();
  renderShowsListing(allShows);

  setupShowSearch();
  setupEpisodeSearch();

  showShowsPage();
}

window.onload = initialize;
t.getElementById("root");
  rootElem.innerHTML = `<p class="status-message error">${message}</p>`;
  updateCount(0, 0);
}

// Fill the show dropdown with all shows (alphabetically)
function populateShowSelect() {
  const showSelect = document.getElementById("showSelect");
  if (!showSelect) return;

  showSelect.innerHTML = "";

  // Sort shows alphabetically, case-insensitive
  const sortedShows = [...allShows].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a show...";
  showSelect.appendChild(defaultOption);

  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = String(show.id);
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  // Optionally: auto-select a specific show (e.g. id 82) if present
  const gameOfThrones = sortedShows.find((show) => show.id === 82);
  if (gameOfThrones) {
    showSelect.value = String(gameOfThrones.id);
    currentShowId = gameOfThrones.id;
  }
}

// Fill the episode dropdown with episodes for the current show
function populateEpisodeSelect() {
  const episodeSelect = document.getElementById("episodeSelect");
  if (!episodeSelect) return;

  episodeSelect.innerHTML = "";

  if (!allEpisodes || allEpisodes.length === 0) {
    const option = document.createElement("option");
    option.value = "none";
    option.textContent = "No episodes";
    episodeSelect.appendChild(option);
    return;
  }

  // "All episodes" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = String(episode.id); // unique id
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });
}

// Attach search + dropdown event listeners
function setupEventListeners() {
  const searchInput = document.getElementById("searchInput");
  const episodeSelect = document.getElementById("episodeSelect");
  const showSelect = document.getElementById("showSelect");

  if (!searchInput || !episodeSelect || !showSelect) return;

  // When user changes show
  showSelect.addEventListener("change", async function () {
    const selectedShowId = showSelect.value;

    // No show selected
    if (!selectedShowId) {
      allEpisodes = [];
      currentShowId = null;
      showLoadingMessage("Please select a show.");
      updateCount(0, 0);
      populateEpisodeSelect();
      return;
    }

    currentShowId = Number(selectedShowId);
    searchInput.value = ""; // clear search when changing show

    await loadEpisodesForShow(currentShowId);
  });

  // Live search: runs on every key press
  searchInput.addEventListener("input", function () {
    const term = searchInput.value.trim().toLowerCase();

    // Reset episode dropdown to "All episodes" when typing
    if (episodeSelect.value !== "all" && episodeSelect.value !== "none") {
      episodeSelect.value = "all";
    }

    if (!allEpisodes || allEpisodes.length === 0) {
      showLoadingMessage("No episodes loaded yet.");
      updateCount(0, 0);
      return;
    }

    // If empty, show all episodes
    if (term === "") {
      makePageForEpisodes(allEpisodes);
      updateCount(allEpisodes.length, allEpisodes.length);
      return;
    }

    // Filter by name OR summary (case-insensitive)
    const filtered = allEpisodes.filter((episode) => {
      const name = episode.name.toLowerCase();
      const summary = (episode.summary || "").toLowerCase();
      return name.includes(term) || summary.includes(term);
    });

    makePageForEpisodes(filtered);
    updateCount(filtered.length, allEpisodes.length);
  });

  // Episode dropdown change: show one episode or all
  episodeSelect.addEventListener("change", function () {
    const selectedValue = episodeSelect.value;
    const searchInput = document.getElementById("searchInput");

    if (!allEpisodes || allEpisodes.length === 0) return;

    // If "all" selected, show all episodes and keep current search term
    if (selectedValue === "all") {
      const term = searchInput.value.trim().toLowerCase();
      if (term === "") {
        makePageForEpisodes(allEpisodes);
        updateCount(allEpisodes.length, allEpisodes.length);
      } else {
        const filtered = allEpisodes.filter((episode) => {
          const name = episode.name.toLowerCase();
          const summary = (episode.summary || "").toLowerCase();
          return name.includes(term) || summary.includes(term);
        });
        makePageForEpisodes(filtered);
        updateCount(filtered.length, allEpisodes.length);
      }
      return;
    }

    if (selectedValue === "none") {
      makePageForEpisodes([]);
      updateCount(0, allEpisodes.length);
      return;
    }

    // Otherwise, show ONLY the selected episode
    const selectedEpisode = allEpisodes.find(
      (episode) => String(episode.id) === selectedValue
    );

    if (selectedEpisode) {
      // Clear search so we don't confuse user
      searchInput.value = "";
      makePageForEpisodes([selectedEpisode]);
      updateCount(1, allEpisodes.length);
    } else {
      showErrorMessage("Could not find that episode.");
    }
  });
}

// Load episodes for a show, using cache so we never fetch a URL twice
async function loadEpisodesForShow(showId) {
  // If we have cached episodes, use them
  if (episodesCache[showId]) {
    allEpisodes = episodesCache[showId];
    populateEpisodeSelect();
    makePageForEpisodes(allEpisodes);
    updateCount(allEpisodes.length, allEpisodes.length);
    return;
  }

  showLoadingMessage("Loading episodes for this show…");
  updateCount(0, 0);

  try {
    const response = await fetch(EPISODES_API_URL(showId));
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const episodes = await response.json();
    episodesCache[showId] = episodes; // cache it
    allEpisodes = episodes;

    populateEpisodeSelect();
    makePageForEpisodes(allEpisodes);
    updateCount(allEpisodes.length, allEpisodes.length);
  } catch (error) {
    console.error("Failed to load episodes:", error);
    showErrorMessage(
      "Sorry, something went wrong while loading the episodes for this show."
    );
  }
}

// Fetch shows once at the start
async function initializePage() {
  updateCount(0, 0);
  showLoadingMessage("Loading shows, please wait…");

  try {
    const response = await fetch(SHOWS_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    allShows = await response.json();

    populateShowSelect();
    setupEventListeners();

    // If we auto-selected a show (e.g. GOT), load its episodes
    if (currentShowId) {
      await loadEpisodesForShow(currentShowId);
    } else {
      showLoadingMessage("Please select a show.");
    }
  } catch (error) {
    console.error("Failed to load shows:", error);
    showErrorMessage(
      "Sorry, something went wrong while loading the list of shows."
    );
  }
}

// Run once when the page loads
window.onload = initializePage;
