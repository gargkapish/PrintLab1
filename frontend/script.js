const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5005'
    : 'https://printlab1.onrender.com';

// Supabase Configuration
const SUPABASE_URL = 'https://fwtmaucsjhlxzwtvrbkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dG1hdWNzamhseHp3dHZyYmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNDg3MDcsImV4cCI6MjA5MjkyNDcwN30.yNWrEFi6cmNJgYLOoWnT6STpGs2pQ-XVm3KVWesB3GU';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



const fallbackProducts = [
    { id: 1, name: 'Standard Document', price: 2, icon: 'fa-file-lines', desc: 'High-quality printing for your documents.', category: 'Print' },
    { id: 2, name: 'Sunboard & Boxboard', price: 50, icon: 'fa-layer-group', desc: 'Sturdy boards for models and presentations.', category: 'Sheets & Boards' },
    { id: 3, name: 'Acrylic Sheets', price: 120, icon: 'fa-square-full', desc: 'Clear and durable acrylic sheets.', category: 'Sheets & Boards' },
    { id: 4, name: 'OHP Sheets', price: 10, icon: 'fa-file-image', desc: 'Clear & Coloured OHP sheets.', category: 'Sheets & Boards' },
    { id: 5, name: 'Cartridge Sheet', price: 5, icon: 'fa-file', desc: 'Premium cartridge sheets.', category: 'Sheets & Boards' },
    { id: 6, name: 'Cutter (blade)', price: 20, icon: 'fa-pen-nib', desc: 'Sharp cutter for precise cuts.', category: 'Stationery' },
    { id: 7, name: 'Precision Knife', price: 45, icon: 'fa-pen', desc: 'Craft precision knife.', category: 'Stationery' },
    { id: 8, name: 'Cutting Mat', price: 150, icon: 'fa-table-cells', desc: 'Self-healing cutting mat.', category: 'Stationery' },
    { id: 9, name: 'Drawing Board', price: 250, icon: 'fa-clipboard', desc: 'Wooden drawing board.', category: 'Stationery' },
    { id: 10, name: 'Nose Plier', price: 80, icon: 'fa-wrench', desc: 'Long nose plier.', category: 'Stationery' },
    { id: 11, name: 'Pliers', price: 75, icon: 'fa-toolbox', desc: 'Standard pliers.', category: 'Stationery' },
    { id: 12, name: 'Metal Wires', price: 30, icon: 'fa-bars-staggered', desc: 'Aluminum, iron wires for modeling.', category: 'Stationery' },
    { id: 13, name: 'Mechanical Pencil', price: 40, icon: 'fa-pencil', desc: '0.5mm / 0.7mm mechanical pencil.', category: 'Stationery' },
    { id: 14, name: 'Staedtler Pencil Colors', price: 350, icon: 'fa-palette', desc: 'Premium colored pencils.', category: 'Stationery' },
    { id: 15, name: 'Alcohol Markers', price: 600, icon: 'fa-highlighter', desc: 'Set of alcohol-based markers.', category: 'Stationery' }
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
    currentOrderId: null,
    user: null,
    profile: null
};


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initAuth();
    simulateLoading();
    updateCartUI();
    initFunkyFeatures();
    startTypedTagline();
    initMagneticButtons();
});

// --- Auth Logic ---
async function initAuth() {
    console.log("Supabase Init: Checking session... Current URL:", window.location.href);
    
    // Give Supabase a moment to parse the URL hash if we just redirected back
    if (window.location.hash) {
        console.log("Hash detected in URL, waiting for Supabase to parse...");
        await new Promise(r => setTimeout(r, 500));
    }

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) console.error("Session fetch error:", error);
    
    console.log("Initial session found:", session);
    handleAuthState(session);

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        console.log("Auth event:", _event, session);
        handleAuthState(session);
    });
}



function handleAuthState(session) {
    if (session) {
        console.log("User session active:", session.user.email);
        state.user = session.user;
        document.getElementById('auth-overlay').classList.remove('active');
        checkProfile();
    } else {
        console.log("No active session.");
        state.user = null;
        state.profile = null;
        document.getElementById('auth-overlay').classList.add('active');
    }
}


async function loginWithGoogle() {
    await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { 
            redirectTo: window.location.href // Redirect back to exactly where we are (including /frontend/)
        }
    });
}



async function checkProfile() {
    if (!state.user) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', state.user.id)
            .single();

        
        if (error || !data || !data.phone) {
            document.getElementById('profile-modal').classList.add('active');
        } else {
            state.profile = data;
            document.getElementById('profile-modal').classList.remove('active');
            updateSettingsUI();
        }
    } catch (err) {
        console.error('Profile check failed', err);
    }
}

