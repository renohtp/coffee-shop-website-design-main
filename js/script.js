// =========================================
// 1. NAVIGASI, SLIDER BERANDA & ULASAN PENGGUNA
// =========================================
const menuBtn = document.querySelector('#menu-btn');
const navbar = document.querySelector('.navbar');

menuBtn.onclick = () => {
    menuBtn.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

window.addEventListener('scroll', () => {
    menuBtn.classList.remove('fa-times');
    navbar.classList.remove('active');
});

document.querySelectorAll('.image-slider img').forEach(thumb => {
    thumb.onclick = () => {
        const src = thumb.getAttribute('src');
        document.querySelector('.main-home-image').src = src;
    };
});

const REVIEWS_STORAGE_KEY = "coffee_pasogit_user_reviews_v1";
const reviewSwiperWrapper = document.getElementById('review-swiper-wrapper');
const defaultReviewSlidesHtml = reviewSwiperWrapper.innerHTML;

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildStarsHtml(rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 5));
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fas fa-star ${i > safeRating ? 'star-inactive' : ''}"></i>`;
    }
    return stars;
}

function getSavedUserReviews() {
    try {
        const parsed = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY));
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
}

let reviewSwiperInstance = null;

function renderReviewsAndInitSwiper() {
    const userReviews = getSavedUserReviews();
    const customSlidesHtml = userReviews.map((rev, idx) => {
        const avatarNum = (idx % 4) + 1;
        return `
            <div class="swiper-slide box">
                <i class="fas fa-quote-left"></i>
                <i class="fas fa-quote-right"></i>
                <img src="image/pic-${avatarNum}.png" alt="${escapeHtml(rev.author)}">
                <div class="stars">${buildStarsHtml(rev.rating)}</div>
                <p>${escapeHtml(rev.comment)}</p>
                <h3>${escapeHtml(rev.author)}</h3>
                <span>${escapeHtml(rev.role || 'pelanggan')}</span>
            </div>
        `;
    }).join('');

    reviewSwiperWrapper.innerHTML = defaultReviewSlidesHtml + customSlidesHtml;

    if (reviewSwiperInstance && typeof reviewSwiperInstance.destroy === 'function') {
        reviewSwiperInstance.destroy(true, true);
    }

    reviewSwiperInstance = new Swiper(".review-slider", {
        spaceBetween: 20,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        loop: reviewSwiperWrapper.children.length > 2,
        grabCursor: true,
        autoplay: {
            delay: 7500,
            disableOnInteraction: false,
        },
        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            }
        },
    });
}

// Form Ulasan Interaktif Pengguna
const starPickBtns = document.querySelectorAll('#rating-stars-select .star-pick-btn');
const ratingValueLabel = document.getElementById('rating-value-label');
const userReviewForm = document.getElementById('user-review-form');
let selectedRating = 5;

function setSelectedRating(val) {
    selectedRating = Math.max(1, Math.min(5, Number(val) || 5));
    starPickBtns.forEach(btn => {
        const btnVal = Number(btn.dataset.value);
        btn.classList.toggle('active', btnVal <= selectedRating);
    });
    ratingValueLabel.textContent = `${selectedRating} / 5`;
}

starPickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setSelectedRating(btn.dataset.value);
    });
});

userReviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const author = document.getElementById('rev-author').value.trim();
    const role = document.getElementById('rev-role').value.trim() || 'pelanggan';
    const comment = document.getElementById('rev-comment').value.trim();

    if (!author || !comment) {
        showToast('Nama dan isi ulasan wajib diisi');
        return;
    }

    const existing = getSavedUserReviews();
    existing.push({
        author,
        role,
        rating: selectedRating,
        comment
    });
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(existing));

    renderReviewsAndInitSwiper();
    userReviewForm.reset();
    setSelectedRating(5);
    showToast('Terima kasih! Ulasan kamu sudah tampil di daftar ulasan');
});

