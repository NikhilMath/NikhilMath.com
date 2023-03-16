const apiUrl =
  "https://api.github.com/repos/NikhilMath/NikhilMath.com/branches/master";
const lastCommitDateEl = document.getElementById("last-commit-date");

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    const lastCommitDate = new Date(data.commit.commit.author.date);
    const options = { dateStyle: "long" };
    lastCommitDateEl.textContent = lastCommitDate.toLocaleString(
      "en-US",
      options
    );
  })
  .catch((error) => console.error(error));
