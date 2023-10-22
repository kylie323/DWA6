import { BOOKS_PER_PAGE, books, authors, genres } from "./data.js";

//Tests if books exist
const matches = books;
let page = 1;
const range = [0, BOOKS_PER_PAGE];

if (!books && !Array.isArray(books)) {
  throw new Error("Source required");
}

if (!range && range.length === 2) {
  throw new Error("Range must be an array with two numbers");
}

const elements = {
  list: {
    items: document.querySelector("[data-list-items]"),
    message: document.querySelector("[data-list-message]"),
    button: document.querySelector("[data-list-button]"),
    active: document.querySelector("[data-list-active]"),
    blur: document.querySelector("[data-list-blur]"),
    image: document.querySelector("[data-list-image]"),
    title: document.querySelector("[data-list-title]"),
    subtitle: document.querySelector("[data-list-subtitle]"),
    description: document.querySelector("[data-list-description]"),
    close: document.querySelector("[data-list-close]"),
  },
  search: {
    header: document.querySelector("[data-header-search]"),
    overlay: document.querySelector("[data-search-overlay]"),
    form: document.querySelector("[data-search-form]"),
    title: document.querySelector("[data-search-title]"),
    genres: document.querySelector("[data-search-genres]"),
    authors: document.querySelector("[data-search-authors]"),
    cancel: document.querySelector("[data-search-cancel]"),
  },
  settings: {
    header: document.querySelector("[data-header-settings]"),
    overlay: document.querySelector("[data-settings-overlay]"),
    form: document.querySelector("[data-settings-form]"),
    theme: document.querySelector("[data-settings-theme]"),
    cancel: document.querySelector("[data-settings-cancel]"),
  },
}; 

//Displays books
const fragment = document.createDocumentFragment();
const extracted = matches.slice(0, 36);

//Preview books & Index
function createPreview(preview, index, bookTotal) {
  const { author: authorId, id, image, title } = preview;

  const showPreview = document.createElement("button");
  showPreview.classList = "preview";
  showPreview.setAttribute("data-preview", id);
  showPreview.innerHTML = /*html */ `
<img class="preview__image" src="${image}" />
<div class="preview__info">
<h3 class="preview__title">${title}</h3>
<div class="preview__author">${authors[authorId]}</div>
<div class="preview__index">Book ${index + 1} of ${bookTotal}</div>
</div> `;
  return showPreview;
}

function loadBooks() {
  const startIndex = (page - 1) * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const bookFragment = document.createDocumentFragment();
  const bookExtracted = matches.slice(startIndex, endIndex);

  for (let i = 0; i < bookExtracted.length; i++) {
    const preview = createPreview(
      bookExtracted[i],
      startIndex + i,
      matches.length
    );

    bookFragment.appendChild(preview);
  }
  elements.list.items.appendChild(bookFragment);
  const remainingBooks = matches.length - page * BOOKS_PER_PAGE;
  elements.list.button.innerHTML = /* html */ `
<span> Show more </span>
<span class = "list__remaining"> (${
    remainingBooks > 0 ? remainingBooks : 0
  }) </span>
 `;
  elements.list.button.disabled = remainingBooks <= 0;
}

loadBooks();

elements.list.button.addEventListener("click", () => {
  page++;
  loadBooks();
});

//Opens book summary

function handleListItemClick(event) {
  elements.list.active.showModal();

  const pathArray = Array.from(event.path || event.composedPath());
  let active;

  for (const node of pathArray) {
    if (active) break;
    const id = node?.dataset.preview;

    if (id) {
      const matchingBook = matches.find((book) => book.id === id);
      if (matchingBook) {
        active = matchingBook;
        break;
      }
    }
  }

  if (!active) {
    return;
  }

  elements.list.image.src = active.image;
  elements.list.blur.src = active.image;
  elements.list.title.textContent = active.title;
  const date = new Date(active.published);
  const published = date.getFullYear();
  elements.list.subtitle.textContent = `${authors[active.author]} (${published})`;
  elements.list.description.textContent = active.description;
;}

function handleCloseButtonClick() {
  elements.list.active.close();
}

elements.list.items.addEventListener("click", handleListItemClick);
elements.list.close.addEventListener("click", handleCloseButtonClick);

//Search
function handleHeaderClick () {
  elements.search.overlay.showModal();
  elements.search.title.focus();
}

