import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllPosts, getAllCategories } from '../lib/blog'
import type { PostMeta } from '../lib/blog'
import { setPageMeta } from '../lib/pageMeta'
import Logo from '../components/Logo'
import AppFooter from '../components/AppFooter'

export default function Blog() {
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [categories, setCategories] = useState<{ name: string; slug: string; count: number }[]>([])

  useEffect(() => {
    window.scrollTo(0, 0)
    setPosts(getAllPosts())
    setCategories(getAllCategories())
    setPageMeta({
      title: 'Blog — ListingIgnite',
      description: 'Real estate marketing tips, AI tools, and strategies to help agents generate more leads and close more deals.',
      ogUrl: 'https://listingignite.com/blog',
      canonical: 'https://listingignite.com/blog',
    })
    return () => {
      // Reset to site defaults when navigating away so these tags don't bleed
      // into other pages (e.g. individual blog post pages).
      setPageMeta({
        title: 'ListingIgnite — AI Marketing for Real Estate Agents',
        description: 'AI-generated marketing content for every listing — MLS copy, social posts, email blast, and more. In seconds.',
        ogUrl: 'https://listingignite.com',
      })
    }
  }, [])

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags ?? []))).sort()

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
          <p style={s.eyebrow}>The Blog</p>
          <h1 style={s.headline}>Real Estate Marketing, Simplified.</h1>
          <p style={s.subheadline}>
            Practical guides, strategies, and insights for agents who want to market faster and sell more.
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
                <h2 style={s.emptyHeading}>Posts coming soon.</h2>
                <p style={s.emptyBody}>We're working on practical guides for real estate agents. Check back soon.</p>
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

            {/* Popular tags */}
            {allTags.length > 0 && (
              <div style={s.tagsCard}>
                <h4 style={s.tagsHeading}>Popular Topics</h4>
                <div style={s.tagList}>
                  {allTags.map(tag => (
                    <span key={tag} style={s.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div style={s.tagsCard}>
                <h4 style={s.tagsHeading}>Categories</h4>
                <div style={s.categoryList}>
                  {categories.map(cat => (
                    <Link key={cat.slug} to={`/blog/category/${cat.slug}`} style={s.categoryLink}>
                      <span>{cat.name}</span>
                      <span style={s.categoryCount}>{cat.count}</span>
                    </Link>
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
      {/* Image */}
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

      {/* Content */}
      <div style={c.body}>
        {post.tags && post.tags.length > 0 && (
          <div style={c.tagRow}>
            <span style={c.tag}>{post.tags[0]}</span>
          </div>
        )}
        <h2 style={c.title}>{post.title}</h2>
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
    padding: '64px 24px',
    textAlign: 'center',
  },
  headerInner: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#a855f7',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    margin: '0 0 16px',
  },
  headline: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: '0 0 16px',
    letterSpacing: '-1px',
    lineHeight: '1.1',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  subheadline: {
    fontSize: '17px',
    color: '#a0a8b8',
    lineHeight: '1.65',
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
    cursor: 'default',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  categoryLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 10px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#d1d5db',
    textDecoration: 'none',
    background: 'transparent',
    transition: 'background 0.15s',
  },
  categoryCount: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '400',
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
  tagRow: { marginBottom: '10px' },
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
