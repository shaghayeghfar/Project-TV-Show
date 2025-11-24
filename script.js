function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  episodeList.forEach((episode) => {
    // Create a container for each episode
    const episodeDiv = document.createElement("div");
    episodeDiv.classList.add("episode-card");

    // Episode name
    const nameElem = document.createElement("h2");
    nameElem.textContent = episode.name;

    // Episode code SxxExx
    const code = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    const codeElem = document.createElement("h3");
    codeElem.textContent = code;

    // Episode image
    const imgElem = document.createElement("img");
    imgElem.src = episode.image.medium;

    // Summary
    const summaryElem = document.createElement("div");
    summaryElem.innerHTML = episode.summary;

    // Append everything
    episodeDiv.append(nameElem, codeElem, imgElem, summaryElem);
    rootElem.appendChild(episodeDiv);
  });

  // TVMaze credit
  const credit = document.createElement("p");
  credit.innerHTML = `Data originally from <a href="https://www.tvmaze.com/">TVMaze.com</a>`;
  rootElem.appendChild(credit);
}

window.onload = setup;
