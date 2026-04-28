// Environment Config
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5005'
    : 'https://your-render-app.onrender.com';

// Fallback data
const fallbackProducts = [
    { id: 1, name: 'Standard Document', price: 2, icon: 'fa-file-lines', desc: 'A4 size, High-quality 70 GSM paper.', category: 'Document' },
    { id: 2, name: 'Glossy Poster', price: 45, icon: 'fa-image', desc: 'Premium glossy finish for room decor.', category: 'Posters' },
    { id: 3, name: 'Business Cards', price: 150, icon: 'fa-address-card', desc: 'Pack of 50. Professional matte finish.', category: 'Stationery' },
    { id: 4, name: 'Spiral Binding', price: 30, icon: 'fa-book', desc: 'Durable plastic spiral binding.', category: 'Services' },
    { id: 5, name: 'Thesis Hardcover', price: 450, icon: 'fa-graduation-cap', desc: 'Gold embossed title on premium navy blue.', category: 'Premium' },
    { id: 6, name: 'Passport Photos', price: 80, icon: 'fa-user-tie', desc: 'Set of 8 high-resolution photos.', category: 'Photos' }
];

// State Management
const state = {
    currentScreen: 'home',
    currentCategory: 'All',
    cart: JSON.parse(localStorage.getItem('printlab_cart')) || [],
    products: [],
    selectedProduct: null,
    tempQty: 1,
    isLoading: true,
    currentOrderId: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    simulateLoading();
    updateCartUI();
    initFunkyFeatures();
    startTypedTagline();
    initMagneticButtons();
});

async function simulateLoading() {
    state.isLoading = true;
    renderSkeletons();

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('API Error');
        state.products = await response.json();
        setTimeout(() => {
            state.isLoading = false;
            renderProductGrid();
        }, 500);
    } catch (err) {
        console.warn('Falling back to local data', err);
        state.products = fallbackProducts;
        setTimeout(() => {
            state.isLoading = false;
            renderProductGrid();
        }, 800);
    }
}

function saveToStorage() {
    localStorage.setItem('printlab_cart', JSON.stringify(state.cart));
}

function initFunkyFeatures() {
    // Custom Cursor logic
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Smooth outline follow
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Remove 3D Tilt Effect logic (it's handled by CSS hover now for simplicity/performance in light mode)
}

// --- SPA Navigation ---
function showScreen(screenId) {
    // Update State
    state.currentScreen = screenId;

    // Toggle Screen Visibility
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(`${screenId}-screen`).classList.add('active');

    // Update Nav Link Styles (Desktop)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => n.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${screenId}`);
    if (activeNav) activeNav.classList.add('active');

    // Update Mobile Nav Styles
    const mNavItems = document.querySelectorAll('.nav-item-mobile');
    mNavItems.forEach(n => n.classList.remove('active'));
    const activeMNav = document.getElementById(`m-nav-${screenId}`);
    if (activeMNav) activeMNav.classList.add('active');

    // Special Logic for Screens
    if (screenId === 'status') {
        triggerStatusAnimation();
    }
}

// --- Home Screen Logic ---
function filterProducts(category) {
    state.currentCategory = category;

    // Update active hex badge
    const badges = document.querySelectorAll('.category-hex');
    badges.forEach(badge => {
        const spanText = badge.querySelector('span').innerText.toLowerCase();
        const categoryMatch = (category === 'All' && spanText.includes('all')) ||
            (category === 'Document' && spanText.includes('completes')) ||
            (category === 'Posters' && spanText.includes('complex')) ||
            (category === 'Stationery' && spanText.includes('fast'));

        if (categoryMatch) {
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
        }
    });

    renderProductGrid();
}

function renderProductGrid() {
    if (state.isLoading) return;

    const grid = document.getElementById('product-grid');
    const filteredProducts = state.currentCategory === 'All'
        ? state.products
        : state.products.filter(p => p.category === state.currentCategory);

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="openProductDetail('${product.id}')">
            <div class="product-img">
                <i class="fa-solid ${product.icon} text-teal"></i>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">₹${product.price} / unit</p>
            </div>
        </div>
    `).join('');

    // Trigger Entrance Animation
    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('reveal');
        }, index * 80);
    });
}

function renderSkeletons() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = Array(6).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-price"></div>
        </div>
    `).join('');
}

function startTypedTagline() {
    const tagline = document.getElementById('typed-tagline');
    if (!tagline) return;

    const text = "Fast, reliable, and affordable printing for students.";
    tagline.innerHTML = "";
    let i = 0;

    function type() {
        if (i < text.length) {
            tagline.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 30);
        }
    }
    type();
}

