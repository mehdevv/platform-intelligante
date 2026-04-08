import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function BlogListingPage() {
    const { t } = useTranslation()
    const { supabase } = useAuth()
    const [dbPosts, setDbPosts] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!supabase) {
                setDbPosts([])
                setLoading(false)
                return
            }
            const { data } = await supabase
                .from('blog_posts')
                .select('slug, title, excerpt, published_at, seo')
                .eq('status', 'published')
                .lte('published_at', new Date().toISOString())
                .order('published_at', { ascending: false })
                .limit(24)
            if (!cancelled) {
                setDbPosts(data || [])
                setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [supabase])

    const i18nPosts = t('blog.posts', { returnObjects: true })
    const fallback = Array.isArray(i18nPosts) ? i18nPosts : []
    const posts =
        dbPosts && dbPosts.length > 0
            ? dbPosts.map(p => ({
                  slug: p.slug,
                  title: p.title,
                  excerpt: p.excerpt || '',
                  date: p.published_at ? new Date(p.published_at).toLocaleDateString() : '',
                  tag: (p.seo && p.seo.tag) || 'News',
              }))
            : fallback.map(p => ({ ...p, tag: p.tag || 'News' }))

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ pt: '72px', pb: 8 }}>
                <Box className="page-hero-slant section-fade-in" sx={{ py: { xs: 6, md: 9 }, position: 'relative', overflow: 'hidden' }}>
                    <Box className="diagonal-stripes" sx={{ opacity: 0.5 }} aria-hidden />
                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="h3" sx={{ fontFamily: '"League Spartan", sans-serif', fontWeight: 800, mb: 1 }}>
                            {t('blog.title')}
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
                            {t('blog.subtitle')}
                        </Typography>
                    </Container>
                </Box>
                <Container maxWidth="lg" sx={{ mt: -2 }}>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress color="secondary" />
                        </Box>
                    )}
                    <Grid container spacing={3}>
                        {posts.map(post => (
                            <Grid key={post.slug} size={{ xs: 12, md: 4 }}>
                                <Card className="card-lift" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                                            <Chip label={post.tag} size="small" color="secondary" variant="outlined" />
                                            <Typography variant="caption" color="text.secondary">
                                                {post.date}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, flex: 1 }}>
                                            {post.title}
                                        </Typography>
                                        <Typography component="p" variant="body2" color="text.secondary" className="typography-premium-small" sx={{ mb: 2 }}>
                                            {post.excerpt}
                                        </Typography>
                                        <Button component={Link} to={`/blog/${post.slug}`} size="small" sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
                                            {t('blog.readArticle')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
            <Footer />
        </Box>
    )
}
