(() => {
  'use strict';

  const STORAGE_KEY = 'gjz-motion-preference';
  const rootEl = document.documentElement;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionToggleBtn = document.getElementById('motion-toggle');

  let userPaused = false;
  try {
    userPaused = window.localStorage.getItem(STORAGE_KEY) === 'paused';
  } catch (_) {
    userPaused = false;
  }

  function isMotionAllowed() {
    return !reducedMotionQuery.matches && !userPaused && !document.hidden;
  }

  function syncMotionController() {
    rootEl.classList.toggle('page-hidden', document.hidden);
    const osReduced = reducedMotionQuery.matches;

    if (osReduced) {
      rootEl.setAttribute('data-motion', 'reduced');
    } else if (userPaused) {
      rootEl.setAttribute('data-motion', 'paused');
    } else {
      rootEl.setAttribute('data-motion', 'running');
    }

    if (motionToggleBtn) {
      motionToggleBtn.hidden = false;
      if (osReduced) {
        motionToggleBtn.disabled = true;
        motionToggleBtn.setAttribute('aria-pressed', 'true');
        motionToggleBtn.textContent = 'Motion reduced';
      } else {
        motionToggleBtn.disabled = false;
        motionToggleBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        motionToggleBtn.textContent = userPaused ? 'Resume motion' : 'Pause motion';
      }
    }

    rootEl.setAttribute('data-motion-ready', 'true');
  }

  if (motionToggleBtn) {
    motionToggleBtn.addEventListener('click', () => {
      if (reducedMotionQuery.matches) return;
      userPaused = !userPaused;
      try {
        window.localStorage.setItem(STORAGE_KEY, userPaused ? 'paused' : 'running');
      } catch (_) {
        // Ignore storage errors
      }
      syncMotionController();
    });
  }

  document.addEventListener('visibilitychange', syncMotionController);
  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener('change', syncMotionController);
  }
  syncMotionController();

  // 0. Kinetic Arrow Wrapping (Safe DOM TextNode Replacement, No innerHTML)
  function wrapExternalArrows() {
    const links = document.querySelectorAll('a');
    links.forEach((link) => {
      if (link.querySelector('.ext-arrow')) return;
      const nodes = Array.from(link.childNodes);
      for (let i = nodes.length - 1; i >= 0; i -= 1) {
        const node = nodes[i];
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('↗')) {
          const idx = node.nodeValue.lastIndexOf('↗');
          const before = node.nodeValue.slice(0, idx).replace(/\s+$/, '');
          const after = node.nodeValue.slice(idx + 1);
          node.nodeValue = before;
          const arrowSpan = document.createElement('span');
          arrowSpan.className = 'ext-arrow';
          arrowSpan.setAttribute('aria-hidden', 'true');
          arrowSpan.textContent = '↗';
          link.insertBefore(arrowSpan, node.nextSibling);
          if (after) {
            link.insertBefore(document.createTextNode(after), arrowSpan.nextSibling);
          }
          break;
        }
      }
    });
  }
  wrapExternalArrows();

  // 1. Publication Filter Controls
  const filterGroup = document.querySelector('.filter-controls');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const pubEntries = Array.from(document.querySelectorAll('.pub-entry'));
  const liveStatus = document.getElementById('filter-live-status');

  function applyFilter(filterKey, announce = true) {
    let visibleCount = 0;
    pubEntries.forEach((entry) => {
      const status = entry.getAttribute('data-status');
      let match = true;
      if (filterKey === 'accepted') match = status === 'accepted';
      else if (filterKey === 'review') match = status === 'review';
      entry.hidden = !match;
      if (match) visibleCount += 1;
    });

    filterBtns.forEach((btn) => {
      const active = btn.getAttribute('data-filter') === filterKey;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (announce && liveStatus) {
      liveStatus.textContent = `Showing ${visibleCount} of ${pubEntries.length} main publications.`;
    }
  }

  if (filterGroup && filterBtns.length > 0 && pubEntries.length > 0) {
    filterGroup.hidden = false;
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyFilter(btn.getAttribute('data-filter') || 'all', true);
      });
    });
  }

  // 2. Interactive Research Map (SVG Geometry Sync + 3 Topic Pings + Interaction Pulses)
  const mapContainer = document.querySelector('.research-map');
  const mapField = document.querySelector('.map-field');
  const mapSvg = document.querySelector('.map-svg');
  const topicBtns = Array.from(document.querySelectorAll('[data-topic-btn]'));
  const workLinks = Array.from(document.querySelectorAll('[data-work-link]'));
  const curves = Array.from(document.querySelectorAll('.map-curve'));
  const topicDots = Array.from(document.querySelectorAll('.topic-dot'));
  const workDots = Array.from(document.querySelectorAll('.work-dot'));
  const linkableEntries = Array.from(document.querySelectorAll('.pub-entry, .system-card'));
  const animatedPanels = Array.from(document.querySelectorAll('.system-card, .update-note'));
  const statusBar = document.getElementById('map-status-bar');
  const statusText = document.getElementById('map-status-text');
  const jumpLink = document.getElementById('map-jump-link');
  const clearBtn = document.getElementById('map-clear-btn');

  const TOPIC_META = {
    reliability: { label: 'Agent reliability (6 papers)', href: '#eca', text: 'View related papers ↓' },
    evaluation: { label: 'Evaluation (2 papers)', href: '#divergence', text: 'View related papers ↓' },
    automated: { label: 'Automated research (2 systems)', href: '#paperfuture', text: 'View research software ↓' }
  };

  let selectedTopic = null;
  let previewState = null;
  let suppressFocusPreview = false;
  const pulsePathsByWork = {};
  const topicPingsByTopic = {};

  function initMapSvgOrnaments() {
    if (!mapSvg) return;
    const ns = 'http://www.w3.org/2000/svg';

    const defs = document.createElementNS(ns, 'defs');
    const grad = document.createElementNS(ns, 'linearGradient');
    grad.setAttribute('id', 'map-pulse-grad');
    grad.setAttribute('x1', '0%');
    grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%');
    grad.setAttribute('y2', '0%');

    const stops = [
      { offset: '0%', color: '#70D4DE', opacity: '0' },
      { offset: '55%', color: '#70D4DE', opacity: '0.9' },
      { offset: '100%', color: '#C5AD83', opacity: '1' }
    ];
    stops.forEach((s) => {
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', s.offset);
      stop.setAttribute('stop-color', s.color);
      stop.setAttribute('stop-opacity', s.opacity);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    mapSvg.insertBefore(defs, mapSvg.firstChild);

    const pulseGroup = document.createElementNS(ns, 'g');
    pulseGroup.setAttribute('class', 'map-pulses-group');
    curves.forEach((curve) => {
      const w = curve.getAttribute('data-work');
      const t = curve.getAttribute('data-topic');
      const pulse = document.createElementNS(ns, 'path');
      pulse.setAttribute('class', 'map-pulse-path');
      pulse.setAttribute('data-work', w);
      pulse.setAttribute('data-topic', t);
      pulse.setAttribute('pathLength', '100');
      pulse.setAttribute('d', curve.getAttribute('d') || '');
      pulseGroup.appendChild(pulse);
      pulsePathsByWork[w] = pulse;
    });

    const pingGroup = document.createElementNS(ns, 'g');
    pingGroup.setAttribute('class', 'map-pings-group');
    topicDots.forEach((dot, idx) => {
      const t = dot.getAttribute('data-topic');
      const ping = document.createElementNS(ns, 'circle');
      ping.setAttribute('class', 'topic-ping');
      ping.setAttribute('cx', dot.getAttribute('cx') || '0');
      ping.setAttribute('cy', dot.getAttribute('cy') || '0');
      ping.setAttribute('r', '3.5');
      ping.style.animationDelay = `${(idx * 1.8).toFixed(2)}s`;
      pingGroup.appendChild(ping);
      topicPingsByTopic[t] = ping;
    });

    mapSvg.insertBefore(pulseGroup, topicDots[0] || null);
    mapSvg.insertBefore(pingGroup, topicDots[0] || null);
  }

  function syncMapGeometry() {
    if (!mapField || !mapSvg || window.innerWidth <= 760) return;
    const fieldRect = mapField.getBoundingClientRect();
    if (fieldRect.width === 0 || fieldRect.height === 0) return;
    mapSvg.setAttribute('viewBox', `0 0 ${fieldRect.width} ${fieldRect.height}`);

    const topicCoords = {};
    topicBtns.forEach((btn) => {
      const t = btn.getAttribute('data-topic-btn');
      const r = btn.getBoundingClientRect();
      const x = Math.round(r.right - fieldRect.left + 8);
      const y = Math.round(r.top - fieldRect.top + r.height / 2);
      topicCoords[t] = { x, y };
      const dot = mapSvg.querySelector(`.topic-dot[data-topic="${t}"]`);
      if (dot) {
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
      }
      const ping = topicPingsByTopic[t];
      if (ping) {
        ping.setAttribute('cx', x);
        ping.setAttribute('cy', y);
      }
    });

    workLinks.forEach((link) => {
      const w = link.getAttribute('data-work-link');
      const t = link.getAttribute('data-topic');
      const r = link.getBoundingClientRect();
      const x2 = Math.round(r.left - fieldRect.left - 4);
      const y2 = Math.round(r.top - fieldRect.top + r.height / 2);
      const dot = mapSvg.querySelector(`.work-dot[data-work="${w}"]`);
      if (dot) {
        dot.setAttribute('cx', x2);
        dot.setAttribute('cy', y2);
      }
      const curve = mapSvg.querySelector(`.map-curve[data-work="${w}"]`);
      const tc = topicCoords[t];
      if (curve && tc) {
        const c1x = Math.round(tc.x + (x2 - tc.x) * 0.45);
        const c2x = Math.round(tc.x + (x2 - tc.x) * 0.55);
        const dStr = `M ${tc.x} ${tc.y} C ${c1x} ${tc.y}, ${c2x} ${y2}, ${x2} ${y2}`;
        curve.setAttribute('d', dStr);
        if (pulsePathsByWork[w]) {
          pulsePathsByWork[w].setAttribute('d', dStr);
        }
      }
    });
  }

  function renderMapState() {
    const active = previewState || (selectedTopic ? { type: 'topic', key: selectedTopic } : null);

    topicBtns.forEach((btn) => {
      const t = btn.getAttribute('data-topic-btn');
      const pressed = selectedTopic === t;
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      const highlighted = active && ((active.type === 'topic' && active.key === t) || (active.type === 'work' && workLinks.some((l) => l.getAttribute('data-work-link') === active.key && l.getAttribute('data-topic') === t)));
      btn.classList.toggle('is-active', Boolean(highlighted));
    });

    workLinks.forEach((link) => {
      const w = link.getAttribute('data-work-link');
      const t = link.getAttribute('data-topic');
      const highlighted = active && ((active.type === 'work' && active.key === w) || (active.type === 'topic' && active.key === t));
      link.classList.toggle('is-active', Boolean(highlighted));
    });

    curves.forEach((curve) => {
      const w = curve.getAttribute('data-work');
      const t = curve.getAttribute('data-topic');
      const highlighted = active && ((active.type === 'work' && active.key === w) || (active.type === 'topic' && active.key === t));
      curve.classList.toggle('is-active', Boolean(highlighted));
      const pulse = pulsePathsByWork[w];
      if (pulse) {
        const wasActive = pulse.classList.contains('is-active');
        if (!highlighted) {
          pulse.classList.remove('is-active');
        } else if (!wasActive && isMotionAllowed()) {
          pulse.classList.add('is-active');
        }
      }
    });

    topicDots.forEach((dot) => {
      const t = dot.getAttribute('data-topic');
      const highlighted = active && ((active.type === 'topic' && active.key === t) || (active.type === 'work' && curves.some((c) => c.getAttribute('data-work') === active.key && c.getAttribute('data-topic') === t)));
      dot.classList.toggle('is-active', Boolean(highlighted));
    });

    workDots.forEach((dot) => {
      const w = dot.getAttribute('data-work');
      const t = dot.getAttribute('data-topic');
      const highlighted = active && ((active.type === 'work' && active.key === w) || (active.type === 'topic' && active.key === t));
      dot.classList.toggle('is-active', Boolean(highlighted));
    });

    linkableEntries.forEach((entry) => {
      const id = entry.id;
      const t = entry.getAttribute('data-topic');
      const linked = active && ((active.type === 'work' && active.key === id) || (active.type === 'topic' && active.key === t));
      if (linked) entry.setAttribute('data-linked', 'true');
      else entry.removeAttribute('data-linked');
    });

    if (statusBar && statusText && jumpLink) {
      if (selectedTopic && TOPIC_META[selectedTopic]) {
        statusBar.hidden = false;
        statusText.textContent = TOPIC_META[selectedTopic].label;
        jumpLink.href = TOPIC_META[selectedTopic].href;
        jumpLink.textContent = TOPIC_META[selectedTopic].text;
      } else {
        statusBar.hidden = true;
        statusText.textContent = '';
      }
    }
  }

  function resolveFocusState() {
    const activeEl = document.activeElement;
    if (activeEl && mapContainer && mapContainer.contains(activeEl)) {
      const t = activeEl.getAttribute('data-topic-btn');
      const w = activeEl.getAttribute('data-work-link');
      if (t) return { type: 'topic', key: t };
      if (w) return { type: 'work', key: w };
    }
    return null;
  }

  function clearMapSelectionAndRestoreFocus(restoreIfStatusFocused) {
    const prevTopic = selectedTopic;
    const activeEl = document.activeElement;
    const shouldRestoreFocus = Boolean(
      restoreIfStatusFocused &&
      prevTopic &&
      statusBar &&
      activeEl &&
      statusBar.contains(activeEl)
    );

    if (shouldRestoreFocus) {
      const targetBtn = mapContainer.querySelector(`[data-topic-btn="${prevTopic}"]`);
      if (targetBtn) {
        suppressFocusPreview = true;
        targetBtn.focus({ preventScroll: true });
        suppressFocusPreview = false;
      }
    }

    selectedTopic = null;
    previewState = null;
    renderMapState();
  }

  if (mapContainer && topicBtns.length > 0) {
    mapContainer.classList.add('map-ready');
    initMapSvgOrnaments();

    topicBtns.forEach((btn) => {
      btn.hidden = false;
      const t = btn.getAttribute('data-topic-btn');
      btn.addEventListener('click', () => {
        selectedTopic = selectedTopic === t ? null : t;
        previewState = null;
        renderMapState();
      });
      btn.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') {
          previewState = { type: 'topic', key: t };
          renderMapState();
        }
      });
      btn.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') {
          previewState = resolveFocusState();
          renderMapState();
        }
      });
      btn.addEventListener('focus', () => {
        if (suppressFocusPreview) return;
        previewState = { type: 'topic', key: t };
        renderMapState();
      });
      btn.addEventListener('blur', () => {
        previewState = resolveFocusState();
        renderMapState();
      });
    });

    workLinks.forEach((link) => {
      const w = link.getAttribute('data-work-link');
      link.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') {
          previewState = { type: 'work', key: w };
          renderMapState();
        }
      });
      link.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') {
          previewState = resolveFocusState();
          renderMapState();
        }
      });
      link.addEventListener('focus', () => {
        if (suppressFocusPreview) return;
        previewState = { type: 'work', key: w };
        renderMapState();
      });
      link.addEventListener('blur', () => {
        previewState = resolveFocusState();
        renderMapState();
      });
    });

    mapContainer.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') {
        previewState = resolveFocusState();
        renderMapState();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearMapSelectionAndRestoreFocus(document.activeElement === clearBtn);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && (selectedTopic || previewState)) {
        clearMapSelectionAndRestoreFocus(true);
      }
    });

    requestAnimationFrame(syncMapGeometry);
    window.addEventListener('resize', syncMapGeometry, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncMapGeometry);
    }

    if ('IntersectionObserver' in window) {
      const mapObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          mapContainer.classList.toggle('map-offscreen', !entry.isIntersecting);
        });
      }, { threshold: 0 });
      mapObserver.observe(mapContainer);
    }
  }

  if ('IntersectionObserver' in window && animatedPanels.length > 0) {
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('card-offscreen', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    animatedPanels.forEach((panel) => cardObserver.observe(panel));
  }

  // 3. Hash Reveal & Target Navigation
  function revealElementAndScroll(targetEl, shouldScroll = true) {
    if (!targetEl) return;
    let revealedHiddenState = false;

    const parentPub = targetEl.closest('.pub-entry');
    if (parentPub && parentPub.hidden) {
      applyFilter('all', false);
      revealedHiddenState = true;
    }

    let node = targetEl.parentElement;
    while (node) {
      if (node.tagName === 'DETAILS' && !node.open) {
        node.open = true;
        revealedHiddenState = true;
      }
      node = node.parentElement;
    }
    if (targetEl.tagName === 'DETAILS' && !targetEl.open) {
      targetEl.open = true;
      revealedHiddenState = true;
    }

    if (targetEl.matches('.pub-entry, .system-card')) {
      targetEl.setAttribute('data-flash', 'true');
      setTimeout(() => targetEl.removeAttribute('data-flash'), 1400);
    }

    if (revealedHiddenState || shouldScroll) {
      const instant = !isMotionAllowed();
      requestAnimationFrame(() => {
        targetEl.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' });
      });
    }
  }

  function handleHashNavigation(isHashEvent = false) {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length < 2) return;
    let targetId = '';
    try {
      targetId = decodeURIComponent(rawHash.slice(1));
    } catch (_) {
      targetId = rawHash.slice(1);
    }
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    revealElementAndScroll(targetEl, isHashEvent);
  }

  window.addEventListener('hashchange', () => handleHashNavigation(true));
  handleHashNavigation(false);

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const rawHash = link.getAttribute('href');
    if (!rawHash || rawHash.length < 2) return;
    let targetId = '';
    try {
      targetId = decodeURIComponent(rawHash.slice(1));
    } catch (_) {
      targetId = rawHash.slice(1);
    }
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    if (window.location.hash === rawHash) {
      e.preventDefault();
      revealElementAndScroll(targetEl, true);
    }
  });

  // 4. Explicit-click BibTeX Copy
  const bibPanels = document.querySelectorAll('.bib-panel');
  bibPanels.forEach((panel) => {
    const btn = panel.querySelector('.copy-bib-btn');
    const codeEl = panel.querySelector('pre code');
    const feedback = panel.querySelector('.copy-feedback');

    if (btn && codeEl && navigator.clipboard) {
      btn.hidden = false;
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeEl.textContent.trim());
          if (feedback) {
            feedback.textContent = 'Copied';
            setTimeout(() => {
              feedback.textContent = '';
            }, 2000);
          }
        } catch (_) {
          if (feedback) feedback.textContent = 'Use Download .bib';
        }
      });
    }
  });

  // 5. Section Navigation Active State
  const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length > 0) {
    const setActiveLink = (id) => {
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };
    setActiveLink(sections[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: '-18% 0px -68% 0px', threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }
})();