elements.search.header.addEventListener("click", handleHeaderClick)

//Populate Genres on Search

function populateGenres() {
  const genresFragment = document.createDocumentFragment();
  const allGenresElement = createGenreOption("any", "All Genres");
  genresFragment.appendChild(allGenresElement);

  for (const [id, genre] of Object.entries(genres)) {
    const genreElement = createGenreOption(id, genre);
    genresFragment.appendChild(genreElement);
  }
  elements.search.genres.appendChild(genresFragment);
}

function createGenreOption(value, text) {
  const genreElement = document.createElement("option");
  genreElement.value = value;
  genreElement.innerText = text;
  return genreElement;
}

populateGenres();


//Populate Authors on Search
function populateAuthors() {
  const authorsFragment = document.createDocumentFragment();

  const allAuthorsElement = createAuthorOption("any", "All Authors");
  authorsFragment.appendChild(allAuthorsElement);

  for (const [id, author] of Object.entries(authors)) {
    const authorElement = createAuthorOption(id, author);
    authorsFragment.appendChild(authorElement);
  }

  elements.search.authors.appendChild(authorsFragment);
}

function createAuthorOption(value, text) {
  const authorElement = document.createElement("option");
  authorElement.value = value;
  authorElement.innerText = text;
  return authorElement;
}

populateAuthors();


//Search More

elements.search.form.addEventListener("submit", handleFormSubmission);
function handleFormSubmission(event) {
  event.preventDefault();
  const getData = new FormData(event.target);
  const filters = Object.fromEntries(getData);
  const result = filterBooks(filters);
  updateBookList(result);
}

function filterBooks(filters) {
  const filteredBooks = [];

  for (const book of books) {
    const titleMatch =
      filters.title !== "" &&
      book.title
        .toLocaleLowerCase()
        .includes(filters.title.toLocaleLowerCase());
    const genreMatch =
      filters.genre !== "any" && book.genres.includes(filters.genre);
    const authorMatch =
      filters.author !== "any" &&
      book.author
        .toLocaleLowerCase()
        .includes(filters.author.toLocaleLowerCase());
    if (titleMatch || authorMatch || genreMatch) {
      filteredBooks.push(book);
    }
  }

  return filteredBooks;
}

function updateBookList(result) {
  if (result.length === 0) {
    clearBookList();
  } else {
    clearBookList();
    const searchStartIndex = (page - 1) * BOOKS_PER_PAGE;
    const searchEndIndex = searchStartIndex + BOOKS_PER_PAGE;
    const searchBookExtracted = result.slice(searchStartIndex, searchEndIndex);
    const searchBookFragment = createBookPreviewFragment(searchBookExtracted);
    elements.list.items.appendChild(searchBookFragment);
    const remainingBooks = result.length - page * BOOKS_PER_PAGE;
    elements.list.button.disabled = remainingBooks <= 0;
  }

  resetFormAndOverlay();
}

function createBookPreviewFragment(bookArray) {
  const searchBookFragment = document.createDocumentFragment();
  for (const preview of bookArray) {
    const showPreview = createPreview(preview);
    searchBookFragment.appendChild(showPreview);
  }

  return searchBookFragment;
}

function clearBookList() {
  elements.list.items.innerHTML = "";
  elements.list.button.disabled = true;
  elements.list.message.classList.add("list__message_show");
}

function resetFormAndOverlay() {
  elements.search.overlay.close();
  elements.search.form.reset();
}

elements.search.cancel.addEventListener("click", () => {
  elements.search.overlay.close();
});


//Night & Day Theme

const theme = {
  day: {
    dark: "10, 10, 20",
    light: "255, 255, 255",
  },
  night: {
    dark: "255, 255, 255",
    light: "10, 10, 20",
  },
}; 

const openDataSettings = () => {
  elements.settings.overlay.showModal();
}; 

const applyTheme = (result) => {
  document.documentElement.style.setProperty("--color-dark", theme[result.theme].dark);
  document.documentElement.style.setProperty("--color-light", theme[result.theme].light);
};

const closeDataSettings = () => {
  elements.settings.overlay.close();
}; 

elements.settings.header.addEventListener("click", openDataSettings);

elements.settings.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(elements.settings.form);
  const result = Object.fromEntries(formData);

  applyTheme(result);
  closeDataSettings();
});

elements.settings.cancel.addEventListener("click", closeDataSettings);

