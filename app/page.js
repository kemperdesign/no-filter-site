import { Fragment } from 'react';
import { supabase, fileUrl } from '../lib/supabase';
import Player from './Player';

export const revalidate = 30;

const todayET = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const dateParts = (d) => {
  const dt = new Date(`${d}T12:00:00`);
  return {
    short: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    long: dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  };
};

async function load() {
  const today = todayET();
  const [shows, news, tracks, media, band, settings] = await Promise.all([
    supabase.from('nf_shows').select('*').eq('published', true).gte('show_date', today).order('show_date').order('start_time'),
    supabase.from('nf_news').select('*').eq('published', true).order('posted_at', { ascending: false }).limit(3),
    supabase.from('nf_tracks').select('*').eq('published', true).order('sort_order').order('created_at'),
    supabase.from('nf_media').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false }),
    supabase.from('nf_band_members').select('*').order('sort_order'),
    supabase.from('nf_settings').select('*'),
  ]);
  const s = {};
  (settings.data || []).forEach((r) => (s[r.key] = r.value));
  return {
    shows: shows.data || [],
    news: news.data || [],
    tracks: tracks.data || [],
    media: media.data || [],
    band: band.data || [],
    s,
  };
}

const words = ['Live music', 'Classic rock', 'Oldies', 'Originals', 'Jacksonville, FL'];
const ticker = [...words, ...words, ...words, ...words];
const sounds = [
  { t: 'Classic rock', d: 'The songs everyone in the room already knows the words to.' },
  { t: 'Oldies', d: 'Good-time favorites that get people out of their chairs.' },
  { t: 'Originals', d: 'The band records its own songs in the studio. Originals always welcome.' },
];

