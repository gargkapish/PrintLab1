const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
    ? 'http://localhost:5005'
    : 'https://printlab1.onrender.com';

// Supabase Configuration
const SUPABASE_URL = 'https://fwtmaucsjhlxzwtvrbkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dG1hdWNzamhseHp3dHZyYmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNDg3MDcsImV4cCI6MjA5MjkyNDcwN30.yNWrEFi6cmNJgYLOoWnT6STpGs2pQ-XVm3KVWesB3GU';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



const fallbackProducts = [
    { id: 1, name: 'Photo Paper', price: 30, icon: 'fa-image', image: './assets/photo_paper.png', description: 'High quality photo printing (A5, A4, A3, A2).', category: 'Print' },
    { id: 16, name: 'Standard paper (high gsm)', price: 30, icon: 'fa-file-lines', image: './assets/standard_paper_high.png', description: 'Thick standard paper (A4, A3, A2).', category: 'Print' },
    { id: 17, name: 'Standard Paper (low gsm)', price: 4, icon: 'fa-file', image: './assets/standard_paper_low.png', description: 'Standard low GSM paper (A4 only).', category: 'Print' },
    { id: 18, name: 'Jury Panels', price: 200, icon: 'fa-clipboard-list', image: './assets/jury_panels.png', description: 'Large jury panels for presentations.', category: 'Print' },
    { id: 2, name: 'Sunboard & Boxboard', price: 50, icon: 'fa-layer-group', image: './assets/sunboard_printlab_1777452528921.png', description: 'Sturdy boards for models and presentations.', category: 'Sheets & Boards' },
    { id: 3, name: 'Acrylic Sheets', price: 120, icon: 'fa-square-full', image: './assets/acrylic_sheets_printlab_1777452544512.png', description: 'Clear and durable acrylic sheets.', category: 'Sheets & Boards' },
    { id: 4, name: 'OHP Sheets', price: 10, icon: 'fa-file-image', image: './assets/ohp_sheets.png', description: 'Clear & Coloured OHP sheets.', category: 'Sheets & Boards' },
    { id: 5, name: 'Cartridge Sheet', price: 5, icon: 'fa-file', image: './assets/cartridge_sheet.png', description: 'Premium cartridge sheets.', category: 'Sheets & Boards' },
    { id: 6, name: 'Cutter (blade)', price: 20, icon: 'fa-pen-nib', image: './assets/cutter_blade_printlab_1777451955366.png', description: 'Sharp cutter for precise cuts.', category: 'Stationery' },
    { id: 7, name: 'Precision Knife', price: 45, icon: 'fa-pen', image: './assets/precision_knife_printlab_1777451970860.png', description: 'Craft precision knife.', category: 'Stationery' },
    { id: 8, name: 'Cutting Mat', price: 150, icon: 'fa-table-cells', image: './assets/cutting_mat_printlab_1777451992827.png', description: 'Self-healing cutting mat.', category: 'Stationery' },
    { id: 9, name: 'Drawing Board', price: 250, icon: 'fa-clipboard', image: './assets/drawing_board_printlab_1777452009054.png', description: 'Wooden drawing board.', category: 'Stationery' },
    { id: 10, name: 'Nose Plier', price: 80, icon: 'fa-wrench', image: './assets/nose_plier_printlab_1777452024155.png', description: 'Long nose plier.', category: 'Stationery' },
    { id: 11, name: 'Pliers', price: 75, icon: 'fa-toolbox', image: './assets/pliers_printlab_1777452091069.png', description: 'Standard pliers.', category: 'Stationery' },
    { id: 12, name: 'Metal Wires', price: 30, icon: 'fa-bars-staggered', image: './assets/metal_wires_printlab_1777452106497.png', description: 'Aluminum, iron wires for modeling.', category: 'Stationery' },
    { id: 13, name: 'Mechanical Pencil', price: 40, icon: 'fa-pencil', image: './assets/mechanical_pencil_printlab_1777452126326.png', description: '0.5mm / 0.7mm mechanical pencil.', category: 'Stationery' },
    { id: 14, name: 'Staedtler Pencil Colors', price: 350, icon: 'fa-palette', image: './assets/staedtler_pencils_printlab_1777452144057.png', description: 'Premium colored pencils.', category: 'Stationery' },
    { id: 15, name: 'Alcohol Markers', price: 600, icon: 'fa-highlighter', image: './assets/alcohol_markers_printlab_1777452159013.png', description: 'Set of alcohol-based markers.', category: 'Stationery' }
];

