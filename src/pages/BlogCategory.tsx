import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPostsByCategory, getAllCategories, getAllPosts, tagToSlug } from '../lib/blog'
import type { PostMeta } from '../lib/blog'
import { setPageMeta } from '../lib/pageMeta'
import Logo from '../components/Logo'
import AppFooter from '../components/AppFooter'

const SITE_URL = 'https://listingignite.com'

export default function BlogCategory() {
  const { category: categorySlug } = useParams<{ category: string }>()
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [categoryName, setCategoryName] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    if (!categorySlug) return
    window.scrollTo(0, 0)

    const found = getPostsByCategory(categorySlug)
    const cats = getAllCategories()
    const allPosts = getAllPosts()

    const catInfo = cats.find(c => c.slug === categorySlug)
    const displayName = catInfo?.name ?? categorySlug.replace(/-/g, ' ')
    const tags = Array.from(new Set(allPosts.flatMap(p => p.tags ?? []))).sort()

    setPosts(found)
    setCategoryName(displayName)
    setAllTags(tags)

    const rawCatDescription = `Browse all ${displayName} articles on ListingIgnite — practical guides and strategies for real estate agents.`
    const catDescription = rawCatDescription.length > 155
      ? rawCatDescription.slice(0, 152) + '...'
      : rawCatDescription
    const catSuffix = ' — ListingIgnite Blog'
    const catTitle = (`${displayName}${catSuffix}`).length <= 60
      ? `${displayName}${catSuffix}`
      : displayName

    setPageMeta({
      title: catTitle,
      description: catDescription,
      ogImage: `${SITE_URL}/og-image.png`,
      ogUrl: `${SITE_URL}/blog/category/${categorySlug}`,
      canonical: `${SITE_URL}/blog/category/${categorySlug}`,
    })

    return () => {
      setPageMeta({
        title: 'ListingIgnite — AI Marketing for Real Estate Agents',
        description: 'AI-generated marketing content for every listing — MLS copy, social posts, email blast, and more. In seconds.',
        ogUrl: SITE_URL,
      })
    }
  }, [categorySlug])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <Link to="/login" style={s.navSignIn}>Sign In</Link>
        </div>
      </nav>

      {/* Header */}
      <div style={s.headerOuter}>
        <div style={s.headerInner}>
          <Link to="/blog" style={s.backLink}>← Back to Blog</Link>
          <p style={s.eyebrow}>Category</p>
          <h1 style={s.headline}>{categoryName || '…'}</h1>
          <p style={s.postCount}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={s.container}>
        <div className="blog-post-layout">

          {/* ── Post grid ── */}
          <main>
            {posts.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>✦</div>
                <h2 style={s.emptyHeading}>No posts yet.</h2>
                <p style={s.emptyBody}>
                  Nothing in this category yet — check back soon or{' '}
                  <Link to="/blog" style={s.emptyLink}>browse all posts</Link>.
                </p>
              </div>
            ) : (
              <div className="blog-card-grid">
                {posts.map(post => (
                  <PostCard key={post.slug} post={post} formatDate={formatDate} />
                ))}
              </div>
            )}
          </main>

          {/* ── Sidebar ── */}
          <aside className="blog-post-sidebar">
            {/* CTA card */}
            <div style={s.ctaCard}>
              <div style={s.ctaSparkle}>✦</div>
              <h3 style={s.ctaHeading}>Ready to market faster?</h3>
              <p style={s.ctaBody}>
                Paste your listing details. Get MLS copy, social posts, email blast, and more — in seconds.
              </p>
              <Link to="/login" style={s.ctaBtn}>Get Started Free →</Link>
              <p style={s.ctaNote}>3 free listings. No credit card required.</p>
            </div>

            {/* Popular topics */}
            {allTags.length > 0 && (
              <div style={s.tagsCard}>
                <h4 style={s.tagsHeading}>Popular Topics</h4>
                <div style={s.tagList}>
                  {allTags.map(tag => (
                    <Link key={tag} to={`/blog/tag/${tagToSlug(tag)}`} style={s.tag}>{tag}</Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>
      </div>

      <AppFooter />
    </div>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, formatDate }: { post: PostMeta; formatDate: (d: string) => string }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div style={c.card}>
      <Link to={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
        {post.featuredImage && !imgError ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            style={c.image}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={c.imagePlaceholder}>
            <span style={c.placeholderIcon}>✦</span>
          </div>
        )}
      </Link>
      <div style={c.body}>
        {post.tags && post.tags.length > 0 && (
          <div style={c.tagRow}>
            <Link to={`/blog/tag/${tagToSlug(post.tags[0])}`} style={c.tag}>{post.tags[0]}</Link>
          </div>
        )}
        <h2 style={c.title}><Link to={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</Link></h2>
        {post.excerpt && <p style={c.excerpt}>{post.excerpt}</p>}
        <div style={c.footer}>
          <span style={c.date}>{formatDate(post.date)}</span>
          <Link to={`/blog/${post.slug}`} style={c.readMore}>Read More →</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#f3f4f6',
  },
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(12,12,18,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(46,46,58,0.6)',
  },
  navInner: {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navSignIn: {
    padding: '8px 20px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#a0a8b8',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
  },
  headerOuter: {
    borderBottom: '1px solid #1e1e28',
    padding: '52px 24px 48px',
    textAlign: 'center',
  },
  headerInner: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  backLink: {
    display: 'inline-block',
    fontSize: '13px',
    color: '#a0a8b8',
    textDecoration: 'none',
    padding: '6px 14px',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    fontWeight: '500',
    marginBottom: '28px',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#a855f7',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    margin: '0 0 12px',
  },
  headline: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: '0 0 10px',
    letterSpacing: '-0.8px',
    lineHeight: '1.15',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    textTransform: 'capitalize',
  },
  postCount: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
  },
  container: {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '48px 24px 80px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
  },
  emptyIcon: {
    fontSize: '32px',
    color: '#a855f7',
    opacity: 0.5,
    marginBottom: '16px',
  },
  emptyHeading: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#e5e7eb',
    margin: '0 0 10px',
    letterSpacing: '-0.3px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  emptyBody: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.6',
  },
  emptyLink: {
    color: '#a855f7',
    textDecoration: 'underline',
  },
  ctaCard: {
    background: 'linear-gradient(135deg, rgba(139,47,232,0.12) 0%, rgba(124,58,237,0.06) 100%)',
    border: '1px solid rgba(168,85,247,0.35)',
    borderRadius: '16px',
    padding: '28px 24px',
    textAlign: 'center',
  },
  ctaSparkle: { fontSize: '24px', color: '#a855f7', marginBottom: '12px' },
  ctaHeading: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: '0 0 10px',
    letterSpacing: '-0.3px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  ctaBody: {
    fontSize: '14px',
    color: '#a0a8b8',
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  ctaBtn: {
    display: 'block',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    boxShadow: '0 4px 14px rgba(139,47,232,0.4)',
    marginBottom: '12px',
  },
  ctaNote: { fontSize: '12px', color: '#6b7280', margin: 0 },
  tagsCard: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    padding: '20px 24px',
  },
  tagsHeading: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 14px',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    padding: '4px 10px',
    background: 'rgba(168,85,247,0.10)',
    border: '1px solid rgba(168,85,247,0.25)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#c084fc',
    textDecoration: 'none',
    cursor: 'pointer',
  },
}

const c: Record<string, React.CSSProperties> = {
  card: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
  },
  imagePlaceholder: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    height: '160px',
    background: 'linear-gradient(135deg, rgba(139,47,232,0.15) 0%, rgba(124,58,237,0.08) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: '28px', color: '#a855f7', opacity: 0.5 },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  tagRow: {
    marginBottom: '10px',
    display: 'flex',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    gap: '6px',
  },
  tag: {
    padding: '3px 8px',
    background: 'rgba(168,85,247,0.10)',
    border: '1px solid rgba(168,85,247,0.25)',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#c084fc',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
    textDecoration: 'none',
  },
  title: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 10px',
    letterSpacing: '-0.2px',
    lineHeight: '1.35',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  excerpt: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.65',
    margin: '0 0 16px',
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '14px',
    borderTop: '1px solid #2e2e3a',
  },
  date: { fontSize: '12px', color: '#4b5563' },
  readMore: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#a855f7',
    textDecoration: 'none',
  },
}
