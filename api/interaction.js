import fetch from "node-fetch";
import {
  InteractionType,
  InteractionResponseType,
  verifyKey
} from "discord-interactions";

/*
=====================================
ISI CONFIG DI SINI (TANPA ENV)
=====================================
*/
const CONFIG = {
  DISCORD_PUBLIC_KEY: "11434966887f9540aa05888bafc40a1c6ec881ba15c312487adaf3f1f5863197",
  DISCORD_BOT_TOKEN: "MTQ3MDM1NDMyMzIxMTgxNzEwNQ.GgMyCT.Ft3DR12UDYQzhwZExUB00pyd7TpXJ91wPN1vCs",
  TKA_LOG_CHANNEL_ID: "1470355530567647304"
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

  // Ping dari Discord
  if (interaction.type === InteractionType.PING) {
    return res.json({ type: InteractionResponseType.PONG });
  }

  // Slash command /start
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    if (interaction.data.name === "start") {
      return res.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "📚 **Panel Belajar TKA**\nKlik tombol untuk mulai timer 20 menit",
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

  // Button click
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    if (interaction.data.custom_id === "mulai_tka") {

      // Response cepat (< 3 detik)
      res.json({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: { flags: 64 }
      });

      // Timer 20 menit
      setTimeout(async () => {
        await fetch(
          `https://discord.com/api/v10/channels/${CONFIG.TKA_LOG_CHANNEL_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bot ${CONFIG.DISCORD_BOT_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              content: `✅ **TKA SELESAI**\n<@${interaction.member.user.id}> berhasil menyelesaikan 20 menit belajar 💪`
            })
          }
        );
      }, DURASI);

      return;
    }
  }
}
