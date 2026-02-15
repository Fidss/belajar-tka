import fetch from "node-fetch";

const CONFIG = {
  DISCORD_BOT_TOKEN: "MTQ3MDM1NDMyMzIxMTgxNzEwNQ.GgMyCT.Ft3DR12UDYQzhwZExUB00pyd7TpXJ91wPN1vCs",
  TKA_LOG_CHANNEL_ID: "1470355530567647304",
  PHP_API_URL: "http://fidsstesting.infinityfreeapp.com/api"
};

export default async function handler(req, res) {
  try {
    // Ambil timer expired dari PHP API
    const timers = await fetch(`${CONFIG.PHP_API_URL}/get_expired.php`)
      .then(r => r.json());

    for (const t of timers) {
      // Kirim notifikasi ke Discord
      await fetch(
        `https://discord.com/api/v10/channels/${CONFIG.TKA_LOG_CHANNEL_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${CONFIG.DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: `✅ <@${t.user_id}> berhasil menyelesaikan **20 menit belajar** 💪🔥`
          })
        }
      );

      // Hapus timer dari PHP API
      await fetch(`${CONFIG.PHP_API_URL}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id })
      });
    }

    res.json({ success: true, count: timers.length });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
}
