/**
 * LinkRi Cloudflare Worker
 *
 * - GET  *         -> serve static assets (index.html, JS, CSS, data/*, etc.)
 * - POST /contact  -> send email via Web3Forms API (works from Cloudflare Workers)
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders() });
        }

        // POST /contact -> email handler
        if (request.method === 'POST' && url.pathname === '/contact') {
            return handleContact(request);
        }

        // All other requests -> serve static assets
        return env.ASSETS.fetch(request);
    },
};

// ---------------------------------------------------------------------------
// Contact handler — uses Web3Forms API (server-side, no CORS issues)
// ---------------------------------------------------------------------------
async function handleContact(request) {
    try {
        const body = await request.json();
        const { name, mobile, email, message, linkedin_profile, naukri_profile } = body;

        if (!name || !mobile || !email || !message) {
            return jsonResponse({ success: false, message: 'Missing required fields.' });
        }

        // Load access key from config
        const configUrl = new URL('/data/config.properties', request.url);
        const configResp = await fetch(configUrl);
        const configText = await configResp.text();
        const config = parseProperties(configText);

        const accessKey = config['web3forms.access-key'] || 'beff612e-87c9-4ad7-94bf-eb68845b0726';

        const payload = {
            access_key: accessKey,
            subject:    'LinkRi Contact Form',
            name,
            email,
            mobile,
            message,
            ...(linkedin_profile && { linkedin_profile }),
            ...(naukri_profile   && { naukri_profile }),
        };

        console.log('Web3Forms: submitting for', name, email);

        const response = await fetch('https://api.web3forms.com/submit', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
        });

        const rawText = await response.text();
        console.log('Web3Forms response:', response.status, rawText);

        let result = {};
        try { result = JSON.parse(rawText); } catch (_) {}

        if (response.ok && result.success) {
            console.log('Web3Forms SUCCESS');
            return jsonResponse({ success: true, message: 'Message sent!' });
        }

        console.log('Web3Forms FAILURE:', JSON.stringify(result));
        return jsonResponse({
            success: false,
            message: result.message || ('Web3Forms returned HTTP ' + response.status),
        });

    } catch (err) {
        console.error('Contact handler error:', err.message, err.stack);
        return jsonResponse({ success: false, message: 'Internal error: ' + err.message });
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseProperties(text) {
    var config = {};
    text.split('\n').forEach(function(line) {
        var trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            var idx = trimmed.indexOf('=');
            if (idx > 0) {
                config[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
            }
        }
    });
    return config;
}

function jsonResponse(data, status) {
    if (status === undefined) status = 200;
    return new Response(JSON.stringify(data), {
        status: status,
        headers: Object.assign({ 'Content-Type': 'application/json' }, corsHeaders()),
    });
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
    };
}