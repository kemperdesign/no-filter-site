'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, fileUrl } from '../../lib/supabase';

const TABS = ['Shows', 'Studio news', 'Downloads', 'Photos and videos', 'Band', 'Contact info'];

async function uploadFile(bucket, file) {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

function useRows(table, orderCol, ascending = true) {
  const [rows, setRows] = useState([]);
  const reload = useCallback(async () => {
    const { data } = await supabase.from(table).select('*').order(orderCol, { ascending });
    setRows(data || []);
  }, [table, orderCol, ascending]);
  useEffect(() => { reload(); }, [reload]);
  return [rows, reload];
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc('nf_is_admin').then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (session === undefined) return <div className="adm"><div className="adm-body">Loading…</div></div>;
  if (!session) return <Login />;
  if (isAdmin === null) return <div className="adm"><div className="adm-body">Checking access…</div></div>;
  if (!isAdmin) {
    return (
      <div className="login">
        <h1 className="slab">No access</h1>
        <p className="hint">{session.user.email} is not on the list of people who can edit this site.</p>
        <button className="save" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    );
  }
  return <Panel email={session.user.email} />;
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const loginEmail = email.includes('@') ? email.trim() : email.trim().toLowerCase() === 'david' ? 'david@hcsgraphix.com' : email.trim();
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (error) setErr(error.message);
    setBusy(false);
  }

  return (
    <form className="login" onSubmit={submit}>
      <h1 className="slab">No Filter admin</h1>
      {err && <p className="err">{err}</p>}
      <Field label="Username or email">
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
      </Field>
      <Field label="Password">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </Field>
      <button className="save" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

function Panel({ email }) {
  const [tab, setTab] = useState(TABS[0]);
  const [msg, setMsg] = useState('');
  const say = (m) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 4500);
  };

  return (
    <div className="adm">
      <div className="adm-top">
        <span className="slab">No Filter admin</span>
        <span>
          <a href="/" target="_blank" rel="noreferrer" style={{ marginRight: 10 }}>View site</a>
          <button onClick={() => supabase.auth.signOut()}>Sign out ({email})</button>
        </span>
      </div>
      <div className="adm-body">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {tab === 'Shows' && <ShowsTab say={say} />}
        {tab === 'Studio news' && <NewsTab say={say} />}
        {tab === 'Downloads' && <TracksTab say={say} />}
        {tab === 'Photos and videos' && <MediaTab say={say} />}
        {tab === 'Band' && <BandTab say={say} />}
        {tab === 'Contact info' && <ContactTab say={say} />}
      </div>
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}

/* ---------- Shows ---------- */
const emptyShow = { show_date: '', start_time: '', venue: '', address: '', city: '', details: '' };

function ShowsTab({ say }) {
  const [rows, reload] = useRows('nf_shows', 'show_date', true);
  const [form, setForm] = useState(emptyShow);
  const [editId, setEditId] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    const payload = {
      show_date: form.show_date,
      venue: form.venue,
      start_time: form.start_time || null,
      address: form.address || null,
      city: form.city || null,
      details: form.details || null,
    };
    const q = editId ? supabase.from('nf_shows').update(payload).eq('id', editId) : supabase.from('nf_shows').insert(payload);
    const { error } = await q;
    if (error) return say(error.message);
    say(editId ? 'Show updated' : 'Show added');
    setForm(emptyShow);
    setEditId(null);
    reload();
  }
  async function toggle(r) {
    const { error } = await supabase.from('nf_shows').update({ published: !r.published }).eq('id', r.id);
    if (error) return say(error.message);
    say(r.published ? 'Show hidden from the site' : 'Show visible on the site');
    reload();
  }
  async function remove(r) {
    if (!confirm(`Delete ${r.venue} on ${r.show_date}?`)) return;
    const { error } = await supabase.from('nf_shows').delete().eq('id', r.id);
    if (error) return say(error.message);
    say('Show deleted');
    reload();
  }
  function edit(r) {
    setEditId(r.id);
    setForm({ show_date: r.show_date, start_time: r.start_time || '', venue: r.venue, address: r.address || '', city: r.city || '', details: r.details || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <form className="panel" onSubmit={save}>
        <h2 className="slab">{editId ? 'Edit show' : 'Add a show'}</h2>
        <div className="grid2">
          <Field label="Date"><input type="date" value={form.show_date} onChange={set('show_date')} required /></Field>
          <Field label="Start time (optional)"><input value={form.start_time} onChange={set('start_time')} placeholder="8:00 PM" /></Field>
        </div>
        <Field label="Venue"><input value={form.venue} onChange={set('venue')} required /></Field>
        <div className="grid2">
          <Field label="Street address"><input value={form.address} onChange={set('address')} /></Field>
          <Field label="City, state, zip"><input value={form.city} onChange={set('city')} /></Field>
        </div>
        <Field label="Extra details (optional)"><input value={form.details} onChange={set('details')} placeholder="Private party, 21 and up, etc." /></Field>
        <button className="save">{editId ? 'Save changes' : 'Add show'}</button>
        {editId && <button type="button" className="ghost" style={{ marginLeft: 12 }} onClick={() => { setEditId(null); setForm(emptyShow); }}>Cancel</button>}
      </form>

      <div className="panel">
        <h2 className="slab">All shows</h2>
        <p className="hint">Past shows drop off the public page by themselves. Hide a show to keep it saved but not visible.</p>
        {rows.length === 0 && <p>No shows yet.</p>}
        {rows.map((r) => (
          <div className="item" key={r.id}>
            <div className="meta">
              <b>{r.show_date} · {r.venue}</b>
              <span className={`pill ${r.published ? '' : 'off'}`}>{r.published ? 'Visible' : 'Hidden'}</span>
              <div>{[r.start_time, r.address, r.city].filter(Boolean).join(', ')}</div>
            </div>
            <div>
              <button className="ghost" onClick={() => edit(r)}>Edit</button>
              <button className="ghost" onClick={() => toggle(r)}>{r.published ? 'Hide' : 'Show'}</button>
              <button className="ghost danger" onClick={() => remove(r)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Studio news ---------- */
function NewsTab({ say }) {
  const [rows, reload] = useRows('nf_news', 'posted_at', false);
  const [form, setForm] = useState({ title: '', body: '' });
  const [editId, setEditId] = useState(null);

  async function save(e) {
    e.preventDefault();
    const q = editId ? supabase.from('nf_news').update(form).eq('id', editId) : supabase.from('nf_news').insert(form);
    const { error } = await q;
    if (error) return say(error.message);
    say(editId ? 'Post updated' : 'Post published');
    setForm({ title: '', body: '' });
    setEditId(null);
    reload();
  }
  async function toggle(r) {
    const { error } = await supabase.from('nf_news').update({ published: !r.published }).eq('id', r.id);
    if (error) return say(error.message);
    reload();
  }
  async function remove(r) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    const { error } = await supabase.from('nf_news').delete().eq('id', r.id);
    if (error) return say(error.message);
    say('Post deleted');
    reload();
  }

  return (
    <>
      <form className="panel" onSubmit={save}>
        <h2 className="slab">{editId ? 'Edit post' : 'New studio update'}</h2>
        <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <Field label="Update"><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></Field>
        <button className="save">{editId ? 'Save changes' : 'Publish update'}</button>
        {editId && <button type="button" className="ghost" style={{ marginLeft: 12 }} onClick={() => { setEditId(null); setForm({ title: '', body: '' }); }}>Cancel</button>}
      </form>
      <div className="panel">
        <h2 className="slab">Posts</h2>
        <p className="hint">The three newest visible posts show on the site.</p>
        {rows.map((r) => (
          <div className="item" key={r.id}>
            <div className="meta">
              <b>{r.title}</b>
              <span className={`pill ${r.published ? '' : 'off'}`}>{r.published ? 'Visible' : 'Hidden'}</span>
              <div>{new Date(r.posted_at).toLocaleDateString()}</div>
            </div>
            <div>
              <button className="ghost" onClick={() => { setEditId(r.id); setForm({ title: r.title, body: r.body }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
              <button className="ghost" onClick={() => toggle(r)}>{r.published ? 'Hide' : 'Show'}</button>
              <button className="ghost danger" onClick={() => remove(r)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Downloads ---------- */
function TracksTab({ say }) {
  const [rows, reload] = useRows('nf_tracks', 'sort_order', true);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function add(e) {
    e.preventDefault();
    if (!file) return say('Choose an audio file first');
    setBusy(true);
    try {
      const path = await uploadFile('nf-tracks', file);
      const next = rows.reduce((m, r) => Math.max(m, r.sort_order), 0) + 1;
      const { error } = await supabase.from('nf_tracks').insert({ title, file_path: path, sort_order: next });
      if (error) throw error;
      say('Track added');
      setTitle('');
      setFile(null);
      e.target.reset();
      reload();
    } catch (err) {
      say(err.message);
    }
    setBusy(false);
  }
  async function toggle(r) {
    const { error } = await supabase.from('nf_tracks').update({ published: !r.published }).eq('id', r.id);
    if (error) return say(error.message);
    reload();
  }
  async function remove(r) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    if (r.file_path) await supabase.storage.from('nf-tracks').remove([r.file_path]);
    const { error } = await supabase.from('nf_tracks').delete().eq('id', r.id);
    if (error) return say(error.message);
    say('Track deleted');
    reload();
  }

  return (
    <>
      <form className="panel" onSubmit={add}>
        <h2 className="slab">Add a download</h2>
        <Field label="Song title"><input value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
        <Field label="Audio file (mp3 or wav)"><input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0] || null)} required /></Field>
        <button className="save" disabled={busy}>{busy ? 'Uploading…' : 'Add track'}</button>
      </form>
      <div className="panel">
        <h2 className="slab">Tracks</h2>
        {rows.map((r) => (
          <div className="item" key={r.id}>
            <div className="meta">
              <b>{r.title}</b>
              <span className={`pill ${r.published ? '' : 'off'}`}>{r.published ? 'Visible' : 'Hidden'}</span>
              <div>{r.file_path ? 'Uploaded here' : 'From the old site'}</div>
            </div>
            <div>
              <button className="ghost" onClick={() => toggle(r)}>{r.published ? 'Hide' : 'Show'}</button>
              <button className="ghost danger" onClick={() => remove(r)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Photos and videos ---------- */
function MediaTab({ say }) {
  const [rows, reload] = useRows('nf_media', 'created_at', false);
  const [files, setFiles] = useState([]);
  const [slot, setSlot] = useState('gallery');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(e) {
    e.preventDefault();
    if (!files.length) return say('Choose at least one file');
    setBusy(true);
    try {
      for (const f of files) {
        const isVideo = f.type.startsWith('video/');
        const path = await uploadFile('nf-media', f);
        const { error } = await supabase.from('nf_media').insert({
          kind: isVideo ? 'video' : 'image',
          slot: isVideo ? 'video' : slot,
          caption: caption || null,
          file_path: path,
        });
        if (error) throw error;
      }
      say(`${files.length} file${files.length > 1 ? 's' : ''} added`);
      setFiles([]);
      setCaption('');
      e.target.reset();
      reload();
    } catch (err) {
      say(err.message.includes('exceeded') ? 'That file is too large. Try a shorter or compressed clip (under 50 MB).' : err.message);
    }
    setBusy(false);
  }
  async function toggle(r) {
    const { error } = await supabase.from('nf_media').update({ published: !r.published }).eq('id', r.id);
    if (error) return say(error.message);
    reload();
  }
  async function remove(r) {
    if (!confirm('Delete this file?')) return;
    await supabase.storage.from('nf-media').remove([r.file_path]);
    const { error } = await supabase.from('nf_media').delete().eq('id', r.id);
    if (error) return say(error.message);
    say('File deleted');
    reload();
  }

  return (
    <>
      <form className="panel" onSubmit={add}>
        <h2 className="slab">Upload photos or videos</h2>
        <p className="hint">Photos go in the gallery, or pick Hero to feature one above the show ticket. Videos always go in the gallery. Keep videos under 50 MB.</p>
        <Field label="Files"><input type="file" accept="image/*,video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} required /></Field>
        <div className="grid2">
          <Field label="Where do photos go?">
            <select value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option value="gallery">Gallery</option>
              <option value="hero">Hero (top of the page)</option>
            </select>
          </Field>
          <Field label="Caption (optional)"><input value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
        </div>
        <button className="save" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
      </form>
      <div className="panel">
        <h2 className="slab">Library</h2>
        {rows.length === 0 && <p>Nothing uploaded yet.</p>}
        <div className="thumbs">
          {rows.map((r) => (
            <div className="thumb" key={r.id}>
              {r.kind === 'video' ? <video src={fileUrl('nf-media', r.file_path)} controls preload="metadata" /> : <img src={fileUrl('nf-media', r.file_path)} alt={r.caption || ''} />}
              <div className="cap">{r.slot === 'hero' ? 'Hero' : r.kind === 'video' ? 'Video' : 'Gallery'}{r.caption ? ` · ${r.caption}` : ''}<span className={`pill ${r.published ? '' : 'off'}`}>{r.published ? 'Visible' : 'Hidden'}</span></div>
              <button className="ghost" onClick={() => toggle(r)}>{r.published ? 'Hide' : 'Show'}</button>
              <button className="ghost danger" onClick={() => remove(r)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- Band ---------- */
function BandTab({ say }) {
  const [rows, reload] = useRows('nf_band_members', 'sort_order', true);
  return (
    <div className="panel">
      <h2 className="slab">Band members</h2>
      <p className="hint">Upload a photo for each member. Portrait photos (taller than wide) look best.</p>
      {rows.map((r) => <Member key={r.id} row={r} say={say} reload={reload} />)}
    </div>
  );
}

function Member({ row, say, reload }) {
  const [name, setName] = useState(row.name);
  const [role, setRole] = useState(row.role);
  const [busy, setBusy] = useState(false);

  async function save() {
    const { error } = await supabase.from('nf_band_members').update({ name, role }).eq('id', row.id);
    if (error) return say(error.message);
    say('Saved');
    reload();
  }
  async function photo(e) {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true);
    try {
      const path = await uploadFile('nf-media', f);
      if (row.photo_path) await supabase.storage.from('nf-media').remove([row.photo_path]);
      const { error } = await supabase.from('nf_band_members').update({ photo_path: path }).eq('id', row.id);
      if (error) throw error;
      say('Photo updated');
      reload();
    } catch (err) {
      say(err.message);
    }
    setBusy(false);
  }

  return (
    <div className="item">
      <div className="meta" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {row.photo_path ? <img src={fileUrl('nf-media', row.photo_path)} alt="" style={{ width: 90, height: 120, objectFit: 'cover' }} /> : <div style={{ width: 90, height: 120, background: '#ddd' }} />}
        <div style={{ flex: '1 1 220px' }}>
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Role"><input value={role} onChange={(e) => setRole(e.target.value)} /></Field>
        </div>
      </div>
      <div>
        <label className="ghost" style={{ display: 'inline-block' }}>
          {busy ? 'Uploading…' : 'Change photo'}
          <input type="file" accept="image/*" onChange={photo} style={{ display: 'none' }} />
        </label>
        <button className="save" onClick={save}>Save</button>
      </div>
    </div>
  );
}

/* ---------- Contact ---------- */
const SETTING_FIELDS = [
  ['tagline', 'Tagline under the band name'],
  ['phone', 'Booking phone'],
  ['email', 'Booking email'],
  ['studio_address', 'Studio address'],
];

function ContactTab({ say }) {
  const [vals, setVals] = useState({});
  useEffect(() => {
    supabase.from('nf_settings').select('*').then(({ data }) => {
      const o = {};
      (data || []).forEach((r) => (o[r.key] = r.value));
      setVals(o);
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    const rows = SETTING_FIELDS.map(([key]) => ({ key, value: vals[key] || '' }));
    const { error } = await supabase.from('nf_settings').upsert(rows);
    if (error) return say(error.message);
    say('Saved');
  }

  return (
    <form className="panel" onSubmit={save}>
      <h2 className="slab">Contact info</h2>
      {SETTING_FIELDS.map(([key, label]) => (
        <Field key={key} label={label}>
          <input value={vals[key] || ''} onChange={(e) => setVals({ ...vals, [key]: e.target.value })} />
        </Field>
      ))}
      <button className="save">Save</button>
    </form>
  );
}
