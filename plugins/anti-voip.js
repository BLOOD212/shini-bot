let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antivoip) return false

  // Se lo Shinigami non ha i poteri da admin, non può giustiziare l'anima
  if (!isBotAdmin) return false

  let decodedSender = conn.decodeJid(m.sender)
  let senderNumber = decodedSender.split('@')[0].split(':')[0]
  let domain = decodedSender.split('@')[1]
  let decodedBotJid = conn.decodeJid(conn.user.jid)

  // Immunità: Bot stesso, Admin, Owner, Sam e account LID (nascosti)
  if (decodedSender === decodedBotJid || isAdmin || isOwner || isSam || domain === 'lid') return false

  // Controllo prefisso internazionale (Solo +39 consentito nel registro italiano)
  if (!senderNumber.startsWith('39')) {

    // Cancella la traccia del messaggio spurio dal gruppo
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})

    const utente = formatPhoneNumber(senderNumber, true)

    // Messaggio estetico in puro stile Ryuk
    const text = `✒️ *DEATH NOTE SYSTEM* 
_Un'anima estranea ha tentato di infiltrarsi oltre i confini consentiti..._
────────────────────────────
💀 *TARGET:* ${utente}
🌍 *PROVENIENZA:* Estera / VOIP Anonimo
❌ *SANZIONE:* CANCELLAZIONE IMMEDIATA
────────────────────────────

𓃦 🩸 *RESTRIZIONE DI RYUK:*
In questo spazio non è ammesso il nomadismo digitale. L'accesso è blindato e concesso esclusivamente ai numeri nativi italiani (+39). 

_Il tuo prefisso ha scritto la tua fine._ 🍎`

    await conn.sendMessage(m.chat, { 
      text, 
      mentions: [decodedSender],
      contextInfo: {
        externalAdReply: {
          title: 'R Y U K  B O R D E R  C O N T R O L',
          body: 'Accesso negato: Traccia estera estirpata.',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })

    // Espulsione immediata dell'utente straniero dal gruppo
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {})
    return true
  }

  return false
}

function formatPhoneNumber(number, includeAt = false) {
  if (!number || number === '?' || number === 'sconosciuto') return includeAt ? '@Sconosciuto' : 'Sconosciuto';
  return includeAt ? '@' + number : number;
}

export default handler;
