import './styles.css';
import { endRelationship, loadDashboard, login, logout, registerAccount, respondToRequest, sendRelationshipRequest, waitForSession } from './firebase-client';

type AuthMode = 'login' | 'register';

const logoUrl = `${import.meta.env.BASE_URL}love-history-logo.png`;

const icon = (name: 'shield' | 'id' | 'lock' | 'eye' | 'history' | 'link' | 'user' | 'search' | 'logout') => {
  const paths: Record<typeof name, string> = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    id: '<rect width="18" height="14" x="3" y="5" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M7 15h2M13 9h4M13 13h4"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    eye: '<path d="M2.1 12a10.9 10.9 0 0 1 19.8 0 10.9 10.9 0 0 1-19.8 0Z"/><circle cx="12" cy="12" r="3"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/>',
  };
  return `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

const securityPill = (text: string) => `
  <div class="flex items-center gap-2 rounded-full border border-[#dfeae4] bg-[#f5fbf7] px-3 py-2 text-xs font-semibold text-[#286047]">
    <span class="security-dot"></span>${text}
  </div>`;

function firstNameFragment(fullName: string): string {
  const words = fullName.toLowerCase().trim().split(/\s+/);
  const givenName = words.find((word) => !word.includes('.') && word.replace(/[^a-z]/g, '').length >= 3) ?? '';
  return givenName.normalize('NFKD').replace(/[^a-z]/g, '').slice(0, 3);
}

function generateLoveKey(fullName: string, birthday: string): string {
  const [year, month, day] = birthday.split('-');
  const fragment = firstNameFragment(fullName);
  if (!year || !month || !day || fragment.length !== 3) return '';
  return `${Number(day)}${Number(month)}${year}${fragment}`;
}

function accountFields(mode: AuthMode) {
  if (mode === 'login') {
    return `<div><label for="love-key" class="mb-2 block text-sm font-bold text-[#4c2634]">Love Key</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7e89]">${icon('id')}</span><input id="love-key" name="loveKey" class="field" autocomplete="username" inputmode="text" maxlength="24" placeholder="Example: 2222006yas" required aria-describedby="key-help" /></div><p id="key-help" class="mt-2 flex items-center gap-1.5 text-xs text-[#88727a]">${icon('shield')} Use the exact key created for your account.</p></div>`;
  }
  return `<div><label for="birthday" class="mb-2 block text-sm font-bold text-[#4c2634]">Birthday</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7e89]">${icon('history')}</span><input id="birthday" name="birthday" type="date" class="field" autocomplete="bday" min="1926-01-01" required /></div><p class="mt-2 text-xs text-[#88727a]">Love History accounts are currently limited to adults aged 18+.</p></div>
    <div><label for="full-name" class="mb-2 block text-sm font-bold text-[#4c2634]">Full name <span class="font-medium text-[#9a818b]">(English)</span></label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7e89]">${icon('user')}</span><input id="full-name" name="fullName" class="field" autocomplete="name" maxlength="100" placeholder="K.M.H Yasodha Sandeepa" required /></div></div>
    <div class="rounded-2xl border border-[#e4ced7] bg-gradient-to-r from-[#fff7fa] to-[#fffaf1] p-4"><p class="text-[10px] font-bold uppercase tracking-[.15em] text-[#a15e76]">Your Love Key</p><div class="mt-2 flex items-center justify-between gap-3"><output id="generated-key" class="font-mono text-xl font-black tracking-wide text-[#651533]">Waiting for details</output><span class="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#8a5368]">Auto-generated</span></div><p class="mt-2 text-xs leading-5 text-[#8c747d]">Example: 22 Feb 2006 + Yasodha = <strong>2222006yas</strong>. If that key already exists, a short collision suffix is added securely.</p></div>`;
}

