import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import { fileURLToPath } from 'url'
import NodeCache from 'node-cache'

const __filename = fileURLToPath(import.meta.url)
const nameCache = new NodeCache({ stdTTL: 600 });
const groupMetaCache = new NodeCache({ stdTTL: 300 });

// --- ESTETICA DEATH NOTE ---
const c = {
  blood: chalk.hex('#8B0000').bold,
  death: chalk.hex('#000000').inverse,
  text: chalk.white,
  note: chalk.hex('#A9A9A9'),
  warn: chalk.hex('#FFD700').bold,
  err: chalk.bgHex('#8B0000').white.bold
}

export default async function (m, conn = { user: {} }) {
  if (!global.messageUpdateListenerSet) {
    conn.ev.on('messages.update', (updates) => {
      for (const update of updates) {
        if (update.update.message?.editedMessage) {
          console.log(c.blood(' ✒️ SHINIGAMI EYE '), c.text('Un nome è stato corretto nel registro.'));
        }
      }
    })
    global.messageUpdateListenerSet = true
  }

  if (!m || m.key?.fromMe) return

  try {
    const senderJid = conn.decodeJid(m.sender)
    const chatJid = conn.decodeJid(m.chat || '')
    let _name = nameCache.get(senderJid) || await conn.getName(senderJid) || '';
    nameCache.set(senderJid, _name);
    
    const sender = _name ? `${_name} ${c.note('('+senderJid.split('@')[0]+')')}` : senderJid.split('@')[0]
    let chatName = nameCache.get(chatJid) || await conn.getName(chatJid) || 'Unknown';

    const isOwner = Array.isArray(global.owner) ? global.owner.map(([number]) => number).includes(senderJid.split('@')[0]) : global.owner === senderJid.split('@')[0]
    const isGroup = chatJid.endsWith('@g.us')
    const isAdmin = isGroup ? await checkAdmin(conn, chatJid, senderJid) : false
    const isPremium = global.prems?.includes(senderJid) || false
    const isBanned = global.DATABASE?.data?.users?.[senderJid]?.banned || false

    const top = c.blood('┌─── ') + chalk.white('RYUK - DEATH NOTE LOG') + c.blood(' ───┐')
    const mid = c.blood('├──────────────────────────────────────┤')
    const bot = c.blood('└──────────────────────────────────────┘')
    const L = c.blood('│')

    console.log('\n' + top)
    console.log(`${L} ${c.note('HUMAN')}    ${c.blood('➤')} ${c.text(sender)}`)
    console.log(`${L} ${c.note('REALM')}    ${c.blood('➤')} ${c.text(chatName)} ${isGroup ? c.blood('[GROUP]') : c.note('[PVT]')}`)
    console.log(`${L} ${c.note('STATUS')}   ${c.blood('➤')} ${getStatus(isOwner, isAdmin, isPremium, isBanned)}`)
    
    // Gestione Comandi
    if (m.isCommand) {
      console.log(mid)
      console.log(`${L} ${c.blood('⚡ COMMAND')} ${c.blood('➤')} ${chalk.bgWhite.black.bold(' ' + (m.text?.split(/\s/)[0].toUpperCase() || 'CMD') + ' ')}`)
    }

    // Gestione Allegati (Missing piece)
    const attachType = getAttachType(m.mtype)
    if (attachType) {
      console.log(`${L} ${c.note('ATTACH')}   ${c.blood('➤')} ${c.warn(attachType)}`)
    }

    // Testo
    const text = (m.text || m.caption || '').trim()
    if (text) {
      console.log(mid)
      console.log(`${L} ${c.note('ENTRY')}    ${c.blood('➤')} ${c.text(text.length > 40 ? text.slice(0, 40) + '...' : text)}`)
    }
    console.log(bot)

  } catch (e) {
    console.error(c.err(' [!] ERRORE NEL REGISTRO SHINIGAMI '), e.message);
  }
}

// --- FUNZIONI DI SUPPORTO ---

function getStatus(o, a, p, b) {
  if (b) return c.blood('『 BANNED 』')
  if (o) return chalk.bgHex('#8B0000').white.bold(' 🍎 OWNER ')
  let s = []
  if (a) s.push(c.text('ADMIN'))
  if (p) s.push(c.note('PREMIUM'))
  return s.length ? s.join(c.blood(' | ')) : c.note('HUMAN')
}

function getAttachType(type) {
  const types = {
    imageMessage: '🖼️ VISUAL',
    videoMessage: '🎥 RECORDING',
    audioMessage: '🎵 SOUND',
    stickerMessage: '✨ SHINIGAMI STICKER',
    documentMessage: '📄 FILE'
  }
  return types[type] || null
}

async function checkAdmin(conn, chatId, senderId) {
  try {
    const meta = groupMetaCache.get(chatId) || await conn.groupMetadata(chatId)
    groupMetaCache.set(chatId, meta)
    return meta?.participants?.some(p => conn.decodeJid(p.id) === conn.decodeJid(senderId) && p.admin) || false
  } catch { return false }
}

watchFile(__filename, () => {
  console.log(c.blood('\n[!] RYUK: IL REGISTRO È STATO RISCRITTO DAL MONDO DEGLI SHINIGAMI.'))
})
