const noButton = document.getElementById("no-btn");
const yesButton = document.getElementById("yes-btn");
const response = document.getElementById("response");
const catPhoto = document.getElementById("cat-photo");
const catPhotoImg = document.getElementById("cat-photo-img");
const catPhotoCaption = document.getElementById("cat-photo-caption");
const card = document.querySelector(".card");

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

const CAT_API_URL =
  "https://api.thecatapi.com/v1/images/search?has_breeds=true";
// NOTE: This is only obfuscation. Client-side keys are still visible.
const CAT_API_KEY_B64 =
  "bGl2ZV9NT1F2NlppNmxKYXA4Q3RZM3htMTJnd09oeTF0SmVENnBNb1V4blNWZmVkdFVlTHp5YTlERzRvdjVnbnpZNlNQ";

const decodeCatApiKey = () => atob(CAT_API_KEY_B64);

const fetchCatImage = async () => {
  if (!catPhotoImg || !catPhotoCaption) return;
  catPhotoCaption.textContent = "Fetching a cat...";
  catPhotoImg.style.display = "none";
  try {
    const res = await fetch(CAT_API_URL, {
      headers: { "x-api-key": decodeCatApiKey() },
    });
    if (!res.ok) throw new Error(`Cat API error: ${res.status}`);
    const data = await res.json();
    const url = data && data[0] && data[0].url;
    if (!url) throw new Error("No image returned");
    catPhotoImg.src = url;
    catPhotoImg.style.display = "block";
    catPhotoCaption.textContent = "Good choice, here is a cat to approve it !!";
  } catch (err) {
    catPhotoCaption.textContent =
      "Cat delivery failed. Try clicking Yes again.";
  }
};

const playfulNoResponses = [
  "Missed by a whisker!",
  "Meow you see it, meow you don’t.",
  "Too slow for these paws.",
  "Check your re-flexes!",
  "Fast as a feline.",
  "You’re chasing shadows now.",
  "Stop kitten around!",
  "That’s a cat-astrophe.",
  "Not in my purr-view.",
  "Fur-get about it.",
  "You've gotta be kitten me.",
  "Hiss-tory says no to 'No'.",
  "The button has cat-titude.",
  "It’s got the zoomies!",
  "Claw-ver attempt, though.",
  "Hiding like a hairball.",
  "In-fur-iating, isn't it?",
  "It's feline a bit shy.",
  "Don't be hiss-terical.",
  "Paws-itively un-clickable.",
  "Are you feline lucky?",
  "Tail-ing you now: Give up.",
  "Be-claws I said so.",
];

let dodgeCount = 0;

const CARD_PADDING = 12;
const CIRCLE_PADDING = 20;
const YES_EXCLUSION_SCALE = 3;

const getCardBounds = (itemW = 0, itemH = 0) => {
  const cardRect = card.getBoundingClientRect();
  const minX = CARD_PADDING;
  const minY = CARD_PADDING;
  const maxX = Math.max(minX, cardRect.width - CARD_PADDING - itemW);
  const maxY = Math.max(minY, cardRect.height - CARD_PADDING - itemH);
  return { minX, minY, maxX, maxY, cardRect };
};

const clampToCardCircle = (x, y, w, h, bounds) => {
  const cx = bounds.cardRect.width / 2;
  const cy = bounds.cardRect.height / 2;
  const radius =
    Math.min(bounds.cardRect.width, bounds.cardRect.height) / 2 -
    CIRCLE_PADDING -
    Math.max(w, h) / 2;

  if (radius <= 0) {
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
    };
  }

  const bx = x + w / 2;
  const by = y + h / 2;
  const dx = bx - cx;
  const dy = by - cy;
  const dist = Math.hypot(dx, dy);

  if (dist > radius) {
    const scale = radius / (dist || 1);
    const nx = cx + dx * scale;
    const ny = cy + dy * scale;
    x = nx - w / 2;
    y = ny - h / 2;
  }

  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
  };
};

