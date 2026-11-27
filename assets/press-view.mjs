// Used for both the public HTML response and the editor's unsaved preview.
function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function pressProjectId(project) {
  return 'project-' + project.name.trim().normalize('NFC').replace(/\s+/g, '-') + (project.date ? '-' + project.date : '');
}

// Old public bookmarks include the original Korean project name and date.
const previousProjectNames = new Map([
  ['2026 KSoP Philanthropy Forum', ['2026-11-05', '2026 KSoP 필란트로피포럼']],
  ['16th Korea Jamboree', ['2026-08-04', '제16회 한국잼버리']],
  ['Climate Action Center of Korea: June Roundtable', ['2026-06-25', '기후대응센터 6월 라운드테이블']],
  ['2015 Seoul International Fireworks Festival with Hanwha', ['2015-10-03', '한화와 함께하는 2015 서울세계불꽃축제']],
]);

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

function projectRow(project, links, id, alias) {
  const start = dateTag(project.date);
  const end = project.endDate !== project.date && dateTag(project.endDate);
  return '<article class="press-row"' + (id ? ' id="' + escape(id) + '"' : '') + '><div' +
    (alias ? ' id="' + escape(alias) + '"' : '') + '>' +
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
  const rows = (projects || []).filter(project => typeof project?.name === 'string' && project.name.trim());
  const currentIds = new Set(rows.map(pressProjectId));
  const renderedIds = new Set();
  for (const project of rows) {
    const id = pressProjectId(project);
    const previous = previousProjectNames.get(project.name);
    const alias = previous && previous[0] === project.date ? pressProjectId({ name: previous[1], date: project.date }) : '';
    const links = publishedLinks(project);
    const group = links.some(link => link.kind === 'press') ? 0 : links.length ? 1 : 2;
    groups[group].rows.push(projectRow(project, links, renderedIds.has(id) ? '' : id,
      currentIds.has(alias) || renderedIds.has(alias) ? '' : alias));
    renderedIds.add(id);
    if (alias && !currentIds.has(alias)) renderedIds.add(alias);
  }
  return groups.filter(group => group.rows.length).map(group =>
    '<section class="press-group"><h2>' + escape(group.heading) + '</h2>' + group.rows.join('') + '</section>'
  ).join('') || '<p class="body-copy">No photography assignments are listed yet.</p>';
}
