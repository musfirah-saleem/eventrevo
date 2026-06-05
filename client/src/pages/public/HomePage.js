// // // client/src/pages/public/HomePage.js
// // import React from 'react';
// // import { Link } from 'react-router-dom';
// // import { ArrowRight } from 'lucide-react';

// // const STEPS = [
// //   { num:'01', title:'Browse', desc:'Filter by genre, event type, or availability. Watch mixes and read full bios before committing.' },
// //   { num:'02', title:'Enquire', desc:'Submit your event details. Contracts, deposits, and confirmations all handled securely through EventRevo.' },
// //   { num:'03', title:'Celebrate', desc:'Your curated DJ shows up ready. You enjoy the night. We follow up to make sure everything was perfect.' },
// // ];

// // const FEATURES = [
// //   { icon:'🎧', title:'Browse DJs & Talent', desc:'Filter by event type, style, or availability. Every profile has sample mixes and real social links.' },
// //   { icon:'🔒', title:'Secure Bookings', desc:'Deposits and contracts handled through our platform. No awkward cash exchanges, ever.' },
// //   { icon:'✅', title:'Curated & Verified', desc:"Only trusted Canberra DJs make it onto EventRevo. We don't list everyone — only the best." },
// //   { icon:'🎉', title:'Any Event Type', desc:'Corporate, weddings, birthdays, NYE — we have talent for every vibe and guest list.' },
// // ];

// // const CATEGORIES = [
// //   { emoji:'💍', title:'Weddings', desc:'Ceremony to dancefloor — DJs who understand the arc of your most important night.' },
// //   { emoji:'🏢', title:'Corporate', desc:'EOFY parties, product launches, and end-of-year bashes done with polish.' },
// //   { emoji:'🎂', title:'Birthdays', desc:'Milestone parties with DJs who read the room and keep the floor packed.' },
// //   { emoji:'🎆', title:'Seasonal', desc:"NYE, Christmas, and end-of-year celebrations done properly." },
// // ];

// // const TESTIMONIALS = [
// //   { quote:'Booking was completely painless. The DJ read the room perfectly — guests were on the floor the entire night.', name:'Sarah R.', event:'Wedding Reception, Canberra' },
// //   { quote:"Used EventRevo for our EOFY party. Seamless from enquiry to event night. Our team is still talking about it.", name:'Marcus T.', event:'Corporate EOFY, ACT Government' },
// //   { quote:'The verified badge gave me confidence to book without seeing them live first. Absolutely nailed it.', name:'Jess P.', event:'30th Birthday, Braddon ACT' },
// // ];