function authView(mode: AuthMode = 'login') {
  return `
    <div class="page-shell noise">
      <header class="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <a href="#" class="flex items-center gap-3" aria-label="Love History home">
          <img src="${logoUrl}" alt="" class="h-12 w-12 object-contain" />
          <div><p class="text-lg font-extrabold tracking-[-.03em] text-[#5f1230]">Love History</p><p class="text-[11px] font-semibold uppercase tracking-[.19em] text-[#a36d80]">Private by design</p></div>
        </a>
        <button id="security-open" class="flex items-center gap-2 rounded-full border border-[#e6d8de] bg-white/70 px-4 py-2 text-sm font-semibold text-[#6b2841] hover:bg-white">
          ${icon('shield')} Security design
        </button>
      </header>

      <main id="main" class="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-6 lg:min-h-[calc(100vh-94px)] lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24">
        <section class="max-w-2xl py-8 lg:py-0">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#eadce1] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[.15em] text-[#8b3655]">
            ${icon('shield')} Exact-match identity protection
          </div>
          <h1 class="max-w-xl text-5xl font-black leading-[1.02] tracking-[-.055em] text-[#3d1223] sm:text-6xl">Your story deserves memory, <span class="text-[#a52f57]">not exposure.</span></h1>
          <p class="mt-6 max-w-xl text-lg leading-8 text-[#745b65]">Build a private relationship timeline, connect only by mutual consent, and use a simple Love Key instead of a national identity number.</p>

          <div class="mt-8 flex flex-wrap gap-3">
            ${securityPill('No NIC required')}
            ${securityPill('Encrypted at rest')}
            ${securityPill('Mutual consent')}
          </div>

          <div class="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            <div><p class="text-2xl font-black text-[#5f1230]">0</p><p class="mt-1 text-sm text-[#826d75]">NIC numbers collected</p></div>
            <div><p class="text-2xl font-black text-[#5f1230]">100%</p><p class="mt-1 text-sm text-[#826d75]">exact-match search</p></div>
            <div><p class="text-2xl font-black text-[#5f1230]">2-way</p><p class="mt-1 text-sm text-[#826d75]">relationship consent</p></div>
          </div>
        </section>

        <section class="glass mx-auto w-full max-w-[510px] rounded-[2rem] p-5 sm:p-8" aria-labelledby="auth-heading">
          <div class="rounded-[1.35rem] bg-[#faf5f7] p-1.5" role="tablist" aria-label="Account access">
            <div class="grid grid-cols-2 gap-1">
              <button class="tab-button rounded-2xl py-3 text-sm" role="tab" data-mode="login" aria-selected="${mode === 'login'}">Log in</button>
              <button class="tab-button rounded-2xl py-3 text-sm" role="tab" data-mode="register" aria-selected="${mode === 'register'}">Create account</button>
            </div>
          </div>

          <div class="px-1 pt-8">
            <p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">${mode === 'login' ? 'Welcome back' : 'A safer beginning'}</p>
            <h2 id="auth-heading" class="mt-2 text-3xl font-black tracking-[-.04em] text-[#411426]">${mode === 'login' ? 'Continue your story' : 'Create your private space'}</h2>
            <p class="mt-2 text-sm leading-6 text-[#826d75]">${mode === 'login' ? 'Enter your exact Love Key and password.' : 'Enter only your birthday, full name and a strong password. Your Love Key is created automatically.'}</p>
          </div>

          <form id="auth-form" class="mt-7 space-y-4" novalidate>
            ${accountFields(mode)}

            <div>
              <label for="password" class="mb-2 block text-sm font-bold text-[#4c2634]">${mode === 'login' ? 'Password' : 'Create a strong password'}</label>
              <div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7e89]">${icon('lock')}</span><input id="password" name="password" type="password" class="field pr-12" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" minlength="12" placeholder="At least 12 characters" required /><button id="toggle-password" type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e717c]" aria-label="Show password">${icon('eye')}</button></div>
              ${mode === 'register' ? '<div class="mt-2 grid grid-cols-4 gap-1" aria-hidden="true"><span class="strength h-1 rounded-full bg-[#eadce1]"></span><span class="strength h-1 rounded-full bg-[#eadce1]"></span><span class="strength h-1 rounded-full bg-[#eadce1]"></span><span class="strength h-1 rounded-full bg-[#eadce1]"></span></div><p id="password-hint" class="mt-2 text-xs text-[#88727a]">Use 12+ characters with a unique phrase.</p>' : ''}
            </div>

            ${mode === 'register' ? `<div><label for="password-confirm" class="mb-2 block text-sm font-bold text-[#4c2634]">Confirm password</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7e89]">${icon('lock')}</span><input id="password-confirm" name="passwordConfirm" type="password" class="field" autocomplete="new-password" minlength="12" placeholder="Enter the same password again" required /></div><p id="password-match" class="mt-2 text-xs text-[#88727a]">Passwords must match.</p></div>` : ''}

            ${mode === 'register' ? '<label class="flex items-start gap-3 rounded-2xl border border-[#eadde2] bg-white p-4 text-sm leading-5 text-[#725c65]"><input id="consent" type="checkbox" class="mt-1 h-4 w-4 accent-[#841d45]" required /><span>I understand that relationship connections require mutual consent and that I can revoke non-essential profile visibility.</span></label>' : ''}

            <div id="form-message" class="hidden rounded-2xl border px-4 py-3 text-sm" role="status" aria-live="polite"></div>
            <button class="primary-button" type="submit">${mode === 'login' ? 'Log in securely' : 'Create encrypted account'}</button>
          </form>

          <p class="mt-6 text-center text-[11px] leading-5 text-[#9b858d]">Live on Firebase Spark. Private details are encrypted in your browser before Firestore storage.</p>
        </section>
      </main>
    </div>
    ${securityDialog()}`;
}

function securityDialog() {
  return `<dialog id="security-dialog" class="m-auto w-[min(92vw,620px)] rounded-[2rem] border-0 bg-white p-0 shadow-2xl backdrop:bg-[#2c101b]/50">
    <div class="p-6 sm:p-8">
      <div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Security architecture</p><h2 class="mt-2 text-2xl font-black text-[#411426]">No national identity number required.</h2></div><button id="security-close" class="rounded-full bg-[#f6edf0] px-3 py-2 text-sm font-bold text-[#6c2941]" aria-label="Close">Close</button></div>
      <div class="mt-7 space-y-5">
        ${securityRow('01', 'Server-verified Love Key', 'The visible key is only a login identifier. The server stores a separate HMAC-SHA-256 lookup token, never the raw key as a database index.')}
        ${securityRow('02', 'Private details encrypted', 'Birthday and full legal name are encrypted with AES-256-GCM and a versioned key outside Firestore.')}
        ${securityRow('03', 'Passwords stay with Auth', 'Passwords are processed by Firebase Authentication and are never stored in Firestore or application logs.')}
        ${securityRow('04', 'No sensitive public identifiers', 'Profiles use random public IDs. Birthday, legal name and Love Key never appear in analytics, notifications or public URLs.')}
      </div>
    </div>
  </dialog>`;
}

function securityRow(number: string, title: string, body: string) {
  return `<div class="grid grid-cols-[42px_1fr] gap-4"><div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5e8ed] text-xs font-black text-[#812044]">${number}</div><div><h3 class="font-extrabold text-[#4d1b2e]">${title}</h3><p class="mt-1 text-sm leading-6 text-[#7c666f]">${body}</p></div></div>`;
}