// --- Product Detail Logic ---
function openProductDetail(productId) {
    const product = state.products.find(p => String(p.id) === String(productId));
    state.selectedProduct = product;
    state.tempQty = 1;

    const detailContent = document.getElementById('product-detail-content');
    detailContent.innerHTML = `
        <div class="detail-img-large">
            <i class="fa-solid ${product.icon} text-teal"></i>
        </div>
        <div class="detail-info">
            <span class="stat-label">${product.category}</span>
            <h2 style="font-weight: 900; letter-spacing: -1px;">${product.name}</h2>
            <p class="detail-desc">${product.desc}</p>
            
            <div class="quantity-selector">
                <button class="qty-btn" onclick="updateTempQty(-1)"><i class="fa-solid fa-minus"></i></button>
                <span class="qty-value" id="qty-val">1</span>
                <button class="qty-btn" onclick="updateTempQty(1)"><i class="fa-solid fa-plus"></i></button>
            </div>

            <div class="price-estimate">
                <span class="stat-label">Estimated Price</span>
                ₹<span id="estimated-price">${product.price}</span>
            </div>

            <div class="magnetic-btn-wrap">
                <button class="btn-add" onclick="addToCart(event)">Add to Order</button>
            </div>
        </div>
    `;

    showScreen('detail');
}

function updateTempQty(change) {
    state.tempQty = Math.max(1, state.tempQty + change);
    document.getElementById('qty-val').innerText = state.tempQty;
    document.getElementById('estimated-price').innerText = state.tempQty * state.selectedProduct.price;
}

// --- Cart Logic ---
function addToCart(e) {
    const existingItem = state.cart.find(item => item.id === state.selectedProduct.id);

    if (existingItem) {
        existingItem.qty += state.tempQty;
    } else {
        state.cart.push({
            ...state.selectedProduct,
            qty: state.tempQty
        });
    }

    // Series A Feedback
    triggerFlyingParticle(e);
    triggerCartJiggle();

    saveToStorage();
    updateCartUI();
    showToast(`${state.selectedProduct.name} added to cart!`);
    showScreen('home');
}

function triggerFlyingParticle(e) {
    const particle = document.createElement('div');
    particle.className = 'cart-particle';

    const startX = e.clientX;
    const startY = e.clientY;

    // Target: Cart badge/sidebar area
    const target = document.getElementById('cart-count-badge').getBoundingClientRect();
    const endX = target.left + target.width / 2;
    const endY = target.top + target.height / 2;

    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    document.body.appendChild(particle);

    particle.animate([
        { left: `${startX}px`, top: `${startY}px`, opacity: 1, scale: 1 },
        { left: `${endX}px`, top: `${endY}px`, opacity: 0, scale: 0.2 }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
        fill: 'forwards'
    }).onfinish = () => particle.remove();
}

function triggerCartJiggle() {
    const badges = [document.getElementById('cart-count-badge'), document.getElementById('mobile-cart-count')];
    badges.forEach(b => {
        if (b) {
            b.classList.add('cart-jiggle');
            setTimeout(() => b.classList.remove('cart-jiggle'), 500);
        }
    });
}

function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-check-circle text-teal"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateCartUI() {
    const cartCountElements = [
        document.getElementById('cart-count-badge'),
        document.getElementById('mobile-cart-count')
    ];

    const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountElements.forEach(el => {
        if (el) el.innerText = count;
    });

    // Render Desktop Sidebar Items
    renderCartItems('desktop-cart-items');
    // Render Mobile Screen Items
    renderCartItems('mobile-cart-items');

    calculateTotals();
}

function renderCartItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (state.cart.length === 0) {
        if (containerId === 'desktop-cart-items') {
            container.innerHTML = `
                <div class="empty-cart-ui">
                    <div class="empty-cart-illustration">
                        <i class="fa-solid fa-box-open" style="font-size: 4rem;"></i>
                    </div>
                    <h3>Your cart is empty</h3>
                    <p style="font-size: 0.9rem;">Add some items to start your printing project.</p>
                    <div class="btn-start-printing" onclick="showScreen('home')">Start Printing</div>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
        }
        return;
    }

    container.innerHTML = state.cart.map(item => `
        <div class="cart-item" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 0.5rem;">
            <div class="cart-item-img" style="display:flex; align-items:center; justify-content:center; background: #E1F5EE; border-radius: 50%; min-width: 50px; height: 50px;">
                <i class="fa-solid ${item.icon}" style="font-size: 1.2rem; color: var(--primary-teal);"></i>
            </div>
            <div class="cart-item-info" style="flex-grow: 1;">
                <h4 style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">${item.name}</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">₹${item.price} x ${item.qty}</p>
            </div>
            <div style="cursor: pointer; color: var(--accent-coral); padding: 0.5rem;" 
                 onclick="removeFromCart('${item.id}')">
                <i class="fa-solid fa-circle-xmark" style="font-size: 1.2rem;"></i>
            </div>
        </div>
    `).join('');
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => String(item.id) !== String(productId));
    saveToStorage();
    updateCartUI();
}

function calculateTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fee = subtotal > 0 ? 10 : 0;
    const total = subtotal + fee;

    document.getElementById('subtotal').innerText = `₹${subtotal}`;
    document.getElementById('fee').innerText = `₹${fee}`;
    document.getElementById('total').innerText = `₹${total}`;

    // Update Progress Bar
    const progressPct = Math.min(100, Math.floor((subtotal / 500) * 100)); // 500 as a sample goal
    const progressBar = document.getElementById('cart-progress-bar');
    const progressLabel = document.getElementById('progress-pct');
    if (progressBar) progressBar.style.width = `${progressPct}%`;
    if (progressLabel) progressLabel.innerText = `${progressPct}%`;

    // Update Mobile Totals if screen is active
    const mobileFooter = document.getElementById('mobile-cart-footer');
    if (mobileFooter) {
        mobileFooter.innerHTML = `
            <div class="cart-footer" style="margin-top: 2rem;">
                <div class="cart-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
                <div class="cart-row"><span>Svc Fee</span><span>₹${fee}</span></div>
                <div class="cart-row total-row"><span>Total</span><span>₹${total}</span></div>
                <button class="btn-checkout" onclick="placeOrder()">Place Order</button>
            </div>
        `;
    }
}

// --- Order Logic ---
async function placeOrder() {
    if (state.cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    const orderBtn = document.querySelector('.btn-checkout');
    if (orderBtn) orderBtn.innerText = 'Placing...';

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fee = subtotal > 0 ? 10 : 0;
    const total = subtotal + fee;

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: state.cart, total: total })
        });

        if (!response.ok) throw new Error('Failed to place order');
        const orderData = await response.json();

        state.currentOrderId = orderData.id;
    } catch (err) {
        console.warn('API error, falling back to mock order placement', err);
        state.currentOrderId = 'PL-' + Math.floor(Math.random() * 10000);
    }

    if (orderBtn) orderBtn.innerText = 'Place Order';

    // Create Confetti
    createConfetti();

    // Reset Cart
    state.cart = [];
    saveToStorage();
    updateCartUI();
    showScreen('status');
}

function createConfetti() {
    const colors = ['#1D9E75', '#D85A30', '#BA7517', '#2ecc71', '#3498db'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 8 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.animation = `confetti-fall ${Math.random() * 2 + 1}s linear forwards`;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// --- Animation Logic ---
async function triggerStatusAnimation() {
    const progressBar = document.getElementById('status-progress-bar');
    const statusText = document.getElementById('status-text');
    const trackingHeading = document.querySelector('#status-screen h2');

    if (trackingHeading) {
        const displayId = state.currentOrderId
            ? (state.currentOrderId.length > 8 ? state.currentOrderId.substring(0, 8) + '...' : state.currentOrderId)
            : 'Unknown';
        trackingHeading.innerText = `Tracking Order #${displayId}`;
    }

    // Reset
    if (progressBar) progressBar.style.width = '0%';
    if (statusText) statusText.innerText = "Order Placed...";

    if (state.currentOrderId && !state.currentOrderId.startsWith('PL-')) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${state.currentOrderId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Order status fetched:', data.status);
            }
        } catch (err) {
            console.warn('Failed to fetch status', err);
        }
    }

    // Trigger after small delay
    setTimeout(() => {
        if (progressBar) progressBar.style.width = '33%'; // Fill to 'Packed' step
        if (statusText) statusText.innerText = "Order is being packed...";
    }, 500);
}

function initMagneticButtons() {
    document.addEventListener('mousemove', (e) => {
        const wraps = document.querySelectorAll('.magnetic-btn-wrap');
        wraps.forEach(wrap => {
            const rect = wrap.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

            if (dist < 100) {
                const moveX = (e.clientX - centerX) * 0.2;
                const moveY = (e.clientY - centerY) * 0.2;
                wrap.style.transform = "translate(" + moveX + "px, " + moveY + "px)";
            } else {
                wrap.style.transform = "translate(0px, 0px)";
            }
        });
    });
}