// // export default function HomePage() {
// //   return (
// //     <main style={{ paddingTop:60 }}>
// //       {/* ── HERO */}
// //       <section style={{ minHeight:'calc(100vh - 60px)', display:'flex', alignItems:'center', padding:'4rem 2rem', position:'relative', overflow:'hidden' }}>
// //         <div style={{ position:'absolute', top:'-10%', right:'-5%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,255,62,.08) 0%,transparent 70%)', pointerEvents:'none' }}/>
// //         <div style={{ position:'absolute', bottom:0, left:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,255,62,.04) 0%,transparent 70%)', pointerEvents:'none' }}/>
// //         <div style={{ maxWidth:1200, margin:'0 auto', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center', position:'relative', zIndex:1 }}>
// //           <div>
// //             <div className="eyebrow" style={{ marginBottom:'1.2rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Canberra's #1 DJ Platform</span></div>
// //             <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(4rem,8vw,8rem)', lineHeight:.92, letterSpacing:'.02em', marginBottom:'1rem' }}>
// //               Book<br/>
// //               <span style={{ fontFamily:"'Playfair Display'", fontStyle:'italic', color:'var(--lime)', fontSize:'clamp(3.5rem,7vw,7rem)', display:'block' }}>Great Nights.</span>
// //               Every Time.
// //             </h1>
// //             <p style={{ color:'var(--muted)', lineHeight:1.78, fontSize:'1rem', maxWidth:420, marginBottom:'2.2rem' }}>
// //               Browse verified Canberra DJs, check mixes, and book with total confidence. Contracts, deposits & confirmations — all handled by EventRevo.
// //             </p>
// //             <div style={{ display:'flex', gap:'.8rem', flexWrap:'wrap' }}>
// //               <Link to="/register" className="btn btn-lime btn-lg">Get Started Free <ArrowRight size={15}/></Link>
// //               <Link to="/djs" className="btn btn-outline btn-lg">Browse DJs</Link>
// //             </div>
// //           </div>
// //           <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'2.5rem' }}>
// //             {[['40+','Verified DJs'],['500+','Events Booked'],['4.9★','Average Rating']].map(([num, label]) => (
// //               <div key={label} style={{ textAlign:'right' }}>
// //                 <div style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(3.5rem,5vw,5.5rem)', lineHeight:1, color:'var(--white)' }}>
// //                   {num.replace('★','')}<span style={{ color:'var(--lime)' }}>{num.includes('★')?'★':'+'}</span>
// //                 </div>
// //                 <div style={{ fontSize:'.7rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--muted)' }}>{label}</div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //         <style>{`@media(max-width:768px){main section:first-of-type .hero-grid{grid-template-columns:1fr!important} main section:first-of-type .hero-stats{display:none!important}}`}</style>
// //       </section>

