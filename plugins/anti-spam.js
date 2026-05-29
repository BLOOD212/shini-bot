import crypto from 'crypto';

const uzer = new Map();
let lastCleanup = 0;
const handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup) return;
    const chat = global.db.data.chats[m.chat] || {};

    // Filtri di esclusione dallo sguardo dello Shinigami
    if (!chat.antispam || chat.modoadmin || isOwner || isSam || isAdmin || !isBotAdmin) return;
    if (m.message?.viewOnceMessage) return;
    if (['reactionMessage', 'pollUpdateMessage', 'protocolMessage'].includes(m.mtype)) return;

    const msgTimestamp = (m.messageTimestamp ? m.messageTimestamp * 1000 : Date.now());
    if (Date.now() - msgTimestamp > 10000) return; 

    const sender = m.sender;
    let decodedSender = conn.decodeJid(sender);
    if (decodedSender.endsWith('@lid')) return;

    const config = {
        timeWindow: 10000,      // Finestra di 10 secondi
        removeThreshold: 10,    // Max messaggi tollerati
        timeThreshold: 1500,    // Media millisecondi tra messaggi
        cleanupInterval: 300000 // Pulizia ogni 5 minuti
    };

    const now = Date.now();
    if (now - lastCleanup > config.cleanupInterval) {
        cleanupOldData(config.cleanupInterval);
        lastCleanup = now;
    }

    let userData = uzer.get(decodedSender);
    if (!userData) {
        userData = { timestamps: [], messages: [] };
        uzer.set(decodedSender, userData);
    }

    const messageContent = getMessageContent(m);
    if (['unknown_message_type', 'error_parsing_message'].includes(messageContent)) return;

    const contentHash = crypto.createHash('md5').update(messageContent).digest('hex');

    userData.timestamps.push(msgTimestamp);
    userData.messages.push({ time: msgTimestamp, hash: contentHash });

    // Pulizia registri temporanei dell'utente
    userData.timestamps = userData.timestamps.filter(t => now - t < config.timeWindow);
    userData.messages = userData.messages.filter(msg => now - msg.time < config.timeWindow);

    const duplicateCount = userData.messages.filter(msg => 
        msg.hash === contentHash && msg.time !== msgTimestamp
    ).length;

    let effectiveThreshold = config.removeThreshold;
    if (duplicateCount > 0) {
        effectiveThreshold = Math.max(5, config.removeThreshold - (duplicateCount * 2));
    }

    const messageCount = userData.timestamps.length;

    if (messageCount >= effectiveThreshold) {
        userData.timestamps.sort((a, b) => a - b);
        const totalDuration = userData.timestamps[userData.timestamps.length - 1] - userData.timestamps[0];
        const averageTime = (userData.timestamps.length > 1) ? (totalDuration / (userData.timestamps.length - 1)) : 10000;

        if (averageTime < config.timeThreshold || duplicateCount >= 4) {
            try {
                uzer.delete(decodedSender);
                const typeSanz = duplicateCount >= 4 ? `SPAM DUPLICATI (${duplicateCount + 1}x)` : `FLOOD RAPIDO (${averageTime.toFixed(0)}ms)`;

                // Messaggio estetico in puro stile Ryuk
                const text = `✒️ *DEATH NOTE SYSTEM* 
_Umani impazienti che intasano il fluire delle anime..._
────────────────────────────
💀 *TARGET:* @${decodedSender.split('@')[0]}
⚡ *RILEVATO:* ${typeSanz}
❌ *AZIONE:* Cancellazione Utente
────────────────────────────

𓃦 🩸 *SENTENZA DI RYUK:*
La ripetizione ossessiva compromette l'ordine del quaderno. Chi genera caos superfluo e disturba il disegno di Blood non merita di restare qui.

_Il tuo tempo è scaduto velocemente._ 🍎`;

                await conn.sendMessage(m.chat, {
                    text,
                    mentions: [decodedSender],
                    contextInfo: {
                        externalAdReply: {
                            title: 'R Y U K  A N T I - F L O O D',
                            body: 'Minaccia spam neutralizzata nel registro.',
                            thumbnailUrl: 'https://qu.ax/TfUj.jpg',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                });

                await conn.groupParticipantsUpdate(m.chat, [decodedSender], 'remove');

            } catch (e) {
                console.error(`[Ryuk-AntiSpam] Errore:`, e);
            }
            return;
        }
    }

    uzer.set(decodedSender, userData);
};

function getMessageContent(m) {
    try {
        const msg = m.message;
        if (msg?.conversation) return msg.conversation;
        if (msg?.extendedTextMessage?.text) return msg.extendedTextMessage.text;
        if (msg?.imageMessage?.caption) return `img:${msg.imageMessage.caption}`;
        if (msg?.videoMessage?.caption) return `vid:${msg.videoMessage.caption}`;
        if (msg?.stickerMessage) return `stk:${msg.stickerMessage.fileSha256?.toString('base64')}`;
        return 'unknown_message_type';
    } catch { return 'error_parsing_message'; }
}

function cleanupOldData(interval) {
    const now = Date.now();
    for (const [key, data] of uzer.entries()) {
        if (!data.timestamps.length || now - data.timestamps[data.timestamps.length - 1] > interval) {
            uzer.delete(key);
        }
    }
}

export default handler;
