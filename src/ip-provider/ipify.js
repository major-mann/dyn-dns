module.exports = findIp;

const API = `https://api.ipify.org?format=json`;

const fetch = require(`node-fetch`);

async function findIp() {
    const response = await fetch(API);
    const json = await response.json();
    return json.ip;
}
