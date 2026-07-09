/**
 * LinkRi Cloudflare Worker
 *
 * - GET  *         -> serve static assets (index.html, JS, CSS, data/*, etc.)
 * - POST /contact  -> proxy form data to FormSubmit server-side (no CORS issue)
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Handle CORS preflight (just in case)
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(),
            });
        }

        // POST /contact -> server-side FormSubmit proxy
        if (request.method === 'POST' && url.pathname === '/contact') {
            return handleContact(request);
        }

        // All other requests -> serve static assets
        return env.ASSETS.fetch(request);
    },
};

// ---------------------------------------------------------------------------
// Contact handler - runs on the server, so FormSubmit has no CORS issue
// ---------------------------------------------------------------------------
async function handleContact(request) {
    try {
        const body = await request.json();
        const {
            name, mobile, email, message,
            mail_to,
            linkedin_profile,
            naukri_profile,
        } = body;

        // Basic validation
        if (!name || !mobile || !email || !message) {
            return jsonResponse({ success: false, message: 'Missing required fields.' }, 400);
        }

        const target = mail_to || 'LinkRi.Jobs@gmail.com';

        const payload = {
            name,
            mobile,
            email,
            message,
            _subject: 'LinkRi Contact - ' + name,
            _replyto: email,
            ...(linkedin_profile && { linkedin_profile }),
            ...(naukri_profile && { naukri_profile }),
        };

        // Server-side fetch - no browser CORS restriction applies here
        const fsResponse = await fetch(
            'https://formsubmit.co/ajax/' + encodeURIComponent(target),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://linkri.linkri.workers.dev',
                    'Referer': 'https://linkri.linkri.workers.dev/',
                },
                body: JSON.stringify(payload),
            }
        );

        const fsResult = await fsResponse.json().catch(() => ({}));

        // Log every outcome for Cloudflare dashboard / wrangler tail
        console.log(
            'FormSubmit response:',
            fsResponse.status,
            JSON.stringify(fsResult)
        );

        if (fsResponse.ok && fsResult.success === 'true') {
            console.log('...FormSubmit SUCCESS:', JSON.stringify(fsResult));
            return jsonResponse({ success: true, message: 'Message sent!' });
        }

        // FormSubmit may return activation notice on first use
        if (fsResult.message && fsResult.message.toLowerCase().includes('activation')) {
            console.log('...FormSubmit ACTIVATION required:', JSON.stringify(fsResult));
            return jsonResponse({
                success: false,
                message: 'Please check your inbox to activate the FormSubmit address first.',
            });
        }

        console.log('...FormSubmit FAILURE / unexpected response:', JSON.stringify(fsResult));
        return jsonResponse({
            success: false,
            message: fsResult.message || 'FormSubmit did not confirm delivery.',
        }, 502);

    } catch (err) {
        console.error('...Contact handler error:', err.message, err.stack);
        return jsonResponse({ success: false, message: 'Internal error: ' + err.message }, 500);
    }
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