import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostBySlug, getAllPosts, getRelatedPosts, categoryToSlug } from '../lib/blog'
import type { Post, PostMeta } from '../lib/blog'
import { setPageMeta } from '../lib/pageMeta'
import Logo from '../components/Logo'
import AppFooter from '../components/AppFooter'
import logoIconUrl from '../assets/logo-icon.svg'

const SITE_URL = 'https://listingignite.com'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [recentPosts, setRecentPosts] = useState<PostMeta[]>([])
  const [relatedPosts, setRelatedPosts] = useState<PostMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Effect 1: load post data
  useEffect(() => {
    window.scrollTo(0, 0)
    if (!slug) return
    const found = getPostBySlug(slug)
    const all = getAllPosts()
    if (!found) {
      setNotFound(true)
    } else {
      setPost(found)
      setRecentPosts(all.filter(p => p.slug !== slug).slice(0, 3))
      setRelatedPosts(getRelatedPosts(slug, found.category, found.tags ?? []))
    }
    setLoading(false)
  }, [slug])

  // Effect 2: set meta tags only after post data is confirmed loaded
  useEffect(() => {
    if (!post) return
    const description = post.description ?? post.excerpt
    const ogImage = post.featuredImage
      ? (post.featuredImage.startsWith('http') ? post.featuredImage : `${SITE_URL}${post.featuredImage}`)
      : `${SITE_URL}/og-image.png`
    setPageMeta({
      title: `${post.title} — ListingIgnite Blog`,
      description,
      ogType: 'article',
      ogImage,
      ogUrl: `${SITE_URL}/blog/${post.slug}`,
      canonical: `${SITE_URL}/blog/${post.slug}`,
      articlePublishedTime: post.date,
      articleAuthor: post.author,
      keywords: post.tags?.join(', '),
    })
  }, [post])

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
      <div style={s.navOuter}>
        <div style={s.navInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
        </div>
      </div>

      <div style={s.container}>
        <Link to="/blog" style={s.backLink}>← Back to Blog</Link>

        {loading ? (
          <div style={s.stateBox}>
            <span className="generating-pulse" style={s.stateSparkle}>✦</span>
            <p style={s.stateText}>Loading post…</p>
          </div>
        ) : notFound ? (
          <div style={s.notFoundBox}>
            <p style={s.notFoundText}>Post not found.</p>
            <Link to="/blog" style={s.backLink}>← Back to Blog</Link>
          </div>
        ) : post ? (
          <>
            <div className="blog-post-layout">

              {/* ── Main content ── */}
              <article>
                {/* Featured image */}
                <FeaturedImage src={post.featuredImage} alt={post.title} />

                {/* Post header */}
                <header style={s.postHeader}>
                  {post.tags && post.tags.length > 0 && (
                    <div style={s.tagRow}>
                      {post.tags.map(tag => (
                        <span key={tag} style={s.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {post.category && (
                    <Link
                      to={`/blog/category/${categoryToSlug(post.category)}`}
                      style={s.categoryLink}
                    >
                      In: {post.category}
                    </Link>
                  )}
                  <h1 style={s.title}>{post.title}</h1>
                  <div style={s.meta}>
                    <span style={s.author}>By {post.author}</span>
                    <span style={s.metaDot}>·</span>
                    <span style={s.date}>{formatDate(post.date)}</span>
                  </div>
                </header>

                {/* Markdown content */}
                <div style={s.prose}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={mdComponents}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>
              </article>

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

                {/* Recent posts */}
                {recentPosts.length > 0 && (
                  <div style={s.recentCard}>
                    <h4 style={s.recentHeading}>Recent Posts</h4>
                    <div style={s.recentList}>
                      {recentPosts.map(p => (
                        <Link key={p.slug} to={`/blog/${p.slug}`} style={s.recentLink}>
                          {p.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

            </div>

            {/* ── Related Posts ── */}
            {relatedPosts.length > 0 && (
              <section style={s.relatedSection}>
                <hr style={s.relatedDivider} />
                <h2 style={s.relatedHeading}>Keep Reading</h2>
                <div className="blog-card-grid">
                  {relatedPosts.map(p => (
                    <RelatedPostCard key={p.slug} post={p} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>

      <AppFooter />
    </div>
  )
}

// ─── Related post card ───────────────────────────────────────────────────────

function RelatedPostCard({ post }: { post: PostMeta }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div style={r.card}>
      {/* Image */}
      {post.featuredImage && !imgError ? (
        <img
          src={post.featuredImage}
          alt={post.title}
          style={r.image}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={r.imagePlaceholder}>
          <span style={r.placeholderIcon}>✦</span>
        </div>
      )}

      {/* Body */}
      <div style={r.body}>
        {post.category && (
          <Link
            to={`/blog/category/${categoryToSlug(post.category)}`}
            style={r.categoryLabel}
          >
            {post.category}
          </Link>
        )}
        <h3 style={r.title}>{post.title}</h3>
        {post.excerpt && <p style={r.excerpt}>{post.excerpt}</p>}
        <Link to={`/blog/${post.slug}`} style={r.readMore}>Read More →</Link>
      </div>
    </div>
  )
}

// ─── Featured image with error fallback ──────────────────────────────────────

function FeaturedImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        style={s.featuredImage}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div style={s.featuredImagePlaceholder}>
      <img src={logoIconUrl} alt="ListingIgnite" style={s.placeholderLogo} />
    </div>
  )
}

// ─── Markdown component overrides ─────────────────────────────────────────────
// Maps markdown elements to styled JSX so they match the dark premium aesthetic.

const mdComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 style={md.h1}>{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 style={md.h2}>{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 style={md.h3}>{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 style={md.h4}>{children}</h4>,
  p:  ({ children }: { children?: React.ReactNode }) => <p style={md.p}>{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul style={md.ul}>{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol style={md.ol}>{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li style={md.li}>{children}</li>,
  a:  ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} style={md.a} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {children}
    </a>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => <strong style={md.strong}>{children}</strong>,
  em:     ({ children }: { children?: React.ReactNode }) => <em style={md.em}>{children}</em>,
  blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote style={md.blockquote}>{children}</blockquote>,
  code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
    inline
      ? <code style={md.inlineCode}>{children}</code>
      : <pre style={md.pre}><code style={md.code}>{children}</code></pre>,
  hr: () => <hr style={md.hr} />,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div style={md.tableWrapper}><table style={md.table}>{children}</table></div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => <th style={md.th}>{children}</th>,
  td: ({ children }: { children?: React.ReactNode }) => <td style={md.td}>{children}</td>,
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={src} alt={alt ?? ''} style={md.img} />
  ),
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    overflowX: 'hidden',
    background: 'linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#f3f4f6',
  },
  navOuter: {
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
  },
  container: {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '40px 24px 80px',
  },
  backLink: {
    display: 'inline-block',
    fontSize: '13px',
    color: '#a0a8b8',
    textDecoration: 'none',
    padding: '7px 16px',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    fontWeight: '500',
    marginBottom: '32px',
  },
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 0',
    gap: '16px',
  },
  stateSparkle: { fontSize: '28px', color: '#a855f7' },
  stateText: { fontSize: '15px', color: '#6b7280', margin: 0 },
  notFoundBox: {
    textAlign: 'center',
    padding: '80px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  notFoundText: { fontSize: '16px', color: '#6b7280', margin: 0 },
  featuredImage: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    height: '380px',
    objectFit: 'cover',
    borderRadius: '14px',
    display: 'block',
    marginBottom: '32px',
    border: '1px solid #2e2e3a',
  },
  featuredImagePlaceholder: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    height: '400px',
    background: 'linear-gradient(135deg, rgba(139,47,232,0.15) 0%, rgba(124,58,237,0.08) 100%)',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  placeholderLogo: { width: '72px', height: '72px', opacity: 0.7 },
  postHeader: { marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #2e2e3a' },
  tagRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' },
  tag: {
    padding: '3px 10px',
    background: 'rgba(168,85,247,0.10)',
    border: '1px solid rgba(168,85,247,0.25)',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#c084fc',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  categoryLink: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#a855f7',
    textDecoration: 'none',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: '0 0 14px',
    letterSpacing: '-1px',
    lineHeight: '1.15',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  meta: { display: 'flex', alignItems: 'center', gap: '8px' },
  author: { fontSize: '14px', color: '#a0a8b8', fontWeight: '500' },
  metaDot: { color: '#3a3a4a', fontSize: '16px' },
  date: { fontSize: '14px', color: '#6b7280' },
  prose: {},

  ctaCard: {
    width: '100%',
    boxSizing: 'border-box',
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
  recentCard: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    padding: '20px 24px',
  },
  recentHeading: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 16px',
  },
  recentList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  recentLink: {
    fontSize: '14px',
    color: '#d1d5db',
    textDecoration: 'none',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  relatedSection: {
    marginTop: '56px',
  },
  relatedDivider: {
    border: 'none',
    borderTop: '1px solid #2e2e3a',
    margin: '0 0 48px',
  },
  relatedHeading: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: '0 0 28px',
    letterSpacing: '-0.4px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
}

// Markdown-rendered element styles
const md: Record<string, React.CSSProperties> = {
  h1: { fontSize: '28px', fontWeight: '800', color: '#f3f4f6', margin: '40px 0 16px', letterSpacing: '-0.5px', lineHeight: '1.25', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  h2: { fontSize: '22px', fontWeight: '700', color: '#f3f4f6', margin: '36px 0 14px', letterSpacing: '-0.3px', lineHeight: '1.3', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  h3: { fontSize: '18px', fontWeight: '700', color: '#e5e7eb', margin: '28px 0 12px', letterSpacing: '-0.2px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  h4: { fontSize: '15px', fontWeight: '700', color: '#d1d5db', margin: '24px 0 8px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  p:  { fontSize: '16px', color: '#a0a8b8', lineHeight: '1.75', margin: '0 0 20px' },
  ul: { margin: '0 0 20px', paddingLeft: '24px' },
  ol: { margin: '0 0 20px', paddingLeft: '24px' },
  li: { fontSize: '16px', color: '#a0a8b8', lineHeight: '1.7', marginBottom: '6px' },
  a:  { color: '#a855f7', textDecoration: 'underline', textDecorationColor: 'rgba(168,85,247,0.4)' },
  strong: { color: '#e5e7eb', fontWeight: '600' },
  em: { color: '#c084fc', fontStyle: 'italic' },
  blockquote: {
    margin: '24px 0',
    padding: '16px 20px',
    borderLeft: '3px solid #a855f7',
    background: 'rgba(168,85,247,0.06)',
    borderRadius: '0 8px 8px 0',
    color: '#a0a8b8',
    fontSize: '16px',
    lineHeight: '1.7',
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: 'ui-monospace, Consolas, monospace',
    fontSize: '13px',
    background: 'rgba(168,85,247,0.08)',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '4px',
    padding: '2px 6px',
    color: '#c084fc',
  },
  pre: {
    background: '#13131a',
    border: '1px solid #2e2e3a',
    borderRadius: '8px',
    padding: '20px',
    overflowX: 'auto',
    margin: '0 0 24px',
  },
  code: {
    fontFamily: 'ui-monospace, Consolas, monospace',
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.6',
  },
  hr: { border: 'none', borderTop: '1px solid #2e2e3a', margin: '32px 0' },
  tableWrapper: { overflowX: 'auto', margin: '0 0 24px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: {
    padding: '10px 14px',
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    color: '#d1d5db',
    fontWeight: '600',
    textAlign: 'left',
    fontSize: '13px',
    letterSpacing: '0.3px',
  },
  td: {
    padding: '10px 14px',
    border: '1px solid #2e2e3a',
    color: '#a0a8b8',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  img: {
    display: 'block',
    width: '100%',
    borderRadius: '12px',
    margin: '28px 0',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    border: '1px solid #2e2e3a',
  },
}

// ─── Related post card styles ─────────────────────────────────────────────────

const r: Record<string, React.CSSProperties> = {
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
    height: '180px',
    objectFit: 'cover',
    display: 'block',
  },
  imagePlaceholder: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    height: '140px',
    background: 'linear-gradient(135deg, rgba(139,47,232,0.15) 0%, rgba(124,58,237,0.08) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: '24px', color: '#a855f7', opacity: 0.5 },
  body: {
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '8px',
  },
  categoryLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#a855f7',
    textDecoration: 'none',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: 0,
    letterSpacing: '-0.2px',
    lineHeight: '1.35',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  excerpt: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: 0,
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  readMore: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#a855f7',
    textDecoration: 'none',
    marginTop: 'auto',
    paddingTop: '10px',
    borderTop: '1px solid #2e2e3a',
  },
}
