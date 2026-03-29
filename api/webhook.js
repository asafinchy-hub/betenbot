export default async function handler(req, res) {
  try {
    console.log("🔥 RAW BODY:", JSON.stringify(req.body, null, 2));

    const body = req.body;

    const chatId = body?.senderData?.chatId;

    const message =
      body?.messageData?.textMessageData?.textMessage ||
      body?.messageData?.extendedTextMessageData?.text ||
      "";

    console.log("👉 chatId:", chatId);
    console.log("👉 message:", message);

    // 🚨 אם אין הודעה או chatId - נצא
    if (!chatId || !message) {
      console.log("❌ אין נתונים → יוצא");
      return res.status(200).end();
    }

    // 🚀 שולחים תשובה תמיד
    const instance = process.env.GREEN_API_INSTANCE;
    const token = process.env.GREEN_API_TOKEN;

    const url = `https://7103.api.greenapi.com/waInstance${instance}/sendMessage/${token}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: chatId,
        message: "🔥 כןןן זה עובד!!!",
      }),
    });

    const text = await response.text();
    console.log("📩 Green API response:", text);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("💥 ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
