import { supabase, fileUrl } from '../lib/supabase';

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

export default async function Home() {
  const { shows, news, tracks, media, band, s } = await load();
  const next = shows[0];
  const later = shows.slice(1);
  const hero = media.find((m) => m.slot === 'hero' && m.kind === 'image');
  const gallery = media.filter((m) => m.slot !== 'hero');
  const phoneDigits = (s.phone || '').replace(/\D/g, '');
  const mapQuery = next ? [next.venue, next.address, next.city].filter(Boolean).join(' ') : '';

  return (
    <>
      <header className="hero" id="top">
        <div className="wrap">
          <nav className="nav" aria-label="Main">
            <a href="#top" className="brand slab">No Filter</a>
            <div className="links">
              <a href="#shows">Shows</a>
              <a href="#sound">Sound</a>
              <a href="#studio">Studio</a>
              <a href="#downloads">Downloads</a>
              {gallery.length > 0 && <a href="#gallery">Photos</a>}
              <a href="#band">Band</a>
              <a href="#book" className="cta">Book the band</a>
            </div>
          </nav>

          <div className="hero-grid">
            <div className="hero-copy">
              <h1 className="slab">No<br />Filter</h1>
              <p className="tag">{s.tagline}</p>
              <div className="btns">
                <a className="btn solid" href="#shows">See the next show</a>
                <a className="btn line" href="#downloads">Download original tracks</a>
              </div>
            </div>

            <div className="hero-side" id="shows">
              {hero && <img className="hero-photo" src={fileUrl('nf-media', hero.file_path)} alt={hero.caption || 'No Filter on stage'} />}
              <div className="ticket">
                <div className="label">Next show</div>
                {next ? (
                  <>
                    <div className="date slab">{dateParts(next.show_date).short}</div>
                    <hr />
                    <div className="venue slab">{next.venue}</div>
                    <p>
                      {next.start_time && <>{next.start_time}<br /></>}
                      {next.address && <>{next.address}<br /></>}
                      {next.city}
                    </p>
                    {next.details && <p>{next.details}</p>}
                    <a className="dir" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}>Get directions</a>
                  </>
                ) : (
                  <>
                    <div className="date slab" style={{ fontSize: 44 }}>New dates soon</div>
                    <hr />
                    <p>Call or email to book the band.</p>
                  </>
                )}
              </div>
              {later.length > 0 && (
                <div className="more">
                  <b>More dates</b>
                  {later.map((sh) => (
                    <div key={sh.id}>{dateParts(sh.show_date).long}: {sh.venue}{sh.city ? `, ${sh.city}` : ''}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="strip slab">Classic rock. Oldies. Country. Originals always welcome.</div>

      <section id="sound">
        <div className="wrap">
          <h2 className="slab big" style={{ maxWidth: '16ch' }}>Something for everybody on the dance floor.</h2>
          <div className="cards">
            <div className="card c1"><div className="t slab">Classic rock</div><p>The songs everyone in the room already knows the words to.</p></div>
            <div className="card c2"><div className="t slab">Oldies</div><p>Good-time favorites that get people out of their chairs.</p></div>
            <div className="card c3"><div className="t slab">Country</div><p>A little twang in every set, for the two-steppers.</p></div>
            <div className="card c4"><div className="t slab">Originals</div><p>The band records its own songs in the studio. Originals are always welcome.</p></div>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap two">
          <div id="studio">
            <h2 className="slab">Things are happening in the studio.</h2>
            <div style={{ marginTop: 28 }}>
              {news.length === 0 && <p style={{ fontSize: 20 }}>New studio news is on the way.</p>}
              {news.map((n) => (
                <article className="news-item" key={n.id}>
                  <h3 className="slab">{n.title}</h3>
                  <div className="when">{new Date(n.posted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })}</div>
                  <p>{n.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div id="downloads">
            <h2 className="slab sub">Free original tracks</h2>
            {tracks.length === 0 && <p>New tracks are coming soon.</p>}
            {tracks.map((t) => (
              <div className="track" key={t.id}>
                <div className="name slab">{t.title}</div>
                <a href={t.external_url || fileUrl('nf-tracks', t.file_path)} download>Download</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section id="gallery">
          <div className="wrap">
            <h2 className="slab big">Live and loud.</h2>
            <div className="gallery">
              {gallery.map((m) => (
                <figure key={m.id}>
                  {m.kind === 'video' ? (
                    <video controls preload="metadata" src={fileUrl('nf-media', m.file_path)} />
                  ) : (
                    <img src={fileUrl('nf-media', m.file_path)} alt={m.caption || 'No Filter'} loading="lazy" />
                  )}
                  {m.caption && <figcaption>{m.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="band" style={gallery.length > 0 ? { paddingTop: 0 } : undefined}>
        <div className="wrap">
          <h2 className="slab big">Three guys. One loud room.</h2>
          <div className="band">
            {band.map((m) => (
              <div key={m.id}>
                {m.photo_path ? (
                  <img className="ph" src={fileUrl('nf-media', m.photo_path)} alt={m.name} loading="lazy" />
                ) : (
                  <div className="ph">Photo of {m.name}</div>
                )}
                <div className="n slab">{m.name}</div>
                <div className="r">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="book" id="book">
        <div className="wrap row">
          <div className="l">
            <h2 className="slab">Book No Filter.</h2>
            <p>For a bar, a private party or a festival stage, call or email David Hughes.</p>
          </div>
          <div className="r">
            <a className="phone slab" href={`tel:+1${phoneDigits}`}>{s.phone}</a>
            <a className="mail slab" href={`mailto:${s.email}`}>{s.email}</a>
            <p>Studio: {s.studio_address}</p>
          </div>
        </div>
      </section>

      <footer>&copy; 2026 No Filter Music. Live in Jacksonville, Florida.</footer>
    </>
  );
}
