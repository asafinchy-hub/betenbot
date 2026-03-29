export default async function handler(req, res) {
  try {
    console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));

    if (req.method !== "POST") {
      return res.status(200).json({ status: "ok" });
    }

    const body = req.body;

    const typeWebhook = body.typeWebhook;

    // ❌ מתעלמים מיוצא
    if (
      typeWebhook === "outgoingMessageReceived" ||
      typeWebhook === "outgoingAPIMessageReceived" ||
      typeWebhook === "outgoingMessageStatus"
    ) {
      return res.status(200).json({ ignored: true });
    }

    // 🔥 שולפים הודעה בצורה בטוחה
    let message = "";
    if (body.messageData?.textMessageData?.textMessage) {
      message = body.messageData.textMessageData.textMessage;
    } else if (body.messageData?.extendedTextMessageData?.text) {
      message = body.messageData.extendedTextMessageData.text;
    }

    const chatId = body.senderData?.chatId;

    console.log("Parsed:", { message, chatId, typeWebhook });

    if (!chatId || !message) {
      console.log("No message/chatId → skip");
      return res.status(200).json({ skipped: true });
    }

    // 🔥 שליחה
    const instance = process.env.GREEN_API_INSTANCE;
    const token = process.env.GREEN_API_TOKEN;

    const url = `https://7103.api.greenapi.com/waInstance${instance}/sendMessage/${token}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: chatId,
        message: "🔥 עובד!!!",
      }),
    });

    const text = await resp.text();
    console.log("Green response:", text);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
}