// //       {/* ── HOW IT WORKS */}
// //       <section style={{ background:'var(--off)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
// //         <div style={{ maxWidth:1200, margin:'0 auto', padding:'5rem 2rem' }}>
// //           <div className="eyebrow" style={{ marginBottom:'.75rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Simple Process</span></div>
// //           <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(2.5rem,4vw,3.8rem)', letterSpacing:'.04em', lineHeight:1, marginBottom:'.5rem' }}>
// //             How It <span style={{ fontFamily:"'Playfair Display'", fontStyle:'italic', color:'var(--lime)' }}>Works</span>
// //           </h2>
// //           <p style={{ color:'var(--muted)', fontSize:'.9rem', marginBottom:'3rem', maxWidth:400 }}>Three steps to a night that delivers — from first browse to final playlist.</p>
// //           <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'var(--border)' }}>
// //             {STEPS.map(s => (
// //               <div key={s.num} style={{ background:'var(--off)', padding:'2.5rem 2rem', transition:'background .25s', cursor:'default' }}
// //                 onMouseEnter={e=>e.currentTarget.style.background='var(--card2)'}
// //                 onMouseLeave={e=>e.currentTarget.style.background='var(--off)'}>
// //                 <div style={{ fontFamily:"'Bebas Neue'", fontSize:'4.5rem', color:'rgba(168,255,62,.1)', lineHeight:1, marginBottom:'.8rem' }}>{s.num}</div>
// //                 <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', letterSpacing:'.05em', marginBottom:'.5rem' }}>{s.title}</div>
// //                 <p style={{ fontSize:'.85rem', color:'var(--muted)', lineHeight:1.75 }}>{s.desc}</p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* ── FEATURES */}
// //       <section style={{ background:'var(--black)' }}>
// //         <div style={{ maxWidth:1200, margin:'0 auto', padding:'5rem 2rem' }}>
// //           <div className="eyebrow" style={{ marginBottom:'.75rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Why EventRevo</span></div>
// //           <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(2.5rem,4vw,3.8rem)', letterSpacing:'.04em', lineHeight:1, marginBottom:'3rem' }}>
// //             Trusted.<br/><span style={{ fontFamily:"'Playfair Display'", fontStyle:'italic', color:'var(--lime)' }}>Verified.</span><br/>Seamless.
// //           </h2>
// //           <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
// //             {FEATURES.map(f => (
// //               <div key={f.title} className="card card-hover" style={{ padding:'1.5rem', display:'flex', gap:'1rem' }}>
// //                 <div style={{ fontSize:'1.4rem', flexShrink:0, marginTop:'.1rem' }}>{f.icon}</div>
// //                 <div>
// //                   <div style={{ fontSize:'.9rem', fontWeight:500, marginBottom:'.35rem' }}>{f.title}</div>
// //                   <p style={{ fontSize:'.82rem', color:'var(--muted)', lineHeight:1.7 }}>{f.desc}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* ── CATEGORIES */}
// //       <section style={{ background:'var(--off)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
// //         <div style={{ maxWidth:1200, margin:'0 auto', padding:'5rem 2rem' }}>
// //           <div className="eyebrow" style={{ marginBottom:'.75rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Event Types</span></div>
// //           <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(2.5rem,4vw,3.8rem)', letterSpacing:'.04em', lineHeight:1, marginBottom:'3rem' }}>
// //             Every <span style={{ fontFamily:"'Playfair Display'", fontStyle:'italic', color:'var(--lime)' }}>Occasion.</span>
// //           </h2>
// //           <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>
// //             {CATEGORIES.map(c => (
// //               <Link key={c.title} to="/djs" className="card card-hover" style={{ padding:'1.5rem', textDecoration:'none', display:'block' }}>
// //                 <div style={{ fontSize:'2rem', marginBottom:'.8rem' }}>{c.emoji}</div>
// //                 <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.4rem', letterSpacing:'.05em', marginBottom:'.4rem' }}>{c.title}</div>
// //                 <p style={{ fontSize:'.78rem', color:'var(--muted)', lineHeight:1.65 }}>{c.desc}</p>
// //               </Link>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* ── TESTIMONIALS */}
// //       <section style={{ background:'var(--black)' }}>
// //         <div style={{ maxWidth:1200, margin:'0 auto', padding:'5rem 2rem' }}>
// //           <div className="eyebrow" style={{ marginBottom:'.75rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Real Reviews</span></div>
// //           <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(2.5rem,4vw,3.8rem)', letterSpacing:'.04em', lineHeight:1, marginBottom:'3rem' }}>
// //             Real Nights.<br/><span style={{ fontFamily:"'Playfair Display'", fontStyle:'italic', color:'var(--lime)' }}>Real Reviews.</span>
// //           </h2>
// //           <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
// //             {TESTIMONIALS.map(t => (
// //               <div key={t.name} className="card" style={{ padding:'1.5rem' }}>
// //                 <div style={{ color:'var(--lime)', fontSize:'.85rem', marginBottom:'.8rem', letterSpacing:'.05em' }}>★★★★★</div>
// //                 <p style={{ fontSize:'.85rem', color:'var(--muted2)', lineHeight:1.78, fontStyle:'italic', marginBottom:'1.2rem' }}>"{t.quote}"</p>
// //                 <div style={{ display:'flex', alignItems:'center', gap:'.7rem', paddingTop:'.8rem', borderTop:'1px solid var(--border)' }}>
// //                   <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--lime-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', color:'var(--lime)', fontWeight:500, flexShrink:0 }}>{t.name[0]}</div>
// //                   <div><div style={{ fontSize:'.82rem', fontWeight:500 }}>{t.name}</div><div style={{ fontSize:'.7rem', color:'var(--muted)' }}>{t.event}</div></div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* ── CTA */}
// //       <section style={{ padding:'7rem 2rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
// //         <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(168,255,62,.06) 0%,transparent 70%)', pointerEvents:'none' }}/>
// //         <div style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
// //           <div className="eyebrow" style={{ justifyContent:'center', marginBottom:'1rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Ready to Book?</span><div className="eyebrow-line"/></div>
// //           <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'clamp(3rem,7vw,6rem)', lineHeight:.92, letterSpacing:'.03em', marginBottom:'1.2rem' }}>
// //             Your Night<br/>Starts <span style={{ fontFamily:"'Playfair Display'", fontStyle:'italic', color:'var(--lime)' }}>Here.</span>
// //           </h2>
// //           <p style={{ color:'var(--muted)', fontSize:'.95rem', lineHeight:1.75, marginBottom:'2.2rem', maxWidth:440, margin:'0 auto 2.2rem' }}>
// //             Browse Canberra's most trusted DJs and lock in your talent. No surprises. Just great nights.
// //           </p>
// //           <div style={{ display:'flex', gap:'.8rem', justifyContent:'center', flexWrap:'wrap' }}>
// //             <Link to="/register" className="btn btn-lime btn-lg">Create Free Account</Link>
// //             <Link to="/djs" className="btn btn-outline btn-lg">Browse DJs</Link>
// //           </div>
// //         </div>
// //       </section>

