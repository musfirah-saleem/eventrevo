import React, { useState, useEffect } from 'react';
import { djAPI } from '../../utils/api';
import { DJCard, PageLoader } from '../../components/ui';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EVENT_TYPES = ['Wedding','Corporate','Birthday','EOFY Party','NYE Party','Private Party','Club Night','Festival'];
const GENRES = ['House','Techno','Drum & Bass','Hip-Hop','R&B','Afrobeats','Latin','Pop / Top 40','Commercial Dance','Electro'];

export default function BrowsePage() {
  const [djs, setDjs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ eventType:'', genre:'', minPrice:'', maxPrice:'' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchDJs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filters.eventType) params.eventType = filters.eventType;
      if (filters.genre) params.genre = filters.genre;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      const res = await djAPI.getAll(params);
      setDjs(res.data.data || []);
    } catch { toast.error('Failed to load DJs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDJs(); }, []);

  const hasFilters = Object.values(filters).some(Boolean);

  const clearFilters = () => {
    setFilters({ eventType:'', genre:'', minPrice:'', maxPrice:'' });
    setSearch('');
  };

  return (
    <div style={{ paddingTop:60 }}>
      {/* Header */}
      <div style={{ borderBottom:'1px solid var(--border)', background:'var(--off)', padding:'3rem 2rem 2rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="eyebrow" style={{ marginBottom:'.5rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Canberra's Finest</span></div>
          <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(2.5rem,5vw,4rem)', letterSpacing:'.04em', lineHeight:1, marginBottom:'.5rem' }}>
            Browse <span style={{ fontFamily:"'Playfair Display'", fontStyle:'italic', color:'var(--lime)' }}>DJs</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:'.88rem', marginBottom:'1.5rem' }}>{djs.length} verified DJs available · Canberra, ACT</p>

          {/* Search + filter bar */}
          <div style={{ display:'flex', gap:'.7rem', flexWrap:'wrap' }}>
            <div style={{ position:'relative', flex:1, minWidth:200 }}>
              <Search size={14} style={{ position:'absolute', left:'.9rem', top:'50%', transform:'translateY(-50%)', color:'var(--muted)' }}/>
              <input type="text" className="form-input" style={{ paddingLeft:'2.4rem' }} placeholder="Search by name or style..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchDJs()}/>
            </div>
            <button className={`btn ${showFilters||hasFilters?'btn-lime':'btn-outline'} btn-sm`} onClick={()=>setShowFilters(!showFilters)}>
              <SlidersHorizontal size={13}/> Filters {hasFilters?`(${Object.values(filters).filter(Boolean).length})`:''}
            </button>
            <button className="btn btn-lime btn-sm" onClick={fetchDJs}>Search</button>
            {(hasFilters||search) && <button className="btn btn-ghost btn-sm" onClick={clearFilters}><X size={13}/> Clear</button>}
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'.8rem', marginTop:'1rem', padding:'1.2rem', background:'var(--card)', border:'1px solid var(--border)', borderRadius:3 }}>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Event Type</label>
                <select className="form-input form-select" value={filters.eventType} onChange={e=>setFilters({...filters,eventType:e.target.value})}>
                  <option value="">All Events</option>
                  {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Genre</label>
                <select className="form-input form-select" value={filters.genre} onChange={e=>setFilters({...filters,genre:e.target.value})}>
                  <option value="">All Genres</option>
                  {GENRES.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Min Price ($/hr)</label>
                <input type="number" className="form-input" placeholder="e.g. 100" value={filters.minPrice} onChange={e=>setFilters({...filters,minPrice:e.target.value})}/>
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Max Price ($/hr)</label>
                <input type="number" className="form-input" placeholder="e.g. 300" value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'2rem' }}>
        {loading ? <PageLoader/> : djs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'var(--muted)' }}>
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:'2.5rem', marginBottom:'.5rem' }}>No DJs Found</div>
            <p style={{ fontSize:'.88rem', marginBottom:'1.5rem' }}>Try adjusting your filters or search terms</p>
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>Clear All Filters</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem' }}>
            {djs.map(dj=><DJCard key={dj._id} dj={dj}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
