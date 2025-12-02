const SHOWS_API_URL = "https://api.tvmaze.com/shows";
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
  return `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(
    2,
    "0"
  )}`;
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
        ep.summary?.toLowerCase().includes(term)
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
        show.summary?.toLowerCase().includes(term)
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