const getYesExclusionRect = () => {
  const cardRect = card.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const cx = yesRect.left - cardRect.left + yesRect.width / 2;
  const cy = yesRect.top - cardRect.top + yesRect.height / 2;

  const w = yesRect.width * YES_EXCLUSION_SCALE;
  const h = yesRect.height * YES_EXCLUSION_SCALE;

  return {
    x: cx - w / 2,
    y: cy - h / 2,
    w,
    h,
  };
};

const rectsOverlap = (a, b, pad = 0) =>
  !(
    a.x + a.w + pad < b.x ||
    a.x > b.x + b.w + pad ||
    a.y + a.h + pad < b.y ||
    a.y > b.y + b.h + pad
  );

// Helper that tries to place "No" at/near (targetX, targetY) but NEVER in Yes-zone.
const placeNoSafely = (targetX, targetY) => {
  const noRect = noButton.getBoundingClientRect();

  const noW = noRect.width;
  const noH = noRect.height;

  const bounds = getCardBounds(noW, noH);
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  const yesZone = getYesExclusionRect();
  const padding = 18; // gap so No doesn't even touch Yes-zone

  // Clamp target to the circular play area
  let { x, y } = clampToCardCircle(targetX, targetY, noW, noH, bounds);

  // If clamped target overlaps yes zone, try a few alternative positions
  // that are far away in random directions.
  const candidate = { x, y, w: noW, h: noH };
  if (rectsOverlap(candidate, yesZone, padding)) {
    for (let i = 0; i < 80; i++) {
      const rx = bounds.minX + Math.random() * (maxX - bounds.minX);
      const ry = bounds.minY + Math.random() * (maxY - bounds.minY);
      const clamped = clampToCardCircle(rx, ry, noW, noH, bounds);
      const c = { x: clamped.x, y: clamped.y, w: noW, h: noH };
      if (!rectsOverlap(c, yesZone, padding)) {
        x = clamped.x;
        y = clamped.y;
        break;
      }
    }
  }

  noButton.style.position = "absolute";
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;

  response.textContent =
    playfulNoResponses[dodgeCount % playfulNoResponses.length];
  dodgeCount += 1;
};

// Keep the old API name so rest of code still works
const moveNoButton = (event) => {
  const noRect = noButton.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();

  const noW = noRect.width;
  const noH = noRect.height;

  // Yes exclusion zone = 3x size around the Yes button (viewport coords)
  const yesCenterX = yesRect.left + yesRect.width / 2;
  const yesCenterY = yesRect.top + yesRect.height / 2;

  const yesZone = {
    x: yesCenterX - (yesRect.width * YES_EXCLUSION_SCALE) / 2,
    y: yesCenterY - (yesRect.height * YES_EXCLUSION_SCALE) / 2,
    w: yesRect.width * YES_EXCLUSION_SCALE,
    h: yesRect.height * YES_EXCLUSION_SCALE,
  };

  const bounds = getCardBounds(noW, noH);
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  const overlaps = (x, y) => {
    const pad = 14;
    return !(
      x + noW + pad < yesZone.x ||
      x > yesZone.x + yesZone.w + pad ||
      y + noH + pad < yesZone.y ||
      y > yesZone.y + yesZone.h + pad
    );
  };

  // If we have a pointer event, jump AWAY from it (big jump)
  let targetX = bounds.minX + Math.random() * Math.max(1, maxX - bounds.minX);
  let targetY = bounds.minY + Math.random() * Math.max(1, maxY - bounds.minY);

  if (event && typeof event.clientX === "number") {
    const px = event.clientX - bounds.cardRect.left;
    const py = event.clientY - bounds.cardRect.top;

    // current No position (card coords)
    const curX = noRect.left - bounds.cardRect.left;
    const curY = noRect.top - bounds.cardRect.top;

    const dx = curX + noW / 2 - px;
    const dy = curY + noH / 2 - py;
    const dist = Math.hypot(dx, dy) || 1;

    const nx = dx / dist;
    const ny = dy / dist;

    const JUMP = 260; // <-- "wider away" distance
    const jitter = 70;

    targetX = curX + nx * JUMP + (Math.random() * jitter - jitter / 2);
    targetY = curY + ny * JUMP + (Math.random() * jitter - jitter / 2);
  }
  const clamped = clampToCardCircle(targetX, targetY, noW, noH, bounds);
  targetX = clamped.x;
  targetY = clamped.y;

  // Try to find a non-overlapping spot (including during dodges)
  let x = targetX;
  let y = targetY;

  for (let i = 0; i < 80; i++) {
    if (!overlaps(x, y)) break;
    const rx = bounds.minX + Math.random() * (maxX - bounds.minX);
    const ry = bounds.minY + Math.random() * (maxY - bounds.minY);
    const clamped = clampToCardCircle(rx, ry, noW, noH, bounds);
    x = clamped.x;
    y = clamped.y;
  }

  noButton.style.position = "absolute";
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;

  response.textContent =
    playfulNoResponses[dodgeCount % playfulNoResponses.length];
  dodgeCount += 1;
};

