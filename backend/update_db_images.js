const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fwtmaucsjhlxzwtvrbkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dG1hdWNzamhseHp3dHZyYmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNDg3MDcsImV4cCI6MjA5MjkyNDcwN30.yNWrEFi6cmNJgYLOoWnT6STpGs2pQ-XVm3KVWesB3GU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const imageMap = {
  1: './assets/standard_document_printlab_1777451849704.png',
  2: './assets/sunboard_printlab_1777452528921.png',
  3: './assets/acrylic_sheets_printlab_1777452544512.png',
  4: 'https://images.unsplash.com/photo-1517148818476-75ff57a92744?q=80&w=800',
  5: 'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?q=80&w=800',
  6: './assets/cutter_blade_printlab_1777451955366.png',
  7: './assets/precision_knife_printlab_1777451970860.png',
  8: './assets/cutting_mat_printlab_1777451992827.png',
  9: './assets/drawing_board_printlab_1777452009054.png',
  10: './assets/nose_plier_printlab_1777452024155.png',
  11: './assets/pliers_printlab_1777452091069.png',
  12: './assets/metal_wires_printlab_1777452106497.png',
  13: './assets/mechanical_pencil_printlab_1777452126326.png',
  14: './assets/staedtler_pencils_printlab_1777452144057.png',
  15: './assets/alcohol_markers_printlab_1777452159013.png'
};

async function updateProducts() {
    console.log("Starting Database Sync...");
    for (const [id, image] of Object.entries(imageMap)) {
        const { error } = await supabase
            .from('products')
            .update({ image })
            .eq('id', parseInt(id));
        
        if (error) {
            console.error(`Error updating product ${id}:`, error.message);
        } else {
            console.log(`Product ${id} updated with: ${image}`);
        }
    }
    console.log("Database Sync Complete!");
}

updateProducts();
