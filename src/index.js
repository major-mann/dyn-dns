const TICK_TIME = 60 * 1000;

const config = require(`../etc/config.js`);

const dnsProvider = require(`./dns-provider/${config.dns.provider}.js`);
const ipProvider = require(`./ip-provider/${config.ip.provider}.js`);

setInterval(onTick, TICK_TIME);
onTick();

async function onTick() {
    console.info(`Fetching IP`);
    const ip = await ipProvider(config.ip.options);
    console.info(`Processing IP ${ip}`);
    await dnsProvider(config.name, ip, config.dns.options);
    console.info(`${ip} processed succesfully`);
}