function dashboardView() {
  const dashboardDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return `<div class="page-shell noise min-h-screen">
    <header class="border-b border-[#eadde2] bg-white/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <div class="flex items-center gap-3"><img src="${logoUrl}" alt="" class="h-11 w-11 object-contain"/><div><p class="font-black tracking-[-.03em] text-[#5f1230]">Love History</p><p class="text-[10px] font-bold uppercase tracking-[.16em] text-[#a36d80]">Private dashboard</p></div></div>
        <div class="flex items-center gap-2"><button id="privacy-center" class="rounded-full border border-[#e6d8de] bg-white p-2.5 text-[#6b2841]" aria-label="Open privacy centre">${icon('shield')}</button><button id="logout" class="flex items-center gap-2 rounded-full bg-[#f3e8ec] px-4 py-2.5 text-sm font-bold text-[#6b2841]">${icon('logout')} Log out</button></div>
      </div>
    </header>
    <main id="main" class="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
      <div class="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p class="text-xs font-bold uppercase tracking-[.18em] text-[#a35d76]">${dashboardDate}</p><h1 class="mt-2 text-4xl font-black tracking-[-.045em] text-[#3d1223]">Hello, <span id="dashboard-name" class="text-[#9e2c54]">Member.</span></h1><p class="mt-2 text-[#7b646d]">Your private relationship space is protected by mutual consent.</p></div><button id="relationship-settings" class="primary-button !w-auto px-6">${icon('link')} Relationship settings</button></div>

      <section class="mt-9 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article class="relative overflow-hidden rounded-[1.7rem] border border-[#d7a6b8] bg-white p-6 shadow-[0_20px_55px_rgba(103,20,52,.14)] sm:p-8">
          <div class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#7a173c] via-[#d14972] to-[#d8a04b]"></div>
          <div class="flex flex-wrap items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Current relationship</p><h2 id="current-heading" class="mt-2 text-3xl font-black tracking-[-.04em] text-[#431628]">Loading…</h2></div><span id="current-status" class="flex items-center gap-2 rounded-full bg-[#eef9f3] px-4 py-2 text-xs font-extrabold text-[#286047]"><span class="security-dot"></span> Checking</span></div>
          <div class="mt-7 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#fff6f9] to-[#fffaf2] p-5"><div class="flex -space-x-3"><div id="avatar-one" class="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#7b193d] text-lg font-black text-white">L</div><div id="avatar-two" class="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#d59048] text-lg font-black text-white">H</div></div><div><p id="current-names" class="text-lg font-black text-[#4d1b2e]">Loading account</p><p id="current-detail" class="mt-1 text-sm font-semibold text-[#8a6976]">Checking Firestore</p></div></div>
          <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><div class="rounded-2xl border border-[#eee0e5] bg-[#fffdfd] p-4"><p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#a07887]">Together for</p><p id="together-duration" class="mt-2 text-lg font-black text-[#5f1734]">—</p><p class="text-xs text-[#907781]">Calculated privately</p></div><div class="rounded-2xl border border-[#eee0e5] bg-[#fffdfd] p-4"><p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#a07887]">History records</p><p id="history-count" class="mt-2 text-lg font-black text-[#5f1734]">0</p><p class="text-xs text-[#907781]">Your relationships</p></div><div class="col-span-2 rounded-2xl border border-[#eee0e5] bg-[#fffdfd] p-4 sm:col-span-1"><p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#a07887]">Consent</p><p id="consent-state" class="mt-2 text-lg font-black text-[#2d7453]">Not connected</p><p class="text-xs text-[#907781]">Mutual acceptance required</p></div></div>
          <div class="mt-5 flex flex-wrap items-center justify-between gap-3"><p class="flex items-center gap-2 text-xs font-semibold text-[#806a73]">${icon('shield')} Partner birthdays and Love Keys are never displayed.</p><button class="rounded-xl border border-[#dec9d1] bg-white px-4 py-2.5 text-sm font-extrabold text-[#6f2642]">View relationship</button></div>
        </article>
        <article class="rounded-[1.7rem] bg-gradient-to-br from-[#601531] to-[#9b2d54] p-6 text-white shadow-[0_20px_50px_rgba(93,19,47,.22)] sm:p-8"><div class="flex items-center justify-between"><p class="text-xs font-bold uppercase tracking-[.16em] text-[#f0cbd9]">Profile protection</p>${icon('shield')}</div><p class="mt-7 text-5xl font-black">AES<span class="text-2xl text-[#eab7c9]">-256</span></p><p class="mt-2 font-bold">Private details encrypted</p><p class="mt-2 text-sm leading-6 text-[#f0d8e1]">Your full name and birthday are encrypted in this browser before they reach Firestore.</p></article>
      </section>

      <section class="mt-5 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
        <article class="dashboard-card rounded-[1.7rem] p-6 sm:p-8"><div class="flex items-center justify-between"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Your profile</p><h2 class="mt-2 text-xl font-black text-[#431628]">Private details</h2></div><div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4e6eb] text-[#842046]">${icon('user')}</div></div><dl class="mt-7 space-y-4 text-sm"><div class="flex justify-between gap-4 border-b border-[#eee2e6] pb-4"><dt class="text-[#8a747d]">Display name</dt><dd id="profile-name" class="font-bold text-[#4e2635]">—</dd></div><div class="flex justify-between gap-4 border-b border-[#eee2e6] pb-4"><dt class="text-[#8a747d]">Love Key</dt><dd id="profile-key" class="font-mono font-bold text-[#2f7654]">—</dd></div><div class="flex justify-between gap-4"><dt class="text-[#8a747d]">Public profile ID</dt><dd id="profile-id" class="font-mono text-xs font-bold text-[#4e2635]">—</dd></div></dl></article>
        <article class="dashboard-card rounded-[1.7rem] p-6 sm:p-8"><div class="flex items-center justify-between"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Love history</p><h2 class="mt-2 text-xl font-black text-[#431628]">Your private timeline</h2></div><div class="text-[#842046]">${icon('history')}</div></div><div id="history-content" class="mt-7 text-sm leading-6 text-[#806b73]">No relationship history yet.</div></article>
      </section>
      <section class="mt-5 grid gap-5 lg:grid-cols-2">
        <article class="dashboard-card rounded-[1.7rem] p-6 sm:p-8"><div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Daily connection</p><h2 class="mt-2 text-2xl font-black tracking-[-.035em] text-[#431628]">How are you feeling today?</h2></div><span class="rounded-full bg-[#fff2d9] px-3 py-1.5 text-xs font-bold text-[#8a5a13]">Day 12 streak</span></div><div id="mood-options" class="mt-6 grid grid-cols-5 gap-2" aria-label="Mood check-in"><button class="mood rounded-2xl border border-[#eadde2] bg-white py-3 text-2xl" aria-label="Very low">😔</button><button class="mood rounded-2xl border border-[#eadde2] bg-white py-3 text-2xl" aria-label="Low">😕</button><button class="mood rounded-2xl border border-[#eadde2] bg-white py-3 text-2xl" aria-label="Okay">😐</button><button class="mood rounded-2xl border border-[#eadde2] bg-white py-3 text-2xl" aria-label="Good">🙂</button><button class="mood rounded-2xl border border-[#eadde2] bg-white py-3 text-2xl" aria-label="Great">🥰</button></div><div class="mt-6 rounded-2xl bg-[#fff7fa] p-5"><p class="text-[10px] font-bold uppercase tracking-[.15em] text-[#a35d76]">Today’s question</p><p class="mt-2 text-lg font-extrabold leading-7 text-[#4d1b2e]">What did your partner do recently that made you feel appreciated?</p><button id="answer-question" class="mt-4 rounded-xl bg-[#7d1b40] px-4 py-2.5 text-sm font-extrabold text-white">Answer privately</button><p id="answer-status" class="mt-3 text-xs text-[#8c747d]">Your answers unlock only after both partners respond.</p></div></article>
        <article class="dashboard-card rounded-[1.7rem] p-6 sm:p-8"><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Together space</p><h2 class="mt-2 text-2xl font-black tracking-[-.035em] text-[#431628]">Plans &amp; milestones</h2><div id="together-space" class="mt-6 rounded-2xl border border-[#eadde2] bg-white p-5 text-sm leading-6 text-[#88727a]">Connect with a partner through mutual consent to unlock your shared space.</div></article>
      </section>
      <section class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><button class="dashboard-card rounded-2xl p-5 text-left"><span class="text-2xl">🎯</span><p class="mt-3 font-extrabold text-[#4d1b2e]">Couple quiz</p><p class="mt-1 text-xs leading-5 text-[#88727a]">Compare answers together</p></button><button class="dashboard-card rounded-2xl p-5 text-left"><span class="text-2xl">📷</span><p class="mt-3 font-extrabold text-[#4d1b2e]">Memories</p><p class="mt-1 text-xs leading-5 text-[#88727a]">Private encrypted timeline</p></button><button id="privacy-card" class="dashboard-card rounded-2xl p-5 text-left"><span class="text-2xl">🔐</span><p class="mt-3 font-extrabold text-[#4d1b2e]">Privacy centre</p><p class="mt-1 text-xs leading-5 text-[#88727a]">Visibility, sessions &amp; export</p></button><button id="safety-card" class="dashboard-card rounded-2xl p-5 text-left"><span class="text-2xl">🛟</span><p class="mt-3 font-extrabold text-[#4d1b2e]">Safety</p><p class="mt-1 text-xs leading-5 text-[#88727a]">Block, report or exit safely</p></button></section>
    </main>${dashboardDialogs()}
  </div>`;
}

