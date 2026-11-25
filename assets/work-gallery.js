(() => {
  'use strict';

  const album = document.querySelector('[data-href="photography.portfolio.href"]');
  if (album) enableAlbumPreview(album);

  const grid = document.querySelector('.photo-selection[data-photo-shuffle]');
  if (grid && typeof HTMLDialogElement !== 'undefined' && HTMLDialogElement.prototype.showModal) {
    enablePhotoViewer(grid);
  }

  function driveEmbedUrl(link) {
    if (link.hidden || !link.hasAttribute('href')) return '';
    let url;
    try { url = new URL(link.href); } catch { return ''; }
    if (url.origin !== 'https://drive.google.com') return '';
    const folder = url.pathname.match(/^\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)\/?$/);
    if (!folder) return '';
    const embed = new URL('/embeddedfolderview', url.origin);
    embed.searchParams.set('id', folder[1]);
    if (url.searchParams.has('resourcekey')) {
      embed.searchParams.set('resourcekey', url.searchParams.get('resourcekey'));
    }
    embed.hash = 'grid';
    return embed.href;
  }

  function enableAlbumPreview(link) {
    const details = document.createElement('details');
    details.className = 'work-album-preview';
    const summary = document.createElement('summary');
    summary.textContent = 'Browse albums on this page';
    details.append(summary);
    link.parentElement.append(details);

    function update() {
      const src = driveEmbedUrl(link);
      details.hidden = !src;
      if (!src) details.open = false;
      let frame = details.querySelector('iframe');
      if (!details.open) {
        if (frame) frame.remove();
        return;
      }
      if (!frame) {
        frame = document.createElement('iframe');
        frame.title = 'Photography albums on Google Drive';
        frame.referrerPolicy = 'no-referrer';
        frame.src = src;
        details.append(frame);
      } else if (frame.src !== src) {
        frame.src = src;
      }
    }
    details.addEventListener('toggle', update);
    new MutationObserver(update).observe(link, {attributes: true, attributeFilter: ['href', 'hidden']});
    update();
  }

  function enablePhotoViewer(grid) {
    const links = Array.from(grid.querySelectorAll('a[href]')).filter(link => link.querySelector('img'));
    if (!links.length) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'work-photo-viewer';
    dialog.setAttribute('aria-label', 'Photo preview');
    dialog.innerHTML = `
      <div class="work-photo-tools">
        <a class="work-photo-original" target="_blank" rel="noopener noreferrer">Open original ↗</a>
        <button type="button" data-close autofocus>Close</button>
      </div>
      <figure>
        <img class="work-photo-full" alt="">
        <figcaption aria-live="polite" aria-atomic="true"></figcaption>
      </figure>
      <div class="work-photo-controls">
        <button type="button" data-prev>Previous</button>
        <button type="button" data-next>Next</button>
      </div>`;
    document.body.append(dialog);
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('figcaption');
    const original = dialog.querySelector('a');
    let opener;
    let current;

    function show(index) {
      // site.js shuffles the selection on load. Follow its current visible order.
      const ordered = Array.from(grid.querySelectorAll('a[aria-haspopup="dialog"]'));
      current = (index + ordered.length) % ordered.length;
      const link = ordered[current];
      const thumb = link.querySelector('img');
      image.src = thumb.currentSrc || thumb.src;
      image.alt = thumb.alt;
      original.href = link.href;
      const description = link.closest('figure')?.querySelector('figcaption')?.textContent || thumb.alt;
      caption.textContent = (current + 1) + ' / ' + ordered.length + ' · ' + description;
    }

    links.forEach(link => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-label', 'Enlarge photo: ' + link.querySelector('img').alt);
      const icon = document.createElement('span');
      icon.className = 'msym work-photo-zoom';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'zoom_in';
      link.append(icon);
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = link;
        show(Array.from(grid.querySelectorAll('a[aria-haspopup="dialog"]')).indexOf(link));
        dialog.showModal();
        document.documentElement.classList.add('work-photo-open');
      });
    });
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-prev]').addEventListener('click', () => show(current - 1));
    dialog.querySelector('[data-next]').addEventListener('click', () => show(current + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(current + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('work-photo-open');
      opener?.focus({preventScroll: true});
    });
  }
})();