// //       {/* ── FOOTER */}
// //       <footer style={{ borderTop:'1px solid var(--border)', padding:'2rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
// //         <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.1rem', letterSpacing:'.12em' }}>EVENT<span style={{ color:'var(--lime)' }}>REVO</span></div>
// //         <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
// //           {[['Browse DJs','/djs'],['Sign In','/login'],['Register','/register']].map(([l,to])=>(
// //             <Link key={l} to={to} style={{ fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', color:'var(--muted)', textDecoration:'none', transition:'color .2s' }}
// //               onMouseEnter={e=>e.target.style.color='var(--white)'} onMouseLeave={e=>e.target.style.color='var(--muted)'}>{l}</Link>
// //           ))}
// //         </div>
// //         <div style={{ fontSize:'.68rem', color:'var(--muted)' }}>© {new Date().getFullYear()} EventRevo — Canberra, ACT</div>
// //       </footer>

// //       <style>{`
// //         @media(max-width:900px) {
// //           section > div > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns:1fr!important; }
// //           section > div > div[style*="repeat(4,1fr)"] { grid-template-columns:1fr 1fr!important; }
// //           section > div > div[style*="repeat(3,1fr)"] { grid-template-columns:1fr!important; }
// //         }
// //       `}</style>
// //     </main>
// //   );
// // }



// import React from 'react';
// import { Link } from 'react-router-dom';
// import { ArrowRight } from 'lucide-react';

// const STEPS = [
//   {
//     num: '01',
//     title: 'Browse',
//     desc: 'Filter by genre, event type, or availability. Watch mixes and read full bios before committing.',
//   },
//   {
//     num: '02',
//     title: 'Enquire',
//     desc: 'Submit your event details. Contracts, deposits, and confirmations all handled securely through EventRevo.',
//   },
//   {
//     num: '03',
//     title: 'Celebrate',
//     desc: 'Your curated DJ shows up ready. You enjoy the night. We follow up to make sure everything was perfect.',
//   },
// ];

// const FEATURES = [
//   {
//     icon: '🎧',
//     title: 'Browse DJs & Talent',
//     desc: 'Filter by event type, style, or availability. Every profile has sample mixes and real social links.',
//   },
//   {
//     icon: '🔒',
//     title: 'Secure Bookings',
//     desc: 'Deposits and contracts handled through our platform. No awkward cash exchanges, ever.',
//   },
//   {
//     icon: '✅',
//     title: 'Curated & Verified',
//     desc: "Only trusted Canberra DJs make it onto EventRevo. We don't list everyone — only the best.",
//   },
//   {
//     icon: '🎉',
//     title: 'Any Event Type',
//     desc: 'Corporate, weddings, birthdays, NYE — we have talent for every vibe and guest list.',
//   },
// ];