async function completeProfile() {
    const username = document.getElementById('profile-username').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();

    if (!username || !phone) {
        showToast("Username and Phone are required.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: state.user.id,
                email: state.user.email,
                name: username,
                phone: phone
            })
        });

        if (!response.ok) throw new Error('Failed to save profile');
        const profile = await response.json();
        
        state.profile = profile;
        document.getElementById('profile-modal').classList.remove('active');
        showToast("Profile completed! You can now place orders.");
        updateSettingsUI();
    } catch (err) {
        console.error('Error completing profile:', err);
        showToast("Failed to save profile. Try again.");
    }
}

function updateSettingsUI() {
    if (!state.profile) return;
    
    const settingsScreen = document.getElementById('settings-screen');
    const nameEl = settingsScreen.querySelector('div[style*="font-weight: 600; margin-top: 0.3rem; font-size: 1.1rem;"]');
    const emailEl = settingsScreen.querySelectorAll('div[style*="font-weight: 600; margin-top: 0.3rem; font-size: 1.1rem;"]')[1];
    
    if (nameEl) nameEl.innerText = state.profile.name;
    if (emailEl) emailEl.innerText = state.profile.email;
}

async function logout() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('printlab_cart');
    window.location.reload();
}



function initDarkMode() {
    const isDark = localStorage.getItem('printlab_dark') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        updateDarkIcons(true);
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('printlab_dark', isDark);
    updateDarkIcons(isDark);
}

function updateDarkIcons(isDark) {
    const mobileIcon = document.getElementById('mobile-dark-icon');
    const desktopIcon = document.getElementById('desktop-dark-icon');
    const desktopText = document.getElementById('desktop-dark-text');
    
    if (isDark) {
        if (mobileIcon) { mobileIcon.classList.remove('fa-moon'); mobileIcon.classList.add('fa-sun'); }
        if (desktopIcon) { desktopIcon.classList.remove('fa-moon'); desktopIcon.classList.add('fa-sun'); }
        if (desktopText) desktopText.innerText = 'Light Mode';
    } else {
        if (mobileIcon) { mobileIcon.classList.remove('fa-sun'); mobileIcon.classList.add('fa-moon'); }
        if (desktopIcon) { desktopIcon.classList.remove('fa-sun'); desktopIcon.classList.add('fa-moon'); }
        if (desktopText) desktopText.innerText = 'Dark Mode';
    }
}


async function simulateLoading() {
    state.isLoading = true;
    renderSkeletons();

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('API Error');
        state.products = await response.json();
    } catch (err) {
        console.warn('Falling back to local data', err);
        state.products = fallbackProducts;
    } finally {
        state.isLoading = false;
        renderProductGrid();
    }
}


function saveToStorage() {
    localStorage.setItem('printlab_cart', JSON.stringify(state.cart));
}

function initFunkyFeatures() {
    // Other features can go here
}

