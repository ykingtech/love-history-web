(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=e=>`<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${{shield:`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>`,id:`<rect width="18" height="14" x="3" y="5" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M7 15h2M13 9h4M13 13h4"/>`,lock:`<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,eye:`<path d="M2.1 12a10.9 10.9 0 0 1 19.8 0 10.9 10.9 0 0 1-19.8 0Z"/><circle cx="12" cy="12" r="3"/>`,history:`<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>`,link:`<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1"/>`,user:`<circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>`,search:`<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,logout:`<path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/>`}[e]}</svg>`,t=e=>`
  <div class="flex items-center gap-2 rounded-full border border-[#dfeae4] bg-[#f5fbf7] px-3 py-2 text-xs font-semibold text-[#286047]">
    <span class="security-dot"></span>${e}
  </div>`;function n(n=`login`){return`
    <div class="page-shell noise">
      <header class="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <a href="#" class="flex items-center gap-3" aria-label="Love History home">
          <img src="/love-history-logo.png" alt="" class="h-12 w-12 object-contain" />
          <div><p class="text-lg font-extrabold tracking-[-.03em] text-[#5f1230]">Love History</p><p class="text-[11px] font-semibold uppercase tracking-[.19em] text-[#a36d80]">Private by design</p></div>
        </a>
        <button id="security-open" class="flex items-center gap-2 rounded-full border border-[#e6d8de] bg-white/70 px-4 py-2 text-sm font-semibold text-[#6b2841] hover:bg-white">
          ${e(`shield`)} Security design
        </button>
      </header>

      <main id="main" class="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-6 lg:min-h-[calc(100vh-94px)] lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24">
        <section class="max-w-2xl py-8 lg:py-0">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#eadce1] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[.15em] text-[#8b3655]">
            ${e(`shield`)} Exact-match identity protection
          </div>
          <h1 class="max-w-xl text-5xl font-black leading-[1.02] tracking-[-.055em] text-[#3d1223] sm:text-6xl">Your story deserves memory, <span class="text-[#a52f57]">not exposure.</span></h1>
          <p class="mt-6 max-w-xl text-lg leading-8 text-[#745b65]">Build a private relationship timeline, connect only by mutual consent, and keep your identity number invisible at every step.</p>

          <div class="mt-8 flex flex-wrap gap-3">
            ${t(`NIC never displayed`)}
            ${t(`Encrypted at rest`)}
            ${t(`Mutual consent`)}
          </div>

          <div class="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            <div><p class="text-2xl font-black text-[#5f1230]">0</p><p class="mt-1 text-sm text-[#826d75]">partial-ID results</p></div>
            <div><p class="text-2xl font-black text-[#5f1230]">100%</p><p class="mt-1 text-sm text-[#826d75]">exact-match search</p></div>
            <div><p class="text-2xl font-black text-[#5f1230]">2-way</p><p class="mt-1 text-sm text-[#826d75]">relationship consent</p></div>
          </div>
        </section>

        <section class="glass mx-auto w-full max-w-[510px] rounded-[2rem] p-5 sm:p-8" aria-labelledby="auth-heading">
          <div class="rounded-[1.35rem] bg-[#faf5f7] p-1.5" role="tablist" aria-label="Account access">
            <div class="grid grid-cols-2 gap-1">
              <button class="tab-button rounded-2xl py-3 text-sm" role="tab" data-mode="login" aria-selected="${n===`login`}">Log in</button>
              <button class="tab-button rounded-2xl py-3 text-sm" role="tab" data-mode="register" aria-selected="${n===`register`}">Create account</button>
            </div>
          </div>

          <div class="px-1 pt-8">
            <p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">${n===`login`?`Welcome back`:`A safer beginning`}</p>
            <h2 id="auth-heading" class="mt-2 text-3xl font-black tracking-[-.04em] text-[#411426]">${n===`login`?`Continue your story`:`Create your private space`}</h2>
            <p class="mt-2 text-sm leading-6 text-[#826d75]">${n===`login`?`Enter your full identity number. Partial searches never return a result.`:`Your identity number is transformed server-side before it reaches the database.`}</p>
          </div>

          <form id="auth-form" class="mt-7 space-y-4" novalidate>
            <div>
              <label for="nic" class="mb-2 block text-sm font-bold text-[#4c2634]">National identity number</label>
              <div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7e89]">${e(`id`)}</span><input id="nic" name="nic" class="field" autocomplete="username" inputmode="text" maxlength="12" placeholder="Enter the complete number" required aria-describedby="nic-help" /></div>
              <p id="nic-help" class="mt-2 flex items-center gap-1.5 text-xs text-[#88727a]">${e(`shield`)} Never shown in your public profile.</p>
            </div>

            <div>
              <label for="password" class="mb-2 block text-sm font-bold text-[#4c2634]">${n===`login`?`Password`:`Create a strong password`}</label>
              <div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b7e89]">${e(`lock`)}</span><input id="password" name="password" type="password" class="field pr-12" autocomplete="${n===`login`?`current-password`:`new-password`}" minlength="12" placeholder="At least 12 characters" required /><button id="toggle-password" type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e717c]" aria-label="Show password">${e(`eye`)}</button></div>
              ${n===`register`?`<div class="mt-2 grid grid-cols-4 gap-1" aria-hidden="true"><span class="strength h-1 rounded-full bg-[#eadce1]"></span><span class="strength h-1 rounded-full bg-[#eadce1]"></span><span class="strength h-1 rounded-full bg-[#eadce1]"></span><span class="strength h-1 rounded-full bg-[#eadce1]"></span></div><p id="password-hint" class="mt-2 text-xs text-[#88727a]">Use 12+ characters with a unique phrase.</p>`:``}
            </div>

            ${n===`register`?`<label class="flex items-start gap-3 rounded-2xl border border-[#eadde2] bg-white p-4 text-sm leading-5 text-[#725c65]"><input id="consent" type="checkbox" class="mt-1 h-4 w-4 accent-[#841d45]" required /><span>I understand that relationship connections require mutual consent and that I can revoke non-essential profile visibility.</span></label>`:``}

            <div id="form-message" class="hidden rounded-2xl border px-4 py-3 text-sm" role="status" aria-live="polite"></div>
            <button class="primary-button" type="submit">${n===`login`?`Log in securely`:`Create encrypted account`}</button>
            <button id="dashboard-demo" type="button" class="w-full rounded-2xl border border-[#e5d6dc] bg-white py-3 text-sm font-bold text-[#73304a] hover:bg-[#fff9fb]">View dashboard preview</button>
          </form>

          <p class="mt-6 text-center text-[11px] leading-5 text-[#9b858d]">Preview build. Real account creation remains disabled until server-side secrets and App Check are configured.</p>
        </section>
      </main>
    </div>
    ${r()}`}function r(){return`<dialog id="security-dialog" class="m-auto w-[min(92vw,620px)] rounded-[2rem] border-0 bg-white p-0 shadow-2xl backdrop:bg-[#2c101b]/50">
    <div class="p-6 sm:p-8">
      <div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Security architecture</p><h2 class="mt-2 text-2xl font-black text-[#411426]">Your NIC is not a username in a table.</h2></div><button id="security-close" class="rounded-full bg-[#f6edf0] px-3 py-2 text-sm font-bold text-[#6c2941]" aria-label="Close">Close</button></div>
      <div class="mt-7 space-y-5">
        ${i(`01`,`Exact-match token`,`The server creates an HMAC-SHA-256 lookup token. A partial or guessed number cannot be used for prefix search.`)}
        ${i(`02`,`Authenticated encryption`,`If recovery is legally required, the NIC is separately encrypted with AES-256-GCM and a versioned key outside Firestore.`)}
        ${i(`03`,`Passwords stay with Auth`,`Passwords are processed by Firebase Authentication and are never stored in Firestore or application logs.`)}
        ${i(`04`,`No public identifiers`,`Profiles use random public IDs. Responses, URLs, analytics, and notifications never include the NIC.`)}
      </div>
    </div>
  </dialog>`}function i(e,t,n){return`<div class="grid grid-cols-[42px_1fr] gap-4"><div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5e8ed] text-xs font-black text-[#812044]">${e}</div><div><h3 class="font-extrabold text-[#4d1b2e]">${t}</h3><p class="mt-1 text-sm leading-6 text-[#7c666f]">${n}</p></div></div>`}function a(){return`<div class="page-shell noise min-h-screen">
    <header class="border-b border-[#eadde2] bg-white/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <div class="flex items-center gap-3"><img src="/love-history-logo.png" alt="" class="h-11 w-11 object-contain"/><div><p class="font-black tracking-[-.03em] text-[#5f1230]">Love History</p><p class="text-[10px] font-bold uppercase tracking-[.16em] text-[#a36d80]">Private dashboard</p></div></div>
        <div class="flex items-center gap-2"><button class="rounded-full border border-[#e6d8de] bg-white p-2.5 text-[#6b2841]" aria-label="Search">${e(`search`)}</button><button id="logout" class="flex items-center gap-2 rounded-full bg-[#f3e8ec] px-4 py-2.5 text-sm font-bold text-[#6b2841]">${e(`logout`)} Exit preview</button></div>
      </div>
    </header>
    <main id="main" class="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
      <div class="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p class="text-xs font-bold uppercase tracking-[.18em] text-[#a35d76]">Sunday, 9 November</p><h1 class="mt-2 text-4xl font-black tracking-[-.045em] text-[#3d1223]">Good morning, <span class="text-[#9e2c54]">Nimali.</span></h1><p class="mt-2 text-[#7b646d]">Your current relationship is active, private, and protected by mutual consent.</p></div><button class="primary-button !w-auto px-6">${e(`link`)} Relationship settings</button></div>

      <section class="mt-9 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article class="relative overflow-hidden rounded-[1.7rem] border border-[#d7a6b8] bg-white p-6 shadow-[0_20px_55px_rgba(103,20,52,.14)] sm:p-8">
          <div class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#7a173c] via-[#d14972] to-[#d8a04b]"></div>
          <div class="flex flex-wrap items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Current relationship</p><h2 class="mt-2 text-3xl font-black tracking-[-.04em] text-[#431628]">You’re together</h2></div><span class="flex items-center gap-2 rounded-full bg-[#eef9f3] px-4 py-2 text-xs font-extrabold text-[#286047]"><span class="security-dot"></span> Active relationship</span></div>
          <div class="mt-7 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#fff6f9] to-[#fffaf2] p-5"><div class="flex -space-x-3"><div class="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#7b193d] text-lg font-black text-white">N</div><div class="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#d59048] text-lg font-black text-white">K</div></div><div><p class="text-lg font-black text-[#4d1b2e]">Nimali &amp; Kasun</p><p class="mt-1 text-sm font-semibold text-[#8a6976]">Together since 14 February 2026</p></div></div>
          <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><div class="rounded-2xl border border-[#eee0e5] bg-[#fffdfd] p-4"><p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#a07887]">Together for</p><p class="mt-2 text-lg font-black text-[#5f1734]">8 months</p><p class="text-xs text-[#907781]">26 days</p></div><div class="rounded-2xl border border-[#eee0e5] bg-[#fffdfd] p-4"><p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#a07887]">Next milestone</p><p class="mt-2 text-lg font-black text-[#5f1734]">1 year</p><p class="text-xs text-[#907781]">97 days away</p></div><div class="col-span-2 rounded-2xl border border-[#eee0e5] bg-[#fffdfd] p-4 sm:col-span-1"><p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#a07887]">Consent</p><p class="mt-2 text-lg font-black text-[#2d7453]">Confirmed</p><p class="text-xs text-[#907781]">By both people</p></div></div>
          <div class="mt-5 flex flex-wrap items-center justify-between gap-3"><p class="flex items-center gap-2 text-xs font-semibold text-[#806a73]">${e(`shield`)} Partner identity numbers are never displayed.</p><button class="rounded-xl border border-[#dec9d1] bg-white px-4 py-2.5 text-sm font-extrabold text-[#6f2642]">View relationship</button></div>
        </article>
        <article class="rounded-[1.7rem] bg-gradient-to-br from-[#601531] to-[#9b2d54] p-6 text-white shadow-[0_20px_50px_rgba(93,19,47,.22)] sm:p-8"><div class="flex items-center justify-between"><p class="text-xs font-bold uppercase tracking-[.16em] text-[#f0cbd9]">Profile protection</p>${e(`shield`)}</div><p class="mt-7 text-5xl font-black">82<span class="text-2xl text-[#eab7c9]">%</span></p><p class="mt-2 font-bold">Profile complete</p><p class="mt-2 text-sm leading-6 text-[#f0d8e1]">Add an optional recovery method. It remains private and is never shown in search.</p><button class="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#6a1736]">Complete profile</button></article>
      </section>

      <section class="mt-5 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
        <article class="dashboard-card rounded-[1.7rem] p-6 sm:p-8"><div class="flex items-center justify-between"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Your profile</p><h2 class="mt-2 text-xl font-black text-[#431628]">Private details</h2></div><div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4e6eb] text-[#842046]">${e(`user`)}</div></div><dl class="mt-7 space-y-4 text-sm"><div class="flex justify-between gap-4 border-b border-[#eee2e6] pb-4"><dt class="text-[#8a747d]">Display name</dt><dd class="font-bold text-[#4e2635]">Nimali</dd></div><div class="flex justify-between gap-4 border-b border-[#eee2e6] pb-4"><dt class="text-[#8a747d]">Identity number</dt><dd class="font-bold text-[#2f7654]">Encrypted · hidden</dd></div><div class="flex justify-between gap-4"><dt class="text-[#8a747d]">Public profile ID</dt><dd class="font-mono text-xs font-bold text-[#4e2635]">LH-7P4X••••</dd></div></dl></article>
        <article class="dashboard-card rounded-[1.7rem] p-6 sm:p-8"><div class="flex items-center justify-between"><div><p class="text-xs font-bold uppercase tracking-[.16em] text-[#a35d76]">Love history</p><h2 class="mt-2 text-xl font-black text-[#431628]">Your private timeline</h2></div><div class="text-[#842046]">${e(`history`)}</div></div><div class="mt-7"><div class="timeline-line relative grid grid-cols-[24px_1fr] gap-4 pb-7"><span class="mt-1 h-6 w-6 rounded-full border-[6px] border-[#f4dbe4] bg-[#9d2d54]"></span><div><div class="flex flex-wrap items-center justify-between gap-2"><p class="font-extrabold text-[#4d1b2e]">A relationship ended</p><time class="text-xs font-bold text-[#9a7d88]">12 March 2025</time></div><p class="mt-2 text-sm leading-6 text-[#806b73]">Together for 1 year, 4 months. Partner identity remains private.</p><span class="mt-3 inline-flex rounded-full bg-[#f7edf1] px-3 py-1 text-xs font-bold text-[#81324e]">Mutually confirmed</span></div></div><div class="relative grid grid-cols-[24px_1fr] gap-4"><span class="mt-1 h-6 w-6 rounded-full border-[6px] border-[#f4dbe4] bg-[#d09045]"></span><div><div class="flex flex-wrap items-center justify-between gap-2"><p class="font-extrabold text-[#4d1b2e]">Relationship started</p><time class="text-xs font-bold text-[#9a7d88]">2 November 2023</time></div><p class="mt-2 text-sm leading-6 text-[#806b73]">Connection accepted by both people.</p></div></div></div></article>
      </section>
    </main>
  </div>`}function o(e){document.querySelectorAll(`[data-mode]`).forEach(e=>{e.addEventListener(`click`,()=>s(e.dataset.mode??`login`))});let t=document.querySelector(`#security-dialog`);document.querySelector(`#security-open`)?.addEventListener(`click`,()=>t?.showModal()),document.querySelector(`#security-close`)?.addEventListener(`click`,()=>t?.close());let n=document.querySelector(`#password`);document.querySelector(`#toggle-password`)?.addEventListener(`click`,()=>{n&&(n.type=n.type===`password`?`text`:`password`)}),n?.addEventListener(`input`,()=>{if(e!==`register`)return;let t=[n.value.length>=12,/[A-Z]/.test(n.value),/[0-9]/.test(n.value),/[^A-Za-z0-9]/.test(n.value)].filter(Boolean).length;document.querySelectorAll(`.strength`).forEach((e,n)=>{e.style.background=n<t?t<3?`#c7823c`:`#32845f`:`#eadce1`})}),document.querySelector(`#dashboard-demo`)?.addEventListener(`click`,()=>{window.history.replaceState({},``,`#dashboard`),c()}),document.querySelector(`#auth-form`)?.addEventListener(`submit`,e=>{e.preventDefault();let t=document.querySelector(`#form-message`);t&&(t.className=`rounded-2xl border border-[#ead9bd] bg-[#fff9ed] px-4 py-3 text-sm text-[#765628]`,t.textContent=`Secure account access is intentionally disabled in this preview until server secrets, App Check, and recovery controls are configured.`)})}function s(e=`login`){document.querySelector(`#app`).innerHTML=n(e),window.scrollTo({top:0,behavior:`auto`}),o(e)}function c(){document.querySelector(`#app`).innerHTML=a(),window.scrollTo({top:0,behavior:`auto`}),document.querySelector(`#logout`)?.addEventListener(`click`,()=>{window.history.replaceState({},``,location.pathname),s()})}location.hash===`#dashboard`?c():s();