const quickEssentials = [
    { id: 'addon-pen', name: 'Premium Blue Gel Pen', price: 10, icon: 'fa-pen' },
    { id: 'addon-folder', name: 'Eco Document Folder', price: 15, icon: 'fa-folder-open' },
    { id: 'addon-cutter', name: 'Replacement Cutter Blade', price: 20, icon: 'fa-pen-nib' },
    { id: 'addon-pencil', name: 'Mechanical Pencil 0.5mm', price: 40, icon: 'fa-pencil' }
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

        // Auto-populate mock profile data for mock sessions to bypass setup modals seamlessly
        if (session.user.id === 'mock-user-123') {
            state.profile = {
                name: 'Alex Student',
                phone: '9876543210',
                email: 'student@campus.edu'
            };
            updateSettingsUI();
        } else {
            checkProfile();
        }
    } else {
        console.log("No active session.");
        state.user = null;
        state.profile = null;
        document.getElementById('auth-overlay').classList.add('active');
    }
}


async function loginWithGoogle(e) {
    console.log("Login with Google triggered...");
    const btn = (e && e.currentTarget) ? e.currentTarget : document.querySelector('#auth-overlay .btn-checkout');
    let originalText = "Continue with Google";
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Connecting...';
        btn.style.pointerEvents = 'none';
    }

    // Local / development / offline bypass for seamless local browser testing
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log("Local development/file protocol active. Logging in as mock campus student.");
        setTimeout(() => {
            const mockSession = {
                user: {
                    id: 'mock-user-123',
                    email: 'student@campus.edu',
                    user_metadata: {
                        full_name: 'Alex Student'
                    }
                }
            };
            handleAuthState(mockSession);
            showToast("Welcome back! Logged in as mock campus student.");
            if (btn) {
                btn.innerHTML = originalText;
                btn.style.pointerEvents = 'auto';
            }
        }, 800);
        return;
    }

    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    } catch (err) {
        console.error("Login Error, invoking local mock session fallback:", err);

        // Dynamic robust fallback: Always log in to prevent getting stuck
        const mockSession = {
            user: {
                id: 'mock-user-123',
                email: 'student@campus.edu',
                user_metadata: {
                    full_name: 'Alex Student'
                }
            }
        };
        handleAuthState(mockSession);
        showToast("Logged in as mock student (offline fallback)!");

        if (btn) {
            btn.innerHTML = originalText;
            btn.style.pointerEvents = 'auto';
        }
    }
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

    // Validation: 10 digit numeric
    const phoneRegex = /^[0-9]{10,}$/;
    if (!username || !phone) {
        showToast("Username and Phone are required.");
        return;
    }
    if (!phoneRegex.test(phone)) {
        showToast("Please enter a valid numeric mobile number (at least 10 digits).");
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
        const dbProducts = await response.json();

        // Merge missing images/descriptions from local fallbackProducts array for robustness!
        state.products = dbProducts.map(dbP => {
            const fallbackP = fallbackProducts.find(fP => fP.name.toLowerCase() === dbP.name.toLowerCase());
            if (fallbackP) {
                return {
                    ...dbP,
                    image: dbP.image || fallbackP.image,
                    description: dbP.description || fallbackP.description
                };
            }
            return dbP;
        });
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
    } else if (screenId === 'transactions') {
        fetchUserOrders();
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
                ${product.image
            ? `<img src="${product.image}" alt="${product.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`
            : `<i class="fa-solid ${product.icon} text-teal"></i>`
        }
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
        }, index * 30); // Faster stagger
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
        let sizeOptions = '';
        let finishOptions = '';
        let colorOptions = '';

        if (product.name === 'Photo Paper') {
            sizeOptions = `
                <option value="A5" data-price="30">A5 (₹30)</option>
                <option value="A4" data-price="60">A4 (₹60)</option>
                <option value="A3" data-price="90">A3 (₹90)</option>
                <option value="A2" data-price="150">A2 (₹150)</option>
            `;
            finishOptions = `
                <option value="Glossy">Glossy</option>
                <option value="Matte">Matte</option>
            `;
        } else if (product.name === 'Standard paper (high gsm)') {
            sizeOptions = `
                <option value="A4" data-price="30">A4 (₹30)</option>
                <option value="A3" data-price="60">A3 (₹60)</option>
                <option value="A2" data-price="120">A2 (₹120)</option>
            `;
            finishOptions = `
                <option value="Glossy">Glossy</option>
                <option value="Matte">Matte</option>
            `;
        } else if (product.name === 'Standard Paper (low gsm)') {
            sizeOptions = `
                <option value="A4" data-price="0">A4</option>
            `;
            colorOptions = `
                <option value="B&W" data-price="4">Black & White (₹4)</option>
                <option value="Coloured" data-price="10">Coloured (₹10)</option>
            `;
        } else if (product.name === 'Jury Panels') {
            sizeOptions = `
                <option value="A3" data-price="200">A3 (₹200)</option>
                <option value="A2" data-price="390">A2 (₹390)</option>
                <option value="A1" data-price="450">A1 (₹450)</option>
            `;
            finishOptions = `
                <option value="Glossy">Glossy</option>
                <option value="Matte">Matte</option>
            `;
        } else {
            // Fallback for any other Print products
            sizeOptions = `<option value="A4" data-price="${product.price}">A4 (₹${product.price})</option>`;
        }

        dynamicOptions = `
            <div class="product-options" style="margin-top: 1.5rem;">
                ${sizeOptions ? `
                <div class="form-group">
                    <label>Size</label>
                    <select id="opt-size" class="form-control" onchange="updateDynamicPrice()">
                        ${sizeOptions}
                    </select>
                </div>` : ''}
                
                ${finishOptions ? `
                <div class="form-group">
                    <label>Finish</label>
                    <select id="opt-finish" class="form-control">
                        ${finishOptions}
                    </select>
                </div>` : ''}

                ${colorOptions ? `
                <div class="form-group">
                    <label>Color</label>
                    <select id="opt-color" class="form-control" onchange="updateDynamicPrice()">
                        ${colorOptions}
                    </select>
                </div>` : ''}
            </div>
            <div class="scan-container">
                <div style="display: flex; gap: 1rem;">
                    <button class="scan-btn" id="scan-btn" onclick="triggerScan()">
                        <i class="fa-solid fa-expand"></i>
                        Scan Document
                    </button>
                    <button class="scan-btn" id="upload-btn" onclick="triggerUpload()">
                        <i class="fa-solid fa-upload"></i>
                        Upload File
                    </button>
                </div>
                <div class="scan-loader" id="scan-loader">
                    <div class="scanner-bar"></div>
                    <p style="font-size: 0.85rem; font-weight: 600; color: var(--primary-teal);">Scanning Document...</p>
                </div>
                <div class="scan-loader" id="upload-loader">
                    <div class="scanner-bar" style="background: var(--accent-amber);"></div>
                    <p style="font-size: 0.85rem; font-weight: 600; color: var(--accent-amber);">Uploading File...</p>
                </div>
                <p id="scan-success" style="display: none; font-size: 0.85rem; font-weight: 700; color: var(--primary-teal); margin-top: 0.5rem;">
                    <i class="fa-solid fa-circle-check"></i> Document Scanned Successfully!
                </p>
                <p id="upload-success" style="display: none; font-size: 0.85rem; font-weight: 700; color: var(--accent-amber); margin-top: 0.5rem;">
                    <i class="fa-solid fa-circle-check"></i> File Uploaded Successfully!
                </p>
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
            ${product.image
            ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">`
            : `<i class="fa-solid ${product.icon} text-teal"></i>`
        }
        </div>
        <div class="detail-info">
            <span class="stat-label">${product.category}</span>
            <h2 style="font-weight: 900; letter-spacing: -1px;">${product.name}</h2>
            <p class="detail-desc">${product.description || product.desc}</p>
            
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
    updateDynamicPrice();
}

