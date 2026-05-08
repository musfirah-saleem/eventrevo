import React, { useState, useEffect } from 'react';
import { djAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import { Trash2, Save } from 'lucide-react';

const DAYS = [{ label:'Sunday',val:0},{ label:'Monday',val:1},{ label:'Tuesday',val:2},{ label:'Wednesday',val:3},{ label:'Thursday',val:4},{ label:'Friday',val:5},{ label:'Saturday',val:6}];

export default function DJAvailability() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState(DAYS.map(d=>({ dayOfWeek:d.val, isAvailable:d.val===5||d.val===6, startTime:'18:00', endTime:'02:00' })));
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    djAPI.getMyProfile().then(r=>{
      const d=r.data.data; setProfile(d);
      if(d.weeklyAvailability?.length) setWeekly(DAYS.map(day=>d.weeklyAvailability.find(a=>a.dayOfWeek===day.val)||{dayOfWeek:day.val,isAvailable:false,startTime:'18:00',endTime:'02:00'}));
    }).catch(()=>toast.error('Failed')).finally(()=>setLoading(false));
  },[]);

  const updateDay = (idx, field, val) => setWeekly(prev=>prev.map((d,i)=>i===idx?{...d,[field]:val}:d));

  const saveAvailability = async () => {
    setSaving(true);
    try { await djAPI.updateAvailability({ weeklyAvailability: weekly }); toast.success('Availability saved! ✓'); }
    catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const addBlock = async () => {
    if(!blockDate){toast.error('Pick a date');return;}
    try {
      const res = await djAPI.blockDate({ date:blockDate, reason:blockReason });
      setProfile(p=>({...p,blockedDates:res.data.data}));
      setBlockDate(''); setBlockReason(''); toast.success('Date blocked ✓');
    } catch { toast.error('Failed'); }
  };

  const removeBlock = async (id) => {
    try { const res = await djAPI.unblockDate(id); setProfile(p=>({...p,blockedDates:res.data.data})); toast.success('Unblocked'); }
    catch { toast.error('Failed'); }
  };

  if(loading) return <div className="dash-layout"><DashSidebar/><main className="dash-main"><PageLoader/></main></div>;

  return (
    <div className="dash-layout">
      <DashSidebar/>
      <main className="dash-main">
        <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', marginBottom:'2rem' }}>Availability</h1>

        <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem' }}>📅 Weekly Schedule</div>
          {weekly.map((day, idx) => (
            <div key={day.dayOfWeek} style={{ display:'grid', gridTemplateColumns:'110px 100px 1fr', alignItems:'center', gap:'1rem', padding:'.65rem 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:'.85rem', fontWeight:500 }}>{DAYS[idx].label}</span>
              <label style={{ display:'flex', alignItems:'center', gap:'.4rem', fontSize:'.8rem', cursor:'pointer' }}>
                <input type="checkbox" checked={day.isAvailable} onChange={e=>updateDay(idx,'isAvailable',e.target.checked)}/> Available
              </label>
              {day.isAvailable && (
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                  <input type="time" className="form-input" style={{ width:100, padding:'.4rem .6rem', fontSize:'.8rem' }} value={day.startTime} onChange={e=>updateDay(idx,'startTime',e.target.value)}/>
                  <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>to</span>
                  <input type="time" className="form-input" style={{ width:100, padding:'.4rem .6rem', fontSize:'.8rem' }} value={day.endTime} onChange={e=>updateDay(idx,'endTime',e.target.value)}/>
                </div>
              )}
            </div>
          ))}
          <button className="btn btn-lime btn-sm" style={{ marginTop:'1rem' }} onClick={saveAvailability} disabled={saving}><Save size={13}/>{saving?'Saving...':'Save Schedule'}</button>
        </div>

        <div className="card" style={{ padding:'1.5rem' }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem' }}>🚫 Block Specific Dates</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:'.8rem', marginBottom:'1rem', alignItems:'end' }}>
            <div><label className="form-label">Date</label><input type="date" className="form-input" value={blockDate} onChange={e=>setBlockDate(e.target.value)}/></div>
            <div><label className="form-label">Reason (optional)</label><input type="text" className="form-input" value={blockReason} onChange={e=>setBlockReason(e.target.value)} placeholder="e.g. Personal / Holiday"/></div>
            <button className="btn btn-danger btn-sm" style={{ marginBottom:'1.1rem' }} onClick={addBlock}>Block Date</button>
          </div>
          {(profile?.blockedDates||[]).length===0 ? <p style={{ fontSize:'.82rem', color:'var(--muted)' }}>No dates blocked yet.</p> : (
            (profile.blockedDates||[]).map(d=>(
              <div key={d._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.5rem .8rem', background:'rgba(239,68,68,.05)', border:'1px solid rgba(239,68,68,.15)', borderRadius:2, marginBottom:'.4rem' }}>
                <div><span style={{ fontSize:'.85rem', fontWeight:500 }}>{new Date(d.date).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span>{d.reason&&<span style={{ fontSize:'.75rem', color:'var(--muted)', marginLeft:'.6rem' }}>{d.reason}</span>}</div>
                <button onClick={()=>removeBlock(d._id)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:'.78rem' }}>Remove</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
