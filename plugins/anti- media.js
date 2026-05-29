export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antimedia) return false

  // Immunità per Admin, Owner, Sam e il bot stesso
  if (m.fromMe || isAdmin || isOwner || isSam || !isBotAdmin) return false

  // Lascia passare i media "Visualizza una volta"
  if (
    m.message?.viewOnceMessage ||
    m.message?.viewOnceMessageV2 ||
    m.message?.viewOnceMessageV2Extension
  ) {
    return false
  }

  // Rileva Foto o Video normali
  const hasNormalMedia = !!m.message?.imageMessage || !!m.message?.videoMessage
  if (!hasNormalMedia) return false

  // Eliminazione del messaggio dal quaderno
  await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant,
      },
    }).catch(() => {})

  // Messaggio estetico in puro stile Ryuk
  const text = `✒️ *DEATH NOTE SYSTEM* 
_Un file permanente occupa troppo spazio nel mio mondo..._
────────────────────────────
💀 *TARGET:* @${m.sender.split('@')[0]}
🖼️ *RILEVATO:* Media Permanente
🩸 *AZIONE:* Eliminazione Immediata
────────────────────────────

𓃦 ⚠️ *REGOLA DEL QUADERNO:* 
In questo raggio d'azione sono tollerati solo i media *Visualizza una volta*. Gli umani dimenticano in fretta, le immagini permanenti no.

_Gli umani sono davvero interessanti..._ 🍎`

  await conn.sendMessage(m.chat, {
      text,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: 'R Y U K  S E C U R I T Y',
          body: 'Il quaderno ha cancellato la traccia.',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1
        }
      }
    }).catch(() => {})

  return true
}
