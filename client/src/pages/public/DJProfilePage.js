// client/src/pages/public/DJProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { djAPI, reviewAPI } from '../../utils/api';
import { StatusBadge, PageLoader } from '../../components/ui';
import { Star, MapPin, Clock, DollarSign, ArrowLeft, Instagram, Youtube } from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORM_ICONS = {
  youtube: { icon: '▶', color: '#ff0000', label: 'YouTube' },
  soundcloud: { icon: '☁', color: '#ff5500', label: 'SoundCloud' },
  mixcloud: { icon: '∞', color: '#5000ff', label: 'Mixcloud' },
  instagram: { icon: '◈', color: '#e1306c', label: 'Instagram' },
  spotify: { icon: '♪', color: '#1db954', label: 'Spotify' },
  facebook: { icon: 'f', color: '#1877f2', label: 'Facebook' },
};

function getYouTubeEmbed(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default function DJProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dj, setDj] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([djAPI.getOne(id), reviewAPI.getForDJ(id)])
      .then(([djRes, revRes]) => {
        setDj(djRes.data.data);
        setReviews(revRes.data.data || []);
      })
      .catch(() => toast.error('DJ not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ paddingTop: 60 }}><PageLoader /></div>;
  if (!dj) return (
    <div style={{ paddingTop: 80, textAlign: 'center', padding: '5rem 2rem' }}>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3rem', color: 'var(--muted)' }}>DJ Not Found</div>
      <Link to="/djs" className="btn btn-lime" style={{ marginTop: '1.5rem' }}>Browse DJs</Link>
    </div>
  );

  const initials = dj.stageName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const socialLinks = Object.entries(dj.socials || {}).filter(([, v]) => v);

  return (
    <div style={{ paddingTop: 60 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(to bottom, rgba(168,255,62,0.05), var(--black))', padding: '3rem 2rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,255,62,.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link to="/djs" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <ArrowLeft size={13} /> Back to DJs
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.2rem', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: 3, background: 'linear-gradient(135deg,rgba(168,255,62,.15),transparent)', border: '1px solid rgba(168,255,62,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {dj.profileImage
                ? <img src={dj.profileImage} alt={dj.stageName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: 'var(--lime)' }}>{initials}</span>}
            </div>
            <div>
              <div style={{ marginBottom: '.4rem' }}><span className="badge badge-approved">Verified</span></div>
              <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 'clamp(2.5rem,6vw,4.5rem)', letterSpacing: '.03em', lineHeight: 1 }}>{dj.stageName}</h1>
              <div style={{ display: 'flex', gap: '1.2rem', marginTop: '.4rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--lime)', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                  <Star size={12} fill="currentColor" /> {dj.averageRating?.toFixed(1) || '5.0'}
                  <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>({dj.totalReviews} reviews)</span>
                </span>
                <span style={{ color: 'var(--muted)', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                  <MapPin size={12} /> {dj.location}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                  <Clock size={12} /> {dj.totalBookings}+ bookings
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        <div>
          {/* Genres & Events */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '1rem' }}>🎵 Music & Events</div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '.5rem' }}>Genres</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                {dj.genres?.map(g => <span key={g} className="tag">{g}</span>)}
              </div>
            </div>
            <div>
              <p style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '.5rem' }}>Event Types</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                {dj.eventTypes?.map(t => <span key={t} style={{ fontSize: '.72rem', padding: '3px 9px', border: '1px solid var(--border2)', color: 'var(--muted2)', borderRadius: 2 }}>{t}</span>)}
              </div>
            </div>
          </div>

          {/* Bio */}
          {dj.bio && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '1rem' }}>About</div>
              <p style={{ color: 'var(--muted2)', fontSize: '.88rem', lineHeight: 1.8 }}>{dj.bio}</p>
            </div>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '1rem' }}>🔗 Find Me Online</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {socialLinks.map(([platform, handle]) => {
                  const p = PLATFORM_ICONS[platform] || { icon: '🔗', color: 'var(--lime)', label: platform };
                  const urls = { instagram: `https://instagram.com/${handle}`, facebook: `https://facebook.com/${handle}`, soundcloud: `https://soundcloud.com/${handle}`, spotify: `https://open.spotify.com/artist/${handle}`, youtube: `https://youtube.com/@${handle}`, mixcloud: `https://mixcloud.com/${handle}`, tiktok: `https://tiktok.com/@${handle}` };
                  return (
                    <a key={platform} href={urls[platform] || '#'} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem 1rem', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: 2, textDecoration: 'none', fontSize: '.78rem', color: 'var(--muted2)', transition: 'border-color .2s' }}>
                      <span style={{ color: p.color }}>{p.icon}</span> {p.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Media Links */}
          {dj.mediaLinks?.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '1rem' }}>🎬 Sample Mixes</div>
              {dj.mediaLinks.map(m => {
                const embed = m.platform === 'youtube' ? getYouTubeEmbed(m.url) : null;
                if (embed) return (
                  <div key={m._id} style={{ marginBottom: '1rem' }}>
                    {m.title && <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '.4rem' }}>{m.title}</p>}
                    <div style={{ aspectRatio: '16/9', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <iframe src={embed} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen title={m.title || 'Mix'} />
                    </div>
                  </div>
                );
                const p = PLATFORM_ICONS[m.platform] || { icon: '🔗', color: 'var(--lime)', label: m.platform };
                return (
                  <a key={m._id} href={m.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.6rem .8rem', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: 2, textDecoration: 'none', marginBottom: '.4rem', color: 'var(--muted2)', fontSize: '.82rem' }}>
                    <span style={{ color: p.color, fontSize: '.95rem' }}>{p.icon}</span>
                    <span>{m.title || m.url}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--lime)', fontSize: '.7rem' }}>Open ↗</span>
                  </a>
                );
              })}
            </div>
          )}

          {/* Gallery */}
          {dj.galleryImages?.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '1rem' }}>📸 Gallery</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '.5rem' }}>
                {dj.galleryImages.map((img, i) => (
                  <div key={i} style={{ aspectRatio: '4/3', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={img} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '1rem' }}>★ Reviews</div>
              {reviews.map(r => (
                <div key={r._id} style={{ padding: '1rem', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: 2, marginBottom: '.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--lime-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', color: 'var(--lime)', fontWeight: 500 }}>
                        {r.customer?.name?.[0] || 'A'}
                      </div>
                      <span style={{ fontSize: '.85rem', fontWeight: 500 }}>{r.customer?.name}</span>
                    </div>
                    <div style={{ color: 'var(--lime)', fontSize: '.8rem' }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                  <p style={{ fontSize: '.82rem', color: 'var(--muted2)', fontStyle: 'italic', lineHeight: 1.7 }}>"{r.comment}"</p>
                  {r.reply && <p style={{ fontSize: '.78rem', color: 'var(--lime)', marginTop: '.5rem', paddingLeft: '.8rem', borderLeft: '2px solid var(--lime)' }}>DJ Reply: {r.reply}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.5rem', letterSpacing: '.04em', marginBottom: '1.2rem' }}>Book {dj.stageName}</div>
            <div>
              {[
                { label: 'Rate', value: dj.hourlyRate ? `A$${dj.hourlyRate}/hr` : 'POA', color: 'var(--lime)' },
                { label: 'Min. Hours', value: `${dj.minimumHours}h` },
                { label: 'Min. Booking', value: dj.hourlyRate ? `A$${dj.hourlyRate * dj.minimumHours}` : 'POA' },
                { label: 'All Time Bookings', value: `${dj.totalBookings}+` },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.65rem 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 500, color: color || 'var(--white)' }}>{value}</span>
                </div>
              ))}
            </div>

            {dj.packageDetails && (
              <div style={{ background: 'var(--lime-dim)', border: '1px solid rgba(168,255,62,.2)', padding: '.8rem 1rem', borderRadius: 2, margin: '1rem 0', fontSize: '.78rem', color: 'var(--muted2)', lineHeight: 1.6 }}>
                <div style={{ fontSize: '.62rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: '.3rem' }}>Package Info</div>
                {dj.packageDetails}
              </div>
            )}

            <Link to={`/book/${dj._id}`} className="btn btn-lime btn-full" style={{ marginTop: '1rem', padding: '.9rem', justifyContent: 'center' }}>
              Book This DJ
            </Link>
            <p style={{ fontSize: '.68rem', color: 'var(--muted)', textAlign: 'center', marginTop: '.7rem', lineHeight: 1.6 }}>
              No payment now.{' '}
              {Number(dj.minimumAdvanceAmount || 0) > 0
                ? `Minimum advance deposit of A$${Number(dj.minimumAdvanceAmount).toFixed(0)} on confirmation.`
                : `${dj.advanceBookingPercentage > 0 ? `${dj.advanceBookingPercentage}% deposit` : '20% deposit'} on confirmation.`}{' '}
              Contracts included.
            </p>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){.dj-profile-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