// const CATEGORIES = [
//   {
//     emoji: '💍',
//     title: 'Weddings',
//     desc: 'Ceremony to dancefloor — DJs who understand the arc of your most important night.',
//   },
//   {
//     emoji: '🏢',
//     title: 'Corporate',
//     desc: 'EOFY parties, product launches, and end-of-year bashes done with polish.',
//   },
//   {
//     emoji: '🎂',
//     title: 'Birthdays',
//     desc: 'Milestone parties with DJs who read the room and keep the floor packed.',
//   },
//   {
//     emoji: '🎆',
//     title: 'Seasonal',
//     desc: 'NYE, Christmas, and end-of-year celebrations done properly.',
//   },
// ];

// const TESTIMONIALS = [
//   {
//     quote:
//       'Booking was completely painless. The DJ read the room perfectly — guests were on the floor the entire night.',
//     name: 'Sarah R.',
//     event: 'Wedding Reception, Canberra',
//   },
//   {
//     quote:
//       'Used EventRevo for our EOFY party. Seamless from enquiry to event night. Our team is still talking about it.',
//     name: 'Marcus T.',
//     event: 'Corporate EOFY, ACT Government',
//   },
//   {
//     quote:
//       'The verified badge gave me confidence to book without seeing them live first. Absolutely nailed it.',
//     name: 'Jess P.',
//     event: '30th Birthday, Braddon ACT',
//   },
// ];

// const STATS = [
//   { value: '40', suffix: '+', label: 'Verified DJs' },
//   { value: '500', suffix: '+', label: 'Events Booked' },
//   { value: '4.9', suffix: '★', label: 'Average Rating' },
// ];

// export default function HomePage() {
//   return (
//     <main className="home-page">
//       {/* HERO */}
//       <section className="home-hero">
//         <div className="home-hero-glow home-hero-glow--top" />
//         <div className="home-hero-glow home-hero-glow--bottom" />

//         <div className="home-hero-grid">
//           <div className="home-hero-content">
//             <div className="eyebrow home-eyebrow">
//               <div className="eyebrow-line" />
//               <span className="eyebrow-text">Canberra&apos;s #1 DJ Platform</span>
//             </div>

//             <h1 className="home-hero-title">
//               Book
//               <br />
//               <span>Great Nights.</span>
//               Every Time.
//             </h1>

//             <p className="home-hero-copy">
//               Browse verified Canberra DJs, check mixes, and book with total confidence.
//               Contracts, deposits &amp; confirmations — all handled by EventRevo.
//             </p>

//             <div className="home-actions">
//               <Link to="/register" className="btn btn-lime btn-lg">
//                 Get Started Free <ArrowRight size={15} />
//               </Link>
//               <Link to="/djs" className="btn btn-outline btn-lg">
//                 Browse DJs
//               </Link>
//             </div>
//           </div>

//           <div className="home-hero-stats" aria-label="EventRevo platform statistics">
//             {STATS.map((stat) => (
//               <div key={stat.label} className="home-stat">
//                 <div className="home-stat-number">
//                   {stat.value}
//                   <span>{stat.suffix}</span>
//                 </div>
//                 <div className="home-stat-label">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section className="home-section home-section--off home-section--border">
//         <div className="home-section-inner">
//           <div className="eyebrow home-eyebrow">
//             <div className="eyebrow-line" />
//             <span className="eyebrow-text">Simple Process</span>
//           </div>

//           <h2 className="home-section-title">
//             How It <em>Works</em>
//           </h2>

//           <p className="home-section-desc">
//             Three steps to a night that delivers — from first browse to final playlist.
//           </p>

//           <div className="home-grid home-grid--steps">
//             {STEPS.map((step) => (
//               <div key={step.num} className="home-step-card">
//                 <div className="home-step-num">{step.num}</div>
//                 <h3 className="home-card-title">{step.title}</h3>
//                 <p className="home-card-copy">{step.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FEATURES */}
//       <section className="home-section home-section--black">
//         <div className="home-section-inner">
//           <div className="eyebrow home-eyebrow">
//             <div className="eyebrow-line" />
//             <span className="eyebrow-text">Why EventRevo</span>
//           </div>