function dashboardDialogs() {
  return `<dialog id="relationship-dialog" class="m-auto w-[min(92vw,680px)] rounded-[2rem] border-0 bg-white p-0 shadow-2xl backdrop:bg-[#2c101b]/50"><div class="p-6 sm:p-8"><div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Relationship settings</p><h2 class="mt-2 text-2xl font-black text-[#411426]">Consent comes first</h2></div><button data-close="relationship-dialog" class="rounded-full bg-[#f6edf0] px-3 py-2 text-sm font-bold text-[#6c2941]">Close</button></div><div id="incoming-requests" class="mt-6 space-y-3"></div><div class="mt-7 rounded-2xl border border-[#e5d6dc] p-5"><p class="font-extrabold text-[#4d1b2e]">Connect using an exact Love Key</p><div class="mt-3 flex gap-2"><input id="partner-key" class="field !pl-4" placeholder="Partner’s complete Love Key"/><button id="send-request" class="rounded-xl bg-[#7d1b40] px-4 text-sm font-extrabold text-white">Send request</button></div><p id="request-status" class="mt-2 text-xs text-[#8c747d]">No suggestions or partial matches are shown.</p></div><div class="mt-4 rounded-2xl border border-[#f0d6d6] bg-[#fffafa] p-5"><p class="font-extrabold text-[#7a2633]">End relationship safely</p><p class="mt-2 text-sm leading-6 text-[#826d75]">Leaving never requires permission. The relationship becomes separated immediately; the 10-day period only finalizes the shared history record.</p><div class="mt-4 flex flex-wrap gap-2"><button id="start-breakup" class="rounded-xl border border-[#d6a8ad] px-4 py-2.5 text-sm font-extrabold text-[#8b2f3c]">Start safe breakup flow</button><button class="rounded-xl border border-[#e4d6db] px-4 py-2.5 text-sm font-bold text-[#705761]">Block or report</button></div><p id="breakup-status" class="mt-3 hidden rounded-xl bg-[#f7ecef] p-3 text-sm font-semibold text-[#7b3048]"></p></div></div></dialog>
  <dialog id="privacy-dialog" class="m-auto w-[min(92vw,680px)] rounded-[2rem] border-0 bg-white p-0 shadow-2xl backdrop:bg-[#2c101b]/50"><div class="p-6 sm:p-8"><div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Privacy centre</p><h2 class="mt-2 text-2xl font-black text-[#411426]">You control your history</h2></div><button data-close="privacy-dialog" class="rounded-full bg-[#f6edf0] px-3 py-2 text-sm font-bold text-[#6c2941]">Close</button></div><div class="mt-7 space-y-3"><label class="flex items-center justify-between rounded-2xl border border-[#eadde2] p-4"><span><strong class="block text-[#4d1b2e]">History visibility</strong><small class="text-[#88727a]">Only me</small></span><input type="radio" checked class="h-5 w-5 accent-[#7d1b40]"/></label><label class="flex items-center justify-between rounded-2xl border border-[#eadde2] p-4"><span><strong class="block text-[#4d1b2e]">Current partner access</strong><small class="text-[#88727a]">Only mutually confirmed records</small></span><input type="checkbox" checked class="h-5 w-5 accent-[#7d1b40]"/></label><div class="rounded-2xl border border-[#eadde2] p-4"><div class="flex items-center justify-between"><span><strong class="block text-[#4d1b2e]">Active sessions</strong><small class="text-[#88727a]">Edge on Windows · current device</small></span><button class="text-sm font-extrabold text-[#7d1b40]">Log out all</button></div></div><div class="grid grid-cols-2 gap-3"><button class="rounded-xl border border-[#dec9d1] py-3 text-sm font-extrabold text-[#6f2642]">Download my data</button><button class="rounded-xl border border-[#e5b8bc] py-3 text-sm font-extrabold text-[#8b2f3c]">Delete account</button></div></div></div></dialog>`;
}

