import { promises as fs } from 'fs'
import { join } from 'path'

const emojicategoria = {
  info: '🍎',
  main: '📓',
  sicurezza: '❌'
}

let tags = {
  main: '𓃦 ── SYSTEM MAIN ── 𓃥',
  info: '𓃦 ── DATABASE INFO ── 𓃥'
}

const defaultMenu = {
  testoInizio: `
✒️ *DEATH NOTE SYSTEM* 
_L'umano il cui nome è scritto su questo menu..._
────────────────────────────
💀 *USER:* %name
⏱️ *UPTIME:* %uptime
🍎 *TOTAL USERS:* %totalreg Utenti Registrati
────────────────────────────

*PANNELLO DI CONTROLLO:*`.trimStart(),

  header: '\n\n  %category\n  ━━━━━━━━━━━━━━━━━━━━━━━━',
  body: '  🩸 %cmd',
  footer: '\n  ━━━━━━━━━━━━━━━━━━━━━━━━',
  testoFine: `\n\n_Gli umani sono davvero interessanti..._ 🍎`,
}

const localImg = './menu-principale.jpeg'

const bldButtons = [
  { title: "🛡️ SICUREZZA", command: "attiva" },
  { title: "🎮 GIOCHI", command: "menugiochi" },
  { title: "🤖 IA", command: "menuia" },
  { title: "👥 GRUPPO", command: "menugruppo" },
  { title: "📥 DOWNLOAD", command: "menudownload" },
  { title: "🛠️ STRUMENTI", command: "menustrumenti" },
  { title: "⭐ PREMIUM", command: "menupremium" },
  { title: "💰 EURO", command: "menueuro" }
]

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let name = await conn.getName(m.sender) || 'User'
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users).length

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p
    }))

    let menuTags = Object.keys(tags)

    let _text = [
      defaultMenu.testoInizio,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help
            .filter(menu => menu.tags.includes(tag))
            .map(menu => menu.help.map(h => 
              defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? h : _p + h)
            ).join('\n')),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.testoFine
    ].join('\n')

    let text = _text.replace(/%name/g, name)
                    .replace(/%uptime/g, uptime)
                    .replace(/%totalreg/g, totalreg)

    const buttons = bldButtons.map(btn => ({
      buttonId: _p + btn.command,
      buttonText: { displayText: btn.title },
      type: 1
    }))

    let imageBuffer = null
    try {
      imageBuffer = await fs.readFile(localImg)
    } catch (e) {
      console.log("❌ [RYUK] Pergamena visiva 'menu-principale.jpeg' smarrita.")
    }

    await conn.sendMessage(m.chat, {
      ...(imageBuffer ? { image: imageBuffer } : {}),
      caption: text.trim(),
      footer: "R Y U K  P A G E",
      buttons: buttons,
      headerType: 4,
      viewOnce: true
    }, { quoted: m })

    await m.react('📓')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Quaderno bruciato: ${e.message}`, m)
  }
}

handler.help = ['menu']
handler.command = ['menu', 'help']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
