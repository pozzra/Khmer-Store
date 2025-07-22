import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());  // Enable CORS for all routes
app.use(express.json());

const BOT_TOKEN = '7409975411:AAH92HER0iGfGGR9Lsr3227J-ORwkPgF_NM';
const ADMIN_CHAT_ID = '1208908312';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/send-order', async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    const { cart, user, phone, name } = req.body;

    if (!cart || !user || !phone || !name) {
      throw new Error('Missing required fields');
    }

    // Create a unique Order ID and a timestamp
    const orderId = `#${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toLocaleString('en-US', { hour12: false });

    // Use only the form input for name and phone. Only use Telegram username if name is empty.
    const displayName = name && name.trim() ? name : (user?.username ? `@${user.username}` : 'Unknown');
    const displayPhone = phone && phone.trim() ? phone : 'Unknown';

    let adminMessage = `🛒 *New Order!* ${orderId}\n`;
    adminMessage += `*Timestamp:* ${timestamp}\n\n`;
    adminMessage += `*Name:* ${displayName}\n`;
    adminMessage += `*Phone:* ${displayPhone}\n`;
    if (!name || !name.trim()) {
      adminMessage += `*Telegram:* @${user?.username || 'Unknown'}\n`;
    }
    adminMessage += `\n*Order Details:*\n${cart.map(item => `- ${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`).join('\n')}`;
    adminMessage += `\n\n*Total: $${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}*`;

    const userMessage = `✅ *Your order is confirmed!* ✅\n\nYour Order ID is: *${orderId}*\n\nHere's your summary:\n${cart.map(item => `- ${item.name} x ${item.quantity}`).join('\n')}\n\n*Total: $${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}*`;

    const sendToAdmin = fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: adminMessage, parse_mode: 'Markdown' }),
    });

    const sendToUser = fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: user.id, text: userMessage, parse_mode: 'Markdown' }),
    });

    const [adminResponse, userResponse] = await Promise.all([sendToAdmin, sendToUser]);
    const adminData = await adminResponse.json();
    const userData = await userResponse.json();
    
    if (!adminResponse.ok || !userResponse.ok) {
      throw new Error('Failed to send messages to Telegram');
    }

    console.log('Telegram API responses:', { adminData, userData });
    res.json({ success: true, admin: adminData, user: userData });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Telegram proxy running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
}); 