//           <h2 className="home-section-title home-section-title--stacked">
//             Trusted.
//             <br />
//             <em>Verified.</em>
//             <br />
//             Seamless.
//           </h2>

//           <div className="home-grid home-grid--features">
//             {FEATURES.map((feature) => (
//               <div key={feature.title} className="card card-hover home-feature-card">
//                 <div className="home-feature-icon" aria-hidden="true">
//                   {feature.icon}
//                 </div>
//                 <div>
//                   <h3 className="home-feature-title">{feature.title}</h3>
//                   <p className="home-card-copy">{feature.desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CATEGORIES */}
//       <section className="home-section home-section--off home-section--border">
//         <div className="home-section-inner">
//           <div className="eyebrow home-eyebrow">
//             <div className="eyebrow-line" />
//             <span className="eyebrow-text">Event Types</span>
//           </div>

//           <h2 className="home-section-title">
//             Every <em>Occasion.</em>
//           </h2>

//           <div className="home-grid home-grid--categories">
//             {CATEGORIES.map((category) => (
//               <Link
//                 key={category.title}
//                 to="/djs"
//                 className="card card-hover home-category-card"
//               >
//                 <div className="home-category-emoji" aria-hidden="true">
//                   {category.emoji}
//                 </div>
//                 <h3 className="home-card-title">{category.title}</h3>
//                 <p className="home-card-copy">{category.desc}</p>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* TESTIMONIALS */}
//       <section className="home-section home-section--black">
//         <div className="home-section-inner">
//           <div className="eyebrow home-eyebrow">
//             <div className="eyebrow-line" />
//             <span className="eyebrow-text">Real Reviews</span>
//           </div>

//           <h2 className="home-section-title home-section-title--stacked">
//             Real Nights.
//             <br />
//             <em>Real Reviews.</em>
//           </h2>

//           <div className="home-grid home-grid--testimonials">
//             {TESTIMONIALS.map((testimonial) => (
//               <div key={testimonial.name} className="card home-testimonial-card">
//                 <div className="home-stars" aria-label="5 star rating">
//                   ★★★★★
//                 </div>

//                 <p className="home-quote">“{testimonial.quote}”</p>

//                 <div className="home-reviewer">
//                   <div className="home-avatar" aria-hidden="true">
//                     {testimonial.name[0]}
//                   </div>
//                   <div>
//                     <div className="home-reviewer-name">{testimonial.name}</div>
//                     <div className="home-reviewer-event">{testimonial.event}</div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="home-cta">
//         <div className="home-cta-bg" />

//         <div className="home-cta-inner">
//           <div className="eyebrow home-eyebrow home-eyebrow--center">
//             <div className="eyebrow-line" />
//             <span className="eyebrow-text">Ready to Book?</span>
//             <div className="eyebrow-line" />
//           </div>

//           <h2 className="home-cta-title">
//             Your Night
//             <br />
//             Starts <span>Here.</span>
//           </h2>

//           <p className="home-cta-copy">
//             Browse Canberra&apos;s most trusted DJs and lock in your talent. No surprises.
//             Just great nights.
//           </p>

//           <div className="home-actions home-actions--center">
//             <Link to="/register" className="btn btn-lime btn-lg">
//               Create Free Account
//             </Link>
//             <Link to="/djs" className="btn btn-outline btn-lg">
//               Browse DJs
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="home-footer">
//         <div className="home-footer-logo">
//           EVENT<span>REVO</span>
//         </div>

//         <nav className="home-footer-nav" aria-label="Footer navigation">
//           {[
//             ['Browse DJs', '/djs'],
//             ['Sign In', '/login'],
//             ['Register', '/register'],
//           ].map(([label, to]) => (
//             <Link key={label} to={to}>
//               {label}
//             </Link>
//           ))}
//         </nav>

