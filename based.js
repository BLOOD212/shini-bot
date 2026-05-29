process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, readFileSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';
import { ripristinaTimer } from './plugins/gp-configgruppo.js';

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
};
const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, getPerformanceConfig, setPerformanceConfig, Logger, makeInMemoryStore } = await import('@realvare/based');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
protoType();
serialize();
global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let MethodMobile = process.argv.includes("mobile");
let phoneNumber = global.botNumberCode;

function redefineConsoleMethod(methodName, filterStrings) {
    const originalConsoleMethod = console[methodName];
    console[methodName] = function () {
        const message = arguments[0];
        if (typeof message === 'string' && filterStrings.some(filterString => message.includes(Buffer.from(filterString, 'base64').toString()))) {
            arguments[0] = "";
        }
        originalConsoleMethod.apply(console, arguments);
    };
}

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new JSONFile('database.json') : new JSONFile('database.json'));
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function () {
            if (!global.db.READ) {
                clearInterval(this);
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
            }
        }, 1 * 1000));
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

if (global.conns instanceof Array) {
    console.log(chalk.hex('#1C1C1C')('Connessioni già inizializzate...'));
} else {
    global.conns = [];
}

global.creds = 'creds.json';
global.authFile = 'varesession';
global.authFileJB = 'varebot-sub';

