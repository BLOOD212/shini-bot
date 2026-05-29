let handler = m => m

async function addWarn(conn, m, target, reason, isBotAdmin) {
  if (!global.db.data.users[target]) global.db.data.users[target] = {}
  const user = global.db.data.users[target]
  if (!user.warns) user.warns = {}
  if (typeof user.warns[m.chat] !== 'number') user.warns[m.chat] = 0

  user.warns[m.chat] += 1
  const warns = user.warns[m.chat]
  const tag = target.split('@')[0]

  if (warns >= 3) {
    user.warns[m.chat] = 0
    await conn.sendMessage(m.chat, {
      text: `✒️ *DEATH NOTE SYSTEM* \n_Il limite della pazienza globale è scaduto..._\n────────────────────────────\n💀 *TARGET:* @${tag}\n🚫 *VIOLAZIONE:* Richiamo di massa reiterato\n🩸 *SANZIONE:* CANCELLAZIONE (Espulsione)\n────────────────────────────\n\n_Il tuo nome è stato scritto sulla pagina._ 🍎`,
      mentions: [target]
    }).catch(() => {})

    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [target], 'remove').catch(() => {})
    }
    return
  }

  await conn.sendMessage(m.chat, {
    text: `✒️ *DEATH NOTE SYSTEM* \n_Un tentativo di risveglio forzato ha violato il registro..._\n────────────────────────────\n💀 *TARGET:* @${tag}\n🔗 *RILEVATO:* ${reason}\n🩸 *AMMONIZIONE:* ${warns}/3\n❌ *AZIONE:* Rimozione Immediata\n────────────────────────────\n\n𓃦 _Non disturbare la quiete degli umani con questi trucchetti._ 🍎`,
    mentions: [target]
  }).catch(() => {})
}

handler.before = async function (m, { conn, participants, isAdmin, isOwner, isSam, isBotAdmin }) {
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return false
  if (!m.message) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antitagall) return true

  const sender = m.sender
  if (!sender) return true

  const botJid = conn.decodeJid(conn.user?.jid || conn.user?.id)
  if (sender === botJid) return true
  if (isAdmin || isOwner || isSam) return true

  const contextMentioned =
    m.msg?.contextInfo?.mentionedJid ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    m.message?.imageMessage?.contextInfo?.mentionedJid ||
    m.message?.videoMessage?.contextInfo?.mentionedJid ||
    m.message?.documentMessage?.contextInfo?.mentionedJid ||
    m.message?.audioMessage?.contextInfo?.mentionedJid ||
    m.message?.stickerMessage?.contextInfo?.mentionedJid ||
    []

  const mentionedRaw = [...(m.mentionedJid || []), ...(contextMentioned || [])]
  const mentioned = (mentionedRaw).map(j => conn.decodeJid(j))

  if (!mentioned.length) return true

  const uniqueMentioned = [...new Set(mentioned)].filter(j => j && j !== botJid)
  const groupSize = Array.isArray(participants) && participants.length ? participants.length : 0

  if (!groupSize) return true

  // Soglia di attivazione: se le menzioni superano il 70% dei membri del gruppo
  const ratio = uniqueMentioned.length / groupSize
  if (ratio <= 0.7) return true

  // Rimozione immediata del messaggio abusivo dal registro
  if (isBotAdmin) {
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
  }

  // Esecuzione sanzione e inserimento nel quaderno
  await addWarn(conn, m, sender, `Tag di massa abusivo (${uniqueMentioned.length}/${groupSize} anime)`, !!isBotAdmin)

  return false
}

export default handler
