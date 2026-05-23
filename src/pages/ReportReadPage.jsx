import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import SecureReportPdfViewer from '../components/report/SecureReportPdfViewer'
import { useAuth } from '../context/AuthContext'
import { isUuid, reportPublicPath } from '../lib/reportPath'
import { userCanReadFullReportPdf } from '../lib/reportPdfAccess'

export default function ReportReadPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { supabase, user, isStaff } = useAuth()
    const [report, setReport] = useState(null)
    const [allowed, setAllowed] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !id || !user) {
                setLoading(false)
                return
            }
            setLoading(true)
            setError('')
            const col = isUuid(id) ? 'id' : 'slug'
            const { data: rep, error: e1 } = await supabase.from('reports').select('id, title, slug').eq(col, id).maybeSingle()
            if (cancelled) return
            if (e1 || !rep) {
                setError(e1?.message || 'Report not found')
                setLoading(false)
                return
            }
            setReport(rep)
            const can = await userCanReadFullReportPdf(supabase, rep.id, { isStaff })
            if (!cancelled) {
                setAllowed(can)
                setLoading(false)
                if (!can) setError('You need an active entitlement to read this report.')
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, id, user, isStaff])

    if (loading) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#2c3748',
                }}
            >
                <CircularProgress sx={{ color: '#e1f4f7' }} />
            </Box>
        )
    }

    if (error || !report || !allowed) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#2c3748',
                    px: 2,
                }}
            >
                <Stack spacing={2} alignItems="center" sx={{ maxWidth: 420 }}>
                    <Alert severity="warning">{error || 'Access denied'}</Alert>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(report ? reportPublicPath(report) : '/reports')}
                            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
                        >
                            Back to report
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => navigate('/pricing')}>
                            Get access
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        )
    }

    return (
        <SecureReportPdfViewer
            fullscreen
            reportId={report.id}
            watermark={user?.email || ''}
            backTo={reportPublicPath(report)}
            backLabel="Back to report"
            onAccessDenied={() => setError('Access denied or session expired.')}
        />
    )
}