setPerformanceConfig({
    performance: {
        enableCache: true,
        enableMetrics: true
    },
    debug: {
        enableLidLogging: true,
        logLevel: 'debug'
    }
});

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache();
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
        // DEATH NOTE PALETTE: CRIMSON, GOTHIC GREY & DEEP BLACK
        const crimson = chalk.hex('#8B0000'); // Rosso Sangue / Cremisi
        const darkGrey = chalk.hex('#4A4A4A'); // Grigio scuro opaco
        const boneWhite = chalk.hex('#E5E4E2'); // Bianco osseo
        const ashText = chalk.hex('#A9A9A9'); // Grigio cenere

        const a = crimson('☠︎ ━━━━━━━━━━━━━━━━━━━━━━━━━ • 𝕯𝕰𝕬𝕿𝕳 𝕹𝕺𝕿𝕰 • ━━━━━━━━━━━━━━━━━━━━━━━━━ ☠︎');
        const b = crimson('☠︎ ━━━━━━━━━━━━━━━━━━━━━━━━━ • 𝕿𝖍𝖊 𝖍𝖚𝖒𝖆𝖓 𝖜𝖍𝖔𝖘𝖊 𝖓𝖆𝖒𝖊 𝖎𝖘 𝖜𝖗𝖎𝖙𝖙𝖊𝖓... • ━━━━━━━━━━━━━━━━━━━━━━━━━ ☠︎');
        const linea = darkGrey('   ━━━━━ 🜏 ━━━━━ 🜏 ━━━━━ 🜏 ━━━━━ 🜏 ━━━━━ 🜏 ━━━━━ 🜏 ━━━━━ 🜏 ━━━━━');
        const sm = chalk.bold.hex('#FFFFFF')('𝖀𝕾𝕰𝕽 𝕴𝕯𝕰𝕽𝕿𝕴𝕱𝕴𝕮𝕬𝕿𝕴𝕺𝕽 𝕸𝕰𝕿𝕳𝕺𝕯');
        const qr = crimson('  [𝕷]') + ' ' + chalk.bold.hex('#FFFFFF')('1. Sincronizzazione tramite QR Code');
        const codice = crimson('  [𝕹]') + ' ' + chalk.bold.hex('#FFFFFF')('2. Chiave numerica (8 Cifre)');
        const istruzioni = [
            crimson('  » ') + ashText.italic('Immettere rigorosamente l\'indice numerico.'),
            crimson('  » ') + ashText.italic('Premere Invio per sigillare il patto.'),
            ashText.italic(''),
            crimson.italic('                                             - 𝔏'),
        ];
        const prompt = crimson.bold('\n🜏 Scrivi la tua scelta nel quaderno ---> ');

        opzione = await question(`\n
${a}

                         ${sm}
${linea}

${qr}
${codice}

${linea}
${istruzioni.join('\n')}

${b}
${prompt}`);

        if (!/^[1-2]$/.test(opzione)) {
            console.log(`\n${chalk.bgHex('#8B0000').black.bold(' 🜏 ERRORE DI SCRITTURA ')}

${darkGrey('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${crimson.bold('⚠️  Il quaderno accetta solo le identità')} ${chalk.bold.white('1')} ${crimson.bold('o')} ${chalk.bold.white('2')}
${crimson('┌─ ') + ashText('Nessun carattere estraneo o simbolo concesso.')}
${crimson('└─ ') + ashText('Trascrivi unicamente l\'opzione valida.')}
${chalk.hex('#4A4A4A').italic('\n🜏 "Gli umani sono creature così interessanti..."')}
`);
        }
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const filterStrings = [
    "Q2xvc2luZyBzdGFsZSBvcGVu",
    "Q2xvc2luZyBvcGVuIHNlc3Npb24=",
    "RmFpbGVkIHRvIGRlY3J5cHQ=",
    "U2Vzc2lvbiBlcnJvcg==",
    "RXJyb3I6IEJhZCBNQUM=",
    "RGVjcnlwdGVkIG1lc3NhZ2U="
];
console.info = () => {};
console.debug = () => {};
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings));
const groupMetadataCache = new NodeCache();
global.groupCache = groupMetadataCache;
const logger = pino({
    level: 'silent',
});
global.jidCache = new NodeCache({ stdTTL: 600, useClones: false });
global.store = makeInMemoryStore({ logger });
const connectionOptions = {
    logger: logger,
    mobile: MethodMobile,
    browser: opzione === '1' ? Browsers.windows('Chrome') : methodCodeQR ? Browsers.windows('Chrome') : Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: (jid) => {
        if (!jid) return jid;
        const cached = global.jidCache.get(jid);
        if (cached) return cached;
        let decoded = jid;
        if (/:\d+@/gi.test(jid)) {
            decoded = jidNormalizedUser(jid);
        }
        if (typeof decoded === 'object' && decoded.user && decoded.server) {
            decoded = `${decoded.user}@${decoded.server}`;
        }
        if (typeof decoded === 'string' && decoded.endsWith('@lid')) {
            decoded = decoded.replace('@lid', '@s.whatsapp.net');
        }
        global.jidCache.set(jid, decoded);
        return decoded;
    },
    printQRInTerminal: opzione === '1' || methodCodeQR ? true : false,
    cachedGroupMetadata: async (jid) => {
        const cached = global.groupCache.get(jid);
        if (cached) return cached;
        try {
            const metadata = await global.conn.groupMetadata(global.conn.decodeJid(jid));
            global.groupCache.set(jid, metadata, { ttl: 300 });
            return metadata;
        } catch (err) {
            console.error('Errore nel recupero dei metadati del gruppo:', err);
            return {};
        }
    },
    getMessage: async (key) => {
        try {
            const jid = global.conn.decodeJid(key.remoteJid);
            const msg = await global.store.loadMessage(jid, key.id);
            return msg?.message || undefined;
        } catch (error) {
            console.error('Errore in getMessage:', error);
            return undefined;
        }
    },
    msgRetryCounterCache,
    msgRetryCounterMap,
    retryRequestDelayMs: 500,
    maxMsgRetryCount: 5,
    shouldIgnoreJid: jid => false,
};
global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);
if (!fs.existsSync(`./${authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        opzione = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                phoneNumber = await question(chalk.bgHex('#8B0000').black(chalk.bold(` 📓 Inserisci il contatto per il collegamento. \n`)) + chalk.hex('#A9A9A9')(` Formato richiesto: +393471234567\n`) + chalk.bold.hex('#8B0000')(' 🜏 ━━► '));
                addNumber = phoneNumber.replace(/\D/g, '');
                if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`;
            }
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(addNumber, 'BLOODBOT');
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                console.log(chalk.bold.black(chalk.bgHex('#8B0000')(' 『 📓 』– CODICE DI APPAIAMENTO: ')), chalk.bold.hex('#FFFFFF')(codeBot));
            }, 3000);
        }
    }
}
conn.isInit = false;
conn.well = false;
async function bysamakavare() {
    try {
        const mainChannelId = global.IdCanale?.[0] || '120363418582531215@newsletter';
        await global.conn.newsletterFollow(mainChannelId);
    } catch (error) {}
}
if (!opts['test']) {
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write();
        if (opts['autocleartmp'] && (global.support || {}).find) {
            const tmp = [tmpdir(), 'tmp', "varebot-sub"];
            tmp.forEach(filename => spawn('find', [filename, '-amin', '2', '-type', 'f', '-delete']));
        }
    }, 30 * 1000);
}
if (opts['server']) (await import('./server.js')).default(global.conn, PORT);
async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    global.stopped = connection;
    if (isNewLogin) conn.isInit = true;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (code && code !== DisconnectReason.loggedOut) {
        await global.reloadHandler(true).catch(console.error);
        global.timestamp.connect = new Date;
    }
    if (global.db.data == null) loadDatabase();
    if (qr && (opzione === '1' || methodCodeQR) && !global.qrGenerated) {
        console.log(chalk.bold.hex('#8B0000')(`\n 🍎 SCANSIONA IL CODICE - IL TEMPO SCADE IN 45 SECONDI 🍎`));
        global.qrGenerated = true;
    }
    if (connection === 'open') {
        global.qrGenerated = false;
        global.connectionMessagesPrinted = {};
        if (!global.isLogoPrinted) {
            const logoColors = [
                '#4A4A4A', '#5E1914', '#73130E', '#880D08', '#9D0702',
                '#B20100', '#A10100', '#900100', '#7F0100', '#6E0100', '#5D0000'
            ];
            const varebot = [
               `██████╗ ██╗      ██████╗  ██████╗ ██████╗ `,
    `██╔══██╗██║     ██╔═══██╗██╔═══██╗██╔══██╗`,
    `██████╔╝██║     ██║   ██║██║   ██║██║  ██║`,
    `██╔══██╗██║     ██║   ██║██║   ██║██║  ██║`,
    `██████╔╝███████╗╚██████╔╝╚██████╔╝██████╔╝`,
    `╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ `,
    `                                          `,
    `         ██████╗  ██████╗ ████████╗       `,
    `         ██╔══██╗██╔═══██╗╚══██╔══╝       `,
    `         ██████╔╝██║   ██║   ██║          `,
    `         ██╔══██╗██║   ██║   ██║          `,
    `         ██████╔╝╚██████╔╝   ██║          `,
    `         ╚═════╝  ╚═════╝    ╚═╝          `
            ];
            varebot.forEach((line, i) => {
                const color = logoColors[i] || logoColors[logoColors.length - 1];
                console.log(chalk.hex(color).bold(line));
            });
            global.isLogoPrinted = true;
            await bysamakavare();
        }
        const perfConfig = getPerformanceConfig();
        Logger.info('Performance Config:', perfConfig);
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (reason === DisconnectReason.badSession && !global.connectionMessagesPrinted.badSession) {
            console.log(chalk.bold.hex('#8B0000')(`\n⚠️❗ QUADERNO COMPROMESSO, ELIMINA LA DIRECTORY ${global.authFile} E RIAVVIA IL PATTO ⚠️`));
            global.connectionMessagesPrinted.badSession = true;
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionLost && !global.connectionMessagesPrinted.connectionLost) {
            console.log(chalk.bold.hex('#4A4A4A')(`\n☠︎ ━━━ 🜏 ━━━ 𝕮𝕺𝕽𝕹𝕰𝕾𝕾𝕴𝕺𝕽𝕰 𝕻𝕰𝕽𝕾𝕬 ━━━ 🜏 ━━━ ☠︎\n┃ 🔄 Tentativo di ripristino in corso... \n☠︎ ━━━ 🜏 ━━━ 𝕯𝕰𝕬𝕿𝕳 𝕹𝕺𝕿𝕰 ━━━ 🜏 ━━━ ☠︎`));
            global.connectionMessagesPrinted.connectionLost = true;
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionReplaced && !global.connectionMessagesPrinted.connectionReplaced) {
            console.log(chalk.bold.hex('#8B0000')(`☠︎ ━━━ 🜏 ━━━ 𝕾𝕰𝕾𝕾𝕴𝕺𝕽𝕰 𝕾𝕺𝕾𝕿𝕴𝕿𝕿𝕿𝕬 ━━━ 🜏 ━━━ ☠︎\n┃ Un altro Shinigami ha preso il controllo di questa sessione. \n☠︎ ━━━ 🜏 ━━━ 𝕯𝕰𝕬𝕿𝕳 𝕹𝕺𝕿𝕰 ━━━ 🜏 ━━━ ☠︎`));
            global.connectionMessagesPrinted.connectionReplaced = true;
        } else if (reason === DisconnectReason.loggedOut && !global.connectionMessagesPrinted.loggedOut) {
            console.log(chalk.bold.hex('#8B0000')(`\n⚠️ RECESSO DAL PATTO. CARTELLA ${global.authFile} EPURATA. RIAVVIA IL SITEMA. ⚠️`));
            global.connectionMessagesPrinted.loggedOut = true;
            try {
                if (fs.existsSync(global.authFile)) {
                    fs.rmSync(global.authFile, { recursive: true, force: true });
                }
            } catch (e) {
                console.error('Errore nell\'eliminazione della cartella sessione:', e);
            }
            process.exit(1);
        } else if (reason === DisconnectReason.restartRequired && !global.connectionMessagesPrinted.restartRequired) {
            console.log(chalk.bold.hex('#4A4A4A')(`\n☠︎ ━━━ 🜏 ━━━ 𝕽𝕴𝕹𝕽𝕺𝕱𝕬𝕽𝕯𝕺 𝕮𝕺𝕽𝕽𝕰𝕾𝕾𝕴𝕺𝕽𝕰 ━━━ 🜏 ━━━ ☠︎`));
            global.connectionMessagesPrinted.restartRequired = true;
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.timedOut && !global.connectionMessagesPrinted.timedOut) {
            console.log(chalk.bold.hex('#8B0000')(`\n☠︎ ━━━ 🜏 ━━━ 𝕿𝕴𝕸𝕰𝕺𝕿𝕿 𝕮𝕺𝕽𝕽𝕰𝕾𝕾𝕴𝕺𝕽𝕰 ━━━ 🜏 ━━━ ☠︎\n┃ 🔄 Riconnessione forzata...\n☠︎ ━━━ 🜏 ━━━ 𝕯𝕰𝕬𝕿𝕳 𝕹𝕺𝕿𝕰 ━━━ 🜏 ━━━ ☠︎`));
            global.connectionMessagesPrinted.timedOut = true;
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === 401) {
            console.log(chalk.bold.hex('#8B0000')(`\n⚠️❗ ACCESSO NEGATO (401): RIGENERA IL COLLEGAMENTO QR ⚠️`));
            try {
                if (fs.existsSync(global.authFile)) {
                    fs.rmSync(global.authFile, { recursive: true, force: true });
                }
            } catch (e) {
                console.error('Errore nell\'eliminazione della cartella sessione:', e);
            }
            process.exit(1);
        } else if (reason !== DisconnectReason.restartRequired && reason !== DisconnectReason.connectionClosed && !global.connectionMessagesPrinted.unknown) {
            console.log(chalk.bold.hex('#8B0000')(`\n⚠️ CAUSA SCONOSCIUTA: ${reason || '???'} >> ${connection || '???'}`));
            global.connectionMessagesPrinted.unknown = true;
        }
    }
}
process.on('uncaughtException', console.error);
async function connectSubBots() {
    const subBotDirectory = './varebot-sub';
    if (!existsSync(subBotDirectory)) {
        console.log(chalk.bold.hex('#4A4A4A')('☠︎ 𝖉𝖊𝖆𝖙𝖍 𝖓𝖔𝖙𝖊: Nessun Sub-Bot vincolato.'));
        try {
            mkdirSync(subBotDirectory, { recursive: true });
            console.log(chalk.bold.hex('#8B0000')('✅ Registro creato.'));
        } catch (err) {
            console.log(chalk.bold.red('❌ Errore:', err.message));
            return;
        }
        return;
    }
    try {
        const subBotFolders = readdirSync(subBotDirectory).filter(file =>
            statSync(join(subBotDirectory, file)).isDirectory()
        );
        if (subBotFolders.length === 0) {
            console.log(chalk.bold.hex('#4A4A4A')('- 🜏 | Nessun sub-bot vincolato al quaderno'));
            return;
        }
        const botPromises = subBotFolders.map(async (folder) => {
            const subAuthFile = join(subBotDirectory, folder);
            if (existsSync(join(subAuthFile, 'creds.json'))) {
                try {
                    const { state: subState, saveCreds: subSaveCreds } = await useMultiFileAuthState(subAuthFile);
                    const subConn = makeWASocket({
                        ...connectionOptions,
                        auth: {
                            creds: subState.creds,
                            keys: makeCacheableSignalKeyStore(subState.keys, logger),
                        },
                    });

                    subConn.ev.on('creds.update', subSaveCreds);
                    subConn.ev.on('connection.update', connectionUpdate);
                    return subConn;
                } catch (err) {
                    console.log(chalk.bold.red(`❌ Errore Sub-Bot ${folder}:`, err.message));
                    return null;
                }
            }
            return null;
        });
        const bots = await Promise.all(botPromises);
        global.conns = bots.filter(Boolean);
        if (global.conns.length > 0) {
            console.log(chalk.bold.hex('#8B0000')(`☠︎ ${global.conns.length} Sub-Bot vincolati con successo.`));
        } else {
            console.log(chalk.bold.hex('#4A4A4A')('⚠️ Nessun subordinato attivo.'));
        }
    } catch (err) {
        console.log(chalk.bold.red('❌ Errore Sub-Bot:', err.message))