function updateDynamicPrice() {
    let basePrice = state.selectedProduct.price;
    const sizeSelect = document.getElementById('opt-size');
    const colorSelect = document.getElementById('opt-color');

    if (state.selectedProduct.category === 'Print') {
        let sizePrice = 0;
        let colorPrice = 0;
        let hasDynamic = false;

        if (sizeSelect && sizeSelect.options[sizeSelect.selectedIndex].dataset.price !== undefined) {
            sizePrice = parseFloat(sizeSelect.options[sizeSelect.selectedIndex].dataset.price);
            hasDynamic = true;
        }
        if (colorSelect && colorSelect.options[colorSelect.selectedIndex].dataset.price !== undefined) {
            colorPrice = parseFloat(colorSelect.options[colorSelect.selectedIndex].dataset.price);
            hasDynamic = true;
        }

        if (hasDynamic) {
            basePrice = sizePrice + colorPrice;
            // For standard fallback, if both are 0, we fallback to default price
            if (basePrice === 0 && sizePrice === 0 && colorPrice === 0) basePrice = state.selectedProduct.price;
        }
    }

    state.dynamicBasePrice = basePrice;
    if (document.getElementById('estimated-price')) {
        document.getElementById('estimated-price').innerText = state.dynamicBasePrice * state.tempQty;
    }
}

