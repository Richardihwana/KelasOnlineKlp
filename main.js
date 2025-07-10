document.addEventListener("DOMContentLoaded", function () {
  let cartCount = 0;
  const cartCounter = document.querySelector(".cart-count");
  const cartIcon = document.querySelector(".cart-icon");
  const cartTooltip = document.querySelector(".cart-tooltip");
  const buyButtons = document.querySelectorAll(".btn-buy");
  let cartItems = [];

  // Elemen modal
  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutSummary = document.querySelector(".checkout-summary");
  const closeModal = document.querySelector(".close-modal");
  const checkoutSuccess = document.getElementById("checkoutSuccess");
  const closeSuccess = document.querySelector(".btn-close-success");

  // Load cart from localStorage
  loadCartFromStorage();

  buyButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const courseCard = this.closest(".course-card");
      const courseId = courseCard.getAttribute("data-course-id");
      const courseTitle = courseCard.querySelector(".course-title").textContent;
      const coursePrice = courseCard.querySelector(".course-price").textContent;
      const courseImage = courseCard.querySelector(".course-image").src;

      addToCart(courseId, courseTitle, coursePrice, courseImage);
    });
  });

  cartIcon.addEventListener("click", function (e) {
    e.preventDefault();
    toggleCartTooltip();
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".cart-wrapper")) {
      hideCartTooltip();
    }
  });

  // Modal handlers
  closeModal.addEventListener("click", function () {
    checkoutModal.style.display = "none";
  });

  closeSuccess.addEventListener("click", function () {
    checkoutSuccess.style.display = "none";
  });

  window.addEventListener("click", function (e) {
    if (e.target === checkoutModal) {
      checkoutModal.style.display = "none";
    }
    if (e.target === checkoutSuccess) {
      checkoutSuccess.style.display = "none";
    }
  });

  function loadCartFromStorage() {
    const savedCart = localStorage.getItem("onlineClassCart");
    if (savedCart) {
      cartItems = JSON.parse(savedCart);
      cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      updateCartUI();
    }
  }

  function saveCartToStorage() {
    localStorage.setItem("onlineClassCart", JSON.stringify(cartItems));
  }

  function addToCart(id, title, price, image) {
    const existingIndex = cartItems.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      cartItems[existingIndex].quantity++;
    } else {
      cartItems.push({
        id: id,
        title: title,
        price: price,
        image: image,
        quantity: 1,
      });
    }

    cartCount++;
    updateCartUI();
    saveCartToStorage();
    showSuccessNotification(title, price);
    animateButton(
      document.querySelector(`.course-card[data-course-id="${id}"] .btn-buy`)
    );
  }

  function updateCartUI() {
    cartCounter.textContent = cartCount;
    cartCounter.classList.add("animate-pulse");
    cartIcon.classList.add("animate-shake");

    setTimeout(() => {
      cartCounter.classList.remove("animate-pulse");
      cartIcon.classList.remove("animate-shake");
    }, 500);

    updateCartTooltip();
  }

  function animateButton(button) {
    if (!button) return;

    button.innerHTML = '<i class="bi bi-check-lg"></i> Berhasil';
    button.classList.add("added");
    setTimeout(() => {
      button.innerHTML = '<i class="bi bi-cart-plus"></i> Tambah Lagi';
      button.classList.remove("added");
    }, 1500);
  }

  function showSuccessNotification(title, price) {
    const notification = document.createElement("div");
    notification.className = "purchase-notification";
    notification.innerHTML = `
        <i class="bi bi-check-circle-fill"></i>
        <div>
          <strong>${title}</strong>
          <span>${price} ditambahkan ke keranjang</span>
        </div>
      `;
    document.body.appendChild(notification);

    const cartIconElement = document.querySelector(".cart-icon i");
    const originalIcon = cartIconElement.className;
    cartIconElement.className = "bi bi-cart-check-fill";

    setTimeout(() => {
      cartIconElement.className = originalIcon;
    }, 1500);

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function toggleCartTooltip() {
    cartTooltip.style.display =
      cartTooltip.style.display === "flex" ? "none" : "flex";
  }

  function hideCartTooltip() {
    cartTooltip.style.display = "none";
  }

  function updateCartTooltip() {
    if (cartItems.length === 0) {
      cartTooltip.innerHTML =
        '<div class="empty-cart">Keranjang belanja kosong</div>';
      return;
    }

    let totalHarga = 0;
    let tooltipHTML = `
        <div class="cart-header">
          <h4>Keranjang Belanja</h4>
          <small>${cartCount} item</small>
        </div>
        <div class="cart-items">
      `;

    cartItems.forEach((item) => {
      const angkaHarga = parseInt(item.price.replace(/[^\d]/g, ""));
      totalHarga += angkaHarga * item.quantity;

      tooltipHTML += `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
              <span class="item-title">${item.title}</span>
              <div class="item-meta">
                <span class="item-price">${item.price}</span>
                <span class="item-quantity">× ${item.quantity}</span>
              </div>
            </div>
            <button class="item-remove" data-id="${item.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        `;
    });

    tooltipHTML += `
        </div>
        <div class="cart-footer">
          <div class="total-price">Total: Rp ${totalHarga.toLocaleString(
            "id-ID"
          )}</div>
          <div class="cart-footer-actions">
            <button class="empty-cart-btn"><i class="bi bi-x-circle"></i> Kosongkan</button>
            <button class="checkout-btn"><i class="bi bi-credit-card"></i> Checkout</button>
          </div>
        </div>
      `;

    cartTooltip.innerHTML = tooltipHTML;

    // Add event listeners to new elements
    document.querySelectorAll(".item-remove").forEach((btn) => {
      btn.addEventListener("click", function () {
        const itemId = this.getAttribute("data-id");
        removeItemFromCart(itemId);
      });
    });

    document.querySelector(".empty-cart-btn")?.addEventListener("click", () => {
      emptyCart();
    });

    document.querySelector(".checkout-btn")?.addEventListener("click", () => {
      showCheckoutModal();
    });
  }

  function removeItemFromCart(itemId) {
    const itemIndex = cartItems.findIndex((item) => item.id === itemId);
    if (itemIndex >= 0) {
      cartCount -= cartItems[itemIndex].quantity;
      cartItems.splice(itemIndex, 1);
      updateCartUI();
      saveCartToStorage();

      if (cartItems.length === 0) {
        setTimeout(() => hideCartTooltip(), 300);
      }
    }
  }

  function emptyCart() {
    cartItems = [];
    cartCount = 0;
    updateCartUI();
    saveCartToStorage();
    hideCartTooltip();
  }

  function showCheckoutModal() {
    // Update checkout summary
    let totalHarga = 0;
    let summaryHTML = '<h3>Ringkasan Pembelian</h3><ul class="checkout-items">';

    cartItems.forEach((item) => {
      const angkaHarga = parseInt(item.price.replace(/[^\d]/g, ""));
      totalHarga += angkaHarga * item.quantity;

      summaryHTML += `
          <li>
            <span>${item.title} (${item.quantity}x)</span>
            <span>${item.price}</span>
          </li>
        `;
    });

    summaryHTML += `</ul>
        <div class="checkout-total">
          <strong>Total Pembayaran</strong>
          <strong>Rp ${totalHarga.toLocaleString("id-ID")}</strong>
        </div>
      `;

    checkoutSummary.innerHTML = summaryHTML;
    checkoutModal.style.display = "block";
    hideCartTooltip();
  }

  // Handle checkout form submission
  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const paymentMethod = document.getElementById("payment").value;

    // Simpan data checkout
    const checkoutData = {
      date: new Date().toISOString(),
      items: cartItems,
      total: cartItems.reduce((total, item) => {
        return (
          total + parseInt(item.price.replace(/[^\d]/g, "")) * item.quantity
        );
      }, 0),
      customer: { name, email },
      paymentMethod,
    };

    // Simpan ke localStorage (bisa diganti dengan API call)
    saveCheckoutToStorage(checkoutData);

    // Tampilkan notifikasi sukses
    checkoutModal.style.display = "none";
    checkoutSuccess.style.display = "flex";

    // Kosongkan keranjang
    emptyCart();
  });

  function saveCheckoutToStorage(checkoutData) {
    // Get existing checkouts or create new array
    const existingCheckouts = JSON.parse(
      localStorage.getItem("onlineClassCheckouts") || "[]"
    );

    // Add new checkout
    existingCheckouts.push(checkoutData);

    // Save back to localStorage
    localStorage.setItem(
      "onlineClassCheckouts",
      JSON.stringify(existingCheckouts)
    );

    // Log untuk debugging (bisa dihapus)
    console.log("Checkout saved:", checkoutData);
  }
});