noButton.addEventListener("pointerenter", (e) => moveNoButton(e));
noButton.addEventListener("mouseenter", (e) => moveNoButton(e));

// Proximity dodge: runs away when cursor gets close
const DODGE_RADIUS_PX = 110;
const DODGE_JUMP_PX = 420;

const dodgeIfClose = (event) => {
  const btnRect = noButton.getBoundingClientRect();
  const bounds = getCardBounds(btnRect.width, btnRect.height);

  const px = event.clientX - bounds.cardRect.left;
  const py = event.clientY - bounds.cardRect.top;

  const bx = btnRect.left - bounds.cardRect.left + btnRect.width / 2;
  const by = btnRect.top - bounds.cardRect.top + btnRect.height / 2;

  const dx = bx - px; // NOTE: from pointer -> button (so away direction is +dx,+dy)
  const dy = by - py;

  const dist = Math.hypot(dx, dy);
  if (dist >= DODGE_RADIUS_PX) return;

  // Normalize direction away from pointer
  const nx = dist === 0 ? Math.random() - 0.5 : dx / dist;
  const ny = dist === 0 ? Math.random() - 0.5 : dy / dist;

  // Current button pos in viewport
  const currentX = btnRect.left - bounds.cardRect.left;
  const currentY = btnRect.top - bounds.cardRect.top;

  // Target far away + a little randomness so it doesn't feel robotic
  const jitter = 60;
  let targetX =
    currentX + nx * DODGE_JUMP_PX + (Math.random() * jitter - jitter / 2);
  let targetY =
    currentY + ny * DODGE_JUMP_PX + (Math.random() * jitter - jitter / 2);

  // clamp
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  let clamped = clampToCardCircle(
    targetX,
    targetY,
    btnRect.width,
    btnRect.height,
    bounds,
  );
  targetX = clamped.x;
  targetY = clamped.y;

  // ✅ Corner escape:
  // If clamping makes the move tiny (common in corners), flip direction or randomize.
  const moved = Math.hypot(targetX - currentX, targetY - currentY);

  if (moved < 80) {
    // try the opposite direction first
    let altX =
      currentX - nx * DODGE_JUMP_PX + (Math.random() * jitter - jitter / 2);
    let altY =
      currentY - ny * DODGE_JUMP_PX + (Math.random() * jitter - jitter / 2);

    clamped = clampToCardCircle(
      altX,
      altY,
      btnRect.width,
      btnRect.height,
      bounds,
    );
    altX = clamped.x;
    altY = clamped.y;

    // if still stuck, just pick a safe random spot anywhere
    const movedAlt = Math.hypot(altX - currentX, altY - currentY);
    if (movedAlt < 80) {
      const rx = bounds.minX + Math.random() * (maxX - bounds.minX);
      const ry = bounds.minY + Math.random() * (maxY - bounds.minY);
      placeNoSafely(rx, ry);
      return;
    }

    placeNoSafely(altX, altY);
    return;
  }
  placeNoSafely(targetX, targetY);
};

document.addEventListener("pointermove", dodgeIfClose);

// Extra: if someone somehow tries to click/tap it, it dodges first
noButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
});

// YES => show popup with cat thumbs up
const openModal = () => {
  modal.hidden = false;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modal.hidden = true;
};

yesButton.addEventListener("click", () => {
  const message = messages[Math.floor(Math.random() * messages.length)];
  response.textContent = message;
  fetchCatImage();

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
