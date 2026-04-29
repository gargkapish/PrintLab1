const supabase = require('../services/supabase');

exports.saveUser = async (req, res) => {
  try {
    const { id, email, name, phone } = req.body;
    
    if (!id || !email) {
      return res.status(400).json({ error: 'Missing required user fields' });
    }

    const { data, error } = await supabase
      .from('users')
      .upsert({ id, email, name, phone })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Failed to save user profile' });
  }
};


exports.getProducts = async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;

    // Map images to ensure they match our local assets
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

    const productsWithImages = data.map(p => ({
      ...p,
      image: imageMap[p.id] || p.image
    }));

    res.json(productsWithImages);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};


exports.createOrder = async (req, res) => {
  try {
    const { items, total, customerName, customerMobile, userId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{ 
        items, 
        total,
        customer_name: customerName,
        customer_mobile: customerMobile,
        user_id: userId
      }])
      .select()
      .single();


    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order not found' });
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
};