// =========================================
// 2. FILTER KATEGORI & PENCARIAN MENU
// =========================================
const filterBtns = document.querySelectorAll('#menu-filter-bar .filter-btn');
const menuBoxes = document.querySelectorAll('#menu-box-container .box');
const searchInput = document.getElementById('menu-search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const resultInfoEl = document.getElementById('menu-result-info');
const emptySearchState = document.getElementById('empty-search-state');
const resetFilterBtn = document.getElementById('reset-filter-btn');

let activeCategory = 'all';

function applyMenuFilters() {
    const keyword = searchInput.value.trim().toLowerCase();
    clearSearchBtn.classList.toggle('show', keyword.length > 0);

    let visibleCount = 0;

    menuBoxes.forEach(box => {
        const category = box.dataset.category;
        const textContent = box.textContent.toLowerCase();

        const matchCategory = activeCategory === 'all' || category === activeCategory;
        const matchSearch = keyword === '' || textContent.includes(keyword);

        if (matchCategory && matchSearch) {
            box.classList.remove('hide');
            visibleCount += 1;
        } else {
            box.classList.add('hide');
        }
    });

    emptySearchState.classList.toggle('show', visibleCount === 0);

    if (keyword) {
        resultInfoEl.textContent = `Menampilkan ${visibleCount} menu untuk "${searchInput.value.trim()}"`;
    } else {
        const labelMap = {
            all: 'semua menu',
            minuman: 'minuman',
            makanan: 'makanan',
            snack: 'cemilan / snack'
        };
        resultInfoEl.textContent = `Menampilkan ${visibleCount} menu (${labelMap[activeCategory] || 'menu'})`;
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.filter;
        applyMenuFilters();
    });
});

searchInput.addEventListener('input', applyMenuFilters);

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    applyMenuFilters();
    searchInput.focus();
});

resetFilterBtn.addEventListener('click', () => {
    searchInput.value = '';
    activeCategory = 'all';
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    applyMenuFilters();
});

// =========================================
// 3. LOGIKA PEMESANAN, QRIS DENGAN HARGA & VALIDASI MEJA
// =========================================
const WHATSAPP_NUMBER = "6281938179068";
const STORAGE_KEY = "coffee_pasogit_cart_v5";
// Jika sudah punya gambar QRIS resmi milik kedai, isi path/URL-nya di bawah ini (misal: "image/qris-asli.png")
const CUSTOM_QRIS_IMAGE = "";

let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentProduct = null;
let selectedPaymentMethod = "QRIS";
let selectedPaymentStatus = "PAID";

// Elemen Keranjang
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartScrollBody = document.getElementById('cart-scroll-body');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountBadge = document.getElementById('cart-count');
const cartTotalQtyEl = document.getElementById('cart-total-qty');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const clearCartBtn = document.getElementById('clear-cart-btn');
const orderTypeSelect = document.getElementById('order-type');
const tableGroupEl = document.getElementById('table-group');
const tableNumberInput = document.getElementById('table-number');

// Elemen Pembayaran QRIS
const paymentMethodBtns = document.querySelectorAll('#payment-method-options .pay-method-btn');
const qrisPanel = document.getElementById('qris-panel');
const qrisAmountText = document.getElementById('qris-amount-text');
const qrisCanvas = document.getElementById('qris-canvas');
const downloadQrisBtn = document.getElementById('download-qris-btn');
const copyAmountBtn = document.getElementById('copy-amount-btn');
const statusOptBtns = document.querySelectorAll('#qris-status-toggle .status-opt-btn');

// Elemen Modal Varian
const variantModal = document.getElementById('variant-modal');
const closeVariantBtn = document.getElementById('close-variant');
const confirmAddCartBtn = document.getElementById('confirm-add-cart');
const variantFinalPriceEl = document.getElementById('variant-final-price');
const tempGroupEl = document.getElementById('temp-group');
const sizeOpt1 = document.getElementById('size-opt-1');
const sizeOpt2 = document.getElementById('size-opt-2');

// Elemen Toast
const toastEl = document.getElementById('toast-notif');
const toastMsgEl = document.getElementById('toast-message');
let toastTimer = null;

function showToast(message) {
    toastMsgEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 2600);
}

