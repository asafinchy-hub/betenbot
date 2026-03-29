export default async function handler(req, res) {
  try {
    console.log("🔥 RAW BODY:", JSON.stringify(req.body, null, 2));

    if (req.method !== "POST") {
      return res.status(200).json({ status: "ok" });
    }

    const body = req.body;

    const chatId = body?.senderData?.chatId;

    const message =
      body?.messageData?.textMessageData?.textMessage ||
      body?.messageData?.extendedTextMessageData?.text ||
      "";

    console.log("👉 chatId:", chatId);
    console.log("👉 message:", message);

    if (!chatId || !message) {
      console.log("❌ אין chatId או message → יוצא");
      return res.status(200).json({ skipped: true });
    }

    // 🔥 ENV
    const instance = process.env.GREEN_API_INSTANCE;
    const token = process.env.GREEN_API_TOKEN;

    console.log("👉 instance:", instance);
    console.log("👉 token exists:", !!token);

    // 🔥 URL מתוקן (בלי 7103)
    const url = `https://api.green-api.com/waInstance${instance}/sendMessage/${token}`;

    console.log("👉 sending to:", url);

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
