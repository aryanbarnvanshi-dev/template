// -------------------------------------------------------------------------
// INTEGRATED MULTI-PAGE CONFIGURATION
// -------------------------------------------------------------------------
// ⚠️ यहाँ अपनी Google Apps Script का 'Web App URL' पेस्ट करें (जो script.google.com से मिला है)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwN6pxZPdIArP2yNghRSniNMx0uBZ2lygHr9184CgTktSGj_v7sDGO924RfDqa7AHAIXw/exec';

document.addEventListener('DOMContentLoaded', () => {
  // अगर URL कॉन्फ़िगर नहीं है तो फ़ेचिंग रोकें और कंसोल में अलर्ट दें
  if (!SCRIPT_URL || SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL') {
    console.warn("SCRIPT_URL is not configured yet. Live streaming is paused.");
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';
    return;
  }
  
  fetchAndPopulatePageData();
});

/**
 * मुख्य फ़ंक्शन जो डिटेक्ट करेगा कि यूजर किस पेज पर है और गूगल शीट से डेटा लोड करेगा।
 */
async function fetchAndPopulatePageData() {
  const loader = document.getElementById('global-loader');
  // वर्तमान पेज का नाम पता करना (जैसे index.html, about.html)
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  try {
    // गूगल शीट से डेटा फ़ेच करना
    const response = await fetch(SCRIPT_URL, { method: 'GET' });
    if (!response.ok) throw new Error('Failed to connect with live server stream.');
    
    const data = await response.json();
    console.log("Live Sheet Data Received:", data);

    // -------------------------------------------------------------------------
    // 1. हर पेज पर दिखने वाला कॉमन डेटा (Navbar & Footer)
    // -------------------------------------------------------------------------
    const schoolName = data['global_school_name'] || 'R K MISSION PUBLIC SCHOOL';
    const schoolTagline = data['global_school_tagline'] || 'Education for Excellence';
    
    // Navbar और Footer एलिमेंट्स को अपडेट करना
    if (document.getElementById('nav-school-name')) document.getElementById('nav-school-name').innerText = schoolName;
    if (document.getElementById('footer-school-name')) document.getElementById('footer-school-name').innerText = schoolName;
    if (document.getElementById('nav-school-tagline')) document.getElementById('nav-school-tagline').innerText = schoolTagline;
    
    // लोगो का पहला अक्षर सेट करना
    const logoBox = document.getElementById('school-logo-placeholder');
    if (logoBox && schoolName) {
      logoBox.innerText = schoolName.trim().charAt(0).toUpperCase();
    }

    // कॉन्टैक्ट डिटेल्स (Footer)
    const phones = [data['global_phone_1'], data['global_phone_2']].filter(Boolean).join(', ');
    if (document.getElementById('footer-phones')) document.getElementById('footer-phones').innerText = phones || 'Not Provided';
    if (document.getElementById('footer-address')) document.getElementById('footer-address').innerText = data['global_address'] || 'Campus Address';
    if (document.getElementById('footer-email')) document.getElementById('footer-email').innerText = data['global_email'] || 'info@school.com';
    
    if (data['global_email'] && document.getElementById('header-cta-btn')) {
      document.getElementById('header-cta-btn').href = `mailto:${data['global_email']}`;
    }

    // टॉप स्क्रॉलिंग नोटिस (Ticker)
    if (document.getElementById('ticker-notice')) {
      document.getElementById('ticker-notice').innerText = data['global_ticker_notice'] || 'Welcome to our digital campus.';
    }

    // -------------------------------------------------------------------------
    // 2. पेज के अनुसार विशिष्ट डेटा लोड करना (Page-Specific Routing)
    // -------------------------------------------------------------------------
    
    // --- HOME PAGE (index.html) ---
    if (currentPage === "index.html" || currentPage === "") {
      document.title = `${schoolName} | Home`;
      
      if (data['global_hero_title']) document.getElementById('hero-title').innerText = data['global_hero_title'];
      if (data['global_hero_tagline']) document.getElementById('hero-tagline').innerText = data['global_hero_tagline'];
      if (data['global_hero_bg_url']) document.getElementById('hero-bg-img').style.backgroundImage = `url('${data['global_hero_bg_url']}')`;
      
      // होम पेज पर केवल नोटिस बोर्ड का छोटा रेंडर दिखाना
      renderNoticesBlock(data['notices']);
    }
    
    // --- ABOUT PAGE (about.html) ---
    else if (currentPage === "about.html") {
      document.title = `About Us | ${schoolName}`;
      
      if (document.getElementById('principal-name')) document.getElementById('principal-name').innerText = data['principal_name'] || 'Principal';
      if (document.getElementById('principal-message')) document.getElementById('principal-message').innerText = data['principal_message'] || '';
      if (data['principal_photo_url'] && document.getElementById('principal-img')) document.getElementById('principal-img').src = data['principal_photo_url'];

      if (document.getElementById('director-name')) document.getElementById('director-name').innerText = data['director_name'] || 'Director';
      if (document.getElementById('director-message')) document.getElementById('director-message').innerText = data['director_message'] || '';
      if (data['director_photo_url'] && document.getElementById('director-img')) document.getElementById('director-img').src = data['director_photo_url'];

      if (document.getElementById('admission-rules')) document.getElementById('admission-rules').innerText = data['admission_rules'] || 'Rules pending...';
      
      // प्रशंसापत्र (Testimonials) केवल अबाउट पेज पर लोड होंगे
      renderTestimonialsBlock(data['testimonials']);
    }
    
    // --- FACILITIES PAGE (facilities.html) ---
    else if (currentPage === "facilities.html") {
      document.title = `Facilities | ${schoolName}`;
      renderFacilitiesBlock(data['facilities']);
    }
    
    // --- GALLERY PAGE (gallery.html) ---
    else if (currentPage === "gallery.html") {
      document.title = `Photo Gallery | ${schoolName}`;
      renderGalleryBlock(data['gallery']);
    }
    
    // --- CONTACT PAGE (contact.html) ---
    else if (currentPage === "contact.html") {
      document.title = `Contact Us | ${schoolName}`;
      if (document.getElementById('contact-page-address')) document.getElementById('contact-page-address').innerText = data['global_address'] || '';
      if (document.getElementById('contact-page-phones')) document.getElementById('contact-page-phones').innerText = phones || '';
      if (document.getElementById('contact-page-email')) document.getElementById('contact-page-email').innerText = data['global_email'] || '';
    }

  } catch (error) {
    console.error("Error patching live stream data:", error);
    alert("System Notice: Failed to retrieve data stream. Please verify SCRIPT_URL configuration inside app.js.");
  } finally {
    // लोडर को हटाना
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 400);
    }
  }
}

