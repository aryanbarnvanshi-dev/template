// -------------------------------------------------------------------------
// INTEGRATED MULTI-PAGE CONFIGURATION
// -------------------------------------------------------------------------
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwN6pxZPdIArP2yNghRSniNMx0uBZ2lygHr9184CgTktSGj_v7sDGO924RfDqa7AHAIXw/exec';

document.addEventListener('DOMContentLoaded', () => {
  // अगर URL कॉन्फ़िगर नहीं है तो फ़ेचिंग रोकें और कंसोल में अलर्ट दें
  if (!SCRIPT_URL || SCRIPT_URL.trim() === '' || SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.warn("SCRIPT_URL is not configured yet. Live streaming is paused.");
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';
    return;
  }
  
  fetchAndPopulatePageData();
});

function fetchJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
      delete window[callbackName];
      const scriptEl = document.getElementById(callbackName);
      if (scriptEl) scriptEl.remove();
      resolve(data);
    };
    
    const script = document.createElement('script');
    script.id = callbackName;
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = function() {
      delete window[callbackName];
      const scriptEl = document.getElementById(callbackName);
      if (scriptEl) scriptEl.remove();
      reject(new Error('JSONP request failed'));
    };
    document.body.appendChild(script);
  });
}

/**
 * मुख्य फ़ंक्शन जो डिटेक्ट करेगा कि यूजर किस पेज पर है और गूगल शीट से डेटा लोड करेगा।
 */
async function fetchAndPopulatePageData() {
  const loader = document.getElementById('global-loader');
  // वर्तमान पेज का नाम पता करना (जैसे index.html, about.html)
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  try {
    // गूगल शीट से डेटा फ़ेच करना
    let data;
    if (window.location.protocol === 'file:') {
      data = await fetchJSONP(SCRIPT_URL);
    } else {
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) throw new Error('Failed to connect with live server stream.');
      data = await response.json();
    }
    console.log("Live Sheet Data Received:", data);

    // 0. Apply Dynamic Theme Colors
    applyThemeColors(data);

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
      
      if (data['hero_title']) document.getElementById('hero-title').innerText = data['hero_title'];
      if (data['hero_subtitle']) document.getElementById('hero-tagline').innerText = data['hero_subtitle'];
      
      // Hero Background Slider Logic
      initHeroSlider(data);
      
      // Highlights mapping
      if (document.getElementById('highlight_1_title') && data['highlight_1_title']) document.getElementById('highlight_1_title').innerText = data['highlight_1_title'];
      if (document.getElementById('highlight_1_desc') && data['highlight_1_desc']) document.getElementById('highlight_1_desc').innerText = data['highlight_1_desc'];
      if (document.getElementById('highlight_2_title') && data['highlight_2_title']) document.getElementById('highlight_2_title').innerText = data['highlight_2_title'];
      if (document.getElementById('highlight_2_desc') && data['highlight_2_desc']) document.getElementById('highlight_2_desc').innerText = data['highlight_2_desc'];
      if (document.getElementById('highlight_3_title') && data['highlight_3_title']) document.getElementById('highlight_3_title').innerText = data['highlight_3_title'];
      if (document.getElementById('highlight_3_desc') && data['highlight_3_desc']) document.getElementById('highlight_3_desc').innerText = data['highlight_3_desc'];
      
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
      
      // Fast Facts Stats
      if (document.getElementById('stats-total-students') && data['stats_total_students']) document.getElementById('stats-total-students').innerText = data['stats_total_students'];
      if (document.getElementById('stats-total-teachers') && data['stats_total_teachers']) document.getElementById('stats-total-teachers').innerText = data['stats_total_teachers'];

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
    const arr = safeParse(rawJSON);
    if (arr.length === 0) {
      container.innerHTML = `<p class="text-slate-400 text-sm">No active notices listed.</p>`;
      return;
    }
    arr.forEach(item => {
      const el = document.createElement('div');
      el.className = "bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition";
      el.innerHTML = `
        <div>
          <span class="text-xs font-bold text-indigo-600 mb-2 block bg-indigo-50 w-max px-2 py-0.5 rounded">${item.notice_date || 'Recent Update'}</span>
          <p class="text-slate-700 font-medium text-sm hindi-text">${item.notice_text || ''}</p>
        </div>
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
    const arr = safeParse(rawJSON);
    if (arr.length === 0) { container.innerHTML = `<p class="text-slate-400 text-sm">Updating facilities...</p>`; return; }
    arr.forEach(item => {
      const el = document.createElement('div');
      el.className = "bg-white p-6 rounded-xl border border-slate-200/60 text-center hover:shadow-lg transition duration-300";
      const iconHTML = item.facility_icon_url 
          ? `<img src="${item.facility_icon_url}" class="w-10 h-10 object-contain mx-auto mb-3">` 
          : `<div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3 text-base">🏫</div>`;
      el.innerHTML = `
        ${iconHTML}
        <h3 class="font-bold text-slate-900 text-sm mb-1">${item.facility_name || ''}</h3>
        <p class="text-slate-500 text-xs hindi-text">${item.facility_desc || ''}</p>
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
    const arr = safeParse(rawJSON);
    if (arr.length === 0) { container.innerHTML = `<p class="text-slate-400 text-sm">No images in gallery.</p>`; return; }
    arr.forEach(item => {
      if (!item.gallery_image_url) return;
      const el = document.createElement('div');
      el.className = "group relative overflow-hidden rounded-xl bg-slate-100 aspect-[4/3] border border-slate-200/40 cursor-pointer";
      el.onclick = () => { if(typeof openLightbox === 'function') openLightbox(item.gallery_image_url, item.gallery_image_desc) };
      el.innerHTML = `
        <img src="${item.gallery_image_url}" alt="${item.gallery_image_desc || 'Campus Gallery Image'}" class="h-full w-full object-cover group-hover:scale-105 transition duration-300">
        ${item.gallery_image_desc ? `<div class="absolute inset-0 bg-black/50 flex items-end p-3 opacity-0 group-hover:opacity-100 transition"><p class="text-white text-xs truncate w-full">${item.gallery_image_desc}</p></div>` : ''}
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
    const arr = safeParse(rawJSON);
    if (arr.length === 0) { container.innerHTML = `<p class="text-slate-500 text-sm">No testimonials added yet.</p>`; return; }
    arr.forEach(item => {
      const el = document.createElement('div');
      el.className = "bg-slate-800 p-6 rounded-xl border border-slate-700/50 hover:bg-slate-750 transition";
      el.innerHTML = `
        <p class="text-slate-300 text-xs italic mb-4 hindi-text leading-relaxed">"${item.parent_review || ''}"</p>
        <div class="text-xs font-bold text-white">${item.parent_name || 'Parent/Guardian'}</div>
      `;
      container.appendChild(el);
    });
  } catch(e) { console.error(e); }
}

// -------------------------------------------------------------------------
// NEW UTILITY FUNCTIONS
// -------------------------------------------------------------------------

function safeParse(raw) {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch(e) { return []; }
  }
  return Array.isArray(raw) ? raw : [];
}

