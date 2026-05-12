const SUPABASE_URL = 'https://wcqwkagktddvqjxzjxbj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false });
  try {
    const eventName = req.body?.meta?.event_name;
    if (eventName !== 'order_created') return res.status(200).json({ success: true, message: 'Ignored' });
    const email = req.body?.data?.attributes?.user_email || '';
    const productName = req.body?.data?.attributes?.first_order_item?.product_name || '';
    let credits = 25;
    if (productName.includes('Pro')) credits = 70;
    else if (productName.includes('Studio')) credits = 170;
    else if (productName.includes('Agency')) credits = 390;
    await fetch(SUPABASE_URL + '/rest/v1/rpc/add_lemon_credits', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_email: email, p_plan: productName, p_credits: credits })
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
