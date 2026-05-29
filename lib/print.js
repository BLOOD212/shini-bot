import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import { fileURLToPath } from 'url'
import NodeCache from 'node-cache'

const __filename = fileURLToPath(import.meta.url)
const nameCache = new NodeCache({ stdTTL: 600 });
const groupMetaCache = new NodeCache({ stdTTL: 300 });
const errorThrottle = {};
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

// --- TEMA DEATH NOTE (RYUK) ---
const c = {
  blood: chalk.hex('#8B0000').bold,
  death: chalk.hex('#000000').inverse,
  text: chalk.white,
  note: chalk.hex('#A9A9A9'),
  warn: chalk.hex('#FFD700').bold,
  err: chalk.bgHex('#8B0000').white.bold,
  g: chalk.hex('#39FF14'),
  v: chalk.hex('#BC13FE')
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
    if (!chatJid) return;

    let _name = nameCache.get(senderJid) || await conn.getName(senderJid) || '';
    nameCache.set(senderJid, _name);

    const sender = formatPhoneNumber(senderJid, _name)
    let chatName = nameCache.get(chatJid) || await conn.getName(chatJid) || 'Unknown';

    const isOwner = Array.isArray(global.owner) ? global.owner.map(([number]) => number).includes(senderJid.split('@')[0]) : global.owner === senderJid.split('@')[0]
    const isGroup = chatJid.endsWith('@g.us')
    const isAdmin = isGroup ? await checkAdmin(conn, chatJid, senderJid) : false
    const isPremium = global.prems?.includes(senderJid) || false
    const isBanned = global.DATABASE?.data?.users?.[senderJid]?.banned || false
    const user = global.DATABASE?.data?.users?.[senderJid] || { exp: '?', euro: '?' }

    // STRUTTURA LOG
    const top = c.blood('╔' + '═'.repeat(18) + '┫ ') + chalk.white('RYUK 🍎 BOT') + c.blood(' ┣' + '═'.repeat(18) + '╗')
    const mid = c.blood('╟' + '─'.repeat(50) + '╢')
    const bot = c.blood('╚' + '═'.repeat(50) + '╝')
    const L = c.blood('║')

    console.log('\n' + top)
    console.log(`${L} ${c.note('SENDER')}  ${c.blood('➤')} ${c.text(sender)}`)
    console.log(`${L} ${c.note('CHAT')}    ${c.blood('➤')} ${c.text(chatName)} ${isGroup ? c.g('[GROUP]') : c.v('[PVT]')}`)
    console.log(`${L} ${c.note('STATUS')}  ${c.blood('➤')} ${getUserStatus(isOwner, isAdmin, isPremium, isBanned)}`)
    console.log(`${L} ${c.note('TYPE')}    ${c.blood('➤')} ${c.text(formatType(m))} ${getMessageFlags(m)}`)

    if (m.isCommand) {
      console.log(mid)
      console.log(`${L} ${c.warn('⚡ COMMAND')} ${c.blood('➤')} ${chalk.bgHex('#8B0000').white.bold(' ' + getCommand(m.text) + ' ')}`)
    }

    if (user.exp !== '?') {
      console.log(`${L} ${c.g('⭐ ASSETS')}  ${c.blood('➤')} ${c.text(user.exp + ' XP')} ${c.blood('|')} ${c.text(user.euro + ' €')}`)
    }

    const logText = await formatText(m, conn)
    if (logText?.trim()) {
      console.log(mid)
      console.log(`${L} ${c.note('CONTENT')} ${c.blood('➤')} ${c.text(logText)}`)
    }

    logMessageSpecifics(m, L)
    console.log(bot)

  } catch (error) {
    throttleError(' [!] SHINIGAMI ERROR:', error.message, 5000);
  }
}

// --- LOGICA DI SUPPORTO ---

function getUserStatus(isOwner, isAdmin, isPremium, isBanned) {
  if (isBanned) return c.err('× BANNED ×')
  if (isOwner) return chalk.bgHex('#39FF14').black.bold(' 👑 OWNER ')
  let s = []
  if (isAdmin) s.push(c.warn('ADMIN'))
  if (isPremium) s.push(c.v('PREMIUM'))
  return s.length ? s.join(c.blood(' | ')) : c.note('USER')
}

function formatPhoneNumber(jid, name) {
  const num = jid.split('@')[0].split(':')[0]
  return name ? `${name} ${c.note('('+num+')')}` : num
}

function formatType(m) {
  return (m.mtype || 'msg').replace(/Message/gi, '').toUpperCase()
}

function getMessageFlags(m) {
  let f = []
  if (m.quoted) f.push(c.v('↶ REPLY'))
  if (m.forwarded) f.push(c.g('➥ FWD'))
  return f.length ? c.note('(') + f.join(' ') + c.note(')') : ''
}

function getCommand(text) {
  return text ? text.split(/\s/)[0].toUpperCase() : ''
}

async function checkAdmin(conn, chatId, senderId) {
  try {
    const groupMeta = groupMetaCache.get(chatId) || await conn.groupMetadata(chatId)
    groupMetaCache.set(chatId, groupMeta)
    return groupMeta?.participants?.some(p => conn.decodeJid(p.id) === conn.decodeJid(senderId) && p.admin) || false
  } catch { return false }
}

function logMessageSpecifics(m, L) {
  const types = {
    imageMessage: '🖼️ IMAGE',
    videoMessage: '🎥 VIDEO',
    audioMessage: '🎵 AUDIO',
    stickerMessage: '✨ STICKER',
    documentMessage: '📄 DOC'
  }
  if (types[m.mtype]) console.log(`${L} ${c.note('ATTACH')}  ${c.blood('➤')} ${c.g(types[m.mtype])}`)
}

async function formatText(m, conn) {
  let text = (m.text || m.caption || '').trim()
  if (!text) return ''
  return text.length > 100 ? text.slice(0, 100) + '...' : text
}

function throttleError(message, error, delay) {
  console.error(c.err(message), error)
}

watchFile(__filename, () => {
  console.log(chalk.bgHex('#8B0000').white.bold(" 🍎 RYUK: IL REGISTRO È STATO AGGIORNATO "))
})
