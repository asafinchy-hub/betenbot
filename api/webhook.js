export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ status: "ok" });
    }

    const body = req.body;

    // התעלם מכל הודעה שאינה נכנסת
    const typeWebhook = body?.typeWebhook;
    if (typeWebhook !== "incomingMessageReceived") {
      return res.status(200).json({ skipped: true });
    }

    const chatId = body?.senderData?.chatId;
    const message =
      body?.messageData?.textMessageData?.textMessage ||
      body?.messageData?.extendedTextMessageData?.text ||
      "";

    if (!chatId || !message) {
      return res.status(200).json({ skipped: true });
    }

    const instance = process.env.GREEN_API_INSTANCE;
    const token = process.env.GREEN_API_TOKEN;

    const url = "https://api.green-api.com/waInstance" + instance + "/sendMessage/" + token;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chatId, message: "היי! זה עובד 🔥" }),
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
