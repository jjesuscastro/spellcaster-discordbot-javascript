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
        characterName: rows[4][combatinfo.name] || '',
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