function bindAuth(mode: AuthMode) {
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => render((button.dataset.mode ?? 'login') as AuthMode));
  });
  const dialog = document.querySelector<HTMLDialogElement>('#security-dialog');
  document.querySelector('#security-open')?.addEventListener('click', () => dialog?.showModal());
  document.querySelector('#security-close')?.addEventListener('click', () => dialog?.close());

  const password = document.querySelector<HTMLInputElement>('#password');
  document.querySelector('#toggle-password')?.addEventListener('click', () => {
    if (!password) return;
    password.type = password.type === 'password' ? 'text' : 'password';
  });
  password?.addEventListener('input', () => {
    if (mode !== 'register') return;
    const score = [password.value.length >= 12, /[A-Z]/.test(password.value), /[0-9]/.test(password.value), /[^A-Za-z0-9]/.test(password.value)].filter(Boolean).length;
    document.querySelectorAll<HTMLElement>('.strength').forEach((bar, i) => { bar.style.background = i < score ? (score < 3 ? '#c7823c' : '#32845f') : '#eadce1'; });
  });
  if (mode === 'register') {
    const birthday = document.querySelector<HTMLInputElement>('#birthday');
    const fullName = document.querySelector<HTMLInputElement>('#full-name');
    const output = document.querySelector<HTMLOutputElement>('#generated-key');
    const confirm = document.querySelector<HTMLInputElement>('#password-confirm');
    const match = document.querySelector<HTMLElement>('#password-match');
    const updateKey = () => {
      const key = generateLoveKey(fullName?.value ?? '', birthday?.value ?? '');
      if (output) output.value = key || 'Waiting for details';
    };
    if (birthday) {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 18);
      birthday.max = cutoff.toISOString().slice(0, 10);
    }
    const updateMatch = () => {
      if (!match || !confirm || !password) return;
      const matches = confirm.value.length > 0 && confirm.value === password.value;
      match.textContent = matches ? 'Passwords match.' : 'Passwords must match.';
      match.className = `mt-2 text-xs ${matches ? 'font-semibold text-[#2f7654]' : 'text-[#88727a]'}`;
    };
    birthday?.addEventListener('input', updateKey);
    fullName?.addEventListener('input', updateKey);
    password?.addEventListener('input', updateMatch);
    confirm?.addEventListener('input', updateMatch);
  }
  document.querySelector<HTMLFormElement>('#auth-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const box = document.querySelector<HTMLElement>('#form-message');
    const submit = document.querySelector<HTMLButtonElement>('#auth-form button[type="submit"]');
    if (!box || !password || !submit) return;
    box.classList.remove('hidden');
    if (mode === 'register') {
      const birthday = document.querySelector<HTMLInputElement>('#birthday')?.value ?? '';
      const fullName = document.querySelector<HTMLInputElement>('#full-name')?.value ?? '';
      const confirm = document.querySelector<HTMLInputElement>('#password-confirm')?.value ?? '';
      const key = generateLoveKey(fullName, birthday);
      if (!key || !password || password.value !== confirm) {
        box.className = 'rounded-2xl border border-[#efc7c7] bg-[#fff7f7] px-4 py-3 text-sm text-[#8b2f3c]';
        box.textContent = !key ? 'Enter a valid birthday and an English full name containing a given name with at least three letters.' : 'The two passwords must match.';
        return;
      }
      try {
        submit.disabled = true;
        submit.textContent = 'Creating encrypted account…';
        const loveKey = await registerAccount({ loveKey: key, fullName, birthday, password: password.value });
        box.className = 'rounded-2xl border border-[#b9dec9] bg-[#f3fbf6] px-4 py-3 text-sm font-semibold text-[#286047]';
        box.textContent = `Account created. Save your Love Key: ${loveKey}`;
        await new Promise((resolve) => setTimeout(resolve, 1200));
        window.history.replaceState({}, '', '#dashboard');
        await renderDashboard();
      } catch (error) {
        box.className = 'rounded-2xl border border-[#efc7c7] bg-[#fff7f7] px-4 py-3 text-sm text-[#8b2f3c]';
        box.textContent = friendlyError(error);
      } finally {
        submit.disabled = false;
        submit.textContent = 'Create encrypted account';
      }
      return;
    }
    try {
      submit.disabled = true;
      submit.textContent = 'Logging in…';
      await login(document.querySelector<HTMLInputElement>('#love-key')?.value ?? '', password.value);
      window.history.replaceState({}, '', '#dashboard');
      await renderDashboard();
    } catch (error) {
      box.className = 'rounded-2xl border border-[#efc7c7] bg-[#fff7f7] px-4 py-3 text-sm text-[#8b2f3c]';
      box.textContent = friendlyError(error);
    } finally {
      submit.disabled = false;
      submit.textContent = 'Log in securely';
    }
  });
}

