const minimist = require(`minimist`);
const args = minimist(process.argv.slice(2));
if (!args._[0]) {
    throw new Error(`First unamed argument must be the (fully qualified) domain`);
}

module.exports = {
    name: args._[0],
    dns: {
        provider: `cloudflare`,
        options: require(args.dnsConfig)/*{
            email: ``,
            apiKey: ``,
            zoneId: ``
        }*/
    },
    ip: {
        provider: `ipify`
    }
};
