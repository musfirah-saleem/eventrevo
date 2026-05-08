import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import toast from 'react-hot-toast';
import { uploadAPI } from '../../utils/api';
import { Upload, Loader2 } from 'lucide-react';

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name:user?.name||'', phone:user?.phone||'', location:user?.location||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch('/api/users/me', { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('er_token')}`}, body:JSON.stringify(form) });
      const data = await res.json();
      updateUser(data.data);
      toast.success('Profile saved!');
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('image', file);
    try {
      const res = await uploadAPI.profileImage(fd);
      updateUser({ avatar: res.data.url });
      toast.success('Photo updated!');
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const handlePwSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await fetch('/api/users/me/password', { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('er_token')}`}, body:JSON.stringify(pwForm) });
      toast.success('Password updated!');
      setPwForm({ currentPassword:'', newPassword:'' });
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="dash-layout">
      <DashSidebar/>
      <main className="dash-main">
        <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', marginBottom:'2rem' }}>My Profile</h1>

        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem' }}>👤 Personal Information</div>
          <div style={{ display:'flex', alignItems:'center', gap:'1.2rem', marginBottom:'1.5rem' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--lime-dim)', border:'1px solid rgba(168,255,62,.25)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer', flexShrink:0 }} onClick={()=>fileRef.current?.click()}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', color:'var(--lime)' }}>{initials}</span>}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleUpload}/>
              <button className="btn btn-outline btn-sm" onClick={()=>fileRef.current?.click()} disabled={uploading}>
                {uploading ? <><Loader2 size={12} style={{animation:'spin .8s linear infinite'}}/> Uploading...</> : <><Upload size={12}/> Upload Photo</>}
              </button>
              <p style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:'.3rem' }}>JPG, PNG up to 5MB</p>
            </div>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div className="form-group"><label className="form-label">Phone</label><input type="tel" className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+61 4xx xxx xxx"/></div>
            </div>
            <div className="form-group"><label className="form-label">Location</label><input type="text" className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>
            <button type="submit" className="btn btn-lime" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
          </form>
        </div>

        <div className="card" style={{ padding:'1.5rem' }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem' }}>🔒 Change Password</div>
          <form onSubmit={handlePwSave}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} placeholder="••••••••"/></div>
              <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} placeholder="At least 8 chars"/></div>
            </div>
            <button type="submit" className="btn btn-outline btn-sm" disabled={saving}>Update Password</button>
          </form>
        </div>
      </main>
    </div>
  );
}
