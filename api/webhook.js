async function sendMessage(chatId, text) {
  const instance = process.env.GREEN_API_INSTANCE;
  const token = process.env.GREEN_API_TOKEN;
  const url = `https://api.green-api.com/waInstance${instance}/sendMessage/${token}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message: text }),
  });

  return resp.json();
}

export default async function handler(req, res) {
  try {
    console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));

    if (req.method !== "POST") {
      return res.status(200).json({ status: "ok" });
    }

    const typeWebhook = req.body?.typeWebhook;

    if (
      typeWebhook === "outgoingMessageReceived" ||
      typeWebhook === "outgoingAPIMessageReceived" ||
      typeWebhook === "outgoingMessageStatus"
    ) {
      return res.status(200).json({ success: true });
    }

    const message =
      req.body?.messageData?.textMessageData?.textMessage ||
      req.body?.messageData?.extendedTextMessageData?.text ||
      "";

    const chatId = req.body?.senderData?.chatId;

    if (!chatId || !message) {
      return res.status(200).json({ success: true });
    }

    await sendMessage(chatId, "היי! זה עובד 🔥");

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