function toggleSetting(id) {
    const el = document.getElementById(`${id}-toggle`);
    if (el) {
        el.classList.toggle('active');
        showToast('Settings updated');
    }
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
        const spanText = badge.querySelector('span').innerText.toLowerCase().replace('\n', ' ');
        const catLower = category.toLowerCase();
        
        const categoryMatch = 
            (category === 'All' && spanText === 'all') ||
            (category === 'Print' && spanText === 'print') ||
            (category === 'Sheets & Boards' && spanText === 'sheets & boards') ||
            (category === 'Stationery' && spanText === 'stationery');

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

    let dynamicOptions = '';
    
    if (product.category === 'Print') {
        dynamicOptions = `
            <div class="product-options" style="margin-top: 1.5rem;">
                <div class="form-group">
                    <label>Paper Type</label>
                    <select id="opt-paper" class="form-control">
                        <option value="Photo paper">Photo paper</option>
                        <option value="Bond paper">Bond paper</option>
                        <option value="High quality print">High quality print</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Size</label>
                    <select id="opt-size" class="form-control">
                        <option value="A5">A5</option>
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="A2">A2</option>
                        <option value="A1">A1</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Finish</label>
                    <select id="opt-finish" class="form-control">
                        <option value="Glossy">Glossy</option>
                        <option value="Matte">Matte</option>
                    </select>
                </div>
            </div>
        `;
    } else if (product.category === 'Sheets & Boards') {
        if (product.name.includes('Sunboard') || product.name.includes('Boxboard')) {
            dynamicOptions = `
                <div class="product-options" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label>Size</label>
                        <select id="opt-size" class="form-control">
                            <option value="A2">A2</option>
                            <option value="A1">A1</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Thickness/GSM</label>
                        <select id="opt-thickness" class="form-control">
                            <option value="2mm">2mm</option>
                            <option value="3mm">3mm</option>
                            <option value="4mm">4mm</option>
                            <option value="5mm">5mm</option>
                        </select>
                    </div>
                </div>
            `;
        } else if (product.name.includes('Acrylic')) {
            dynamicOptions = `
                <div class="product-options" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label>Size</label>
                        <select id="opt-size" class="form-control">
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                            <option value="A2">A2</option>
                            <option value="A1">A1</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Thickness</label>
                        <select id="opt-thickness" class="form-control">
                            <option value="2mm">2mm</option>
                            <option value="3mm">3mm</option>
                            <option value="4mm">4mm</option>
                            <option value="5mm">5mm</option>
                        </select>
                    </div>
                </div>
            `;
        } else if (product.name.includes('OHP')) {
            dynamicOptions = `
                <div class="product-options" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label>Size</label>
                        <select id="opt-size" class="form-control">
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Thickness</label>
                        <select id="opt-thickness" class="form-control">
                            <option value="1mm">1mm</option>
                            <option value="2mm">2mm</option>
                            <option value="3mm">3mm</option>
                        </select>
                    </div>
                </div>
            `;
        } else {
            dynamicOptions = `
                <div class="product-options" style="margin-top: 1.5rem;">
                    <div class="form-group">
                        <label>Size</label>
                        <select id="opt-size" class="form-control">
                            <option value="A5">A5</option>
                            <option value="A4">A4</option>
                            <option value="A3">A3</option>
                            <option value="A2">A2</option>
                            <option value="A1">A1</option>
                        </select>
                    </div>
                </div>
            `;
        }
    }

    const detailContent = document.getElementById('product-detail-content');
    detailContent.innerHTML = `
        <div class="detail-img-large">
            <i class="fa-solid ${product.icon} text-teal"></i>
        </div>
        <div class="detail-info">
            <span class="stat-label">${product.category}</span>
            <h2 style="font-weight: 900; letter-spacing: -1px;">${product.name}</h2>
            <p class="detail-desc">${product.desc}</p>
            
            ${dynamicOptions}

            <div class="quantity-selector" style="margin-top: 1.5rem;">
                <button class="qty-btn" onclick="updateTempQty(-1)"><i class="fa-solid fa-minus"></i></button>
                <span class="qty-value" id="qty-val">1</span>
                <button class="qty-btn" onclick="updateTempQty(1)"><i class="fa-solid fa-plus"></i></button>
            </div>

            <div class="price-estimate">
                <span class="stat-label">Estimated Price</span>
                ₹<span id="estimated-price">${product.price}</span>
            </div>

            <div class="magnetic-btn-wrap">
                <button class="btn-add" onclick="addToCart(event)">Add to Cart</button>
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
    let selectedOptions = [];
    let optionsKey = '';

    const paperEl = document.getElementById('opt-paper');
    if (paperEl) {
        selectedOptions.push(paperEl.value);
        optionsKey += `|paper:${paperEl.value}`;
    }
    const sizeEl = document.getElementById('opt-size');
    if (sizeEl) {
        selectedOptions.push(`Size: ${sizeEl.value}`);
        optionsKey += `|size:${sizeEl.value}`;
    }
    const finishEl = document.getElementById('opt-finish');
    if (finishEl) {
        selectedOptions.push(`Finish: ${finishEl.value}`);
        optionsKey += `|finish:${finishEl.value}`;
    }
    const thickEl = document.getElementById('opt-thickness');
    if (thickEl) {
        selectedOptions.push(`GSM/Thick: ${thickEl.value}`);
        optionsKey += `|thick:${thickEl.value}`;
    }

    const itemDesc = selectedOptions.join(', ');
    const uniqueId = state.selectedProduct.id + optionsKey;

    const existingItem = state.cart.find(item => item.cartId === uniqueId);

    if (existingItem) {
        existingItem.qty += state.tempQty;
    } else {
        state.cart.push({
            ...state.selectedProduct,
            cartId: uniqueId,
            itemDesc: itemDesc,
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
    let targetEl = document.getElementById('cart-count-badge') || document.getElementById('mobile-cart-count') || document.querySelector('.cart-sidebar');
    if (!targetEl) return; // Silent fail if no target exists

    const target = targetEl.getBoundingClientRect();
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
                ${item.itemDesc ? `<p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">${item.itemDesc}</p>` : ''}
                <p style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">₹${item.price} x ${item.qty}</p>
            </div>
            <div style="cursor: pointer; color: var(--accent-coral); padding: 0.5rem;" 
                 onclick="removeFromCart('${item.cartId || item.id}')">
                <i class="fa-solid fa-circle-xmark" style="font-size: 1.2rem;"></i>
            </div>
        </div>
    `).join('');
}

function removeFromCart(cartId) {
    state.cart = state.cart.filter(item => (item.cartId || String(item.id)) !== String(cartId));
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
                <button class="btn-checkout" onclick="openCheckoutModal()">Place Order</button>
            </div>
        `;
    }
}

