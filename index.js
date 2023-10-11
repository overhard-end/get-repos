// Helpers
function debounce(fn, delay) {
  let time;
  return function (...args) {
    clearTimeout(time);
    time = setTimeout(() => fn.call(this, ...args), delay);
  };
}
class ItemObj {
  constructor(item) {
    this.name = item.name;
    this.owner = item.owner.login;
    this.stars = item.stargazers_count;
  }
}
const cutText = (text) => {
  text = String(text);
  if (text.length < 15) return text;
  return text.split("").splice(0, 15).join("") + "...";
};
// Helpers end
let items = [];
let selectedItems = [];
let error = "";

const delayHandler = debounce(inputHandler, 700);
const setError = () => alert("Limit of requests exceeded ! Wait a bit dude");

const renderItems = () => {
  document.querySelector(".item-container").innerHTML = "";
  selectedItems.forEach((item, i) => createItem(item, i));
};
const clearHints = () =>
  (document.querySelector(".hint-container").innerHTML = "");
const clearInput = () => (document.querySelector(".form-input").value = "");

const handleHintClick = (e) => {
  const id = e.target.id;
  if (id) {
    clearInput();
    clearHints();
    if (selectedItems.every((item) => item.owner !== items[id].owner)) {
      selectedItems.push(items[id]);
      renderItems();
    }
  }
};

const handleItemClick = (e) => {
  const index = e.target.dataset.index;

  if (index) {
    deleteItem(index);
    renderItems();
  }
};
function createItem(item, i) {
  const itemContainer = document.querySelector(".item-container");
  const itemElement = document.createElement("div");
  itemElement.classList.add("item");
  const itemInfo = document.createElement("div");
  itemInfo.classList.add("item-info");
  for (let key in item) {
    const itemText = document.createElement("p");
    itemText.classList.add("item-text");
    itemText.innerText = `${key}: ${cutText(item[key])}`;
    itemInfo.append(itemText);
  }
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "X";
  deleteBtn.dataset.index = i;
  deleteBtn.classList.add("item-btn");
  itemElement.append(itemInfo);
  itemElement.append(deleteBtn);
  itemContainer.append(itemElement);
}
function deleteItem(index) {
  selectedItems.splice(index, 1);
}

document.querySelector(".form-input").addEventListener("input", delayHandler);
document
  .querySelector(".hint-container")
  .addEventListener("click", handleHintClick);
document
  .querySelector(".item-container")
  .addEventListener("click", handleItemClick);

function createHint(item, i) {
  const hintsContainer = document.querySelector(".hint-container");
  const hintItem = document.createElement("div");
  hintItem.classList.add("hint");
  hintItem.innerText = cutText(item.name);
  hintItem.setAttribute("id", i);
  hintsContainer.append(hintItem);
}
async function inputHandler(e) {
  items = [];
  await getRepositories(e.target.value);
  clearHints();
  items.forEach((item, i) => createHint(item, i));
}

const gitUrl = "https://api.github.com/search/repositories";
async function getRepositories(queryText) {
  if (!queryText) return [];
  let maxCount = 5;
  const response = await fetch(
    `${gitUrl}?q=${queryText}&order=desc&per_page=${maxCount}`
  );
  if (response.status > 205) {
    setError();
    return [];
  }
  const data = await response.json();
  data.items.forEach((item) => items.push(new ItemObj(item)));
}