function friendlyError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Love Key or password is incorrect.';
  if (code.includes('weak-password')) return 'Use a stronger password with at least 12 characters.';
  if (code.includes('network')) return 'Network error. Check your connection and try again.';
  return error instanceof Error ? error.message : 'Request could not be completed.';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ?? character);
}

function render(mode: AuthMode = 'login') {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = authView(mode);
  window.scrollTo({ top: 0, behavior: 'auto' });
  bindAuth(mode);
}

async function renderDashboard() {
  let data;
  try {
    data = await loadDashboard();
  } catch (error) {
    window.history.replaceState({}, '', location.pathname);
    render();
    const box = document.querySelector<HTMLElement>('#form-message');
    if (box) { box.classList.remove('hidden'); box.textContent = friendlyError(error); }
    return;
  }
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = dashboardView();
  window.scrollTo({ top: 0, behavior: 'auto' });
  const partnerName = data.active ? Object.entries(data.active.participantNames).find(([uid]) => uid !== data.profile.uid)?.[1] ?? 'Partner' : '';
  const setText = (selector: string, value: string) => { const element = document.querySelector<HTMLElement>(selector); if (element) element.textContent = value; };
  setText('#profile-name', data.profile.displayName);
  setText('#dashboard-name', `${data.profile.displayName}.`);
  setText('#profile-key', data.profile.loveKeyMasked);
  setText('#profile-id', data.profile.publicId);
  setText('#avatar-one', data.profile.displayName.charAt(0));
  setText('#current-heading', data.active ? 'You’re together' : 'You’re single');
  setText('#current-status', data.active ? '● Active relationship' : '● Single');
  setText('#current-names', data.active ? `${data.profile.displayName} & ${partnerName}` : data.profile.displayName);
  setText('#current-detail', data.active ? 'Mutually confirmed relationship' : 'Use an exact Love Key to send a request');
  setText('#history-count', String(data.history.length));
  setText('#consent-state', data.active ? 'Confirmed' : 'Not connected');
  if (data.active?.startedAt?.toDate) {
    const days = Math.max(0, Math.floor((Date.now() - data.active.startedAt.toDate().getTime()) / 86_400_000));
    setText('#together-duration', days === 1 ? '1 day' : `${days} days`);
  }
  const historyContent = document.querySelector<HTMLElement>('#history-content');
  if (historyContent && data.history.length) {
    historyContent.innerHTML = data.history.map((item) => {
      const other = Object.entries(item.participantNames).find(([uid]) => uid !== data.profile.uid)?.[1] ?? 'Private partner';
      const date = item.breakupAt?.toDate ? item.breakupAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Pending finalization';
      return `<div class="mb-3 rounded-2xl bg-[#fff7fa] p-4"><strong class="text-[#4d1b2e]">Relationship with ${escapeHtml(other)}</strong><p class="mt-1">Separated: ${escapeHtml(date)} · ${item.status === 'ended_pending' ? 'Finalizes after 10 days' : 'Finalized'}</p></div>`;
    }).join('');
  }
  const togetherSpace = document.querySelector<HTMLElement>('#together-space');
  if (togetherSpace && data.active) togetherSpace.textContent = `Shared space with ${partnerName} is active. Private plans and memories can be added in the next feature update.`;
  const secondAvatar = document.querySelector<HTMLElement>('#avatar-two');
  if (secondAvatar) { secondAvatar.textContent = partnerName.charAt(0); secondAvatar.classList.toggle('hidden', !data.active); }
  const relationshipDialog = document.querySelector<HTMLDialogElement>('#relationship-dialog');
  const privacyDialog = document.querySelector<HTMLDialogElement>('#privacy-dialog');
  const incomingBox = document.querySelector<HTMLElement>('#incoming-requests');
  if (incomingBox && data.incoming.length) {
    incomingBox.innerHTML = `<p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Pending requests</p>${data.incoming.map((request) => `<div class="flex items-center justify-between gap-3 rounded-2xl bg-[#fff7fa] p-4"><strong class="text-[#4d1b2e]">${escapeHtml(request.fromName)}</strong><div class="flex gap-2"><button data-request-id="${request.id}" data-answer="yes" class="rounded-xl bg-[#7d1b40] px-3 py-2 text-xs font-bold text-white">Accept</button><button data-request-id="${request.id}" data-answer="no" class="rounded-xl border px-3 py-2 text-xs font-bold">Decline</button></div></div>`).join('')}`;
  }
  document.querySelector('#relationship-settings')?.addEventListener('click', () => relationshipDialog?.showModal());
  document.querySelector('#safety-card')?.addEventListener('click', () => relationshipDialog?.showModal());
  document.querySelector('#privacy-center')?.addEventListener('click', () => privacyDialog?.showModal());
  document.querySelector('#privacy-card')?.addEventListener('click', () => privacyDialog?.showModal());
  document.querySelectorAll<HTMLButtonElement>('[data-close]').forEach((button) => button.addEventListener('click', () => document.querySelector<HTMLDialogElement>(`#${button.dataset.close}`)?.close()));
  document.querySelectorAll<HTMLButtonElement>('[data-request-id]').forEach((button) => button.addEventListener('click', async () => {
    button.disabled = true;
    try { await respondToRequest(button.dataset.requestId ?? '', button.dataset.answer === 'yes'); await renderDashboard(); }
    catch (error) { button.disabled = false; window.alert(friendlyError(error)); }
  }));
  document.querySelector('#send-request')?.addEventListener('click', async () => {
    const input = document.querySelector<HTMLInputElement>('#partner-key');
    const status = document.querySelector<HTMLElement>('#request-status');
    if (!input || !status) return;
    try { await sendRelationshipRequest(input.value); status.textContent = 'Relationship request sent securely.'; status.className = 'mt-2 text-xs font-semibold text-[#2f7654]'; input.value = ''; }
    catch (error) { status.textContent = friendlyError(error); status.className = 'mt-2 text-xs font-semibold text-[#8b2f3c]'; }
  });
  document.querySelectorAll<HTMLButtonElement>('.mood').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll<HTMLButtonElement>('.mood').forEach((item) => item.classList.remove('border-[#8a2047]', 'bg-[#fff0f5]', 'ring-2', 'ring-[#e8b9c9]'));
    button.classList.add('border-[#8a2047]', 'bg-[#fff0f5]', 'ring-2', 'ring-[#e8b9c9]');
  }));
  document.querySelector('#answer-question')?.addEventListener('click', () => {
    const status = document.querySelector<HTMLElement>('#answer-status');
    if (status) { status.textContent = 'Your answer is sealed. It will unlock after your partner responds.'; status.className = 'mt-3 text-xs font-semibold text-[#2f7654]'; }
  });
  document.querySelector('#start-breakup')?.addEventListener('click', async () => {
    const status = document.querySelector<HTMLElement>('#breakup-status');
    if (!status) return;
    status.classList.remove('hidden');
    if (!data.active) { status.textContent = 'You do not have an active relationship.'; return; }
    try { await endRelationship(data.active.id); status.textContent = 'Separated immediately. The shared history will finalize after 10 days.'; await renderDashboard(); }
    catch (error) { status.textContent = friendlyError(error); }
  });
  document.querySelector('#logout')?.addEventListener('click', async () => { await logout(); window.history.replaceState({}, '', location.pathname); render(); });
}

void waitForSession().then((user) => {
  if (user) { window.history.replaceState({}, '', '#dashboard'); void renderDashboard(); }
  else render();
});
