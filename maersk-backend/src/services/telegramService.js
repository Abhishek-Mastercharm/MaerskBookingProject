import axios from 'axios';

/**
 * Send a message via Telegram Bot
 * @param {string} message - The message text to send.
 */
export const sendTelegramMessage = async (message) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('⚠️ Telegram Bot Token or Chat ID is missing. Notification not sent.');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML' // Allow some basic HTML formatting like <b>, <i>, etc.
    });
    console.log('✅ Telegram notification sent successfully!');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error.response?.data || error.message);
  }
};

/**
 * Format a shipment update and send it to Telegram.
 * @param {Object} updateData - Information about the shipment update.
 */
export const sendShipmentUpdateAlert = async (updateData) => {
  // Destructure with default values just in case
  const {
    invoice = 'N/A',
    booking = 'N/A',
    shippingLine = 'N/A',
    vessel = 'N/A',
    voyage = 'N/A',
    status = 'N/A',
    loadingPort = 'N/A',
    destination = 'N/A',
    eta = 'N/A',
    updated = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } = updateData;

  const messageText = `
🚢 <b>Shipment Update</b>

<b>Invoice:</b>
${invoice}

<b>Booking:</b>
${booking}

<b>Shipping Line:</b>
${shippingLine}

<b>Vessel:</b>
${vessel}

<b>Voyage:</b>
${voyage}

<b>Status:</b>
${status}

<b>Loading Port:</b>
${loadingPort}

<b>Destination:</b>
${destination}

<b>ETA:</b>
${eta}

<b>Updated:</b>
${updated}
  `.trim();

  await sendTelegramMessage(messageText);
};
