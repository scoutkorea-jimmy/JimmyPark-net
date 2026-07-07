/* =========================================================
   saju.js — 사주 기반 오행 캐릭터 추천 (/saju, hidden route)
   Korean UI is an approved exception to the English-only rule
   (see CLAUDE.md §Golden rules). No dependencies, no build step.

   구조 (기획서 §20):
   1) saju-engine       생년월일시 → 사주팔자 (절기 경계는 태양
                        황경을 Meeus 저정밀 근사식으로 직접 계산,
                        조견표 없음, 1900–2100 지원)
   2) element-analyzer  오행 분포 + 부족 오행 도출
   3) character-engine  부족 오행 → 캐릭터 (메인/서브)
   4) content-engine    추천 문장 + 고지 문구
   ========================================================= */
(function () {
  'use strict';

  /* ── 1. saju-engine ───────────────────────────────── */
  // 천간 (el: 0목 1화 2토 3금 4수)
  var STEMS = [
    { ko: '갑', hj: '甲', el: 0, yang: true },
    { ko: '을', hj: '乙', el: 0, yang: false },
    { ko: '병', hj: '丙', el: 1, yang: true },
    { ko: '정', hj: '丁', el: 1, yang: false },
    { ko: '무', hj: '戊', el: 2, yang: true },
    { ko: '기', hj: '己', el: 2, yang: false },
    { ko: '경', hj: '庚', el: 3, yang: true },
    { ko: '신', hj: '辛', el: 3, yang: false },
    { ko: '임', hj: '壬', el: 4, yang: true },
    { ko: '계', hj: '癸', el: 4, yang: false }
  ];
  var BRANCHES = [
    { ko: '자', hj: '子', el: 4, animal: '쥐' },
    { ko: '축', hj: '丑', el: 2, animal: '소' },
    { ko: '인', hj: '寅', el: 0, animal: '호랑이' },
    { ko: '묘', hj: '卯', el: 0, animal: '토끼' },
    { ko: '진', hj: '辰', el: 2, animal: '용' },
    { ko: '사', hj: '巳', el: 1, animal: '뱀' },
    { ko: '오', hj: '午', el: 1, animal: '말' },
    { ko: '미', hj: '未', el: 2, animal: '양' },
    { ko: '신', hj: '申', el: 3, animal: '원숭이' },
    { ko: '유', hj: '酉', el: 3, animal: '닭' },
    { ko: '술', hj: '戌', el: 2, animal: '개' },
    { ko: '해', hj: '亥', el: 4, animal: '돼지' }
  ];
  // 오행 (기획서 §3.4 상징 / 색은 /saju 전용 비비드 팔레트 — Open Color 계열)
  var ELEMENTS = [
    { ko: '목', hj: '木', color: '#0ca678', light: '#e6fcf5', symbols: '성장 · 확장 · 생명력' },
    { ko: '화', hj: '火', color: '#fa5252', light: '#fff0f2', symbols: '표현 · 열정 · 빛' },
    { ko: '토', hj: '土', color: '#f08c00', light: '#fff6e6', symbols: '안정 · 균형 · 기반' },
    { ko: '금', hj: '金', color: '#7048e8', light: '#f3f0ff', symbols: '판단 · 절제 · 구조' },
    { ko: '수', hj: '水', color: '#3b5bdb', light: '#edf2ff', symbols: '지혜 · 흐름 · 직관' }
  ];

  var D2R = Math.PI / 180;
  function mod(n, m) { return ((n % m) + m) % m; }
  function jdFromUtcMs(ms) { return ms / 86400000 + 2440587.5; }
  function utcMsFromJd(jd) { return (jd - 2440587.5) * 86400000; }

  // 태양의 겉보기 황경 (도, [0,360)) — Meeus 저정밀 (오차 ≈ 수 분)
  function solarLongitude(jd) {
    var T = (jd - 2451545.0) / 36525;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * D2R;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
          + 0.000289 * Math.sin(3 * M);
    var omega = (125.04 - 1934.136 * T) * D2R;
    var lam = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
    lam = lam % 360; if (lam < 0) lam += 360;
    return lam;
  }

  // 황경이 target(도)이 되는 순간(jd) 탐색
  function findCrossing(jdGuess, target) {
    var jd = jdGuess;
    for (var i = 0; i < 8; i++) {
      var diff = target - solarLongitude(jd);
      diff = mod(diff + 180, 360) - 180;
      if (Math.abs(diff) < 1e-6) break;
      jd += diff / 0.98565; // 태양 평균 이동 °/day
    }
    return jd;
  }

  // 해당 연도의 입춘(황경 315°) UTC ms — 연주 경계
  function ipchunUtcMs(year) {
    return utcMsFromJd(findCrossing(jdFromUtcMs(Date.UTC(year, 1, 4)), 315));
  }

  // 한국 표준시 이력: 1908-04-01~1911 및 1954-03-21~1961-08-09 UTC+8:30
  // (서머타임 1948–51/1955–60/1987–88 미반영 — 페이지 각주로 안내)
  function kstOffsetMin(y, m, d) {
    var v = y * 10000 + m * 100 + d;
    if (v >= 19080401 && v <= 19111231) return 510;
    if (v >= 19540321 && v <= 19610809) return 510;
    return 540;
  }

  // 일주: 1949-10-01 = 갑자일(0) 기준 60일 순환 (1900-01-01 = 갑술일과 교차 검증)
  var DAY_ANCHOR = Date.UTC(1949, 9, 1);
  function dayGanji(y, m, d) {
    var days = Math.round((Date.UTC(y, m - 1, d) - DAY_ANCHOR) / 86400000);
    var idx = mod(days, 60);
    return { stem: idx % 10, branch: idx % 12 };
  }

  /**
   * 사주팔자 계산 (양력 기준).
   * o: { y, m, d, hh, mm, timeKnown }  — timeKnown=false면 시주 없음(6글자)
   */
  function compute(o) {
    var y = o.y, m = o.m, d = o.d;
    var timeKnown = !!o.timeKnown;
    var hh = timeKnown ? o.hh : 12, mi = timeKnown ? o.mm : 0; // 시간 모름 → 정오 가정(연·월 판정용)

    var offMin = kstOffsetMin(y, m, d);
    var wallMs = Date.UTC(y, m - 1, d, hh, mi);
    var utcMs = wallMs - offMin * 60000;

    // 연주: 입춘 경계, 1984 = 갑자년
    var sajuYear = utcMs < ipchunUtcMs(y) ? y - 1 : y;
    var yIdx = mod(sajuYear - 1984, 60);
    var yearP = { stem: yIdx % 10, branch: yIdx % 12 };

    // 월주: 출생 순간의 태양 황경으로 판정 — 315°=인월(寅月)부터 30°씩
    var lam = solarLongitude(jdFromUtcMs(utcMs));
    var mOff = Math.floor(mod(lam - 315, 360) / 30);
    var monthP = {
      stem: mod((yearP.stem % 5) * 2 + 2 + mOff, 10),
      branch: mod(2 + mOff, 12)
    };

    // 일주 (자정 경계) / 시주 (자시 23:00–01:00 …)
    var dayP = dayGanji(y, m, d);
    var hourP = null;
    if (timeKnown) {
      var hb = Math.floor(mod(hh * 60 + mi + 60, 1440) / 120);
      hourP = { stem: mod((dayP.stem % 5) * 2 + hb, 10), branch: hb };
    }

    /* ── 2. element-analyzer: 오행 분포 ─────────────── */
    var counts = [0, 0, 0, 0, 0];
    [yearP, monthP, dayP].concat(hourP ? [hourP] : []).forEach(function (p) {
      counts[STEMS[p.stem].el]++;
      counts[BRANCHES[p.branch].el]++;
    });

    return {
      pillars: { year: yearP, month: monthP, day: dayP, hour: hourP },
      counts: counts,
      meta: { sajuYear: sajuYear, offsetMin: offMin, timeKnown: timeKnown }
    };
  }

  /* ── 3. character-engine ──────────────────────────── */
  // 캐릭터 DB (기획서 §8, §14)
  var CHARACTERS = [
    {
      id: 'wood_mori', el: 0, name: '모리', type: '새싹 정령', emoji: '🌱',
      short: '작은 시작과 성장을 도와주는 새싹 정령',
      long: '모리는 아직 완성되지 않은 작은 새싹 정령입니다. 크고 화려하지는 않지만, 매일 조금씩 자라나는 힘을 가지고 있습니다. 새로운 시작 앞에서 망설일 때, 아주 작은 첫걸음을 조용히 밀어주는 캐릭터입니다.',
      quote: '모리는 거창한 변화를 말하지 않습니다.\n대신 오늘 할 수 있는 작은 시작을 조용히 밀어줍니다.',
      lackMsg: '목은 새롭게 시작하고, 자라고, 가능성을 밀어 올리는 에너지입니다.\n재미로 해석하면 지금 당신에게는 방향을 잡고 천천히 성장하게 도와주는 캐릭터가 잘 어울릴 수 있습니다.',
      roleShort: '작은 시작과 성장을 도와주는',
      products: ['새싹 키링', '성장 다이어리', '루틴 체크 스티커', '"오늘의 작은 시작" 카드'],
      cta: '모리와 함께 오늘의 작은 시작을 만들어보세요.'
    },
    {
      id: 'fire_rua', el: 1, name: '루아', type: '불꽃 요정', emoji: '🔥',
      short: '마음속 불씨를 밝혀주는 작은 불꽃 요정',
      long: '루아는 어두운 곳에서도 작게 반짝이는 불꽃 요정입니다. 늘 강하게 타오르지는 않지만, 필요한 순간 마음속 불씨를 다시 밝혀줍니다. 감정과 생각을 조금 더 밖으로 표현할 수 있도록 돕는 캐릭터입니다.',
      quote: '루아는 당신을 억지로 빛나게 만들지 않습니다.\n다만 이미 안에 있던 작은 불씨를 다시 보이게 합니다.',
      lackMsg: '화는 마음속 에너지를 밖으로 드러내고, 존재감을 밝히는 힘입니다.\n재미로 해석하면 지금 당신에게는 표현력과 활력을 더해주는 캐릭터가 잘 어울릴 수 있습니다.',
      roleShort: '표현과 자신감을 밝혀주는',
      products: ['불꽃 키링', '응원 메시지 카드', '자신감 부스터 스티커', '"오늘의 불씨" 랜덤 카드'],
      cta: '루아와 함께 마음속 불씨를 다시 밝혀보세요.'
    },
    {
      id: 'earth_duri', el: 2, name: '두리', type: '둥근 흙곰', emoji: '🐻',
      short: '흩어진 마음의 중심을 잡아주는 둥근 흙곰',
      long: '두리는 느리지만 단단한 흙곰 캐릭터입니다. 급하게 달리기보다는, 흩어진 것들을 모으고 다시 중심을 잡아주는 역할을 합니다. 생각이 많아지거나 생활이 흐트러질 때, 다시 땅을 밟게 해주는 캐릭터입니다.',
      quote: '두리는 빠른 답을 주지 않습니다.\n대신 무너지지 않도록 옆에서 묵직하게 버텨줍니다.',
      lackMsg: '토는 흩어진 것을 모으고, 중심을 잡고, 현실에 뿌리내리게 하는 에너지입니다.\n재미로 해석하면 지금 당신에게는 균형과 안정감을 더해주는 캐릭터가 잘 어울릴 수 있습니다.',
      roleShort: '안정과 중심을 잡아주는',
      products: ['흙곰 인형', '안정 루틴 플래너', '"오늘의 중심" 카드', '베이지톤 힐링 스티커'],
      cta: '두리와 함께 오늘의 중심을 잡아보세요.'
    },
    {
      id: 'metal_sera', el: 3, name: '세라', type: '은빛 여우', emoji: '🦊',
      short: '복잡한 생각을 정리해주는 은빛 여우',
      long: '세라는 조용하고 예리한 은빛 여우 캐릭터입니다. 복잡한 상황 속에서도 필요한 것과 불필요한 것을 구분하는 감각을 가지고 있습니다. 선택을 미루거나 생각이 복잡해졌을 때, 기준을 세우고 정리할 수 있도록 돕는 캐릭터입니다.',
      quote: '세라는 많은 말을 하지 않습니다.\n대신 무엇을 남기고 무엇을 덜어낼지 조용히 알려줍니다.',
      lackMsg: '금은 복잡한 것을 정리하고, 기준을 세우고, 결단하게 만드는 에너지입니다.\n재미로 해석하면 지금 당신에게는 생각을 정리하고 선택을 도와주는 캐릭터가 잘 어울릴 수 있습니다.',
      roleShort: '정리와 결단을 도와주는',
      products: ['은빛 여우 키링', '할 일 정리 메모패드', '미니멀 스티커팩', '"오늘의 기준" 체크리스트'],
      cta: '세라와 함께 복잡한 생각을 정리해보세요.'
    },
    {
      id: 'water_noa', el: 4, name: '노아', type: '물방울 고래', emoji: '🐳',
      short: '멈춤과 회복을 도와주는 물방울 고래',
      long: '노아는 조용히 흐르는 물방울 고래 캐릭터입니다. 감정을 크게 드러내지는 않지만, 깊은 곳에서 흐름을 읽고 지친 에너지를 회복시켜줍니다. 너무 오래 긴장하거나 생각이 메말랐을 때, 다시 천천히 흐를 수 있도록 도와주는 캐릭터입니다.',
      quote: '노아는 재촉하지 않습니다.\n잠시 멈추고, 숨을 고르고, 다시 흐르게 합니다.',
      lackMsg: '수는 멈춰서 생각하고, 흐름을 읽고, 지친 에너지를 회복하게 만드는 힘입니다.\n재미로 해석하면 지금 당신에게는 생각을 정리하고 감각을 회복하게 해주는 캐릭터가 잘 어울릴 수 있습니다.',
      roleShort: '회복과 흐름을 전해주는',
      products: ['물방울 고래 인형', '회복 다이어리', '감정 기록 스티커', '"오늘의 흐름" 명상 카드'],
      cta: '노아와 함께 잠시 멈추고 다시 흐름을 회복해보세요.'
    }
  ];

  /**
   * 부족 오행 도출 (기획서 §5.2, §12.3)
   * 1) 개수 단순 합산 → 최소 오행이 부족 오행 (0개는 최우선)
   * 2) 동률이면 일간과의 상생 관계로 우선순위:
   *    일간을 생(生)하는 오행 > 일간이 생하는 오행 > 그 외
   * 3) 동률 2개 이상이면 메인 + 서브 캐릭터 추천
   */
  function recommend(counts, dayEl) {
    var min = Math.min.apply(null, counts);
    var cands = [];
    counts.forEach(function (c, el) { if (c === min) cands.push(el); });
    cands.sort(function (a, b) { return prio(a) - prio(b); });
    function prio(el) {
      if (mod(el + 1, 5) === dayEl) return 0; // el 생 일간 (인성)
      if (mod(dayEl + 1, 5) === el) return 1; // 일간 생 el (식상)
      return 2;
    }
    return {
      lacking: cands,
      main: CHARACTERS[cands[0]],
      sub: cands.length > 1 ? CHARACTERS[cands[1]] : null
    };
  }

  var Saju = {
    STEMS: STEMS, BRANCHES: BRANCHES, ELEMENTS: ELEMENTS, CHARACTERS: CHARACTERS,
    compute: compute, recommend: recommend,
    solarLongitude: solarLongitude, ipchunUtcMs: ipchunUtcMs,
    dayGanji: dayGanji, kstOffsetMin: kstOffsetMin
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Saju;
  if (typeof window !== 'undefined') window.Saju = Saju;

  /* ── 4. content-engine + UI (saju.html에서만 동작) ── */
  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('saju-form');
    if (!form) return;
    var $ = function (id) { return document.getElementById(id); };

    $('sj-noTime').addEventListener('change', function () {
      $('sj-time').disabled = this.checked;
      $('sj-time').style.opacity = this.checked ? .45 : 1;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dv = $('sj-date').value;
      if (!dv) { alert('생년월일을 입력해 주세요.'); return; }
      var p = dv.split('-').map(Number);
      if (p[0] < 1900 || p[0] > 2100) { alert('1900–2100년 범위만 지원합니다.'); return; }
      var noTime = $('sj-noTime').checked;
      var t = ($('sj-time').value || '12:00').split(':').map(Number);
      var res = compute({ y: p[0], m: p[1], d: p[2], hh: t[0], mm: t[1], timeKnown: !noTime });
      render(res);
      var out = $('saju-result');
      out.style.display = 'block';
      out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function pillarCol(label, pl) {
      if (!pl) {
        return '<div class="sj-col"><div class="sj-col-label">' + label + '</div>' +
          '<div class="sj-unknown">시간<br>모름</div></div>';
      }
      var s = STEMS[pl.stem], b = BRANCHES[pl.branch];
      return '<div class="sj-col">' +
        '<div class="sj-col-label">' + label + '</div>' +
        '<div class="sj-glyph" style="background:' + ELEMENTS[s.el].color + ';">' + s.hj +
          '<span>' + s.ko + ' · ' + ELEMENTS[s.el].ko + '</span></div>' +
        '<div class="sj-glyph" style="background:' + ELEMENTS[b.el].color + ';">' + b.hj +
          '<span>' + b.ko + ' · ' + ELEMENTS[b.el].ko + '</span></div>' +
        '</div>';
    }

    function charCard(ch, isMain) {
      var el = ELEMENTS[ch.el];
      return '<div class="sj-char" style="background:' + el.light + '; border-color:' + el.color + '33;">' +
        '<div class="sj-char-head">' +
          '<div class="sj-char-emoji" style="background:' + el.color + ';">' + ch.emoji + '</div>' +
          '<div><div class="sj-char-tag" style="color:' + el.color + ';">' +
            (isMain ? '추천 캐릭터' : '함께 추천') + ' · ' + el.ko + '(' + el.hj + ')의 캐릭터</div>' +
          '<div class="sj-char-name">' + ch.name + ' <span>' + ch.type + '</span></div></div>' +
        '</div>' +
        '<p class="sj-char-desc">' + ch.long + '</p>' +
        '<blockquote class="sj-char-quote" style="border-color:' + el.color + ';">' +
          ch.quote.replace('\n', '<br>') + '</blockquote>' +
        '<div class="sj-char-goods"><div class="sj-goods-label">이런 아이템으로 만나요</div>' +
          ch.products.map(function (g) { return '<span class="sj-pill">' + g + '</span>'; }).join('') +
        '</div>' +
        '<a href="/contact" class="btn btn-primary sj-cta" style="background:' + el.color + ';">' +
          ch.cta + ' <span class="msym" aria-hidden="true" style="font-size:17px;">arrow_forward</span></a>' +
        '<div class="sj-char-note">※ 굿즈는 준비 중입니다. 캐릭터 소식이 궁금하다면 연락처로 문의해 주세요.</div>' +
        '</div>';
    }

    function render(r) {
      var pl = r.pillars;
      var yb = BRANCHES[pl.year.branch];
      $('sj-headline').textContent =
        r.meta.sajuYear + '년 ' + STEMS[pl.year.stem].ko + yb.ko + '년 · ' + yb.animal + '띠' +
        (r.meta.timeKnown ? '' : ' · 시간 미상(6글자 기준)');

      $('sj-pillars').innerHTML =
        pillarCol('시주', pl.hour) + pillarCol('일주', pl.day) +
        pillarCol('월주', pl.month) + pillarCol('연주', pl.year);

      // 오행 분포 그래프
      var total = r.counts.reduce(function (a, b) { return a + b; }, 0);
      $('sj-elements').innerHTML = ELEMENTS.map(function (el, i) {
        var c = r.counts[i], w = total ? Math.round(c / total * 100) : 0;
        return '<div class="sj-el-row">' +
          '<span class="sj-el-name" style="color:' + el.color + ';">' + el.ko + ' ' + el.hj + '</span>' +
          '<span class="sj-el-bar"><span style="width:' + Math.max(w, c ? 6 : 0) + '%; background:' + el.color + ';"></span></span>' +
          '<span class="sj-el-count">' + c + '개</span></div>';
      }).join('');

      // 부족 오행 + 캐릭터 추천
      var rec = recommend(r.counts, STEMS[pl.day.stem].el);
      var lackEl = ELEMENTS[rec.main.el];
      var lackNames = rec.lacking.map(function (i) { return '"' + ELEMENTS[i].ko + '"'; }).join(', ');

      $('sj-lack-title').innerHTML =
        '당신의 사주에서 상대적으로 부족하게 나타난 오행은 <strong style="color:' +
        lackEl.color + ';">' + lackNames + '</strong>입니다.';
      $('sj-lack-desc').innerHTML =
        lackEl.ko + '(' + lackEl.hj + ')은 ' + lackEl.symbols + '을 상징합니다.<br>' +
        rec.main.lackMsg.replace('\n', '<br>');

      var html = charCard(rec.main, true);
      if (rec.sub) {
        html += '<p class="sj-both">당신에게는 ' + rec.main.roleShort + ' ' + rec.main.name +
          '와(과) ' + rec.sub.roleShort + ' ' + rec.sub.name + '이(가) 함께 추천됩니다.</p>' +
          charCard(rec.sub, false);
      }
      $('sj-characters').innerHTML = html;

      var notes = [];
      if (r.meta.offsetMin === 510) notes.push('출생 당시 한국 표준시(UTC+8:30) 반영');
      notes.push('양력 기준 · 절기(입춘) 경계 천문 계산');
      $('sj-calc-note').textContent = notes.join(' · ');
    }
  });
})();
