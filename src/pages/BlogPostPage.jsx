import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function BlogPostPage() {
    const { slug } = useParams()
    const { t } = useTranslation()
    const { supabase } = useAuth()
    const [dbPost, setDbPost] = useState(undefined)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase || !slug) {
                setDbPost(null)
                setLoading(false)
                return
            }
            const { data } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .lte('published_at', new Date().toISOString())
                .maybeSingle()
            if (!cancelled) {
                setDbPost(data || null)
                setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase, slug])

    const posts = t('blog.posts', { returnObjects: true })
    const i18nPost = Array.isArray(posts) ? posts.find(p => p.slug === slug) : null

    const post = dbPost
        ? {
              title: dbPost.title,
              tag: (dbPost.seo && dbPost.seo.tag) || 'News',
              date: dbPost.published_at ? new Date(dbPost.published_at).toLocaleDateString() : '',
              body: dbPost.body || '',
          }
        : i18nPost
          ? {
                title: i18nPost.title,
                tag: i18nPost.tag,
                date: i18nPost.date,
                body: null,
            }
          : null

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ pt: '72px', pb: 8 }}>
                <Container maxWidth="md" className="section-fade-in" sx={{ py: 4 }}>
                    <Button component={Link} to="/blog" size="small" sx={{ mb: 3, fontWeight: 700 }}>
                        {t('common.back')}
                    </Button>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={28} />
                        </Box>
                    )}
                    {!loading && post ? (
                        <>
                            <Stack direction="row" gap={1} sx={{ mb: 2 }}>
                                <Chip label={post.tag} size="small" color="secondary" />
                                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                    {post.date}
                                </Typography>
                            </Stack>
                            <Typography variant="h3" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, mb: 3 }}>
                                {post.title}
                            </Typography>
                            {post.body ? (
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                                    {post.body}
                                </Typography>
                            ) : (
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85 }}>
                                    {t('blog.postBody')}
                                </Typography>
                            )}
                        </>
                    ) : (
                        !loading && <Typography color="text.secondary">{t('blog.notFound')}</Typography>
                    )}
                </Container>
            </Box>
            <Footer />
        </Box>
    )
}
