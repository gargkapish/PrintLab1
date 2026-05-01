const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fwtmaucsjhlxzwtvrbkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dG1hdWNzamhseHp3dHZyYmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNDg3MDcsImV4cCI6MjA5MjkyNDcwN30.yNWrEFi6cmNJgYLOoWnT6STpGs2pQ-XVm3KVWesB3GU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const newProducts = [
    { name: 'Standard Document', price: 2, icon: 'fa-file-lines', image: './assets/standard_document_printlab_1777451849704.png', description: 'High-quality printing for your documents.', category: 'Print' },
    { name: 'Sunboard & Boxboard', price: 50, icon: 'fa-layer-group', image: './assets/sunboard_printlab_1777452528921.png', description: 'Sturdy boards for models and presentations.', category: 'Sheets & Boards' },
    { name: 'Acrylic Sheets', price: 120, icon: 'fa-square-full', image: './assets/acrylic_sheets_printlab_1777452544512.png', description: 'Clear and durable acrylic sheets.', category: 'Sheets & Boards' },
    { name: 'OHP Sheets', price: 10, icon: 'fa-file-image', image: './assets/ohp_sheets.png', description: 'Clear & Coloured OHP sheets.', category: 'Sheets & Boards' },
    { name: 'Cartridge Sheet', price: 5, icon: 'fa-file', image: './assets/cartridge_sheet.png', description: 'Premium cartridge sheets.', category: 'Sheets & Boards' },
    { name: 'Cutter (blade)', price: 20, icon: 'fa-pen-nib', image: './assets/cutter_blade_printlab_1777451955366.png', description: 'Sharp cutter for precise cuts.', category: 'Stationery' },
    { name: 'Precision Knife', price: 45, icon: 'fa-pen', image: './assets/precision_knife_printlab_1777451970860.png', description: 'Craft precision knife.', category: 'Stationery' },
    { name: 'Cutting Mat', price: 150, icon: 'fa-table-cells', image: './assets/cutting_mat_printlab_1777451992827.png', description: 'Self-healing cutting mat.', category: 'Stationery' },
    { name: 'Drawing Board', price: 250, icon: 'fa-clipboard', image: './assets/drawing_board_printlab_1777452009054.png', description: 'Wooden drawing board.', category: 'Stationery' },
    { name: 'Nose Plier', price: 80, icon: 'fa-wrench', image: './assets/nose_plier_printlab_1777452024155.png', description: 'Long nose plier.', category: 'Stationery' },
    { name: 'Pliers', price: 75, icon: 'fa-toolbox', image: './assets/pliers_printlab_1777452091069.png', description: 'Standard pliers.', category: 'Stationery' },
    { name: 'Metal Wires', price: 30, icon: 'fa-bars-staggered', image: './assets/metal_wires_printlab_1777452106497.png', description: 'Aluminum, iron wires for modeling.', category: 'Stationery' },
    { name: 'Mechanical Pencil', price: 40, icon: 'fa-pencil', image: './assets/mechanical_pencil_printlab_1777452126326.png', description: '0.5mm / 0.7mm mechanical pencil.', category: 'Stationery' },
    { name: 'Staedtler Pencil Colors', price: 350, icon: 'fa-palette', image: './assets/staedtler_pencils_printlab_1777452144057.png', description: 'Premium colored pencils.', category: 'Stationery' },
    { name: 'Alcohol Markers', price: 600, icon: 'fa-highlighter', image: './assets/alcohol_markers_printlab_1777452159013.png', description: 'Set of alcohol-based markers.', category: 'Stationery' }
];

async function resetCatalog() {
    console.log("Cleaning old catalog...");
    
    // 1. Delete all existing products (assuming RLS allows or is disabled)
    // We use a filter that matches all rows (like id is not null)
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('name', '___NON_EXISTENT___');

    if (deleteError) {
        console.error("Error cleaning database:", deleteError.message);
        return;
    }

    console.log("Adding new premium items...");
    
    // 2. Insert all new products
    const { error: insertError } = await supabase
        .from('products')
        .insert(newProducts);

    if (insertError) {
        console.error("Error inserting new products:", insertError.message);
    } else {
        console.log("Success! Your 15-item catalog is now live.");
    }
}

resetCatalog();