// --- Checkout Logic ---
function openCheckoutModal() {
    if (state.cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }
    
    if (!state.profile || !state.profile.phone) {
        showToast("Please complete your profile first.");
        document.getElementById('profile-modal').classList.add('active');
        return;
    }

    // Auto-fill form if possible
    document.getElementById('checkout-name').value = state.profile.name || '';
    document.getElementById('checkout-mobile').value = state.profile.phone || '';
    
    document.getElementById('checkout-modal').classList.add('active');
}


function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('active');
}

async function confirmOrder(e) {
    const nameInput = document.getElementById('checkout-name').value.trim();
    const mobileInput = document.getElementById('checkout-mobile').value.trim();

    if (!nameInput || !mobileInput) {
        showToast("Please enter your Name and Mobile Number.");
        return;
    }

    const orderBtn = document.getElementById('confirm-btn');
    if (orderBtn) orderBtn.innerText = 'Placing...';

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fee = subtotal > 0 ? 10 : 0;
    const total = subtotal + fee;

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                items: state.cart, 
                total: total,
                customerName: nameInput,
                customerMobile: mobileInput,
                userId: state.user.id
            })
        });


        if (!response.ok) throw new Error('Failed to place order');
        const orderData = await response.json();

        state.currentOrderId = orderData.id;
    } catch (err) {
        console.warn('API error, falling back to mock order placement', err);
        state.currentOrderId = 'PL-' + Math.floor(Math.random() * 10000);
    }

    if (orderBtn) orderBtn.innerText = 'Confirm Order';
    closeCheckoutModal();

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
async function cancelCurrentOrder() {
    if (!state.currentOrderId) return;
    
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${state.currentOrderId}/cancel`, {
            method: 'PATCH'
        });

        if (response.ok) {
            showToast('Order cancelled successfully');
            const statusText = document.getElementById('status-text');
            const progressBar = document.getElementById('status-progress-bar');
            const cancelBtn = document.getElementById('cancel-order-container');

            if (statusText) statusText.innerText = 'Order Cancelled';
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.background = 'var(--accent-coral)';
            }
            if (cancelBtn) cancelBtn.style.display = 'none';
        } else {
            showToast('Failed to cancel order');
        }
    } catch (err) {
        console.error('Error cancelling order:', err);
        showToast('Error cancelling order');
    }
}

async function triggerStatusAnimation() {
    const trackingUI = document.getElementById('order-tracking-ui');
    const emptyUI = document.getElementById('order-empty-ui');

    if (!state.currentOrderId) {
        if (trackingUI) trackingUI.style.display = 'none';
        if (emptyUI) emptyUI.style.display = 'block';
        return;
    }

    if (trackingUI) trackingUI.style.display = 'block';
    if (emptyUI) emptyUI.style.display = 'none';

    const progressBar = document.getElementById('status-progress-bar');
    const statusText = document.getElementById('status-text');
    const trackingHeading = document.querySelector('#status-screen h2');
    const cancelBtn = document.getElementById('cancel-order-container');

    if (trackingHeading) {
        const displayId = state.currentOrderId
            ? (state.currentOrderId.length > 8 ? state.currentOrderId.substring(0, 8) + '...' : state.currentOrderId)
            : 'Unknown';
        trackingHeading.innerText = `Tracking Order #${displayId}`;
    }


    // Reset
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.style.background = 'var(--primary-teal)';
    }
    if (statusText) statusText.innerText = "Order Placed...";
    if (cancelBtn) cancelBtn.style.display = 'block';

    if (state.currentOrderId) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${state.currentOrderId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Order status fetched:', data.status);
                
                if (data.status === 'Cancelled') {
                    if (statusText) statusText.innerText = "Order Cancelled";
                    if (progressBar) {
                        progressBar.style.width = '100%';
                        progressBar.style.background = 'var(--accent-coral)';
                    }
                    if (cancelBtn) cancelBtn.style.display = 'none';
                } else if (data.status === 'Completed' || data.status === 'Ready') {
                    if (statusText) statusText.innerText = "Order is ready for pickup!";
                    if (progressBar) progressBar.style.width = '100%';
                    if (cancelBtn) cancelBtn.style.display = 'none';
                } else {
                    // Default packing animation if not cancelled or completed
                    setTimeout(() => {
                        if (progressBar) progressBar.style.width = '33%';
                        if (statusText) statusText.innerText = "Order is being packed...";
                    }, 500);
                }
            }
        } catch (err) {
            console.warn('Failed to fetch status', err);
        }
    }
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
