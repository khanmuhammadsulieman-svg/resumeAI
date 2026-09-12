/* ---------------- Mobile Responsive Layout ---------------- */

let mobileViewMode = 'menu';

function setupMobileLayout() {
  // 1. Inject Mobile CSS directly via JS
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      /* Hide elements based on active tab */
      .mobile-hide-sidebar #bSidebar { display: none !important; }
      .mobile-hide-panel #bPanel { display: none !important; }
      .mobile-hide-preview .b-preview { display: none !important; }

      /* Bottom Navigation Bar */
      #mobileNav {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0;
        background: var(--bg-panel, #ffffff); border-top: 1px solid var(--border, #dddddd);
        z-index: 9999; justify-content: space-around; padding: 10px 0;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
      }
      .dark #mobileNav { background: #1a1a1a; border-top: 1px solid #333; }
      
      #mobileNav button {
        background: none; border: none; font-size: 12px; font-weight: 600;
        color: var(--ink-soft, #666); cursor: pointer; 
        display: flex; flex-direction: column; align-items: center; gap: 4px;
      }
      #mobileNav button.active { color: var(--primary, #2454c7); }
      
      /* Fix scrolling cut-offs for long forms like Languages/Skills */
      #view-builder { padding-bottom: 60px; display: flex; flex-direction: column; }
      #bPanel, #bSidebar { 
        overflow-y: auto !important; 
        height: calc(100vh - 130px) !important; 
        width: 100% !important; 
        flex: none; 
      }
      .b-preview { width: 100% !important; overflow-x: auto; padding: 10px; }
    }
    @media (min-width: 769px) { #mobileNav { display: none !important; } }
  `;
  document.head.appendChild(style);

  // 2. Inject Bottom Navigation HTML
  const nav = document.createElement('div');
  nav.id = 'mobileNav';
  nav.innerHTML = `
    <button onclick="setMobileMode('menu')" id="mobBtn-menu"><span style="font-size:18px">☰</span> Sections</button>
    <button onclick="setMobileMode('edit')" id="mobBtn-edit"><span style="font-size:18px">✎</span> Edit</button>
    <button onclick="setMobileMode('preview')" id="mobBtn-preview"><span style="font-size:18px">👁</span> Preview</button>
  `;
  document.body.appendChild(nav);
  
  // 3. Auto-switch to "Edit" tab when a sidebar section is clicked on mobile
  const bSidebar = document.getElementById('bSidebar');
  if(bSidebar) {
    bSidebar.addEventListener('click', (e) => {
      if(e.target.closest('.navitem') && window.innerWidth <= 768) {
        setMobileMode('edit');
      }
    });
  }
}

// 4. Tab Switching Logic
window.setMobileMode = function(mode) {
  mobileViewMode = mode;
  const vb = document.getElementById('view-builder');
  if(!vb) return;
  
  vb.classList.remove('mobile-hide-sidebar', 'mobile-hide-panel', 'mobile-hide-preview');
  
  if(mode === 'menu') vb.classList.add('mobile-hide-panel', 'mobile-hide-preview');
  if(mode === 'edit') vb.classList.add('mobile-hide-sidebar', 'mobile-hide-preview');
  if(mode === 'preview') {
    vb.classList.add('mobile-hide-sidebar', 'mobile-hide-panel');
    setTimeout(fitZoom, 50); // Recalculate zoom when preview un-hides
  }
  
  ['menu', 'edit', 'preview'].forEach(m => {
    const btn = document.getElementById('mobBtn-'+m);
    if(btn) btn.classList.toggle('active', m === mode);
  });
}

// 5. Hook into the existing goBuilder function to reset mobile view
const originalGoBuilder = window.goBuilder;
window.goBuilder = function(id) {
  originalGoBuilder(id);
  if(window.innerWidth <= 768) setMobileMode('menu'); 
};

// Initialize mobile modifications
setupMobileLayout();
