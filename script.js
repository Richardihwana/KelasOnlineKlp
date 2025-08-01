// Memory Game yang Sudah Diperbaiki
const memoryGame = {
  state: {
    hasFlippedCard: false,
    lockBoard: false,
    firstCard: null,
    secondCard: null,
    pairsFound: 0,
    attempts: 0,
    gameStarted: false,
    timer: null,
    seconds: 0,
    totalPairs: 4, // Karena kita punya 4 pasang kartu
  },

  cards: [
    { id: 1, src: "gmb/foto1.jpeg" },
    { id: 2, src: "gmb/foto2.jpeg" },
    { id: 3, src: "gmb/foto3.jpg" },
    { id: 4, src: "gmb/foto4.jpeg" }, // Contoh gambar lain
  ],

  init: function () {
    this.state.totalPairs = this.cards.length;
    this.shuffleCards();
    this.createMemoryCards();
    this.updateGameStats();
  },

  shuffleCards: function () {
    // Buat pasangan kartu
    let cardsToShuffle = [];
    this.cards.forEach((card) => {
      cardsToShuffle.push({ ...card });
      cardsToShuffle.push({ ...card }); // Duplikat untuk pasangan
    });

    // Acak kartu
    this.shuffledCards = cardsToShuffle
      .map((card) => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);
  },

  createMemoryCards: function () {
    const gameBoard = document.getElementById("memoryGame");
    gameBoard.innerHTML = "";

    this.shuffledCards.forEach((card, index) => {
      const cardElement = document.createElement("div");
      cardElement.className = "memory-card";
      cardElement.dataset.id = card.id;

      const cardInner = document.createElement("div");
      cardInner.className = "card-inner";

      const frontFace = document.createElement("div");
      frontFace.className = "front-face";
      frontFace.textContent = "❓";

      const backFace = document.createElement("div");
      backFace.className = "back-face";

      const img = document.createElement("img");
      img.src = card.src;
      img.alt = "Memory card";
      backFace.appendChild(img);

      cardInner.appendChild(frontFace);
      cardInner.appendChild(backFace);
      cardElement.appendChild(cardInner);

      cardElement.addEventListener("click", () => this.flipCard(cardElement));
      gameBoard.appendChild(cardElement);
    });
  },

  flipCard: function (card) {
    if (this.state.lockBoard || card.classList.contains("flipped")) return;

    if (!this.state.gameStarted) {
      this.state.gameStarted = true;
      this.startTimer();
    }

    card.classList.add("flipped");

    if (!this.state.hasFlippedCard) {
      // Kartu pertama yang dibalik
      this.state.hasFlippedCard = true;
      this.state.firstCard = card;
      return;
    }

    // Kartu kedua yang dibalik
    this.state.secondCard = card;
    this.state.attempts++;
    this.checkForMatch();
  },

  checkForMatch: function () {
    const isMatch =
      this.state.firstCard.dataset.id === this.state.secondCard.dataset.id;

    if (isMatch) {
      this.disableCards();
      this.state.pairsFound++;

      if (this.state.pairsFound === this.state.totalPairs) {
        setTimeout(() => {
          document.getElementById("question").textContent =
            "🎉 Kamu menang! Semua pasangan ditemukan!";
          clearInterval(this.state.timer);
          this.playCelebration();
        }, 500);
      }
    } else {
      this.unflipCards();
    }

    this.updateGameStats();
  },

  disableCards: function () {
    this.state.firstCard.removeEventListener("click", this.flipCard);
    this.state.secondCard.removeEventListener("click", this.flipCard);
    this.resetBoard();
  },

  unflipCards: function () {
    this.state.lockBoard = true;

    setTimeout(() => {
      this.state.firstCard.classList.remove("flipped");
      this.state.secondCard.classList.remove("flipped");
      this.resetBoard();
    }, 1000);
  },

  resetBoard: function () {
    [this.state.hasFlippedCard, this.state.lockBoard] = [false, false];
    [this.state.firstCard, this.state.secondCard] = [null, null];
  },

  updateGameStats: function () {
    document.getElementById("pairsFound").textContent = this.state.pairsFound;
    document.getElementById("attempts").textContent = this.state.attempts;

    const accuracy =
      this.state.attempts > 0
        ? Math.round((this.state.pairsFound / this.state.attempts) * 100)
        : 0;
    document.getElementById("accuracy").textContent = `Akurasi: ${accuracy}%`;
  },

  startTimer: function () {
    this.state.timer = setInterval(() => {
      this.state.seconds++;
      const mins = Math.floor(this.state.seconds / 60)
        .toString()
        .padStart(2, "0");
      const secs = (this.state.seconds % 60).toString().padStart(2, "0");
      document.getElementById("timer").textContent = `${mins}:${secs}`;
    }, 1000);
  },

  playCelebration: function () {
    document.body.classList.add("celebration");
  },

  resetGame: function () {
    if (
      this.state.gameStarted &&
      this.state.pairsFound < this.state.totalPairs &&
      !confirm("Apakah kamu yakin ingin mengulang permainan?")
    ) {
      return;
    }

    clearInterval(this.state.timer);
    this.state = {
      hasFlippedCard: false,
      lockBoard: false,
      firstCard: null,
      secondCard: null,
      pairsFound: 0,
      attempts: 0,
      gameStarted: false,
      timer: null,
      seconds: 0,
      totalPairs: this.cards.length,
    };

    document.getElementById("question").textContent =
      "Temukan semua pasangan foto kenangan kita!";
    document.getElementById("timer").textContent = "00:00";
    this.init();
  },
};

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  memoryGame.init();

  // Fungsi lainnya (popup, musik, dll)
  showPopup();
  startHearts();
  startCountdown();

  // Inisialisasi musik pada interaksi pertama
  document.addEventListener(
    "click",
    function initMusic() {
      toggleMusic();
      document.removeEventListener("click", initMusic);
    },
    { once: true }
  );
});

// Ekspos fungsi ke global scope
window.resetGame = () => memoryGame.resetGame();