// -------------------------------------------------------------------------
// HTML ब्लॉक रेंडर करने वाले सपोर्टिंग फंक्शन्स
// -------------------------------------------------------------------------

function renderNoticesBlock(rawJSON) {
  const container = document.getElementById('notices-container');
  if (!container) return;
  container.innerHTML = '';
  try {
    const arr = rawJSON ? JSON.parse(rawJSON) : [];
    if (arr.length === 0) {
      container.innerHTML = `<p class="text-slate-400 text-sm">No active notices listed.</p>`;
      return;
    }
    arr.forEach(item => {
      const el = document.createElement('div');
      el.className = "bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between";
      el.innerHTML = `
        <p class="text-slate-700 font-medium text-sm hindi-text">${item.text || ''}</p>
        ${item.link ? `<a href="${item.link}" target="_blank" class="text-indigo-600 font-bold text-xs mt-4 block">View Link →</a>` : ''}
      `;
      container.appendChild(el);
    });
  } catch(e) { console.error(e); }
}

function renderFacilitiesBlock(rawJSON) {
  const container = document.getElementById('facilities-container');
  if (!container) return;
  container.innerHTML = '';
  try {
    const arr = rawJSON ? JSON.parse(rawJSON) : [];
    if (arr.length === 0) { container.innerHTML = `<p class="text-slate-400 text-sm">Updating facilities...</p>`; return; }
    arr.forEach(item => {
      const el = document.createElement('div');
      el.className = "bg-white p-6 rounded-xl border border-slate-200/60 text-center";
      el.innerHTML = `
        <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 text-base">🏫</div>
        <h3 class="font-bold text-slate-900 text-sm mb-1">${item.title || ''}</h3>
        <p class="text-slate-500 text-xs hindi-text">${item.desc || ''}</p>
      `;
      container.appendChild(el);
    });
  } catch(e) { console.error(e); }
}

function renderGalleryBlock(rawJSON) {
  const container = document.getElementById('gallery-container');
  if (!container) return;
  container.innerHTML = '';
  try {
    const arr = rawJSON ? JSON.parse(rawJSON) : [];
    if (arr.length === 0) { container.innerHTML = `<p class="text-slate-400 text-sm">No images in gallery.</p>`; return; }
    arr.forEach(item => {
      if (!item.url) return;
      const el = document.createElement('div');
      el.className = "group relative overflow-hidden rounded-xl bg-slate-100 aspect-[4/3] border border-slate-200/40";
      el.innerHTML = `
        <img src="${item.url}" class="h-full w-full object-cover group-hover:scale-105 transition duration-300">
        ${item.caption ? `<div class="absolute inset-0 bg-black/50 flex items-end p-3 opacity-0 group-hover:opacity-100 transition"><p class="text-white text-xs truncate w-full">${item.caption}</p></div>` : ''}
      `;
      container.appendChild(el);
    });
  } catch(e) { console.error(e); }
}

function renderTestimonialsBlock(rawJSON) {
  const container = document.getElementById('testimonials-container');
  if (!container) return;
  container.innerHTML = '';
  try {
    const arr = rawJSON ? JSON.parse(rawJSON) : [];
    if (arr.length === 0) { container.innerHTML = `<p class="text-slate-500 text-sm">No testimonials added yet.</p>`; return; }
    arr.forEach(item => {
      const el = document.createElement('div');
      el.className = "bg-slate-800 p-6 rounded-xl border border-slate-700/50";
      el.innerHTML = `
        <p class="text-slate-300 text-xs italic mb-4 hindi-text">"${item.review || ''}"</p>
        <div class="text-xs font-bold text-white">${item.parent_name || 'Parent'} <span class="text-slate-500 font-normal">(${item.student_class || 'Guardian'})</span></div>
      `;
      container.appendChild(el);
    });
  } catch(e) { console.error(e); }
}