function formatRupiah(amount) {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function getCartGrandTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartTotalItems() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function drawFinderPattern(ctx, x, y, cellSize) {
    ctx.fillStyle = '#1b100b';
    ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#1b100b';
    ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
}

function drawQrisHeaderAndFooter(ctx, width, height, totalPrice) {
    const formattedPrice = formatRupiah(totalPrice);
    const totalItems = getCartTotalItems();

    // Banner atas harga pesanan
    ctx.fillStyle = '#2b1a12';
    ctx.fillRect(0, 0, width, 54);

    ctx.fillStyle = '#d8a46f';
    ctx.font = 'bold 11px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COFFEE PASOGIT • QRIS PEMBAYARAN', width / 2, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Poppins, sans-serif';
    ctx.fillText(formattedPrice, width / 2, 42);

    // Footer bawah harga pesanan & jumlah item
    ctx.fillStyle = '#f5ebe0';
    ctx.fillRect(0, height - 38, width, 38);

    ctx.strokeStyle = 'rgba(43, 26, 18, .18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, height - 38);
    ctx.lineTo(width - 10, height - 38);
    ctx.stroke();

    ctx.fillStyle = '#2b1a12';
    ctx.font = 'bold 11px Poppins, sans-serif';
    ctx.fillText(`Tagihan: ${formattedPrice} (${totalItems} item)`, width / 2, height - 15);
}

function renderQrisCanvas(totalPrice) {
    if (!qrisCanvas) return;
    const ctx = qrisCanvas.getContext('2d');
    const width = qrisCanvas.width;
    const height = qrisCanvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    drawQrisHeaderAndFooter(ctx, width, height, totalPrice);

    const qrTop = 62;
    const qrAreaHeight = height - 62 - 44;
    const qrBoxSize = Math.min(width - 48, qrAreaHeight);
    const marginX = Math.round((width - qrBoxSize) / 2);
    const marginY = qrTop + Math.round((qrAreaHeight - qrBoxSize) / 2);

    if (CUSTOM_QRIS_IMAGE) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(marginX - 4, marginY - 4, qrBoxSize + 8, qrBoxSize + 8);
            ctx.drawImage(img, marginX, marginY, qrBoxSize, qrBoxSize);
            drawQrisHeaderAndFooter(ctx, width, height, totalPrice);
        };
        img.src = CUSTOM_QRIS_IMAGE;
        return;
    }

    const grid = 21;
    const cell = qrBoxSize / grid;

    drawFinderPattern(ctx, marginX, marginY, cell);
    drawFinderPattern(ctx, marginX + cell * (grid - 7), marginY, cell);
    drawFinderPattern(ctx, marginX, marginY + cell * (grid - 7), cell);

    const seedBase = hashString(`COFFEE-PASOGIT-${totalPrice}-${selectedPaymentStatus}`);
    ctx.fillStyle = '#1b100b';

    for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
            const inTopLeft = r < 8 && c < 8;
            const inTopRight = r < 8 && c >= grid - 8;
            const inBottomLeft = r >= grid - 8 && c < 8;
            if (inTopLeft || inTopRight || inBottomLeft) continue;

            const cellHash = hashString(`${seedBase}-${r}-${c}`);
            if (cellHash % 2 === 0) {
                ctx.fillRect(
                    Math.round(marginX + c * cell),
                    Math.round(marginY + r * cell),
                    Math.ceil(cell - 0.5),
                    Math.ceil(cell - 0.5)
                );
            }
        }
    }
}

function updateQrisDisplay(totalPrice) {
    qrisAmountText.textContent = formatRupiah(totalPrice);
    renderQrisCanvas(totalPrice);
}

function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    if (cartScrollBody) {
        cartScrollBody.scrollTop = 0;
    }
    updateQrisDisplay(getCartGrandTotal());
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
}

function closeVariantModal() {
    variantModal.classList.remove('active');
}

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
closeVariantBtn.addEventListener('click', closeVariantModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVariantModal();
        closeCart();
    }
});

function syncTableFieldVisibility() {
    const isDineIn = orderTypeSelect.value.toLowerCase().includes('dine-in');
    tableGroupEl.style.display = isDineIn ? 'block' : 'none';
}

orderTypeSelect.addEventListener('change', syncTableFieldVisibility);

paymentMethodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        paymentMethodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPaymentMethod = btn.dataset.method;

        if (selectedPaymentMethod === 'QRIS') {
            qrisPanel.classList.remove('hidden');
            selectedPaymentStatus = 'PAID';
            statusOptBtns.forEach(b => b.classList.toggle('active', b.dataset.status === 'PAID'));
            updateQrisDisplay(getCartGrandTotal());
        } else {
            qrisPanel.classList.add('hidden');
            selectedPaymentStatus = 'TIDAK PAID';
        }
    });
});

statusOptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        statusOptBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPaymentStatus = btn.dataset.status;
        updateQrisDisplay(getCartGrandTotal());
    });
});

downloadQrisBtn.addEventListener('click', () => {
    const total = getCartGrandTotal();
    if (total <= 0) {
        showToast('Keranjang masih kosong, pilih menu dulu ya');
        return;
    }

    renderQrisCanvas(total);
    const dataUrl = qrisCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QRIS-Coffee-Pasogit-Rp${total}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`QRIS (${formatRupiah(total)}) berhasil diunduh`);
});

copyAmountBtn.addEventListener('click', () => {
    const total = getCartGrandTotal();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(String(total)).then(() => {
            showToast(`Nominal ${formatRupiah(total)} disalin`);
        }).catch(() => {
            showToast(`Total bayar: ${formatRupiah(total)}`);
        });
    } else {
        showToast(`Total bayar: ${formatRupiah(total)}`);
    }
});

function updateVariantPricePreview() {
    if (!currentProduct) return;
    const activeSize = document.querySelector('#size-options .opt-btn.active');
    const extra = activeSize ? parseInt(activeSize.dataset.extra, 10) : 0;
    const total = currentProduct.basePrice + extra;
    variantFinalPriceEl.textContent = formatRupiah(total);
}

function configureVariantModalByType(type) {
    const isDrink = type === 'drink';
    tempGroupEl.style.display = isDrink ? 'block' : 'none';

    if (isDrink) {
        sizeOpt1.dataset.value = 'Regular';
        sizeOpt1.dataset.extra = '0';
        sizeOpt1.textContent = 'Regular';

        sizeOpt2.dataset.value = 'Large';
        sizeOpt2.dataset.extra = '5000';
        sizeOpt2.textContent = 'Large (+Rp 5.000)';
    } else {
        sizeOpt1.dataset.value = 'Porsi Standar';
        sizeOpt1.dataset.extra = '0';
        sizeOpt1.textContent = 'Porsi Standar';

        sizeOpt2.dataset.value = 'Porsi Besar';
        sizeOpt2.dataset.extra = '6000';
        sizeOpt2.textContent = 'Porsi Besar (+Rp 6.000)';
    }
}

document.querySelectorAll('.add-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentProduct = {
            id: btn.dataset.id,
            type: btn.dataset.type || 'drink',
            name: btn.dataset.name,
            basePrice: parseInt(btn.dataset.price, 10),
            img: btn.dataset.img
        };

        configureVariantModalByType(currentProduct.type);

        document.getElementById('variant-img').src = currentProduct.img;
        document.getElementById('variant-name').textContent = currentProduct.name;
        document.getElementById('variant-price').textContent = 'Harga dasar: ' + formatRupiah(currentProduct.basePrice);
        document.getElementById('variant-note').value = '';

        document.querySelectorAll('#temp-options .opt-btn').forEach((b, idx) => b.classList.toggle('active', idx === 0));
        document.querySelectorAll('#size-options .opt-btn').forEach((b, idx) => b.classList.toggle('active', idx === 0));

        updateVariantPricePreview();
        variantModal.classList.add('active');
    });
});

document.querySelectorAll('.variant-options').forEach(group => {
    group.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            group.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateVariantPricePreview();
        });
    });
});

confirmAddCartBtn.addEventListener('click', () => {
    if (!currentProduct) return;

    const isDrink = currentProduct.type === 'drink';
    const temp = isDrink ? document.querySelector('#temp-options .opt-btn.active').dataset.value : null;
    const sizeBtn = document.querySelector('#size-options .opt-btn.active');
    const size = sizeBtn.dataset.value;
    const extra = parseInt(sizeBtn.dataset.extra, 10);
    const note = document.getElementById('variant-note').value.trim();

    const unitPrice = currentProduct.basePrice + extra;
    const variantLabel = isDrink ? `${temp} • ${size}` : size;
    const itemKey = `${currentProduct.id}-${variantLabel}-${note.toLowerCase()}`;

    const existing = cart.find(item => item.key === itemKey);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            key: itemKey,
            name: currentProduct.name,
            img: currentProduct.img,
            variantLabel,
            note,
            price: unitPrice,
            qty: 1
        });
    }

    saveAndRenderCart();
    closeVariantModal();
    showToast(`${currentProduct.name} (${variantLabel}) masuk keranjang`);

    cartBtn.classList.add('bump');
    setTimeout(() => cartBtn.classList.remove('bump'), 250);
});

function saveAndRenderCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let totalQty = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-box">
                <i class="fas fa-mug-hot"></i>
                <p>Keranjang pesanan Coffee Pasogit masih kosong.</p>
                <a href="#menu" class="btn btn-primary" onclick="closeCart()">Pilih Menu</a>
            </div>
        `;
    } else {
        cart.forEach((item, index) => {
            totalQty += item.qty;
            totalPrice += item.price * item.qty;

            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="variant-tag">${item.variantLabel}</span>
                    ${item.note ? `<small class="item-note">Catatan: ${item.note}</small>` : ''}
                    <div class="item-price">${formatRupiah(item.price * item.qty)}</div>
                </div>
                <div class="cart-item-qty">
                    <button type="button" class="qty-btn ${item.qty === 1 ? 'delete-btn' : ''}" onclick="changeQty(${index}, -1)" aria-label="Kurangi jumlah">
                        <i class="fas ${item.qty === 1 ? 'fa-trash-alt' : 'fa-minus'}"></i>
                    </button>
                    <span>${item.qty}</span>
                    <button type="button" class="qty-btn" onclick="changeQty(${index}, 1)" aria-label="Tambah jumlah">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });
    }

    cartCountBadge.textContent = totalQty;
    cartTotalQtyEl.textContent = `${totalQty} item`;
    cartTotalPriceEl.textContent = formatRupiah(totalPrice);
    updateQrisDisplay(totalPrice);
}

window.changeQty = function(index, delta) {
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
        showToast('Item dihapus dari keranjang');
    }
    saveAndRenderCart();
};

clearCartBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    cart = [];
    saveAndRenderCart();
    showToast('Keranjang telah dikosongkan');
});

document.getElementById('checkout-wa-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Pilih minimal 1 menu terlebih dahulu');
        return;
    }

    const customerName = document.getElementById('customer-name').value.trim();
    const orderType = orderTypeSelect.value;
    const isDineIn = orderType.toLowerCase().includes('dine-in');
    const tableNumber = tableNumberInput.value.trim();

    if (!customerName) {
        showToast('Silakan isi Nama Pemesan terlebih dahulu');
        document.getElementById('customer-name').focus();
        return;
    }

    if (isDineIn && !tableNumber) {
        showToast('Nomor meja wajib diisi untuk pesanan Dine-in');
        tableNumberInput.focus();
        return;
    }

    let text = `Halo *Coffee Pasogit*, saya ingin memesan:%0A%0A`;
    text += `*Nama Pemesan:* ${customerName}%0A`;
    text += `*Tipe Pesanan:* ${orderType}%0A`;
    if (isDineIn) {
        text += `*Nomor Meja:* ${tableNumber}%0A`;
    }
    text += `*Metode Pembayaran:* ${selectedPaymentMethod}%0A`;
    text += `*Status Pembayaran:* ${selectedPaymentStatus}%0A`;
    text += `%0A*Rincian Pesanan:*%0A`;

    let grandTotal = 0;
    cart.forEach((item, idx) => {
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        text += `${idx + 1}. *${item.name}* (${item.variantLabel}) x${item.qty} = ${formatRupiah(subtotal)}%0A`;
        if (item.note) {
            text += `   _Catatan: ${item.note}_%0A`;
        }
    });

    text += `%0A*Total Pembayaran: ${formatRupiah(grandTotal)}*`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(waUrl, '_blank');
});

document.getElementById('reservation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('res-name').value.trim();
    const phone = document.getElementById('res-phone').value.trim();
    const msg = document.getElementById('res-message').value.trim();

    const resText = `Halo *Coffee Pasogit*, saya ingin reservasi tempat:%0A*Nama:* ${name}%0A*No. HP/WA:* ${phone}%0A*Catatan:* ${msg || '-'}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${resText}`, '_blank');
    showToast('Mengarahkan ke WhatsApp untuk konfirmasi reservasi');
    e.target.reset();
});

// Inisialisasi awal
renderReviewsAndInitSwiper();
applyMenuFilters();
syncTableFieldVisibility();
renderCart();