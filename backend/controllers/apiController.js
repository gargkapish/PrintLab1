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

    res.json(data);
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


