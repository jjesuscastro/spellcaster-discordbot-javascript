require('dotenv').config();
const { google } = require('googleapis');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const combatinfo ={
    hp:     33, //ah
    base:   35, //aj
    crit:   37, //al
    mods:   7,  //h
    name:   11, //l
};

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function getAuth() {
    return new google.auth.GoogleAuth({
        credentials: {
            client_email: requireEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
            private_key: requireEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        },
        scopes: SCOPES,
    });
}

function getSheets() {
    return google.sheets({ version: 'v4', auth: getAuth() });
}

async function readRange(range) {
    const res = await getSheets().spreadsheets.values.get({
        spreadsheetId: requireEnv('SPREADSHEET_ID'),
        range,
    });
    return res.data.values || [];
}

async function getCombat(userId) {
    const chara = `🧡 Clementine`;
    const rows = await readRange(`${chara}!A:AP`);
    
    return {
        characterName: rows[3][combatinfo.name] || '',
        hp:            parseInt(rows[9][combatinfo.hp] || '0', 10),
        mp:            parseInt(rows[13][combatinfo.hp] || '0', 10),
        ac:            parseInt(rows[17][combatinfo.hp] || '0', 10),
        baseatk:       parseInt(rows[27][combatinfo.base] || '0', 10),
        critatk:       parseInt(rows[27][combatinfo.crit] || '0', 10),
        baseheal:      parseInt(rows[28][combatinfo.base] || '0', 10),
        critheal:      parseInt(rows[28][combatinfo.crit] || '0', 10),
        int:           parseInt(rows[21][combatinfo.mods] || '0', 10),
        cha:           parseInt(rows[22][combatinfo.mods] || '0', 10),
        wis:           parseInt(rows[23][combatinfo.mods] || '0', 10),
        wil:           parseInt(rows[24][combatinfo.mods] || '0', 10),
        str:           parseInt(rows[25][combatinfo.mods] || '0', 10),
        dex:           parseInt(rows[26][combatinfo.mods] || '0', 10),
        mag:           parseInt(rows[32][combatinfo.mods] || '0', 10),
        mgt:           parseInt(rows[33][combatinfo.mods] || '0', 10),
        fin:           parseInt(rows[34][combatinfo.mods] || '0', 10),
        res:           parseInt(rows[35][combatinfo.mods] || '0', 10),
        esn:           parseInt(rows[36][combatinfo.mods] || '0', 10),
        arc:           parseInt(rows[37][combatinfo.mods] || '0', 10),
        
//        balance:       parseInt(rows[i][COL.BALANCE] || '0', 10),
    };
}

async function writeRange(range, values, valueInputOption = 'RAW') {
    await getSheets().spreadsheets.values.update({
        spreadsheetId: requireEnv('SPREADSHEET_ID'),
        range,
        valueInputOption,
        resource: { values },
    });
}

async function appendRow(sheetName, rowValues, valueInputOption = 'RAW') {
    await getSheets().spreadsheets.values.append({
        spreadsheetId: requireEnv('SPREADSHEET_ID'),
        range: `${sheetName}!A:A`,
        valueInputOption,
        resource: { values: [rowValues] },
    });
}

module.exports = {
    SPREADSHEET_ID,
    getAuth,
    getSheets,
    readRange,
    writeRange,
    appendRow,
    getCombat,
};