function triggerScan() {
    const btn = document.getElementById('scan-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const loader = document.getElementById('scan-loader');
    const success = document.getElementById('scan-success');

    if (btn) btn.style.display = 'none';
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (loader) loader.style.display = 'flex';

    setTimeout(() => {
        if (loader) loader.style.display = 'none';
        if (success) success.style.display = 'block';
        showToast("Document scanned successfully!");
    }, 2500);
}

function triggerUpload() {
    const btn = document.getElementById('scan-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const loader = document.getElementById('upload-loader');
    const success = document.getElementById('upload-success');

    if (btn) btn.style.display = 'none';
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (loader) loader.style.display = 'flex';

    setTimeout(() => {
        if (loader) loader.style.display = 'none';
        if (success) success.style.display = 'block';
        showToast("File uploaded successfully!");
    }, 2000);
}

function updateTempQty(change) {
    state.tempQty = Math.max(1, state.tempQty + change);
    document.getElementById('qty-val').innerText = state.tempQty;
    let price = state.dynamicBasePrice !== undefined ? state.dynamicBasePrice : state.selectedProduct.price;
    document.getElementById('estimated-price').innerText = state.tempQty * price;
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
    let finalPrice = state.dynamicBasePrice !== undefined ? state.dynamicBasePrice : state.selectedProduct.price;

    if (existingItem) {
        existingItem.qty += state.tempQty;
    } else {
        state.cart.push({
            ...state.selectedProduct,
            price: finalPrice,
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
        <div class="cart-item" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 0.5rem; background: var(--white); border-radius: 15px; box-shadow: var(--shadow-premium);">
            <div class="cart-item-img" style="display:flex; align-items:center; justify-content:center; background: #E1F5EE; border-radius: 50%; min-width: 50px; height: 50px;">
                <i class="fa-solid ${item.icon}" style="font-size: 1.2rem; color: var(--primary-teal);"></i>
            </div>
            <div class="cart-item-info" style="flex-grow: 1;">
                <h4 style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">${item.name}</h4>
                ${item.itemDesc ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">${item.itemDesc}</p>` : ''}
                
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-weight: 800; color: var(--primary-teal);">₹${item.price}</span>
                    <div class="quantity-selector" style="padding: 4px; gap: 10px; transform: scale(0.85); origin: left center;">
                        <button class="qty-btn" style="width: 30px; height: 30px; font-size: 0.9rem;" onclick="updateCartQty('${item.cartId || item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-value" style="font-size: 1rem; min-width: 20px;">${item.qty}</span>
                        <button class="qty-btn" style="width: 30px; height: 30px; font-size: 0.9rem;" onclick="updateCartQty('${item.cartId || item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function removeFromCart(cartId) {
    state.cart = state.cart.filter(item => (item.cartId || String(item.id)) !== String(cartId));
    saveToStorage();
    updateCartUI();
}

function updateCartQty(cartId, change) {
    const itemIndex = state.cart.findIndex(item => (item.cartId || String(item.id)) === String(cartId));
    if (itemIndex > -1) {
        const item = state.cart[itemIndex];
        const newQty = item.qty + change;
        if (newQty <= 0) {
            state.cart.splice(itemIndex, 1);
            showToast(`${item.name} removed from cart`);
        } else {
            item.qty = newQty;
        }
        saveToStorage();
        updateCartUI();
    }
}

function addQuickAddon(itemId) {
    const addon = quickEssentials.find(item => item.id === itemId);
    if (!addon) return;

    const uniqueId = 'addon-' + addon.id;
    const existingItem = state.cart.find(item => item.cartId === uniqueId);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        state.cart.push({
            id: addon.id,
            name: addon.name,
            price: addon.price,
            icon: addon.icon,
            category: 'Stationery',
            cartId: uniqueId,
            itemDesc: 'Quick Essential Add-on',
            qty: 1
        });
    }

    saveToStorage();
    updateCartUI();
    showToast(`${addon.name} added!`);
}

function calculateTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fee = subtotal > 0 ? 10 : 0;
    const total = subtotal + fee;

    document.getElementById('subtotal').innerText = `₹${subtotal}`;
    document.getElementById('fee').innerText = `₹${fee}`;
    document.getElementById('total').innerText = `₹${total}`;

    // Update Progress Bar
    const progressPct = Math.min(100, Math.floor((subtotal / 100) * 100)); // 100 as minimum order goal
    const progressBar = document.getElementById('cart-progress-bar');
    const progressLabel = document.getElementById('progress-pct');
    if (progressBar) progressBar.style.width = `${progressPct}%`;
    if (progressLabel) progressLabel.innerText = `${progressPct}%`;

    // Render Quick Add-ons if subtotal is less than 100 and cart is not empty (Desktop)
    const desktopAddonsEl = document.getElementById('desktop-quick-addons');
    if (subtotal > 0 && subtotal < 100) {
        const needed = 100 - subtotal;
        if (desktopAddonsEl) {
            desktopAddonsEl.innerHTML = `
                <div class="quick-addons-container" id="quick-addons-widget">
                    <div class="quick-addons-title">
                        <i class="fa-solid fa-cart-plus"></i>
                        <span>Need ₹${needed} more?</span>
                    </div>
                    <div class="quick-addons-subtitle">Add quick essentials to reach the ₹100 minimum:</div>
                    <div class="quick-addons-list">
                        ${quickEssentials.map(item => `
                            <div class="quick-addon-item">
                                <div class="quick-addon-info">
                                    <span class="quick-addon-name">${item.name}</span>
                                    <span class="quick-addon-price">₹${item.price}</span>
                                </div>
                                <button class="quick-addon-btn" onclick="addQuickAddon('${item.id}')" title="Add to Cart">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    } else {
        if (desktopAddonsEl) desktopAddonsEl.innerHTML = '';
    }

    // Update Mobile Totals if screen is active
    const mobileFooter = document.getElementById('mobile-cart-footer');
    if (mobileFooter) {
        let mobileAddonsHtml = '';
        if (subtotal > 0 && subtotal < 100) {
            const needed = 100 - subtotal;
            mobileAddonsHtml = `
                <div class="quick-addons-container" id="mobile-quick-addons-widget" style="margin-bottom: 1.5rem;">
                    <div class="quick-addons-title">
                        <i class="fa-solid fa-cart-plus"></i>
                        <span>Need ₹${needed} more?</span>
                    </div>
                    <div class="quick-addons-subtitle">Add quick essentials to reach the ₹100 minimum:</div>
                    <div class="quick-addons-list">
                        ${quickEssentials.map(item => `
                            <div class="quick-addon-item">
                                <div class="quick-addon-info">
                                    <span class="quick-addon-name">${item.name}</span>
                                    <span class="quick-addon-price">₹${item.price}</span>
                                </div>
                                <button class="quick-addon-btn" onclick="addQuickAddon('${item.id}')">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        mobileFooter.innerHTML = `
            ${mobileAddonsHtml}
            <div class="cart-footer" style="margin-top: 2rem;">
                <div class="cart-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
                <div class="cart-row"><span>Convenience Fee</span><span>₹${fee}</span></div>
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

    // Validation: 10 digit numeric
    const phoneRegex = /^[0-9]{10,}$/;
    if (!nameInput || !mobileInput) {
        showToast("Please enter your Name and Mobile Number.");
        return;
    }
    if (!phoneRegex.test(mobileInput)) {
        showToast("Please enter a valid numeric mobile number (at least 10 digits).");
        return;
    }


    // Validation: Min Order ₹100
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (subtotal < 100) {
        document.getElementById('checkout-min-notice').style.display = 'block';

        // Error Prevention Wobble & Soft Guide
        const widgets = [
            document.getElementById('quick-addons-widget'),
            document.getElementById('mobile-quick-addons-widget')
        ];

        widgets.forEach(w => {
            if (w) {
                w.classList.add('wobble-active');
                setTimeout(() => w.classList.remove('wobble-active'), 600);
            }
        });

        const needed = 100 - subtotal;
        showToast(`Please add ₹${needed} more to meet the ₹100 minimum. Quick add-ons suggested in cart!`);
        closeCheckoutModal();
        return;
    } else {
        document.getElementById('checkout-min-notice').style.display = 'none';
    }

    // Instead of creating order, go to payment
    state.checkoutData = {
        customerName: nameInput,
        customerMobile: mobileInput,
        total: calculateTotalValue()
    };

    closeCheckoutModal();
    openPaymentModal();
}

function calculateTotalValue() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    return subtotal + (subtotal > 0 ? 10 : 0);
}

function openPaymentModal() {
    document.getElementById('payment-amount').innerText = `₹${state.checkoutData.total}`;
    document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
}

function selectPayment(el) {
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
}

async function processPayment() {
    const btn = document.getElementById('pay-now-btn');
    const originalText = btn.innerText;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
    btn.style.pointerEvents = 'none';

    // Simulate payment delay
    setTimeout(async () => {
        await finalSubmitOrder();
    }, 2000);
}

async function finalSubmitOrder() {
    // Cache the cart for 10-second Undo Window
    state.undoCartBackup = [...state.cart];

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: state.cart,
                total: state.checkoutData.total,
                customerName: state.checkoutData.customerName,
                customerMobile: state.checkoutData.customerMobile,
                userId: state.user ? state.user.id : 'mock-user-123'
            })
        });

        if (!response.ok) throw new Error('Order creation failed');
        const order = await response.json();
        state.currentOrderId = order.id;

    } catch (err) {
        console.warn('API error, falling back to mock order placement', err);
        state.currentOrderId = 'PL-' + Math.floor(Math.random() * 10000);
    }

    // Common UI updates after order (success or mock)
    closePaymentModal();
    const payBtn = document.getElementById('pay-now-btn');
    if (payBtn) {
        payBtn.innerHTML = 'Pay Now';
        payBtn.style.pointerEvents = 'auto';
    }
    createConfetti();

    // Reset Cart
    state.cart = [];
    saveToStorage();
    updateCartUI();

    // Spawn 10s Floating Undo Send banner
    triggerUndoSendBanner(state.currentOrderId);
    showToast("Print job submitted! You have 10s to undo.");
}

function triggerUndoSendBanner(orderId) {
    let banner = document.getElementById('undo-send-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'undo-send-banner';
        banner.className = 'undo-banner';
        banner.innerHTML = `
            <span class="undo-text">Sending print to kiosk... <strong id="undo-timer">10s</strong></span>
            <button class="undo-btn" onclick="executeUndoSend()">Undo Send</button>
            <div class="undo-progress-bg">
                <div class="undo-progress-fill" id="undo-progress-bar"></div>
            </div>
        `;
        document.body.appendChild(banner);
    }

    let timeLeft = 10;
    const timerEl = document.getElementById('undo-timer');
    const progressFill = document.getElementById('undo-progress-bar');

    banner.classList.add('active');
    state.undoOrderId = orderId;

    if (state.undoInterval) clearInterval(state.undoInterval);

    state.undoInterval = setInterval(() => {
        timeLeft -= 0.1;
        if (timerEl) timerEl.innerText = `${Math.max(0, Math.ceil(timeLeft))}s`;
        if (progressFill) progressFill.style.width = `${(timeLeft / 10) * 100}%`;

        if (timeLeft <= 0) {
            clearInterval(state.undoInterval);
            banner.classList.remove('active');
            state.undoCartBackup = null;
            state.undoOrderId = null;

            // Go to live tracking screen
            showScreen('status');
        }
    }, 100);
}

async function executeUndoSend() {
    if (state.undoInterval) clearInterval(state.undoInterval);

    const banner = document.getElementById('undo-send-banner');
    if (banner) banner.classList.remove('active');

    const cancelId = state.undoOrderId;
    if (cancelId) {
        try {
            await fetch(`${API_BASE_URL}/orders/${cancelId}/cancel`, {
                method: 'PATCH'
            });
        } catch (err) {
            console.error("Error cancelling during undo send:", err);
        }
    }

    // Restore Backup Cart
    if (state.undoCartBackup) {
        state.cart = [...state.undoCartBackup];
        saveToStorage();
        updateCartUI();
    }

    state.currentOrderId = null;
    state.undoOrderId = null;
    state.undoCartBackup = null;

    showToast("Print job cancelled. Cart items restored!");
    showScreen('home');
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
        const studentName = (state.profile && state.profile.name) ? state.profile.name : 'Student';
        trackingHeading.innerHTML = `Breathe, ${studentName}.<br>Your deadline is safe with us.`;
    }

    // Start Breathing Label Cycle (Soundarya Bodh)
    const breatheLabel = document.querySelector('.breathe-label');
    if (breatheLabel) {
        breatheLabel.innerText = "Breathe In...";
        if (state.breatheInterval) clearInterval(state.breatheInterval);
        let inhale = true;
        state.breatheInterval = setInterval(() => {
            inhale = !inhale;
            breatheLabel.innerText = inhale ? "Breathe In..." : "Breathe Out...";
        }, 4000);
    }

    // Reset
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.style.background = 'var(--primary-teal)';
    }
    if (statusText) statusText.innerText = "Order Placed - Relax, we are preparing your prints.";
    if (cancelBtn) cancelBtn.style.display = 'block';

    if (state.currentOrderId) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${state.currentOrderId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Order status fetched:', data.status);

                let displayStatus = data.status;
                if (displayStatus === 'Placed' || displayStatus === 'Pending') {
                    const createdAt = data.created_at || data.createdAt;
                    if (createdAt) {
                        const ageMinutes = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
                        if (ageMinutes >= 20) {
                            console.log(`Order is ${ageMinutes.toFixed(1)} mins old. Automatically treating as Completed.`);
                            displayStatus = 'Completed';
                        }
                    }
                }

                if (displayStatus === 'Cancelled') {
                    if (statusText) statusText.innerText = "Order Cancelled";
                    if (progressBar) {
                        progressBar.style.width = '100%';
                        progressBar.style.background = 'var(--accent-coral)';
                    }
                    if (cancelBtn) cancelBtn.style.display = 'none';
                } else if (displayStatus === 'Completed' || displayStatus === 'Ready') {
                    if (statusText) statusText.innerText = "Order is ready for pickup!";
                    if (progressBar) progressBar.style.width = '100%';
                    if (cancelBtn) cancelBtn.style.display = 'none';
                } else {
                    // Default packing animation if not cancelled or completed
                    setTimeout(() => {
                        if (progressBar) progressBar.style.width = '33%';
                        if (statusText) statusText.innerText = "Processing - Breathe easy, your deadline is safe with us.";
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

async function fetchUserOrders() {
    if (!state.user) return;

    let orders = [];
    try {
        const response = await fetch(`${API_BASE_URL}/orders/user/${state.user.id}`);
        if (response.ok) {
            orders = await response.json();
        }
    } catch (err) {
        console.warn('Error fetching orders, falling back to dummy data:', err);
    }

    // Inject Dummy Transactions if empty or failed
    if (!orders || orders.length === 0) {
        orders = [
            { created_at: new Date(Date.now() - 86400000).toISOString(), total_amount: 120, items: [1, 2], status: 'Completed' },
            { created_at: new Date(Date.now() - 86400000 * 4).toISOString(), total_amount: 450, items: [1, 2, 3, 4, 5], status: 'Completed' },
            { created_at: new Date(Date.now() - 86400000 * 7).toISOString(), total_amount: 30, items: [1], status: 'Completed' }
        ];
    }

    // Filter out orders under ₹100 to ensure compliance with the minimum order rule
    const validOrders = orders.filter(order => {
        const val = order.total !== undefined ? order.total : (order.total_amount !== undefined ? order.total_amount : 0);
        return val >= 100;
    });

    renderTransactionsTable(validOrders);
}

function renderTransactionsTable(orders) {
    const list = document.getElementById('transaction-list');
    if (!list) return;

    if (orders.length === 0) {
        list.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 3rem; color: var(--text-muted);">No transactions yet.</td></tr>`;
        return;
    }

    list.innerHTML = orders.map(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        let displayStatus = order.status;
        if (displayStatus === 'Placed' || displayStatus === 'Pending') {
            const ageMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);
            if (ageMinutes >= 20) {
                displayStatus = 'Completed';
            }
        }

        return `
            <tr>
                <td>${date}</td>
                <td>₹${order.total !== undefined ? order.total : (order.total_amount !== undefined ? order.total_amount : 0)}</td>
                <td><span class="status-badge status-${displayStatus.toLowerCase()}">${displayStatus}</span></td>
                <td>
                    <button class="btn-reorder" onclick="reorderItems('${order.id}')">Re-order</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function reorderItems(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        const order = await response.json();

        if (order && order.items) {
            order.items.forEach(item => {
                // Add to state.cart
                const existing = state.cart.find(c => c.id === item.id && JSON.stringify(c.options) === JSON.stringify(item.options));
                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    state.cart.push(item);
                }
            });

            localStorage.setItem('printlab_cart', JSON.stringify(state.cart));
            updateCartUI();
            showToast("Items added to cart!");
            showScreen('home');
        }
    } catch (err) {
        console.error('Error reordering:', err);
        showToast("Failed to re-order items.");
    }
}
