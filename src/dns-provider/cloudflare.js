module.exports = updateDnsEntry;

const TTL = 120;

const API = `https://api.cloudflare.com/client/v4`;
const DNS_RECORDS = (zoneId, name) => `${API}/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(name)}`;
const CREATE = (zoneId) => `${API}/zones/${zoneId}/dns_records`;
const UPDATE = (zoneId, dnsRecordId) => `${API}/zones/${zoneId}/dns_records/${dnsRecordId}`;

const fetch = require(`node-fetch`);

async function updateDnsEntry(name, ip, config) {
    const { email, apiKey, zoneId } = config;
    const record = await dnsRecord(zoneId, name);    

    if (record) {
        const { id: dnsRecordId, content: currentIp } = record;
        if (currentIp === ip) {
            return;
        }
        await updateDnsRecord(zoneId, dnsRecordId, name, ip);
    } else {
        await createDnsRecord(zoneId, name, ip);
    }

    async function createDnsRecord(zoneId, name, ip) {
        await exec(CREATE(zoneId), `POST`, {
            name,
            ttl: TTL,
            type: `A`,
            content: ip,
            proxied: false
        });
    }
    
    async function updateDnsRecord(zoneId, dnsRecordId, name, ip) {
        await exec(UPDATE(zoneId, dnsRecordId), `PUT`, {
            name,
            ttl: TTL,
            type: `A`,
            content: ip,
            proxied: false
        });
    }
    
    
    async function dnsRecord(zoneId, name) {
        const records = await listDnsRecords(zoneId, name);
        if (records.length > 0) {
            return records[0];
        } else {
            return undefined;
        }
    }
    
    async function listDnsRecords(zoneId, name) {
        const records = await exec(DNS_RECORDS(zoneId, name));
        if (records.success) {
            return records.result;
        } else {
            // TODO: Need to find out what the error format is so we an turn returned errors into exceptions
            throw new Error(`not implemented`);
        }
    }
    
    async function exec(uri, method, data) {
        const options = { method };
        if (data) {
            options['content-type'] = `application/json`;
            options.body = JSON.stringify(data);
        }
    
        const response = await fetch(uri, {
            method,
            headers: {
                'content-type': `application/json`,
                'x-auth-email': email,
                'x-auth-key': apiKey
            },
            body: JSON.stringify(data)
        });
    
        const text = await response.text();
    
        if (response.ok) {
            return JSON.parse(text);
        } else {
            try {
                const json = JSON.parse(text);
                const err = new Error(json.message);
                err.code = json.code;
                throw err;
            } catch (ex) {
                const err = new Error(text);
                err.code = response.status;
                throw err;
            }
        }
    }    
}