//         <div className="home-copyright">
//           © {new Date().getFullYear()} EventRevo — Canberra, ACT
//         </div>
//       </footer>
//     </main>
//   );
// }



import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Browse',
    desc: 'Filter by genre, event type, or availability. Watch mixes and read full bios before committing.',
  },
  {
    num: '02',
    title: 'Enquire',
    desc: 'Submit your event details. Contracts, deposits, and confirmations all handled securely through EventRevo.',
  },
  {
    num: '03',
    title: 'Celebrate',
    desc: 'Your curated DJ shows up ready. You enjoy the night. We follow up to make sure everything was perfect.',
  },
];

const FEATURES = [
  {
    icon: '🎧',
    title: 'Browse DJs & Talent',
    desc: 'Filter by event type, style, or availability. Every profile has sample mixes and real social links.',
  },
  {
    icon: '🔒',
    title: 'Secure Bookings',
    desc: 'Deposits and contracts handled through our platform. No awkward cash exchanges, ever.',
  },
  {
    icon: '✅',
    title: 'Curated & Verified',
    desc: "Only trusted Canberra DJs make it onto EventRevo. We don't list everyone — only the best.",
  },
  {
    icon: '🎉',
    title: 'Any Event Type',
    desc: 'Corporate, weddings, birthdays, NYE — we have talent for every vibe and guest list.',
  },
];

const CATEGORIES = [
  {
    emoji: '💍',
    title: 'Weddings',
    desc: 'Ceremony to dancefloor — DJs who understand the arc of your most important night.',
  },
  {
    emoji: '🏢',
    title: 'Corporate',
    desc: 'EOFY parties, product launches, and end-of-year bashes done with polish.',
  },
  {
    emoji: '🎂',
    title: 'Birthdays',
    desc: 'Milestone parties with DJs who read the room and keep the floor packed.',
  },
  {
    emoji: '🎆',
    title: 'Seasonal',
    desc: 'NYE, Christmas, and end-of-year celebrations done properly.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Booking was completely painless. The DJ read the room perfectly — guests were on the floor the entire night.',
    name: 'Sarah R.',
    event: 'Wedding Reception, Canberra',
  },
  {
    quote:
      'Used EventRevo for our EOFY party. Seamless from enquiry to event night. Our team is still talking about it.',
    name: 'Marcus T.',
    event: 'Corporate EOFY, ACT Government',
  },
  {
    quote:
      'The verified badge gave me confidence to book without seeing them live first. Absolutely nailed it.',
    name: 'Jess P.',
    event: '30th Birthday, Braddon ACT',
  },
];

const STATS = [
  { value: '40', suffix: '+', label: 'Verified DJs' },
  { value: '500', suffix: '+', label: 'Events Booked' },
  { value: '4.9', suffix: '★', label: 'Average Rating' },
];

