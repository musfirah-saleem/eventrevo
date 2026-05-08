// client/src/pages/dj/DJProfileEdit.js
import React, { useState, useEffect, useRef } from 'react';
import { djAPI, uploadAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import { Upload, Loader2, Save } from 'lucide-react';

const ALL_GENRES = ['House','Techno','Drum & Bass','Hip-Hop','R&B','Afrobeats','Latin','Pop / Top 40','Commercial Dance','Classic Hits','Electro','Funk / Soul','Reggaeton','Deep House','Minimal','Other'];
const ALL_EVENTS = ['Wedding','Corporate','Birthday','EOFY Party','NYE Party','Private Party','Club Night','Festival','Anniversary','Engagement','Other'];

const SectionTitle = ({ children }) => (
  <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem', fontWeight:500 }}>
    {children}
  </div>
);

export default function DJProfileEdit() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({ stageName:'', bio:'', location:'Canberra, ACT', hourlyRate:'', minimumHours:'2', packageDetails:'', genres:[], eventTypes:[], socials:{ instagram:'', facebook:'', soundcloud:'', spotify:'', youtube:'', mixcloud:'', tiktok:'' } });

  useEffect(() => {
    djAPI.getMyProfile().then(r => {
      const d = r.data.data;
      setProfile(d);
      setForm({ stageName:d.stageName||'', bio:d.bio||'', location:d.location||'Canberra, ACT', hourlyRate:d.hourlyRate||'', minimumHours:d.minimumHours||2, packageDetails:d.packageDetails||'', genres:d.genres||[], eventTypes:d.eventTypes||[], socials:{ instagram:d.socials?.instagram||'', facebook:d.socials?.facebook||'', soundcloud:d.socials?.soundcloud||'', spotify:d.socials?.spotify||'', youtube:d.socials?.youtube||'', mixcloud:d.socials?.mixcloud||'', tiktok:d.socials?.tiktok||'' } });
    }).catch(()=>toast.error('Failed to load profile')).finally(()=>setLoading(false));
  }, []);

  const toggleChip = (arr, val, key) => {
    const next = arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val];
    setForm(f=>({...f, [key]: next}));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await djAPI.updateMyProfile({ ...form, hourlyRate: Number(form.hourlyRate), minimumHours: Number(form.minimumHours) });
      toast.success('Profile saved! ✓');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('image', file);
    try {
      const res = await uploadAPI.profileImage(fd);
      setProfile(p => ({...p, profileImage: res.data.url}));
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  if (loading) return <div className="dash-layout"><DashSidebar/><main className="dash-main"><PageLoader/></main></div>;

  const initials = form.stageName?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="dash-layout">
      <DashSidebar/>
      <main className="dash-main">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom:'.4rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Edit DJ Profile</span></div>
            <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', lineHeight:1 }}>My Profile</h1>
            <p style={{ fontSize:'.8rem', color:'var(--muted)', marginTop:'.25rem' }}>Your public profile on the EventRevo marketplace</p>
          </div>
          <div style={{ display:'flex', gap:'.6rem', alignItems:'center' }}>
            {profile?.status && (
              <span className={`badge ${profile.status==='approved'?'badge-approved':'badge-pending_review'}`}>{profile.status==='approved'?'Live on Marketplace':'Pending Review'}</span>
            )}
            <button className="btn btn-lime" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} style={{animation:'spin .8s linear infinite'}}/> : <Save size={14}/>}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Identity */}
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <SectionTitle>🎭 Identity</SectionTitle>
          <div style={{ display:'flex', alignItems:'center', gap:'1.2rem', marginBottom:'1.5rem' }}>
            <div style={{ width:76, height:76, borderRadius:'50%', background:'var(--lime-dim)', border:'1px solid rgba(168,255,62,.25)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer', flexShrink:0 }} onClick={()=>fileRef.current?.click()}>
              {profile?.profileImage ? <img src={profile.profileImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.8rem', color:'var(--lime)' }}>{initials}</span>}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload}/>
              <button className="btn btn-outline btn-sm" onClick={()=>fileRef.current?.click()} disabled={uploading}>
                {uploading ? <><Loader2 size={12} style={{animation:'spin .8s linear infinite'}}/> Uploading...</> : <><Upload size={12}/> Upload Photo</>}
              </button>
              <p style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:'.3rem' }}>Shown on your public profile</p>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Stage Name *</label><input type="text" className="form-input" value={form.stageName} onChange={e=>setForm({...form,stageName:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Location</label><input type="text" className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>
          </div>
          <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input form-textarea" style={{ minHeight:110 }} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Tell customers about your style, experience, and what makes you different..."/></div>
        </div>

        {/* Pricing */}
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <SectionTitle>💰 Pricing</SectionTitle>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Hourly Rate (A$)</label><input type="number" className="form-input" value={form.hourlyRate} onChange={e=>setForm({...form,hourlyRate:e.target.value})} placeholder="e.g. 200" min={0}/></div>
            <div className="form-group"><label className="form-label">Minimum Hours</label><input type="number" className="form-input" value={form.minimumHours} onChange={e=>setForm({...form,minimumHours:e.target.value})} min={1} max={12}/></div>
          </div>
          <div className="form-group"><label className="form-label">Package Details (optional)</label><textarea className="form-input" style={{ minHeight:70, resize:'none' }} value={form.packageDetails} onChange={e=>setForm({...form,packageDetails:e.target.value})} placeholder="e.g. Wedding package includes ceremony + reception..."/></div>
        </div>

        {/* Genres */}
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <SectionTitle>🎵 Music Genres</SectionTitle>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
            {ALL_GENRES.map(g=><button key={g} type="button" className={`genre-chip ${form.genres.includes(g)?'active':''}`} onClick={()=>toggleChip(form.genres,g,'genres')}>{g}</button>)}
          </div>
        </div>

        {/* Event Types */}
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <SectionTitle>🎉 Event Types</SectionTitle>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
            {ALL_EVENTS.map(t=><button key={t} type="button" className={`genre-chip ${form.eventTypes.includes(t)?'active':''}`} onClick={()=>toggleChip(form.eventTypes,t,'eventTypes')}>{t}</button>)}
          </div>
        </div>

        {/* Socials */}
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <SectionTitle>🔗 Social & Platform Links</SectionTitle>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.8rem' }}>
            {[
              { key:'instagram', prefix:'instagram.com/', label:'Instagram' },
              { key:'facebook', prefix:'facebook.com/', label:'Facebook' },
              { key:'soundcloud', prefix:'soundcloud.com/', label:'SoundCloud' },
              { key:'spotify', prefix:'open.spotify.com/artist/', label:'Spotify' },
              { key:'youtube', prefix:'youtube.com/@', label:'YouTube' },
              { key:'mixcloud', prefix:'mixcloud.com/', label:'Mixcloud' },
              { key:'tiktok', prefix:'tiktok.com/@', label:'TikTok' },
            ].map(({ key, prefix, label }) => (
              <div key={key} className="form-group" style={{ margin:0 }}>
                <label className="form-label">{label}</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:'.8rem', top:'50%', transform:'translateY(-50%)', fontSize:'.68rem', color:'var(--muted)', pointerEvents:'none', whiteSpace:'nowrap' }}>{prefix}</span>
                  <input type="text" className="form-input" style={{ paddingLeft: `${prefix.length * 0.45 + 1.2}rem` }} value={form.socials[key]} onChange={e=>setForm(f=>({...f,socials:{...f.socials,[key]:e.target.value}}))} placeholder="yourhandle"/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:'1rem' }}>
          <button className="btn btn-lime" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          <a href={`/djs/${profile?._id}`} className="btn btn-outline" target="_blank" rel="noreferrer">Preview Profile →</a>
        </div>
      </main>
    </div>
  );
}
