import { renderPressProjects } from './press-view.mjs';

window.addEventListener('message', event => {
  if (window.parent === window || event.source !== window.parent || event.origin !== location.origin) return;
  if (event.data?.type !== 'jp-preview') return;
  const projects = event.data.content?.pages?.work?.sections?.photography?.projects;
  if (Array.isArray(projects)) document.getElementById('press-records').innerHTML = renderPressProjects(projects);
});