function initHeroSlider(data) {
  const bgEl = document.getElementById('hero-bg-img');
  if (!bgEl) return;
  
  const images = [];
  if (data['hero_bg_image_1']) images.push(data['hero_bg_image_1']);
  if (data['hero_bg_image_2']) images.push(data['hero_bg_image_2']);
  if (data['hero_bg_image_3']) images.push(data['hero_bg_image_3']);
  
  if (images.length === 0) return; // leave as CSS default
  
  let currentIndex = 0;
  bgEl.style.backgroundImage = `url('${images[currentIndex]}')`;
  bgEl.style.transition = 'opacity 0.8s ease-in-out';
  
  if (images.length > 1) {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      // Slight fade effect
      bgEl.style.opacity = '0';
      setTimeout(() => {
        bgEl.style.backgroundImage = `url('${images[currentIndex]}')`;
        bgEl.style.opacity = '0.35'; // target opacity in index.html is typically 25-35%
      }, 800);
    }, 5000); // 5 seconds slider
  }
}

function applyThemeColors(data) {
  const primary = data['theme_primary_color'];
  const secondary = data['theme_secondary_color'];
  const bgLight = data['theme_bg_light_color'];
  const textDark = data['theme_text_dark_color'];
  
  if (!primary && !secondary && !bgLight && !textDark) return;
  if (primary === '#000000' && secondary === '#000000' && bgLight === '#000000' && textDark === '#000000') return;

  const style = document.createElement('style');
  let cssStr = `:root {\n`;
  if (primary) cssStr += `  --theme-primary: ${primary};\n`;
  if (secondary) cssStr += `  --theme-secondary: ${secondary};\n`;
  if (bgLight) cssStr += `  --theme-bg-light: ${bgLight};\n`;
  if (textDark) cssStr += `  --theme-text-dark: ${textDark};\n`;
  cssStr += `}\n\n`;

  // Overriding typical Tailwind classes used in the project
  if (primary) {
    cssStr += `
      .bg-indigo-600, .bg-indigo-900, .bg-slate-900 { background-color: var(--theme-primary) !important; }
      .text-indigo-600 { color: var(--theme-primary) !important; }
      .border-indigo-600, .border-indigo-800 { border-color: var(--theme-primary) !important; }
      .hover\\:bg-indigo-700:hover { filter: brightness(0.9); }
      .hover\\:text-indigo-700:hover { filter: brightness(0.9); }
      .border-t-4.border-indigo-600 { border-top-color: var(--theme-primary) !important; }
      .border-b-4.border-indigo-600 { border-bottom-color: var(--theme-primary) !important; }
    `;
  }
  if (secondary) {
    cssStr += `
      .bg-emerald-500, .bg-red-500 { background-color: var(--theme-secondary) !important; }
    `;
  }
  if (bgLight) {
    cssStr += `
      body, .bg-slate-50, .bg-slate-100 { background-color: var(--theme-bg-light) !important; }
    `;
  }
  if (textDark) {
    cssStr += `
      .text-slate-800, .text-slate-900 { color: var(--theme-text-dark) !important; }
    `;
  }
  
  style.innerHTML = cssStr;
  document.head.appendChild(style);
}