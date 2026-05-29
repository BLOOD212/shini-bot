import { xpRange } from '../lib/levelling.js'
import { join } from 'path'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-ia.jpeg');

const emojicategoria = {
  iatesto: '📓',
  iaaudio: '🍎',
  iaimmagini: '❌'
}

let tags = {
  'iatesto': '𓃦 ── IA TESTO ── 𓃥',
  'iaaudio': '𓃦 ── IA AUDIO ── 𓃥',
  'iaimmagini': '𓃦 ── IA IMMAGINI ── 𓃥'
}

const defaultMenu = {
  before: `
✒️ *DEATH NOTE SYSTEM* 
_L'umano il cui nome è scritto su questo menu..._
────────────────────────────
💀 *USER:* %name
🏆 *LEVEL:* %level
⏱️ *UPTIME:* %uptime
🍎 *TOTAL USERS:* %totalreg Utenti Registrati
────────────────────────────

*PANNELLO DI CONTROLLO:*`.trimStart(),

  header: '\n\n  %category\n  ━━━━━━━━━━━━━━━━━━━━━━━━',
  body: '  🩸 %cmd',
  footer: '\n  ━━━━━━━━━━━━━━━━━━━━━━━━',
  after: `\n\n_Gli umani sono davvero interessanti..._ 🍎`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let { level = 0, role = 'User' } = global.db.data.users[m.sender] || {}
    let name = await conn.getName(m.sender) || 'Utente'
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users).length

    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags)
      .filter(plugin => ['iatesto', 'iaaudio', 'iaimmagini'].some(t => plugin.tags.includes(t)))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin
      }))

    let menuTags = Object.keys(tags)
    let _text = [
      defaultMenu.before,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(cmd => {
              return defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, level, uptime, totalreg
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('📓')

    // --- INVIO CON IMMAGINE E CONTEXT GRUPPO ---
    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "R Y U K  P A G E"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Errore nel caricamento del registro delle intelligenze.', m)
  }
}

handler.help = ['menuia']
handler.tags = ['menu']
handler.command = ['menuia', 'menuai']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
