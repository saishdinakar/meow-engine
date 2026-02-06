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

  response.textContent = playfulNoResponses[dodgeCount % playfulNoResponses.length];
  dodgeCount += 1;
};

noButton.addEventListener("mouseenter", moveNoButton);
noButton.addEventListener("focus", moveNoButton);

noButton.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

yesButton.addEventListener("click", () => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  response.textContent = message;
});
