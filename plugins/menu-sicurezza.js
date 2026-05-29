import fetch from 'node-fetch'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const userName = m.pushName || 'User'

  // --- PERCORSO IMMAGINE LOCALE ---
  const localImg = join(process.cwd(), 'menu-sicurezza.jpeg')

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid]

  // --- CONFIGURAZIONE MODULI ---
  const securityFeatures = [
    { key: 'antigore', name: '🚫 Antigore', desc: 'Blocca contenuti splatter/gore' },
    { key: 'modoadmin', name: '🛡️ Soloadmin', desc: 'Solo gli admin usano il bot' },
    { key: 'antivoip', name: '📞 Antivoip', desc: 'Rifiuta chiamate nel gruppo' },
    { key: 'antilink', name: '🔗 Antilink', desc: 'Elimina link gruppi WhatsApp' },
    { key: 'antilinksocial', name: '🌐 Antilinksocial', desc: 'Elimina link social (IG, TT, ecc)' },
    { key: 'antitrava', name: '🧱 Antitrava', desc: 'Blocca crash/messaggi lunghi' },
    { key: 'antinuke', name: '☢️ Antinuke', desc: 'Sicurezza avanzata del gruppo' },
    { key: 'antiviewonce', name: '👁️ Antiviewonce', desc: 'Invia messaggi visualizza una volta' },
    { key: 'antispam', name: '🛑 Antispam', desc: 'Blocca spam di comandi' }
  ]

  const automationFeatures = [
    { key: 'ai', name: '🧠 IA', desc: 'Intelligenza artificiale attiva' },
    { key: 'vocali', name: '🎤 Siri', desc: 'Risponde con audio ai messaggi' },
    { key: 'reaction', name: '😎 Reazioni', desc: 'Reazioni automatiche ai messaggi' },
    { key: 'autolevelup', name: '⬆️ Autolivello', desc: 'Messaggio di livello automatico' },
    { key: 'welcome', name: '👋 Welcome', desc: 'Messaggio di benvenuto' }
  ]

  const ownerFeatures = [
    { key: 'anticall', name: '📵 Antichiamate', desc: 'Blocca chiamate al bot (Global)' },
    { key: 'antiprivate', name: '🔒 Antiprivato', desc: 'Blocca uso del bot in privato' },
    { key: 'solocreatore', name: '👑 Solo Creatore', desc: 'Bot risponde solo all\'owner' }
  ]

  // --- GENERAZIONE MENU ---
  if (!args.length || /menu|help/i.test(args[0])) {
    let text = `
✒️ *DEATH NOTE SYSTEM* 
_L'umano il cui nome è scritto su questo menu..._
────────────────────────────
💀 *USER:* ${userName}
⏱️ *STATUS:* Operational
🍎 *REGISTRY:* Security Module
────────────────────────────

*PANNELLO DI CONTROLLO:*
  _Modifica i vincoli del quaderno:_
  🩸 ${_p}*attiva* <nome>
  🩸 ${_p}*disattiva* <nome>


  𓃦 ── SECURITY SYSTEM ── 𓃥
  ━━━━━━━━━━━━━━━━━━━━━━━━
${securityFeatures.map(f => `  📓 *${f.name}*\n  _${f.desc}_\n  ↳ Codice: *${f.key}*\n`).join('\n')}  ━━━━━━━━━━━━━━━━━━━━━━━━


  𓃦 ── SYSTEM MAIN ── 𓃥
  ━━━━━━━━━━━━━━━━━━━━━━━━
${automationFeatures.map(f => `  🍎 *${f.name}*\n  _${f.desc}_\n  ↳ Codice: *${f.key}*\n`).join('\n')}  ━━━━━━━━━━━━━━━━━━━━━━━━

_Gli umani sono davvero interessanti..._ 🍎`

    // Invio con immagine locale
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
    return
  }

  // --- LOGICA DI ATTIVAZIONE ---
  let isEnable = !/disattiva|off|0/i.test(command)
  let type = args[0].toLowerCase()
  let status = isEnable ? 'ATTIVATO 📓' : 'DISATTIVATO ❌'

  let dbKey = type
  if (type === 'antilink') dbKey = 'antiLink'
  if (type === 'antilinksocial') dbKey = 'antiLink2'
  if (type === 'antiviewonce') dbKey = 'antioneview'
  if (type === 'antiprivate') dbKey = 'antiPrivate'
  if (type === 'solocreatore') dbKey = 'soloCreatore'

  const isSecurity = securityFeatures.some(f => f.key.toLowerCase() === type)
  const isAuto = automationFeatures.some(f => f.key.toLowerCase() === type)
  const isOwnerKey = ownerFeatures.some(f => f.key.toLowerCase() === type)

  if (isSecurity || isAuto) {
    if (!m.isGroup && !isOwner) return m.reply('❌ Questo vincolo appartiene solo ai gruppi.')
    if (m.isGroup && !isAdmin && !isOwner) return m.reply('❌ Solo gli Admin possono scrivere su questa pagina.')
    chat[dbKey] = isEnable
  } else if (isOwnerKey) {
    if (!isOwner) return m.reply('❌ Questo potere appartiene solo al proprietario del quaderno.')
    bot[dbKey] = isEnable
  } else {
    return m.reply('❌ Traccia non trovata nel Death Note.')
  }

  await m.react(isEnable ? '📓' : '❌')
  m.reply(`𓃦 *REGISTRO AGGIORNATO* 𓃥\n\nModulo: *${type.toUpperCase()}*\nStato: *${status}*\n\n_Esecuzione completata._ 🍎`)
}

handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable']
export default handler
