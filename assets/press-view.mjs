// Used for both the public HTML response and the editor's unsaved preview.
function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function pressProjectId(project) {
  return 'project-' + project.name.trim().normalize('NFC').replace(/\s+/g, '-') + (project.date ? '-' + project.date : '');
}

export function publishedLinks(project) {
  return (Array.isArray(project?.articles) ? project.articles : []).filter(item => {
    if (!item?.title?.trim() || !item.outlet?.trim() || !/^https:\/\//.test(item.href)) return false;
    try { const url = new URL(item.href); return !!url.hostname && !url.username && !url.password; }
    catch { return false; }
  });
}

function dateTag(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return '';
  return '<time datetime="' + date + '">' + date.replace(/-/g, '.') + '</time>';
}

function publication(item) {
  return '<li><a class="press-headline" href="' + escape(item.href) +
    '" target="_blank" rel="noopener noreferrer"><span dir="auto">' + escape(item.title) +
    '</span><span aria-hidden="true">↗</span></a><div class="press-source"><span dir="auto">' +
    escape(item.outlet) + '</span>' + dateTag(item.date) + '</div></li>';
}

function projectRow(project, links) {
  const start = dateTag(project.date);
  const end = project.endDate !== project.date && dateTag(project.endDate);
  return '<article class="press-row" id="' + escape(pressProjectId(project)) + '"><div>' +
    ((start || end) ? '<p class="press-dates">' + start + (start && end ? ' – ' : '') + (end || '') + '</p>' : '') +
    '<h3 dir="auto">' + escape(project.name) + '</h3>' +
    (project.role ? '<p class="press-role" dir="auto">' + escape(project.role) + '</p>' : '') + '</div>' +
    (links.length ? '<ul class="press-stories">' + links.map(publication).join('') + '</ul>' : '') + '</article>';
}

export function renderPressProjects(projects) {
  const groups = [
    { heading: 'News coverage', rows: [] },
    { heading: 'Organization, brand & blog publications', rows: [] },
    { heading: 'Other photography assignments', rows: [] },
  ];
  for (const project of projects || []) {
    if (typeof project?.name !== 'string' || !project.name.trim()) continue;
    const links = publishedLinks(project);
    const group = links.some(link => link.kind === 'press') ? 0 : links.length ? 1 : 2;
    groups[group].rows.push(projectRow(project, links));
  }
  return groups.filter(group => group.rows.length).map(group =>
    '<section class="press-group"><h2>' + escape(group.heading) + '</h2>' + group.rows.join('') + '</section>'
  ).join('') || '<p class="body-copy">No photography assignments are listed yet.</p>';
}
