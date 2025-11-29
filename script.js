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

// Set everything up once the page has loaded
window.onload = function () {
  const searchInput = document.getElementById("searchInput");

  // getAllEpisodes is defined in episodes.js
  allEpisodes = getAllEpisodes();

  // Initial render: show all episodes
  makePageForEpisodes(allEpisodes);
  updateCount(allEpisodes.length, allEpisodes.length);

  // Live search: runs on every key press
  searchInput.addEventListener("input", function () {
    const term = searchInput.value.trim().toLowerCase();

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
};
