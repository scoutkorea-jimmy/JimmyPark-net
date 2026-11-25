import { renderPressProjects } from './press-view.mjs';

// The shared preview channel validates the parent origin and transfers only Press data.
document.addEventListener('jp-press-preview', event => {
  const projects = event.detail?.pages?.work?.sections?.photography?.projects;
  if (Array.isArray(projects)) document.getElementById('press-records').innerHTML = renderPressProjects(projects);
});