export default function HomePage() {
  return (
    <main className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-glow home-hero-glow--top" />
        <div className="home-hero-glow home-hero-glow--bottom" />

        <div className="home-hero-grid">
          <div className="home-hero-content">
            <div className="eyebrow home-eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Canberra&apos;s #1 DJ Platform</span>
            </div>

            <h1 className="home-hero-title">
              Book
              <br />
              <span>Great Nights.</span>
              Every Time.
            </h1>

            <p className="home-hero-copy">
              Browse verified Canberra DJs, check mixes, and book with total confidence.
              Contracts, deposits &amp; confirmations — all handled by EventRevo.
            </p>

            <div className="home-actions">
              <Link to="/register" className="btn btn-lime btn-lg">
                Get Started Free <ArrowRight size={15} />
              </Link>

              <Link to="/djs" className="btn btn-outline btn-lg">
                Browse DJs
              </Link>
            </div>
          </div>

          <div className="home-hero-stats" aria-label="EventRevo platform statistics">
            {STATS.map((stat) => (
              <div key={stat.label} className="home-stat">
                <div className="home-stat-number">
                  {stat.value}
                  <span>{stat.suffix}</span>
                </div>
                <div className="home-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section home-section--off home-section--border">
        <div className="home-section-inner">
          <div className="eyebrow home-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Simple Process</span>
          </div>

          <h2 className="home-section-title">
            How It <em>Works</em>
          </h2>

          <p className="home-section-desc">
            Three steps to a night that delivers — from first browse to final playlist.
          </p>

          <div className="home-grid home-grid--steps">
            {STEPS.map((step) => (
              <div key={step.num} className="home-step-card">
                <div className="home-step-num">{step.num}</div>
                <h3 className="home-card-title">{step.title}</h3>
                <p className="home-card-copy">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}z
      <section className="home-section home-section--black">
        <div className="home-section-inner">
          <div className="eyebrow home-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Why EventRevo</span>
          </div>

          <h2 className="home-section-title home-section-title--stacked">
            Trusted.
            <br />
            <em>Verified.</em>
            <br />
            Seamless.
          </h2>

          <div className="home-grid home-grid--features">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card card-hover home-feature-card">
                <div className="home-feature-icon" aria-hidden="true">
                  {feature.icon}
                </div>

                <div>
                  <h3 className="home-feature-title">{feature.title}</h3>
                  <p className="home-card-copy">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="home-section home-section--off home-section--border">
        <div className="home-section-inner">
          <div className="eyebrow home-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Event Types</span>
          </div>

          <h2 className="home-section-title">
            Every <em>Occasion.</em>
          </h2>

          <div className="home-grid home-grid--categories">
            {CATEGORIES.map((category) => (
              <Link
                key={category.title}
                to="/djs"
                className="card card-hover home-category-card"
              >
                <div className="home-category-emoji" aria-hidden="true">
                  {category.emoji}
                </div>

                <h3 className="home-card-title">{category.title}</h3>
                <p className="home-card-copy">{category.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="home-section home-section--black">
        <div className="home-section-inner">
          <div className="eyebrow home-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Real Reviews</span>
          </div>

          <h2 className="home-section-title home-section-title--stacked">
            Real Nights.
            <br />
            <em>Real Reviews.</em>
          </h2>

          <div className="home-grid home-grid--testimonials">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="card home-testimonial-card">
                <div className="home-stars" aria-label="5 star rating">
                  ★★★★★
                </div>

                <p className="home-quote">“{testimonial.quote}”</p>

                <div className="home-reviewer">
                  <div className="home-avatar" aria-hidden="true">
                    {testimonial.name[0]}
                  </div>

                  <div>
                    <div className="home-reviewer-name">{testimonial.name}</div>
                    <div className="home-reviewer-event">{testimonial.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-bg" />

        <div className="home-cta-inner">
          <div className="eyebrow home-eyebrow home-eyebrow--center">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Ready to Book?</span>
            <div className="eyebrow-line" />
          </div>

          <h2 className="home-cta-title">
            Your Night
            <br />
            Starts <span>Here.</span>
          </h2>

          <p className="home-cta-copy">
            Browse Canberra&apos;s most trusted DJs and lock in your talent. No surprises.
            Just great nights.
          </p>

          <div className="home-actions home-actions--center">
            <Link to="/register" className="btn btn-lime btn-lg">
              Create Free Account
            </Link>

            <Link to="/djs" className="btn btn-outline btn-lg">
              Browse DJs
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-logo">
          EVENT<span>REVO</span>
        </div>

        <nav className="home-footer-nav" aria-label="Footer navigation">
          {[
            ['Browse DJs', '/djs'],
            ['Sign In', '/login'],
            ['Register', '/register'],
          ].map(([label, to]) => (
            <Link key={label} to={to}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="home-copyright">
          © {new Date().getFullYear()} EventRevo — Canberra, ACT
        </div>
      </footer>
    </main>
  );
}