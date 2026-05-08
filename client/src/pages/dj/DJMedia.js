import React, { useState, useEffect, useRef } from 'react';
import { djAPI, uploadAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Loader2, ExternalLink } from 'lucide-react';

const PLATFORMS = ['youtube','soundcloud','mixcloud','instagram','spotify','facebook'];
const PLATFORM_ICONS = { youtube:'▶', soundcloud:'☁', mixcloud:'∞', instagram:'◈', spotify:'♪', facebook:'f' };

export default function DJMedia() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newLink, setNewLink] = useState({ platform:'youtube', url:'', title:'' });
  const galleryRef = useRef();

  useEffect(()=>{
    djAPI.getMyProfile().then(r=>setProfile(r.data.data)).catch(()=>toast.error('Failed')).finally(()=>setLoading(false));
  },[]);

  const addLink = async () => {
    if(!newLink.url){toast.error('Please paste a URL');return;}
    try {
      const res = await djAPI.addMedia(newLink);
      setProfile(p=>({...p, mediaLinks: res.data.data}));
      setNewLink({platform:'youtube',url:'',title:''});
      toast.success('Link added!');
    } catch { toast.error('Failed to add'); }
  };

  const removeLink = async (id) => {
    try {
      const res = await djAPI.removeMedia(id);
      setProfile(p=>({...p, mediaLinks: res.data.data}));
      toast.success('Removed');
    } catch { toast.error('Failed'); }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('image', file);
    try {
      const res = await uploadAPI.galleryImage(fd);
      setProfile(p=>({...p, galleryImages: res.data.galleryImages}));
      toast.success('Photo added!');
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const removePhoto = async (url) => {
    try {
      await uploadAPI.deleteGallery(url);
      setProfile(p=>({...p, galleryImages: p.galleryImages.filter(u=>u!==url)}));
      toast.success('Photo removed');
    } catch { toast.error('Failed'); }
  };

  if(loading) return <div className="dash-layout"><DashSidebar/><main className="dash-main"><PageLoader/></main></div>;

  return (
    <div className="dash-layout">
      <DashSidebar/>
      <main className="dash-main">
        <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', marginBottom:'.5rem' }}>Media & Links</h1>
        <p style={{ color:'var(--muted)', fontSize:'.85rem', marginBottom:'2rem' }}>Showcase your work — photos, mixes, and social links all appear on your public profile.</p>

        {/* Gallery Photos */}
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'.8rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem' }}>📸 Gallery Photos</div>
          <p style={{ fontSize:'.8rem', color:'var(--muted)', marginBottom:'1rem' }}>Upload photos from your events. Shown in your profile gallery.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:'.6rem' }}>
            {(profile?.galleryImages||[]).map(url=>(
              <div key={url} style={{ aspectRatio:'16/9', position:'relative', borderRadius:2, overflow:'hidden', border:'1px solid var(--border)' }}>
                <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                <button onClick={()=>removePhoto(url)} style={{ position:'absolute', top:4, right:4, width:20, height:20, background:'rgba(239,68,68,.85)', border:'none', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', fontSize:'.7rem' }}><Trash2 size={10}/></button>
              </div>
            ))}
            <input ref={galleryRef} type="file" accept="image/*" style={{ display:'none' }} onChange={uploadPhoto}/>
            <div onClick={()=>galleryRef.current?.click()} style={{ aspectRatio:'16/9', border:'1px dashed var(--border2)', borderRadius:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:'.3rem', color:'var(--muted)', transition:'border-color .2s' }}>
              {uploading ? <Loader2 size={16} style={{animation:'spin .8s linear infinite',color:'var(--lime)'}}/> : <><Upload size={14}/><span style={{ fontSize:'.7rem' }}>Add Photo</span></>}
            </div>
          </div>
        </div>

        {/* Mix / Video Links */}
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'.8rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem' }}>🎬 Mixes & Video Links</div>
          {(profile?.mediaLinks||[]).map(m=>(
            <div key={m._id} style={{ display:'flex', alignItems:'center', gap:'.8rem', padding:'.6rem .8rem', background:'var(--off)', border:'1px solid var(--border)', borderRadius:2, marginBottom:'.4rem' }}>
              <span style={{ color:'var(--lime)', fontSize:'1rem', width:20, textAlign:'center' }}>{PLATFORM_ICONS[m.platform]||'🔗'}</span>
              <span style={{ fontSize:'.75rem', color:'var(--muted)', textTransform:'capitalize', minWidth:80 }}>{m.platform}</span>
              <span style={{ fontSize:'.8rem', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title||m.url}</span>
              <a href={m.url} target="_blank" rel="noreferrer" style={{ color:'var(--blue)', fontSize:'.7rem' }}><ExternalLink size={12}/></a>
              <button onClick={()=>removeLink(m._id)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer' }}><Trash2 size={13}/></button>
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr auto', gap:'.6rem', marginTop:'1rem', alignItems:'end' }}>
            <div>
              <label className="form-label">Platform</label>
              <select className="form-input form-select" value={newLink.platform} onChange={e=>setNewLink({...newLink,platform:e.target.value})}>
                {PLATFORMS.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">URL</label>
              <input type="url" className="form-input" value={newLink.url} onChange={e=>setNewLink({...newLink,url:e.target.value})} placeholder="https://..."/>
            </div>
            <div>
              <label className="form-label">Title (optional)</label>
              <input type="text" className="form-input" value={newLink.title} onChange={e=>setNewLink({...newLink,title:e.target.value})} placeholder="e.g. Summer Mix 2025"/>
            </div>
            <button className="btn btn-lime btn-sm" onClick={addLink} style={{ marginBottom:'1.1rem' }}><Plus size={14}/> Add</button>
          </div>
        </div>
      </main>
    </div>
  );
}
