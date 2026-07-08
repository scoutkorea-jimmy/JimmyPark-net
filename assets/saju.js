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

  // 굿즈 구매 연결 (임시 — 실제 상품별 페이지 준비되면 캐릭터별로 교체)
  var SHOP_URL = 'https://makeholic.co.kr/';

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
  // strong: 그 기운이 풍성할 때의 강점 (유쾌하고 기분 좋게)
  var ELEMENTS = [
    { ko: '목', hj: '木', color: '#2f9e44', text: '#2f9e44', ink: '#ffffff', light: '#e9fbef', symbols: '성장 · 확장 · 생명력',
      strong: '목(木)이 넉넉한 당신은 새로운 시작 앞에서 눈이 반짝이고, 작은 아이디어도 근사한 결과로 키워내는 사람이에요. 지금처럼 계속 씨앗을 심어가면 돼요 — 당신의 봄은 아직 한창이니까요!' },
    { ko: '화', hj: '火', color: '#e8352e', text: '#e8352e', ink: '#ffffff', light: '#fff1f0', symbols: '표현 · 열정 · 빛',
      strong: '화(火)가 넉넉한 당신은 감정이 솔직해서, 함께 있으면 분위기가 금세 환해지는 사람이에요. 그 반짝임을 아끼지 말고 마음껏 빛내면 돼요 — 오늘도 당신은 충분히 눈부셔요!' },
    { ko: '토', hj: '土', color: '#f5b800', text: '#b07d00', ink: '#4a3800', light: '#fff7d6', symbols: '안정 · 균형 · 기반',
      strong: '토(土)가 넉넉한 당신은 차분히 중심을 잡고 맡은 일은 끝까지 책임지는, 어디서든 든든한 땅 같은 사람이에요. 당신만의 속도로 단단히 걸어가면 돼요 — 오늘도 충분히 단단해요!' },
    { ko: '금', hj: '金', color: '#c3cad1', text: '#8a929b', ink: '#454b52', light: '#f2f4f6', symbols: '판단 · 절제 · 구조',
      strong: '금(金)이 넉넉한 당신은 복잡한 걸 깔끔히 정리하고 핵심을 짚어내는 감각이 뛰어난 사람이에요. 당신만의 기준을 믿고 나아가면 돼요 — 오늘도 충분히 또렷하게 빛나요!' },
    { ko: '수', hj: '水', color: '#2b2f36', text: '#2b2f36', ink: '#ffffff', light: '#eef0f2', symbols: '지혜 · 흐름 · 직관',
      strong: '수(水)가 넉넉한 당신은 흐름을 읽어내는 지혜를 가진, 깊고 잔잔한 물 같은 사람이에요. 당신만의 리듬으로 흘러가면 돼요 — 오늘도 충분히 깊고 아름다워요!' }
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
      long: '매일 조금씩 자라나는 작은 새싹 정령. 새로운 시작 앞에서 망설일 때, 아주 작은 첫걸음을 조용히 밀어줍니다.',
      quote: '모리는 거창한 변화를 말하지 않습니다.\n대신 오늘 할 수 있는 작은 시작을 조용히 밀어줍니다.',
      lackMsg: '목(木)은 "일단 해보자!" 하고 폴짝 일어나는 새싹 같은 기운이에요. 당신 사주엔 이 목 기운이 살짝 옅게 나왔어요 — 하고 싶은 리스트는 가득한데 첫 발이 유난히 무겁죠. 하지만 부족한 건 능력이 아니라 "작은 시작 스위치" 하나예요. 목의 기운은 하루 5분짜리 작은 행동에서 자라나거든요. 그래서 데려온 친구가 새싹 정령 모리 — 오늘 할 수 있는 가장 작은 시작을 조용히 함께 떼어줄 거예요!',
      whenLow: ['#일단저지르기', '#작심삼일탈출각', '#새싹력충전', '#검색만세시간', '#장바구니요정', '#오늘딱한걸음', '#시작이반이라며', '#내일부터진짜', '#성장캐릭터각', '#첫발떼기챌린지', '#루틴새싹', '#가능성만렙'],
      roleShort: '작은 시작과 성장을 도와주는',
      products: ['새싹 키링', '성장 다이어리', '루틴 체크 스티커', '"오늘의 작은 시작" 카드'],
      cta: '모리와 함께 오늘의 작은 시작을 만들어보세요.'
    },
    {
      id: 'fire_rua', el: 1, name: '루아', type: '불꽃 요정', emoji: '🔥',
      short: '마음속 불씨를 밝혀주는 작은 불꽃 요정',
      long: '어두운 곳에서도 작게 반짝이는 불꽃 요정. 필요한 순간 마음속 불씨를 다시 밝혀, 감정과 생각을 밖으로 표현하도록 돕습니다.',
      quote: '루아는 당신을 억지로 빛나게 만들지 않습니다.\n다만 이미 안에 있던 작은 불씨를 다시 보이게 합니다.',
      lackMsg: '화(火)는 마음속 생각을 밖으로 "반짝" 꺼내는 따뜻한 불빛 같은 기운이에요. 당신 사주엔 이 화 기운이 조금 은은하게 나왔어요 — 속엔 할 말이 가득한데 밖으론 살짝 아껴 꺼내는 편이죠. 하지만 부족한 건 열정이 아니라, 이미 있는 불씨를 살짝 키우는 "작은 부채질"이에요. 오늘은 딱 한 번만 솔직하게 표현해봐요. 그래서 데려온 친구가 불꽃 요정 루아 — 당신 안의 작은 불씨를 다시 보이게 도와줄 거예요!',
      whenLow: ['#표현력구독각', '#단톡방침묵요정', '#조용한관찰자', '#리액션부자되기', '#이불킥방지', '#내불씨어디감', '#칭찬은손사래', '#오늘은솔직하게', '#따뜻한텐션', '#존재감ON', '#내가좋아하는거', '#반짝반짝루아'],
      roleShort: '표현과 자신감을 밝혀주는',
      products: ['불꽃 키링', '응원 메시지 카드', '자신감 부스터 스티커', '"오늘의 불씨" 랜덤 카드'],
      cta: '루아와 함께 마음속 불씨를 다시 밝혀보세요.'
    },
    {
      id: 'earth_duri', el: 2, name: '두리', type: '둥근 흙곰', emoji: '🐻',
      short: '흩어진 마음의 중심을 잡아주는 둥근 흙곰',
      long: '느리지만 단단한 흙곰. 생각이 많아지거나 생활이 흐트러질 때, 흩어진 것들을 모아 다시 중심을 잡아줍니다.',
      quote: '두리는 빠른 답을 주지 않습니다.\n대신 무너지지 않도록 옆에서 묵직하게 버텨줍니다.',
      lackMsg: '토(土)는 흩어진 걸 모아 중심을 잡아주는 든든한 땅 같은 기운이에요. 당신 사주엔 이 토 기운이 살짝 옅게 나왔어요 — 마음도 일정도 관심사도 쉽게 우르르 흩어지는 편이죠. 하지만 게을러서가 아니라 세상 모든 게 재미있어 보이는 호기심 넘치는 사람이라는 증거예요. 지금 필요한 건 흩어진 걸 묶어줄 "무게중심" 하나뿐이죠. 그래서 데려온 친구가 둥근 흙곰 두리 — 무너지지 않게 옆에서 묵직하게 버텨줄 거예요!',
      whenLow: ['#탭30개오픈런', '#멀티태스킹의늪', '#계획만화려', '#중심잡기챌린지', '#오늘뭐했더라', '#땅에발붙이기', '#든든한흙곰', '#정신차려중력', '#호기심천국', '#한가지만끝까지', '#안정력충전', '#두리와중심잡기'],
      roleShort: '안정과 중심을 잡아주는',
      products: ['흙곰 인형', '안정 루틴 플래너', '"오늘의 중심" 카드', '베이지톤 힐링 스티커'],
      cta: '두리와 함께 오늘의 중심을 잡아보세요.'
    },
    {
      id: 'metal_sera', el: 3, name: '세라', type: '은빛 여우', emoji: '🦊',
      short: '복잡한 생각을 정리해주는 은빛 여우',
      long: '조용하고 예리한 은빛 여우. 선택이 복잡해졌을 때, 필요한 것과 아닌 것을 구분해 기준을 세우도록 돕습니다.',
      quote: '세라는 많은 말을 하지 않습니다.\n대신 무엇을 남기고 무엇을 덜어낼지 조용히 알려줍니다.',
      lackMsg: '금(金)은 엉킨 걸 "이건 남기고, 이건 안녕" 하고 정리해주는 서늘하고 예리한 기운이에요. 당신 사주엔 이 금 기운이 살짝 옅게 나왔어요 — 생각도 물건도 감정도 자꾸 쌓아두는 편이죠. 하지만 우유부단해서가 아니라 모든 가능성을 소중히 여기는 다정한 사람이라는 뜻이에요. 지금 필요한 건 "나만의 기준" 하나뿐이죠. 그래서 데려온 친구가 은빛 여우 세라 — 무엇을 남기고 덜어낼지 조용히 알려줄 거예요!',
      whenLow: ['#장바구니무한적립', '#아무거나가제일어려움', '#정리유튜브정주행', '#결정장애탈출각', '#위시리스트요정', '#덜어내기연습', '#나만의기준세우기', '#다정해서못버림', '#미니멀도전', '#선택은가볍게', '#은빛여우세라', '#싹둑정리각'],
      roleShort: '정리와 결단을 도와주는',
      products: ['은빛 여우 키링', '할 일 정리 메모패드', '미니멀 스티커팩', '"오늘의 기준" 체크리스트'],
      cta: '세라와 함께 복잡한 생각을 정리해보세요.'
    },
    {
      id: 'water_noa', el: 4, name: '노아', type: '물방울 고래', emoji: '🐳',
      short: '멈춤과 회복을 도와주는 물방울 고래',
      long: '조용히 흐르는 물방울 고래. 너무 오래 긴장했을 때, 지친 에너지를 회복시켜 다시 천천히 흐르도록 돕습니다.',
      quote: '노아는 재촉하지 않습니다.\n잠시 멈추고, 숨을 고르고, 다시 흐르게 합니다.',
      lackMsg: '수(水)는 잠깐 멈춰 숨을 고르며 흐름을 읽는 잔잔한 물 같은 기운이에요. 당신 사주엔 이 수 기운이 살짝 옅게 나왔어요 — 쉬는 법을 자꾸 잊고 몸도 마음도 바짝 마른 느낌이 들 때가 있죠. 하지만 유난스러워서가 아니라 그만큼 성실한 사람이라는 증거예요. 지금 필요한 건 "잠깐의 쉼표" 하나죠. 그래서 데려온 친구가 물방울 고래 노아 — 잠시 멈추고 다시 천천히 흐르게 도와줄 거예요!',
      whenLow: ['#쉬는것도일이야', '#번아웃은남얘기아님', '#밤에더시끄러운생각', '#노트북풀가동', '#멍때리기복습', '#10분쉼표', '#촉촉력충전', '#잘쉬는게이기는거', '#회복탄력성', '#숨고르기챌린지', '#물방울고래노아', '#오늘은꺼져도돼'],
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
    var $ = function (id) { return document.getElementById(id); };
    var pad2 = function (n) { return ('0' + n).slice(-2); };

    // 아직 구현되지 않은 기능(캐릭터 상세 등)은 "개발중" 안내만 띄운다 (두 페이지 공통).
    // (굿즈 구매 CTA는 makeholic 스토어로 실제 이동 — SHOP_URL 참고)
    function soon() { alert('아직 개발중이에요! 🛠️\n조금만 기다려 주세요.'); }
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-soon]')) { e.preventDefault(); soon(); }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('[data-soon]')) {
        e.preventDefault(); soon();
      }
    });

    // ── 마지막 입력 로컬 저장 (localStorage · 7일 후 자동 삭제) ──
    // 쿠키를 쓰지 않는 이유: 쿠키는 매 요청마다 서버로 전송돼 "생년월일은
    // 서버로 안 감" 원칙을 깬다. localStorage는 이 브라우저에만 남는다.
    var LAST_KEY = 'saju:last:v1';
    var LAST_TTL = 7 * 24 * 60 * 60 * 1000;
    function loadLast() {
      try {
        var o = JSON.parse(localStorage.getItem(LAST_KEY) || 'null');
        if (!o || !o.d || !o.ts || (Date.now() - o.ts) > LAST_TTL) { clearLast(); return null; }
        return o;
      } catch (e) { return null; }
    }
    function saveLast(o) {
      try { o.ts = Date.now(); localStorage.setItem(LAST_KEY, JSON.stringify(o)); } catch (e) {}
    }
    function clearLast() { try { localStorage.removeItem(LAST_KEY); } catch (e) {} }

    // ── 입력 페이지(saju.html): 값 검증 후 결과 페이지로 이동 ──
    var form = $('saju-form');
    if (form) {
      var tSel = $('sj-birthtime');
      for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) tSel.add(new Option(pad2(h) + ':' + pad2(m), h + ':' + m));
      }
      tSel.value = '12:0';

      // 연/월/일 직접 입력 필드 — 숫자만, 다 채우면 자동으로 다음 칸으로 이동
      var yIn = $('sj-year'), moIn = $('sj-month'), daIn = $('sj-day');
      // 샘플(placeholder)은 오늘 날짜 기준으로 표시
      var todayD = new Date();
      yIn.placeholder = String(todayD.getFullYear());
      moIn.placeholder = String(todayD.getMonth() + 1);
      daIn.placeholder = String(todayD.getDate());
      function wireDigits(inp, next, leadJump) {
        inp.addEventListener('input', function () {
          this.value = this.value.replace(/\D/g, '').slice(0, this.maxLength);
          var full = this.value.length >= this.maxLength;
          var lead = leadJump && this.value.length === 1 && +this.value > leadJump;
          if ((full || lead) && next) next.focus();
        });
      }
      wireDigits(yIn, moIn, 0);   // 연도 4자리 → 월
      wireDigits(moIn, daIn, 1);  // 월: 2자리거나 첫 숫자가 2~9면 → 일
      wireDigits(daIn, null, 3);  // 일: 4~9로 시작하면 한 자리로 확정

      function setDate(dStr) {
        var p = (dStr || '').split('-');
        yIn.value = p[0] || '';
        moIn.value = p[1] ? String(+p[1]) : '';
        daIn.value = p[2] ? String(+p[2]) : '';
      }
      function getDate() {
        var y = +yIn.value, mo = +moIn.value, da = +daIn.value;
        if (!y || !mo || !da) return null;
        if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || da < 1 || da > 31) return null;
        var dt = new Date(y, mo - 1, da);
        if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== da) return null;
        return y + '-' + pad2(mo) + '-' + pad2(da);
      }

      function setNoTime(on) {
        $('sj-noTime').checked = on;
        tSel.disabled = on;
        tSel.style.opacity = on ? .45 : 1;
      }
      $('sj-noTime').addEventListener('change', function () { setNoTime(this.checked); });

      // 재방문 시 마지막 입력 자동 채움
      var last = loadLast();
      if (last) {
        setDate(last.d);
        if (last.t) tSel.value = last.t;
        setNoTime(!!last.nt);
        var hint = $('sj-restored');
        if (hint) hint.style.display = '';
      }
      var clearBtn = $('sj-clear');
      if (clearBtn) clearBtn.addEventListener('click', function () {
        clearLast();
        setDate('');
        tSel.value = '12:0';
        setNoTime(false);
        yIn.focus();
        var hint = $('sj-restored');
        if (hint) hint.style.display = 'none';
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var dv = getDate();
        if (!dv) { alert('생년월일을 정확히 입력해 주세요.\n(연 1900–2100 · 월 1–12 · 일 1–31)'); return; }
        var noTime = $('sj-noTime').checked;
        saveLast({ d: dv, t: tSel.value, nt: noTime ? 1 : 0 });
        var q = 'd=' + encodeURIComponent(dv) + '&t=' + encodeURIComponent(tSel.value) + '&nt=' + (noTime ? 1 : 0);
        window.location.href = '/saju-result?' + q;
      });
      return;
    }

    // ── 결과 페이지(saju-result.html): 쿼리스트링에서 읽어 계산·렌더 ──
    if ($('sj-pillars')) {
      var params = new URLSearchParams(window.location.search);
      var dv = params.get('d');
      var mp = dv ? dv.split('-').map(Number) : null;
      if (!mp || mp.length < 3 || !(mp[0] >= 1900 && mp[0] <= 2100)) {
        window.location.replace('/saju'); return;   // 잘못된/직접 진입 → 입력 페이지로
      }
      var noTime = params.get('nt') === '1';
      var tp = (params.get('t') || '12:0').split(':');
      render(compute({ y: mp[0], m: mp[1], d: mp[2], hh: +tp[0], mm: +tp[1], timeKnown: !noTime }));
    }

    function pillarCol(label, pl) {
      if (!pl) {
        return '<div class="sj-col"><div class="sj-col-label">' + label + '</div>' +
          '<div class="sj-unknown">시간<br>모름</div></div>';
      }
      var s = STEMS[pl.stem], b = BRANCHES[pl.branch];
      return '<div class="sj-col">' +
        '<div class="sj-col-label">' + label + '</div>' +
        '<div class="sj-glyph" style="background:' + ELEMENTS[s.el].color + '; color:' + ELEMENTS[s.el].ink + ';">' + s.hj +
          '<span>' + s.ko + ' · ' + ELEMENTS[s.el].ko + '</span></div>' +
        '<div class="sj-glyph" style="background:' + ELEMENTS[b.el].color + '; color:' + ELEMENTS[b.el].ink + ';">' + b.hj +
          '<span>' + b.ko + ' · ' + ELEMENTS[b.el].ko + '</span></div>' +
        '</div>';
    }

    function charCard(ch, isMain) {
      var el = ELEMENTS[ch.el];
      return '<div class="sj-char" style="background:' + el.light + '; border-color:' + el.text + '33;">' +
        '<div class="sj-char-head">' +
          '<div class="sj-char-emoji" style="background:' + el.color + ';">' + ch.emoji + '</div>' +
          '<div><div class="sj-char-tag" style="color:' + el.text + ';">' +
            (isMain ? '추천 캐릭터' : '함께 추천') + ' · ' + el.ko + '(' + el.hj + ')의 캐릭터</div>' +
          '<div class="sj-char-name">' + ch.name + ' <span>' + ch.type + '</span></div></div>' +
        '</div>' +
        '<p class="sj-char-desc">' + ch.long + '</p>' +
        '<blockquote class="sj-char-quote" style="border-color:' + el.text + ';">' +
          ch.quote.replace('\n', '<br>') + '</blockquote>' +
        '<div class="sj-char-goods"><div class="sj-goods-label">이런 아이템으로 만나요</div>' +
          ch.products.map(function (g) { return '<span class="sj-pill">' + g + '</span>'; }).join('') +
        '</div>' +
        '<a href="' + SHOP_URL + '" target="_blank" rel="noopener noreferrer" class="sj-cta" style="background:' + el.color + '; color:' + el.ink + ';">' +
          ch.cta + ' <span class="msym" aria-hidden="true" style="font-size:17px;">shopping_bag</span></a>' +
        '<div class="sj-char-note">※ ' + ch.name + ' 굿즈 스토어로 이동해요. (임시 연결 · 상품 순차 입점 예정)</div>' +
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
          '<span class="sj-el-name" style="color:' + el.text + ';">' + el.ko + ' ' + el.hj + '</span>' +
          '<span class="sj-el-bar"><span style="width:' + Math.max(w, c ? 6 : 0) + '%; background:' + el.color + ';"></span></span>' +
          '<span class="sj-el-count">' + c + '개</span></div>';
      }).join('');

      // 가장 풍성한 기운 (강점 먼저, 기분 좋게)
      var strongEl = 0, maxc = -1;
      r.counts.forEach(function (c, i) { if (c > maxc) { maxc = c; strongEl = i; } });
      var sEl = ELEMENTS[strongEl];
      $('sj-strong').innerHTML =
        '<div class="sj-strong-card" style="background:' + sEl.light + '; border-color:' + sEl.text + '33;">' +
        '<div class="sj-strong-badge" style="background:' + sEl.color + '; color:' + sEl.ink + ';">' + sEl.hj + '</div>' +
        '<div><div class="sj-strong-tag" style="color:' + sEl.text + ';">가장 풍성한 기운 · ' +
          sEl.ko + '(' + sEl.hj + ')</div>' +
        '<p class="sj-strong-msg">' + sEl.strong.replace(/\n\n/g, '<br><br>') + '</p></div></div>';

      // 부족 오행 + 캐릭터 추천
      var rec = recommend(r.counts, STEMS[pl.day.stem].el);
      var lackEl = ELEMENTS[rec.main.el];
      var lackNames = rec.lacking.map(function (i) { return '"' + ELEMENTS[i].ko + '"'; }).join(', ');

      $('sj-lack-title').innerHTML =
        '지금 당신에게 살짝 부족한 오행은<br><strong style="color:' +
        lackEl.text + ';">' + lackNames + '</strong> 이에요!';
      $('sj-lack-desc').innerHTML =
        '<b style="color:' + lackEl.text + ';">' + lackEl.ko + '(' + lackEl.hj + ')</b>은 ' +
        lackEl.symbols + '의 기운이에요.<br><br>' + rec.main.lackMsg.replace(/\n\n/g, '<br><br>');
      var lackCard = $('sj-lack-card');
      if (lackCard) {
        // 흰 카드 + 색 스파인(좌측 액센트) — 아래 채워진 캐릭터 카드와 확실히 구분
        lackCard.style.borderLeftColor = lackEl.color;
      }

      // ── 음양(陰陽) 밸런스 — 기존 팔자에서 집계 (음양 스펙 문서 기준) ──────
      //   천간: STEMS[i].yang (겉으로 드러나는 기질) · 지지: 인덱스 짝수(자·인·진·오·신·술)=양 (속·생활 리듬)
      //   보정 참고로 일간(나 자신) 음양 + 월지 계절 음양감을 함께 표시. 단정·우열 판단은 피한다.
      var stemY = 0, branchY = 0, eyN = 0;
      [pl.year, pl.month, pl.day].concat(pl.hour ? [pl.hour] : []).forEach(function (p) {
        if (STEMS[p.stem].yang) stemY++;
        if (p.branch % 2 === 0) branchY++;
        eyN++;
      });
      var stemE = eyN - stemY, branchE = eyN - branchY;
      var yang = stemY + branchY, eyTotal = eyN * 2, eum = eyTotal - yang, yp = yang / eyTotal;
      var YANG_C = ELEMENTS[1].color, EUM_C = ELEMENTS[4].color; // 화 적 / 수 흑

      // 기본 유형 라벨 (스펙 §7: 개수차 기준 — 6·8글자 공통)
      var eyDiff = Math.abs(yang - eum), eySideC = yang >= eum ? YANG_C : EUM_C;
      var eyType = eyDiff === 0 ? '음양 균형형'
        : (yang > eum ? '陽' : '陰') + ' 기운이 ' + (eyDiff >= 6 ? '매우 강한' : eyDiff >= 4 ? '강한' : '조금 강한') + ' 구조';

      // 본문 (스펙 §11·§12·§13 — 좋고 나쁨 아님, 방향성으로만)
      var eyMsg;
      if (yp > 0.5) {
        eyMsg = '<b style="color:' + YANG_C + ';">양(陽)</b>은 발산·표현·행동·확장의 방향이에요. 생각을 안에만 두기보다 밖으로 움직이며 풀어가는 힘이 강한 편으로 볼 수 있어요.';
      } else if (yp < 0.5) {
        eyMsg = '<b style="color:' + EUM_C + ';">음(陰)</b>은 수렴·저장·내면·정리의 방향이에요. 빠르게 드러내기보다 안에서 깊이 정리하고 관찰한 뒤 움직이는 편으로 볼 수 있어요.';
      } else {
        eyMsg = '양(발산·표현)과 음(수렴·정리)의 개수가 균형을 이뤄요. 상황에 따라 밖으로 움직이는 힘과 안에서 정리하는 힘을 함께 쓰는 결로 볼 수 있어요.';
      }

      // 보정 참고: 나 자신 / 태어난 계절 — 어려운 한자어 없이 쉬운 말로
      var dayYang = STEMS[pl.day.stem].yang;
      var season = (function (bi) { return (bi >= 2 && bi <= 4) ? '봄' : (bi >= 5 && bi <= 7) ? '여름' : (bi >= 8 && bi <= 10) ? '가을' : '겨울'; })(pl.month.branch);
      var seasonPlain = { '봄': '새로 피어나는 때', '여름': '가장 뜨거운 때', '가을': '차분히 거두는 때', '겨울': '깊이 가라앉는 때' }[season];
      var eyDetail =
        '<div class="sj-ey-detail">' +
          '<div><span>겉으로 드러나는 나</span>양 ' + stemY + ' · 음 ' + stemE + '</div>' +
          '<div><span>속마음 · 생활 리듬</span>양 ' + branchY + ' · 음 ' + branchE + '</div>' +
          '<div><span>나를 나타내는 기운</span>' + (dayYang ? '먼저 나서고 표현하는 쪽' : '차분히 살피고 정리하는 쪽') + '</div>' +
          '<div><span>태어난 계절</span>' + season + ' · ' + seasonPlain + '</div>' +
        '</div>';

      // 캐릭터 추천은 맨 아래 '부족한 기운' 섹션에서 한 번만 — 여기선 캐릭터 언급 없음.
      var eyEl = $('sj-eumyang');
      if (eyEl) {
        eyEl.innerHTML =
          '<div class="sj-ey-head">' +
            '<span style="color:' + YANG_C + ';">陽 양 <b>' + yang + '</b></span>' +
            '<span style="color:' + EUM_C + ';"><b>' + eum + '</b> 음 陰</span>' +
          '</div>' +
          '<div class="sj-ey-bar">' +
            '<span class="sj-ey-seg" style="width:' + (yp * 100) + '%; background:' + YANG_C + ';"></span>' +
            '<span class="sj-ey-seg" style="width:' + ((1 - yp) * 100) + '%; background:' + EUM_C + ';"></span>' +
          '</div>' +
          '<div class="sj-ey-typerow"><span class="sj-ey-type" style="color:' + eySideC + '; border-color:' + eySideC + '55;">' + eyType + '</span></div>' +
          '<p class="sj-ey-msg">' + eyMsg + '</p>' +
          eyDetail;
      }

      var vibe = '<div class="sj-vibe"><div class="sj-vibe-label">나를 위한 해시태그 🏷️</div>' +
        '<div class="sj-vibe-pills">' +
        rec.main.whenLow.map(function (w) { return '<span class="sj-vibe-pill">' + w + '</span>'; }).join('') +
        '</div></div>';
      var vibeTop = $('sj-vibe-top');
      if (vibeTop) vibeTop.innerHTML = vibe;

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