export default async function Home() {
  const data = await load();
  const { shows, news, band, s } = data;
  const next = shows[0];
  const later = shows.slice(1);
  const hero = data.media.find((m) => m.slot === 'hero' && m.kind === 'image');
  const heroSrc = hero ? fileUrl('nf-media', hero.file_path) : '/img/band-picture-standard.jpg';
  const photos = data.media
    .filter((m) => m.slot !== 'hero')
    .map((m) => ({ u: fileUrl('nf-media', m.file_path), kind: m.kind }));
  const tracks = data.tracks.map((t) => ({ n: t.title, u: t.external_url || fileUrl('nf-tracks', t.file_path) }));
  const trackUrl = (name) => (tracks.find((t) => t.n === name) || {}).u || '#downloads';
  const phoneDigits = (s.phone || '').replace(/\D/g, '');
  const mapQuery = next ? [next.venue, next.address, next.city].filter(Boolean).join(' ') : '';

  return (
    <div className="site">
      <div className="studio-bg" aria-hidden="true" />
      <Player tracks={tracks} />
      <div style={{ position: 'relative', zIndex: 1 }}>
<header id="top" style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px 56px", overflow: "hidden" }}>
<nav style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", alignItems: "center", justifyContent: "space-between", padding: "22px 0", borderBottom: "3px solid #0b0b0b" }}>
<a href="#top" aria-label="No Filter" style={{ display: "block", font: "900 38px/.8 var(--font-display),Impact,sans-serif", textTransform: "uppercase", textDecoration: "none", letterSpacing: "-.02em", paddingBottom: "4px" }}><span style={{ display: "block", position: "relative", zIndex: "1" }}>No</span><span style={{ display: "block", marginLeft: "14px", marginTop: "-6px", WebkitTextStroke: "1.5px #0b0b0b", color: "transparent" }}>Filter</span></a>
<div style={{ display: "flex", flexWrap: "wrap", gap: "4px 26px", alignItems: "center", font: "15px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>
<a href="#shows" style={{ textDecoration: "none", padding: "10px 0" }}>Shows</a>
<a href="#sound" style={{ textDecoration: "none", padding: "10px 0" }}>Sound</a>
<a href="#studio" style={{ textDecoration: "none", padding: "10px 0" }}>Studio</a>
<a href="#band" style={{ textDecoration: "none", padding: "10px 0" }}>Band</a>
<a href="#book" style={{ textDecoration: "none", padding: "10px 18px", background: "#0b0b0b", color: "#fff" }}>Book the band</a>
</div>
</nav>

<h1 style={{ margin: "36px 0 0", lineHeight: "0" }}><img src="/img/logo.png" alt="No Filter" style={{ display: "block", width: "100%", maxWidth: "1100px", height: "auto", mixBlendMode: "multiply" }} /></h1>

<div style={{ display: "flex", flexWrap: "wrap", gap: "40px 56px", alignItems: "flex-start", marginTop: "40px" }}>
<div style={{ flex: "1 1 380px", minWidth: "0" }}>
<p style={{ margin: "0", fontSize: "22px", lineHeight: "1.45", maxWidth: "32ch" }}>A dance band that tries to play a little something for everybody. Classic rock and oldies out of Jacksonville, Florida.</p>
<div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "28px" }}>
<a href="#shows" style={{ padding: "15px 26px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".06em", textDecoration: "none", border: "3px solid #0b0b0b", background: "#0b0b0b", color: "#fff", boxShadow: "6px 6px 0 #8a8a8a" }}>See the next show</a>
</div>
<div id="downloads" style={{ marginTop: "40px", background: "#0b0b0b", color: "#fff", padding: "28px 28px 12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #8a8a8a", maxWidth: "560px" }}>
<h2 style={{ margin: "0 0 26px", font: "900 clamp(40px,5vw,64px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Free original tracks</h2>
{tracks.map((t, i) => (<Fragment key={i}>
<div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "16px 0", borderBottom: "2px solid #333" }}>
<div style={{ flex: "0 0 64px", height: "64px", borderRadius: "50%", border: "2px solid #555", background: "radial-gradient(circle at center,#fff 0 7%,#0b0b0b 7.5% 12%,#1a1a1a 12.5% 38%,#2c2c2c 39% 40%,#141414 41% 60%,#2c2c2c 61% 62%,#141414 63% 100%)" }}></div>
<div style={{ flex: "1 1 auto", minWidth: "0", font: "900 30px/1 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>{t.n}</div>
<a href={t.u} download style={{ padding: "11px 18px", border: "3px solid #fff", color: "#fff", fontWeight: "800", fontSize: "14px", textTransform: "uppercase", letterSpacing: ".08em", textDecoration: "none" }} className="hv1">Download</a>
</div>
</Fragment>))}
</div>

</div>

<div id="shows" style={{ flex: "0 1 430px", minWidth: "290px" }}>
<img src={heroSrc} alt="No Filter on stage" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", marginBottom: "34px", border: "10px solid #fff", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(-1.6deg)", filter: "none" }} />
<div style={{ background: '#fff', border: '3px solid #0b0b0b', boxShadow: '10px 10px 0 #0b0b0b', transform: 'rotate(1.4deg)' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: '#0b0b0b', color: '#fff', font: "13px var(--font-type),monospace", textTransform: 'uppercase', letterSpacing: '.08em' }}><span>Next show</span><span>Admit one</span></div>
<div style={{ padding: '18px 22px 8px' }}>
{next ? (<>
<div style={{ font: "900 clamp(88px,12vw,128px)/.82 var(--font-display),Impact,sans-serif", textTransform: 'uppercase' }}>{dateParts(next.show_date).short}</div>
<div style={{ font: "900 36px/.95 var(--font-display),Impact,sans-serif", textTransform: 'uppercase', marginTop: 16 }}>{next.venue}</div>
</>) : (
<div style={{ font: "900 64px/.9 var(--font-display),Impact,sans-serif", textTransform: 'uppercase' }}>New dates soon</div>
)}
<hr style={{ border: 0, borderTop: '3px dashed #0b0b0b', margin: '18px -22px 0' }} />
</div>
<div style={{ padding: '14px 22px 18px', fontSize: 18, lineHeight: 1.4 }}>
{next ? (<>
<p style={{ margin: '0 0 8px' }}>{next.start_time && <>{next.start_time}<br /></>}{next.address && <>{next.address}<br /></>}{next.city}</p>
{next.details && <p style={{ margin: '0 0 8px' }}>{next.details}</p>}
<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} style={{ display: 'inline-block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 14, textDecoration: 'none', borderBottom: '3px solid #0b0b0b' }}>Get directions</a>
</>) : (<p style={{ margin: 0 }}>Call or email to book the band.</p>)}
</div>
</div>
{later.length > 0 && (
<div style={{ marginTop: 34, padding: '18px 22px', border: '3px solid #0b0b0b', background: 'rgba(255,255,255,.55)', fontSize: 17, lineHeight: 1.7 }}>
<b style={{ display: 'block', font: "14px var(--font-type),monospace", textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>More dates</b>
{later.map((sh) => (<div key={sh.id}>{dateParts(sh.show_date).long}: {sh.venue}{sh.city ? `, ${sh.city}` : ''}</div>))}
</div>
)}</div>
</div>
</header>

<div style={{ background: "#0b0b0b", color: "#fff", overflow: "hidden", whiteSpace: "nowrap", borderBlock: "3px solid #0b0b0b" }}>
<div style={{ display: "inline-flex", padding: "14px 0", animation: "nfroll 38s linear infinite", font: "900 clamp(22px,3vw,36px) var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>
{ticker.map((w, i) => (<Fragment key={i}><span style={{ paddingRight: "28px" }}>{w}<i style={{ fontStyle: "normal", paddingLeft: "28px", opacity: ".55" }}>★</i></span></Fragment>))}
</div>
</div>

<section id="live" style={{ padding: "100px 0 40px" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px" }}>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "40px 56px", alignItems: "center" }}><div><span style={{ display: "inline-block", padding: "5px 10px", border: "2px solid #0b0b0b", marginBottom: "22px", font: "14px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Upcoming shows</span>
<h2 style={{ margin: "0", maxWidth: "14ch", font: "900 clamp(56px,9vw,130px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Catch the unfiltered live sound.</h2>
<p style={{ margin: "28px 0 0", fontSize: "22px", lineHeight: "1.45", maxWidth: "56ch" }}>Experience the high-energy live performance that spreads through the crowd from the very first note. Check out where we are playing next, bring your friends, and get ready for an unforgettable night of live music.</p></div><figure style={{ margin: "0", justifySelf: "end", width: "100%", maxWidth: "340px", background: "#fff", padding: "12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1.6deg)" }}><img src="/img/members-neon.jpg" alt="No Filter band members" style={{ width: "100%", display: "block", filter: "none" }} /></figure></div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "40px 56px", alignItems: "center", marginTop: "72px" }}>
<div><h3 style={{ margin: "0", font: "900 clamp(36px,5vw,64px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Live dates and appearances</h3>
<p style={{ margin: "16px 0 0", fontSize: "19px", lineHeight: "1.5", maxWidth: "60ch" }}>From lively local bar nights to major festivals and high-energy private parties, find out where we are bringing the party next across Florida and beyond.</p></div>

</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "40px 32px", marginTop: "48px" }}>
<figure style={{ margin: "0", background: "#fff", padding: "12px 12px 22px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(-1deg)" }}>
<img src="/img/festivals.jpg" alt="Festivals and big stages" style={{ width: "100%", display: "block", filter: "none" }} />
<h4 style={{ margin: "18px 0 8px", font: "900 34px/1 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Festivals and big stages</h4>
<p style={{ margin: "0", fontSize: "17px", lineHeight: "1.5" }}>Catch us on main stages pumping electrifying sets that get entire crowds moving together.</p></figure>
<figure style={{ margin: "0", background: "#fff", padding: "12px 12px 22px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1deg)" }}>
<img src="/img/bars-hotels.jpg" alt="Bars and hotel gigs" style={{ width: "100%", aspectRatio: "1.4286", objectFit: "cover", display: "block", filter: "none" }} />
<h4 style={{ margin: "18px 0 8px", font: "900 34px/1 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Bars and hotel gigs</h4>
<p style={{ margin: "0", fontSize: "17px", lineHeight: "1.5" }}>Most of our bar and hotel establishment shows are completely free for fans, though venue surcharges may apply.</p></figure>
<figure style={{ margin: "0", background: "#fff", padding: "12px 12px 22px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(-.8deg)" }}>
<img src="/img/parties.jpg" alt="Parties and private events" style={{ width: "100%", display: "block", filter: "none" }} />
<h4 style={{ margin: "18px 0 8px", font: "900 34px/1 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Parties and private events</h4>
<p style={{ margin: "0 0 16px", fontSize: "17px", lineHeight: "1.5" }}>We bring our signature infectious stage vibe directly to large corporate events and private gatherings.</p>
<a href="mailto:david@hcsgraphix.com" style={{ display: "inline-block", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".06em", fontSize: "14px", textDecoration: "none", borderBottom: "3px solid #0b0b0b" }}>Book the band</a></figure>
</div>
</div>
</section>

<section style={{ padding: "60px 0 100px" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px" }}>
<h2 style={{ margin: "0 0 48px", font: "900 clamp(48px,7vw,96px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>No show near you? Bring us to your city.</h2>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "48px", alignItems: "start" }}>
<div>
<p style={{ margin: "0", fontSize: "22px", lineHeight: "1.45", maxWidth: "46ch" }}>We need all the help we can get to spread the music everywhere. If you know a great local venue, club or festival that needs our sound, tell them to get in touch, or reach out to stay tuned for future tour announcements.</p>
<h3 style={{ margin: "44px 0 0", font: "900 clamp(34px,4vw,52px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>The live experience</h3>
<p style={{ margin: "16px 0 0", fontSize: "19px", lineHeight: "1.55", maxWidth: "52ch" }}>Fans pick up on our raw energy immediately. It is obvious from the very first chord, radiating across the venue until everyone is caught up in the rhythm. Come join us at any upcoming date and feel it in person.</p>
<h3 style={{ margin: "44px 0 0", font: "900 clamp(34px,4vw,52px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Venue booking and inquiries</h3>
<p style={{ margin: "16px 0 0", fontSize: "19px", lineHeight: "1.55", maxWidth: "52ch" }}>Are you a venue owner, event organizer or festival promoter looking to book No Filter Music? Contact Phillip David Hughes directly at (904) 571-0011 in Jacksonville, Florida 32205 to arrange dates and details.</p>
<a href="tel:+19045710011" style={{ display: "inline-block", marginTop: "24px", padding: "15px 26px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".06em", textDecoration: "none", border: "3px solid #0b0b0b", background: "#0b0b0b", color: "#fff", boxShadow: "6px 6px 0 #8a8a8a" }}>Call now</a>
</div>
<img src="/img/live.jpg" alt="No Filter live" style={{ width: "100%", display: "block", border: "10px solid #fff", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1.2deg)", filter: "none" }} />
</div>
</div>
</section>

<section id="sound" style={{ padding: "100px 0" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px" }}>
<div style={{ display: "flex", flexWrap: "wrap", gap: "40px 56px", alignItems: "flex-end", justifyContent: "space-between" }}><div style={{ flex: "1 1 420px", minWidth: "0" }}><span style={{ display: "inline-block", padding: "5px 10px", border: "2px solid #0b0b0b", marginBottom: "22px", font: "14px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Side A / the set list</span>
<h2 style={{ margin: "0", maxWidth: "12ch", font: "900 clamp(56px,9vw,130px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Something for everybody on the dance floor.</h2></div><figure style={{ margin: "0", flex: "0 1 300px", background: "#fff", padding: "12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1.6deg)" }}><img src="/img/festival-stage.jpg" alt="Festival stage with No Filter on the big screen" style={{ width: "100%", maxHeight: "420px", objectFit: "cover", objectPosition: "top", display: "block", filter: "none" }} /></figure></div>
<div style={{ marginTop: "56px", borderTop: "3px solid #0b0b0b" }}>
{sounds.map((s, i) => (<Fragment key={i}>
<div style={{ display: "flex", flexWrap: "wrap", gap: "6px 40px", alignItems: "baseline", justifyContent: "space-between", padding: "22px 12px", borderBottom: "3px solid #0b0b0b" }} className="hv2">
<h3 style={{ margin: "0", font: "900 clamp(52px,9vw,120px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>{s.t}</h3>
<p style={{ margin: "0", maxWidth: "30ch", fontSize: "18px", lineHeight: "1.4" }}>{s.d}</p>
</div>
</Fragment>))}
</div>
</div>
</section>

<section style={{ position: "relative", overflow: "hidden", background: "#0b0b0b", color: "#fff", padding: "100px 0" }}>

<div style={{ position: "relative", maxWidth: "1240px", margin: "0 auto", padding: "0 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "72px" }}>
<div id="studio">
<span style={{ display: "inline-block", padding: "5px 10px", border: "2px solid #fff", marginBottom: "22px", font: "14px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Side B / liner notes</span>
<h2 style={{ margin: "0", font: "900 clamp(48px,7vw,96px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Things are happening in the studio.</h2>
{news.length === 0 && <p style={{ margin: '36px 0 0', fontSize: 20, lineHeight: 1.6, color: '#e8e8e8' }}>New studio news is on the way.</p>}
{news.map((n, ni) => (
<Fragment key={n.id}>
{ni > 0 && <h3 style={{ margin: '44px 0 0', font: "900 clamp(34px,4vw,52px)/.95 var(--font-display),Impact,sans-serif", textTransform: 'uppercase' }}>{n.title}</h3>}
{String(n.body || '').split(/\n{2,}/).map((para, pi) => (
<p key={pi} style={{ margin: ni === 0 && pi === 0 ? '36px 0 0' : '18px 0 0', fontSize: 20, lineHeight: 1.6, maxWidth: '54ch', color: '#e8e8e8' }}>{para}</p>
))}
</Fragment>
))}<img src="/img/yeti.svg" alt="No Filter yeti mark" style={{ display: "block", width: "140px", marginTop: "40px", filter: "invert(1)" }} />
</div>
<div style={{ alignSelf: "center" }}>
<figure style={{ margin: "0", background: "#fff", color: "#0b0b0b", padding: "12px 12px 14px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #444", transform: "rotate(-1.4deg)", maxWidth: "520px" }}>
<img src="/img/studio-events.jpg" alt="Studio events" style={{ width: "100%", aspectRatio: "1.4286", objectFit: "cover", display: "block", filter: "none" }} />
<figcaption style={{ marginTop: "10px", font: "14px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Studio events</figcaption></figure>
</div>

</div>
</section>

<section id="music" style={{ padding: "100px 0 40px" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px" }}>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "40px 56px", alignItems: "center" }}><div><span style={{ display: "inline-block", padding: "5px 10px", border: "2px solid #0b0b0b", marginBottom: "22px", font: "14px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Music downloads</span>
<h2 style={{ margin: "0", maxWidth: "12ch", font: "900 clamp(56px,9vw,130px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Raw sound, ready to download.</h2>
<p style={{ margin: "28px 0 0", fontSize: "22px", lineHeight: "1.45", maxWidth: "56ch" }}>Welcome to the official music hub for No Filter Music in Jacksonville, Florida. Grab our high-energy blues and southern rock tracks for free, crank up the volume, and get a taste of the raw power we bring straight to the stage.</p></div><figure style={{ margin: "0", justifySelf: "end", width: "100%", maxWidth: "360px", background: "#fff", padding: "12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1.6deg)" }}><img src="/img/guitarist.jpg" alt="No Filter guitarist on stage" style={{ width: "100%", display: "block", filter: "none" }} /></figure></div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "56px 48px", marginTop: "72px", alignItems: "start" }}>
<div>
<img src="/img/playlist.jpg" alt="Playlist vibe" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", border: "10px solid #fff", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(-1.2deg)", filter: "none" }} />
<h3 style={{ margin: "40px 0 0", font: "900 clamp(34px,4vw,52px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Add the vibe to your personal playlists</h3>
<p style={{ margin: "16px 0 0", fontSize: "19px", lineHeight: "1.55", maxWidth: "52ch" }}>Take our music wherever you go. Drop these free downloads straight into your everyday playlist, and stay tuned across all major digital platforms. Follow No Filter Music on Spotify, YouTube and our social channels to stream new drops, behind-the-scenes studio sessions and fresh releases.</p>
<a href={trackUrl("Your Baby, My Baby Too")} download style={{ display: "inline-block", marginTop: "22px", padding: "15px 26px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".06em", textDecoration: "none", border: "3px solid #0b0b0b", background: "#0b0b0b", color: "#fff", boxShadow: "6px 6px 0 #8a8a8a" }}>Your Baby, My Baby Too</a>
</div>
<div>
<img src="/img/guitarists.jpg" alt="Guitarists on stage" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", border: "10px solid #fff", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1.2deg)", filter: "none" }} />
<h3 style={{ margin: "40px 0 0", font: "900 clamp(34px,4vw,52px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Experience the energy live in concert</h3>
<p style={{ margin: "16px 0 0", fontSize: "19px", lineHeight: "1.55", maxWidth: "52ch" }}>Listening through your headphones is only the beginning. Nothing matches the thunderous rhythm and electric atmosphere of our live performances. After you grab your free tracks, come feel the high-energy blues and southern rock live and in person.</p>
<div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "22px" }}>
<a href="#live" style={{ padding: "15px 26px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".06em", textDecoration: "none", border: "3px solid #0b0b0b" }}>See upcoming shows</a>
<a href={trackUrl("I Got the Blues")} download style={{ padding: "15px 26px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".06em", textDecoration: "none", border: "3px solid #0b0b0b", background: "#0b0b0b", color: "#fff", boxShadow: "6px 6px 0 #8a8a8a" }}>I Got the Blues</a>
</div>
</div>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "34px", marginTop: "80px", alignItems: "start" }}>
<figure style={{ margin: "0", background: "#fff", padding: "12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(-1deg)" }}><img src="/img/hardrock-stage.jpg" alt="No Filter on stage at Hard Rock Cafe" style={{ width: "100%", display: "block", filter: "none" }} /></figure>
<figure style={{ margin: "0", background: "#fff", padding: "12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1deg)" }}><img src="/img/outdoor-stage.jpg" alt="Guitarist on an outdoor stage" style={{ width: "100%", display: "block", filter: "none" }} /></figure>
</div>
</div>
</section>

<section id="inside" style={{ padding: "100px 0 40px" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px" }}>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "40px 56px", alignItems: "center" }}><div><span style={{ display: "inline-block", padding: "5px 10px", border: "2px solid #0b0b0b", marginBottom: "22px", font: "14px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Studio events</span>
<h2 style={{ margin: "0", font: "900 clamp(56px,9vw,130px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Inside the studio.</h2>
<p style={{ margin: "28px 0 0", fontSize: "22px", lineHeight: "1.45", maxWidth: "56ch" }}>Step behind the console with No Filter Music in Jacksonville, Florida. From dedicated session work to exclusive live jam sessions, experience the raw craft, creative energy and technical mastery of real music making.</p></div><figure style={{ margin: "0", justifySelf: "end", width: "100%", maxWidth: "340px", background: "#fff", padding: "12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(-1.4deg)" }}><img src="/img/bassist.jpg" alt="No Filter bassist on stage" style={{ width: "100%", display: "block", filter: "none" }} /></figure></div>
<h3 style={{ margin: "72px 0 0", font: "900 clamp(36px,5vw,64px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Studio sessions and gatherings</h3>
<p style={{ margin: "16px 0 0", fontSize: "19px", lineHeight: "1.5", maxWidth: "60ch" }}>We bring musicians, collaborators and music lovers together to witness and take part in the true recording process. Discover what happens inside our Jacksonville studio.</p>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "40px 32px", marginTop: "48px" }}>
<figure style={{ margin: "0", background: "#fff", padding: "12px 12px 22px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(-1deg)" }}>
<img src="/img/session-work.jpg" alt="Session work" style={{ aspectRatio: "1.4286", objectFit: "cover", objectPosition: "center 40%", width: "100%", display: "block", filter: "none" }} />
<h4 style={{ margin: "18px 0 8px", font: "900 34px/1 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Session work</h4>
<p style={{ margin: "0", fontSize: "17px", lineHeight: "1.5" }}>We offer focused studio recording and production sessions, capturing polished tracks with seasoned musicianship and high-end gear.</p></figure>
<figure style={{ margin: "0", background: "#fff", padding: "12px 12px 22px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1deg)" }}>
<img src="/img/jam.jpg" alt="Open jam nights" style={{ width: "100%", display: "block", filter: "none" }} />
<h4 style={{ margin: "18px 0 8px", font: "900 34px/1 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Open jam nights</h4>
<p style={{ margin: "0", fontSize: "17px", lineHeight: "1.5" }}>Occasionally we host relaxed studio jams where fellow artists are welcome to sit in, collaborate, and even record their performances.</p></figure>
<figure style={{ margin: "0", background: "#fff", padding: "12px 12px 22px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(-.8deg)" }}>
<img src="/img/behind-board.jpg" alt="Behind the board" style={{ width: "100%", display: "block", filter: "none" }} />
<h4 style={{ margin: "18px 0 8px", font: "900 34px/1 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Behind the board</h4>
<p style={{ margin: "0", fontSize: "17px", lineHeight: "1.5" }}>Get a firsthand look at the expertise and meticulous detail that go into engineering, tracking and mixing dynamic original tracks.</p></figure>
</div>
</div>
</section>

<section style={{ padding: "60px 0 100px" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px" }}>
<h2 style={{ margin: "0 0 48px", font: "900 clamp(48px,7vw,96px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Support live independent music.</h2>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "48px", alignItems: "start" }}>
<img src="/img/band-onstage.jpg" alt="No Filter band on stage" style={{ width: "100%", display: "block", border: "10px solid #fff", boxShadow: "8px 8px 0 #0b0b0b", filter: "none" }} />
<div>
<h3 style={{ margin: "0", font: "900 clamp(34px,4vw,52px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>An authentic creative process</h3>
<p style={{ margin: "16px 0 0", fontSize: "19px", lineHeight: "1.55", maxWidth: "52ch" }}>Attending a studio event at No Filter Music provides an up-close appreciation for the technical skill, precision and passion poured into sound production. It is a genuine look into the artistry behind every track we produce.</p>
<h3 style={{ margin: "44px 0 0", font: "900 clamp(34px,4vw,52px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Connect with the band</h3>
<p style={{ margin: "16px 0 0", fontSize: "19px", lineHeight: "1.55", maxWidth: "52ch" }}>Whether you want to sit in on a future session, bring a friend to our next studio jam, or simply support independent artists in Jacksonville, we want to hear from you.</p>
<a href="#book" style={{ display: "inline-block", marginTop: "24px", padding: "15px 26px", fontWeight: "800", textTransform: "uppercase", letterSpacing: ".06em", textDecoration: "none", border: "3px solid #0b0b0b", background: "#0b0b0b", color: "#fff", boxShadow: "6px 6px 0 #8a8a8a" }}>Get in touch</a>
</div>
</div>
</div>
</section>

<section id="gallery" style={{ padding: "100px 0 40px" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px" }}>
<span style={{ display: "inline-block", padding: "5px 10px", border: "2px solid #0b0b0b", marginBottom: "22px", font: "14px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Photos</span>
<h2 style={{ margin: "0", font: "900 clamp(56px,9vw,130px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Caught on film.</h2>
<div style={{ display: "flex", gap: "28px", margin: "56px -28px 0", padding: "8px 28px 28px", overflowX: "auto", scrollSnapType: "x proximity", scrollbarColor: "#0b0b0b transparent" }}>
{photos.map((p, i) => (<Fragment key={i}>
<figure style={{ margin: "0", flex: "0 0 auto", scrollSnapAlign: "start", background: "#fff", padding: "12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b" }}>{p.kind === 'video' ? <video src={p.u} controls preload="metadata" style={{ height: "380px", width: "auto", maxWidth: "78vw", display: "block", filter: "none" }} /> : <img src={p.u} alt="No Filter live" loading="lazy" style={{ height: "380px", width: "auto", maxWidth: "78vw", display: "block", filter: "none" }} />}</figure>
</Fragment>))}
</div>
</div>
</section>

<section id="band" style={{ padding: "100px 0" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px" }}>
<span style={{ display: "inline-block", padding: "5px 10px", border: "2px solid #0b0b0b", marginBottom: "22px", font: "14px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>The band</span>
<h2 style={{ margin: "0", font: "900 clamp(56px,9vw,130px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Three guys. One loud room.</h2>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))', gap: '44px 32px', marginTop: 60 }}>
{band.map((m, bi) => (
<div key={m.id} className={bi === 1 ? 'band-mid' : undefined}>
<div style={{ border: '3px solid #0b0b0b', boxShadow: '10px 10px 0 #0b0b0b', background: '#fff', padding: 10 }}>
{m.photo_path ? (
<img src={fileUrl('nf-media', m.photo_path)} alt={m.name} loading="lazy" style={{ display: 'block', width: '100%', aspectRatio: '3/4', objectFit: 'cover', filter: 'none' }} />
) : (
<div style={{ aspectRatio: '3/4', background: 'repeating-linear-gradient(135deg,#111 0 14px,#2b2b2b 14px 28px)' }} />
)}
</div>
<div style={{ font: "900 clamp(48px,5.4vw,70px)/.9 var(--font-display),Impact,sans-serif", textTransform: 'uppercase', marginTop: 26 }}>{m.name}</div>
<div style={{ font: "14px var(--font-type),monospace", textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 8 }}>{m.role}</div>
</div>
))}
</div>
</div>
</section>



<section style={{ background: "#0b0b0b", color: "#fff", padding: "80px 0" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "48px", alignItems: "center" }}>
<div>
<h2 style={{ margin: "0", font: "900 clamp(56px,8vw,110px)/.9 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Never miss a beat.</h2>
<p style={{ margin: "24px 0 0", fontSize: "20px", lineHeight: "1.6", maxWidth: "48ch", color: "#e8e8e8" }}>Stay tuned for tour announcements, studio jams and fresh track releases. Keep real music alive in Jacksonville.</p>
</div>

</div>
</section>
<section id="book" style={{ padding: "100px 0" }}>
<div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 28px", display: "flex", flexWrap: "wrap", gap: "40px 64px", alignItems: "flex-end", justifyContent: "space-between" }}>
<div style={{ flex: "1 1 440px", minWidth: "0" }}>
<h2 style={{ margin: "0", font: "900 clamp(72px,13vw,190px)/.8 var(--font-display),Impact,sans-serif", textTransform: "uppercase" }}>Book No Filter.</h2>
<p style={{ margin: "28px 0 0", fontSize: "22px", lineHeight: "1.45", maxWidth: "34ch" }}>For a bar, a private party or a festival stage, call or email David Hughes.</p>
</div>
<div style={{ flex: "0 1 540px", minWidth: "260px" }}>
<a href={`tel:+1${phoneDigits}`} style={{ display: "block", font: "900 clamp(48px,7vw,96px)/.95 var(--font-display),Impact,sans-serif", textTransform: "uppercase", textDecoration: "none" }}>{s.phone}</a>
<a href={`mailto:${s.email}`} style={{ display: "inline-block", marginTop: "10px", fontWeight: "800", fontSize: "clamp(20px,2.4vw,28px)", overflowWrap: "anywhere", borderBottom: "3px solid #0b0b0b", textDecoration: "none" }}>{s.email}</a>
<p style={{ margin: "22px 0 0", font: "14px/1.5 var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Studio: {s.studio_address}</p>
</div>
</div>
<div style={{ maxWidth: "1240px", margin: "56px auto 0", padding: "0 28px", display: "flex", justifyContent: "flex-end" }}>
<figure style={{ margin: "0", width: "100%", maxWidth: "560px", background: "#fff", padding: "12px", border: "3px solid #0b0b0b", boxShadow: "8px 8px 0 #0b0b0b", transform: "rotate(1.2deg)" }}><img src="/img/hardrock-sign.jpg" alt="No Filter at the Hard Rock sign" style={{ width: "100%", display: "block", filter: "none" }} /></figure>
</div>
</section>

<footer style={{ background: "#0b0b0b", color: "#fff", padding: "26px 28px", display: "flex", flexWrap: "wrap", gap: "8px 24px", justifyContent: "space-between", font: "13px var(--font-type),monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>
<span>© 2026 No Filter Music</span><span>Live in Jacksonville, Florida</span>
</footer>
      </div>
    </div>
  );
}
