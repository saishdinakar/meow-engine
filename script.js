const noButton = document.getElementById("no-btn");
const yesButton = document.getElementById("yes-btn");
const response = document.getElementById("response");
const buttonRow = document.getElementById("button-row");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalOk = document.getElementById("modal-ok");
const modalText = document.getElementById("modal-text");

const messages = [
  "Nice choice! You just made this page very happy.",
  "Yay! High-five for saying yes.",
  "You got it. Practice buddy unlocked!",
  "Legend. Absolute legend.",
];

const playfulNoResponses = [
  "Almost! The no button is feeling shy.",
  "Oops, it slipped away.",
  "Nope is on a coffee break.",
  "That button is practicing dodgeball.",
  "Nice try. The cat said ‘no’ to your ‘no’.",
];

let dodgeCount = 0;

const moveNoButton = () => {
  const rowRect = buttonRow.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();

  const maxX = rowRect.width - buttonRect.width;
  const maxY = rowRect.height - buttonRect.height;

  // Slight bias away from center sometimes to avoid overlap with Yes
  const x = Math.max(0, Math.min(maxX, Math.random() * maxX));
  const y = Math.max(0, Math.min(maxY, Math.random() * maxY));

  noButton.style.position = "absolute";
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;

  response.textContent =
    playfulNoResponses[dodgeCount % playfulNoResponses.length];
  dodgeCount += 1;
};

// Proximity dodge: runs away when cursor gets close
const DODGE_RADIUS_PX = 90;

const dodgeIfClose = (event) => {
  const btnRect = noButton.getBoundingClientRect();
  const px = event.clientX;
  const py = event.clientY;

  const bx = btnRect.left + btnRect.width / 2;
  const by = btnRect.top + btnRect.height / 2;

  const dx = px - bx;
  const dy = py - by;
  const dist = Math.hypot(dx, dy);

  if (dist < DODGE_RADIUS_PX) moveNoButton();
};

buttonRow.addEventListener("pointermove", dodgeIfClose);

// Extra: if someone somehow tries to click/tap it, it dodges first
noButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
});

// YES => show popup with cat thumbs up
const openModal = () => {
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
};

yesButton.addEventListener("click", () => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  response.textContent = message;

  modalText.innerHTML = `You have unlocked: <strong>Practice Buddy Mode</strong> 🐾`;
  openModal();
});

modalClose.addEventListener("click", closeModal);
modalOk.addEventListener("click", closeModal);

// Click outside modal-card closes it
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// ESC closes it
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
});

// Start with No somewhere random so it doesn’t sit on top of Yes
moveNoButton();
