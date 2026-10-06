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

  const words = ['Live music', 'Classic rock', 'Oldies', 'Country', 'Originals', 'Jacksonville, FL'];
  const ticker = [...words, ...words];

  return (
    <div className="site">
      <header className="hero wrap" id="top">
        <nav className="nav" aria-label="Main">
          <a href="#top" className="brand" aria-label="No Filter, back to top"><img src="/no-filter-logo.png" alt="No Filter" width="150" height="55" /></a>
          <div className="links type">
            <a href="#shows">Shows</a>
            <a href="#sound">Sound</a>
            <a href="#studio">Studio</a>
            <a href="#downloads">Downloads</a>
            {gallery.length > 0 && <a href="#gallery">Photos</a>}
            <a href="#band">Band</a>
            <a href="#book" className="cta">Book the band</a>
          </div>
        </nav>

        <h1 className="mega disp" aria-label="No Filter">
          <span>No</span>
          <span className="l2">Filter</span>
        </h1>

        <div className="hero-row">
          <div className="hero-copy">
            <p className="tag">{s.tagline}</p>
            <div className="btns">
              <a className="btn solid" href="#shows">See the next show</a>
              <a className="btn line" href="#downloads">Free original tracks</a>
            </div>
          </div>

          <div className="hero-side" id="shows">
            {hero && <img className="hero-photo" src={fileUrl('nf-media', hero.file_path)} alt={hero.caption || 'No Filter on stage'} />}
            <div className="ticket">
              <div className="top type"><span>Next show</span><span>Admit one</span></div>
              <div className="body">
                {next ? (
                  <>
                    <div className="date disp">{dateParts(next.show_date).short}</div>
                    <div className="venue disp">{next.venue}</div>
                  </>
                ) : (
                  <div className="date disp" style={{ fontSize: 64 }}>New dates soon</div>
                )}
                <hr className="perf" />
              </div>
              <div className="stub">
                {next ? (
                  <>
                    <p>
                      {next.start_time && <>{next.start_time}<br /></>}
                      {next.address && <>{next.address}<br /></>}
                      {next.city}
                    </p>
                    {next.details && <p>{next.details}</p>}
                    <a className="dir" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}>Get directions</a>
                  </>
                ) : (
                  <p>Call or email to book the band.</p>
                )}
              </div>
            </div>
            {later.length > 0 && (
              <div className="more">
                <b className="type">More dates</b>
                {later.map((sh) => (
                  <div key={sh.id}>{dateParts(sh.show_date).long}: {sh.venue}{sh.city ? `, ${sh.city}` : ''}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="marquee" aria-hidden="true">
        <div className="track-m disp">
          {[...ticker, ...ticker].map((w, i) => (
            <span key={i}>{w}<i>{' ★'}</i></span>
          ))}
        </div>
      </div>

      <section id="sound">
        <div className="wrap">
          <span className="kicker type">Side A / the set list</span>
          <h2 className="disp big" style={{ maxWidth: '12ch' }}>Something for everybody on the dance floor.</h2>
          <div className="sound-list">
            <div className="sound-row"><h3 className="disp">Classic rock</h3><p>The songs everyone in the room already knows the words to.</p></div>
            <div className="sound-row"><h3 className="disp">Oldies</h3><p>Good-time favorites that get people out of their chairs.</p></div>
            <div className="sound-row"><h3 className="disp">Country</h3><p>A little twang in every set, for the two-steppers.</p></div>
            <div className="sound-row"><h3 className="disp">Originals</h3><p>The band records its own songs in the studio. Originals are always welcome.</p></div>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap two">
          <div id="studio">
            <span className="kicker type">Side B / liner notes</span>
            <h2 className="disp">Things are happening in the studio.</h2>
            <div style={{ marginTop: 36 }}>
              {news.length === 0 && <p className="news-empty">New studio news is on the way.</p>}
              {news.map((n) => (
                <article className="news-item" key={n.id}>
                  <h3 className="disp">{n.title}</h3>
                  <div className="when type">{new Date(n.posted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })}</div>
                  <p>{n.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div id="downloads">
            <h2 className="disp sub">Free original tracks</h2>
            {tracks.length === 0 && <p>New tracks are coming soon.</p>}
            {tracks.map((t) => (
              <div className="track" key={t.id}>
                <div className="record" aria-hidden="true" />
                <div className="name disp">{t.title}</div>
                <a href={t.external_url || fileUrl('nf-tracks', t.file_path)} download>Download</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section id="gallery">
          <div className="wrap">
            <span className="kicker type">Caught on film</span>
            <h2 className="disp big">Live and loud.</h2>
            <div className="gallery">
              {gallery.map((m) => (
                <figure key={m.id}>
                  {m.kind === 'video' ? (
                    <video controls preload="metadata" src={fileUrl('nf-media', m.file_path)} />
                  ) : (
                    <img src={fileUrl('nf-media', m.file_path)} alt={m.caption || 'No Filter'} loading="lazy" />
                  )}
                  {m.caption && <figcaption className="type">{m.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="band" style={gallery.length > 0 ? { paddingTop: 0 } : undefined}>
        <div className="wrap">
          <span className="kicker type">The band</span>
          <h2 className="disp big">Three guys. One loud room.</h2>
          <div className="band">
            {band.map((m) => (
              <div key={m.id}>
                <div className="frame">
                  {m.photo_path ? (
                    <img className="ph" src={fileUrl('nf-media', m.photo_path)} alt={m.name} loading="lazy" />
                  ) : (
                    <div className="ph type">Photo of {m.name}</div>
                  )}
                </div>
                <div className="n disp">{m.name}</div>
                <div className="r type">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="book" id="book">
        <div className="wrap row">
          <div className="l">
            <h2 className="disp">Book No Filter.</h2>
            <p>For a bar, a private party or a festival stage, call or email David Hughes.</p>
          </div>
          <div className="r">
            <a className="phone disp" href={`tel:+1${phoneDigits}`}>{s.phone}</a>
            <a className="mail" href={`mailto:${s.email}`}>{s.email}</a>
            <p className="type">Studio: {s.studio_address}</p>
          </div>
        </div>
      </section>

      <footer className="type">
        <span>&copy; 2026 No Filter Music</span>
        <span>Live in Jacksonville, Florida</span>
      </footer>
    </div>
  );
}
