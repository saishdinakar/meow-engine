const noButton = document.getElementById("no-btn");
const yesButton = document.getElementById("yes-btn");
const response = document.getElementById("response");
const buttonRow = document.getElementById("button-row");

const messages = [
  "Nice choice! You just made this page very happy.",
  "Yay! High-five for saying yes.",
  "You got it. Practice buddy unlocked!",
];

const playfulNoResponses = [
  "Almost! The no button is feeling shy.",
  "Oops, it slipped away.",
  "Nope is on a coffee break.",
  "That button is practicing dodgeball.",
];

let dodgeCount = 0;

const moveNoButton = () => {
  const rowRect = buttonRow.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const maxX = rowRect.width - buttonRect.width;
  const maxY = rowRect.height - buttonRect.height;
  const x = Math.max(0, Math.min(maxX, Math.random() * maxX));
  const y = Math.max(0, Math.min(maxY, Math.random() * maxY));

  noButton.style.position = "absolute";
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;

  response.textContent =
    playfulNoResponses[dodgeCount % playfulNoResponses.length];
  dodgeCount += 1;
};

yesButton.addEventListener("click", () => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  response.textContent = message;
});

// Dodge when the pointer gets close (not only when it touches the button)
const DODGE_RADIUS_PX = 80; // increase to make it more cowardly

const dodgeIfClose = (event) => {
  const rowRect = buttonRow.getBoundingClientRect();
  const btnRect = noButton.getBoundingClientRect();

  // pointer position (works for mouse + touch + pen)
  const px = event.clientX;
  const py = event.clientY;

  // button center
  const bx = btnRect.left + btnRect.width / 2;
  const by = btnRect.top + btnRect.height / 2;

  const dx = px - bx;
  const dy = py - by;
  const dist = Math.hypot(dx, dy);

  if (dist < DODGE_RADIUS_PX) {
    moveNoButton();
  }
};

// Track pointer movement inside the button area container
buttonRow.addEventListener("pointermove", dodgeIfClose);

// Extra “nope” for mobile / quick clicks
noButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
});
