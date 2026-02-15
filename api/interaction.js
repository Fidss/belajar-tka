import fetch from "node-fetch";
import {
  InteractionType,
  InteractionResponseType,
  verifyKey
} from "discord-interactions";

// CONFIG
const CONFIG = {
  DISCORD_PUBLIC_KEY: "11434966887f9540aa05888bafc40a1c6ec881ba15c312487adaf3f1f5863197",
  DISCORD_BOT_TOKEN: "MTQ3MDM1NDMyMzIxMTgxNzEwNQ.GgMyCT.Ft3DR12UDYQzhwZExUB00pyd7TpXJ91wPN1vCs",
  TKA_LOG_CHANNEL_ID: "1470355530567647304",
  PHP_API_URL: "http://fidsstesting.infinityfreeapp.com/api"
};

const DURASI = 20 * 60 * 1000; // 20 menit

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];
  const rawBody = JSON.stringify(req.body);

  const isValid = verifyKey(
    rawBody,
    signature,
    timestamp,
    CONFIG.DISCORD_PUBLIC_KEY
  );
  if (!isValid) return res.status(401).send("Invalid request");

  const interaction = req.body;

  // PING
  if (interaction.type === InteractionType.PING) {
    return res.json({ type: InteractionResponseType.PONG });
  }

  // SLASH COMMAND /start
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    if (interaction.data.name === "start") {
      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:
            "📚 **Panel Belajar TKA**\nKlik tombol di bawah untuk mulai belajar 20 menit",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "▶ Mulai Belajar TKA (20 Menit)",
                  style: 3,
                  custom_id: "mulai_tka"
                }
              ]
            }
          ]
        }
      });
    }
  }

  // BUTTON CLICK
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    if (interaction.data.custom_id === "mulai_tka") {

      // 1️⃣ Balas ephemeral
      res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content:
            "⏳ **Timer dimulai!**\nFokus belajar TKA selama 20 menit 💪\n\n_Notifikasi selesai akan dikirim ke #tka-log_",
          flags: 64
        }
      });

      // 2️⃣ Simpan timer ke API PHP
      try {
        await fetch(`${CONFIG.PHP_API_URL}/save.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: interaction.member.user.id,
            selesai: Date.now() + DURASI
          })
        });
      } catch (err) {
        console.error("Gagal simpan timer:", err);
      }

      return;
    }
  }
}
