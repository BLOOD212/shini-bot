import os from 'os'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Calcolo della latenza di reazione dello Shinigami
    const start = process.hrtime.bigint()
    await conn.readMessages([m.key]).catch(() => {})
    const end = process.hrtime.bigint()

    const latency = (Number(end - start) / 1000000).toFixed(3)
    const uptimeMs = process.uptime() * 1000
    const uptimeStr = clockString(uptimeMs)

    const activationTime = new Date(Date.now() - uptimeMs).toLocaleString('it-IT', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    })

    // Messaggio estetico in puro stile Ryuk
    const message = `✒️ *DEATH NOTE SYSTEM* 
_Misurando il battito del tempo nel mondo degli umani..._
────────────────────────────
𓃦 ⏳ *UPTIME:* \`${uptimeStr}\`
⚡ *LATENZA:* \`${latency} ms\`
📓 *RISVEGLIO:* \`${activationTime}\`
────────────────────────────

💀 *STATO:* Attivo e In Attesa
🍎 *PROPRIETARIO:* Registro di Blood`.trim()

    // Invio con gestione di sicurezza contro il Forbidden (403)
    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: `R Y U K  P E R F O R M A N C E`,
          body: `Tempo di reazione: ${latency}ms`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: false,
          sourceUrl: ''
        }
      }
    }, { quoted: m }).catch(async (err) => {
      // Fallback in testo semplice se i metadati falliscono
      console.error("[Ryuk-Ping] Errore 403, invio testo standard...")
      await conn.sendMessage(m.chat, { text: message }, { quoted: m })
    })

  } catch (e) {
    console.error("[Ryuk-Ping] Errore critico:", e)
  }
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler
