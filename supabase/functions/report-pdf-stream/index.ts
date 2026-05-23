import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, corsPreflightResponse, corsJson } from '../_shared/cors.ts'

const BUCKET = 'report-pdfs'

Deno.serve(async req => {
    if (req.method === 'OPTIONS') {
        return corsPreflightResponse()
    }

    if (req.method !== 'GET') {
        return corsJson({ error: 'Method not allowed' }, 405)
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return corsJson({ error: 'Unauthorized' }, 401)
        }

        const reportId = new URL(req.url).searchParams.get('report_id')
        if (!reportId) {
            return corsJson({ error: 'report_id query parameter required' }, 400)
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (!supabaseUrl || !anonKey || !serviceKey) {
            console.error('Missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY')
            return corsJson({ error: 'Server misconfigured' }, 500)
        }

        const userClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
        })

        const {
            data: { user },
            error: userErr,
        } = await userClient.auth.getUser()
        if (userErr || !user) {
            return corsJson({ error: 'Unauthorized' }, 401)
        }

        const { data: entitled, error: entErr } = await userClient.rpc('has_report_entitlement', {
            p_report_id: reportId,
        })
        if (entErr) {
            console.error('has_report_entitlement', entErr)
            return corsJson({ error: 'Access check failed' }, 500)
        }

        let allowed = !!entitled
        if (!allowed) {
            const { data: prof } = await userClient.from('profiles').select('app_role').eq('id', user.id).maybeSingle()
            allowed = prof?.app_role === 'admin' || prof?.app_role === 'editor'
        }
        if (!allowed) {
            return corsJson({ error: 'Forbidden' }, 403)
        }

        const service = createClient(supabaseUrl, serviceKey)
        const { data: asset, error: assetErr } = await service
            .from('report_assets')
            .select('storage_path')
            .eq('report_id', reportId)
            .eq('asset_type', 'full_pdf')
            .maybeSingle()

        if (assetErr || !asset?.storage_path) {
            return corsJson({ error: 'PDF not found' }, 404)
        }

        const { data: blob, error: dlErr } = await service.storage.from(BUCKET).download(asset.storage_path)
        if (dlErr || !blob) {
            console.error('storage download', dlErr)
            return corsJson({ error: 'Failed to load PDF' }, 500)
        }

        return new Response(blob, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-store, no-cache, must-revalidate, private',
                Pragma: 'no-cache',
                'X-Content-Type-Options': 'nosniff',
            },
        })
    } catch (err) {
        console.error('report-pdf-stream', err)
        return corsJson({ error: 'Internal error' }, 500)
    }
})
