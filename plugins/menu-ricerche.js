import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

const defaultMenu = {
  before: `
✒️ *DEATH NOTE SYSTEM* 
_L'umano il cui nome è scritto su questo menu..._
────────────────────────────
💀 *USER:* %name
⏱ *UPTIME:* %uptime
🍎 *REGISTRY:* Search Module
────────────────────────────

*PANNELLO DI CONTROLLO:*`.trimStart(),

  header: '\n\n  𓃦 ── %category ── 𓃥\n  ━━━━━━━━━━━━━━━━━━━━━━━━',
  body: '  🩸 %cmd',
  footer: '\n  ━━━━━━━━━━━━━━━━━━━━━━━━',
  after: `\n\n_Gli umani sono davvero interessanti..._ 🍎`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'ricerca': 'DATABASE INFO'
  }

  try {
    let name = await conn.getName(m.sender) || 'User'
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let user = global.db.data.users[m.sender]
    let { level, role, eris } = user || {}

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body.replace(/%cmd/g, menu.prefix ? help : _p + help)
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
      name, eris, level, role, uptime,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await conn.sendMessage(m.chat, { 
      text: text.trim(), 
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "R Y U K  P A G E"
        }
      }
    }, { quoted: m })

    await m.react('📓')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Errore nel registro delle ricerche.', m)
  }
}

handler.help = ['menuricerche']
handler.tags = ['menu']
handler.command = ['menuricerche', 'menur', 'searchmenu']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
