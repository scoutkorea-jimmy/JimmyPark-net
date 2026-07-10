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
  // yang = 용(用·실전) 기준 음양 — 지장간 정기(십성 관행)로 판정.
  // 체용전도: 자·오는 체(體)로는 양이지만 정기가 계수·정화라 음으로,
  // 사·해는 체로는 음이지만 정기가 병화·임수라 양으로 쓴다. (2026-07-10 채택)
  var BRANCHES = [
    { ko: '자', hj: '子', el: 4, animal: '쥐', yang: false },
    { ko: '축', hj: '丑', el: 2, animal: '소', yang: false },
    { ko: '인', hj: '寅', el: 0, animal: '호랑이', yang: true },
    { ko: '묘', hj: '卯', el: 0, animal: '토끼', yang: false },
    { ko: '진', hj: '辰', el: 2, animal: '용', yang: true },
    { ko: '사', hj: '巳', el: 1, animal: '뱀', yang: true },
    { ko: '오', hj: '午', el: 1, animal: '말', yang: false },
    { ko: '미', hj: '未', el: 2, animal: '양', yang: false },
    { ko: '신', hj: '申', el: 3, animal: '원숭이', yang: true },
    { ko: '유', hj: '酉', el: 3, animal: '닭', yang: false },
    { ko: '술', hj: '戌', el: 2, animal: '개', yang: true },
    { ko: '해', hj: '亥', el: 4, animal: '돼지', yang: true }
  ];
  // 오행 (기획서 §3.4 상징 / 색은 /saju 전용 비비드 팔레트 — Open Color 계열)
  // strong: 그 기운이 풍성할 때의 강점 (유쾌하고 기분 좋게)
  var ELEMENTS = [
    { ko: '목', hj: '木', color: '#2f9e44', text: '#2f9e44', ink: '#ffffff', light: '#e9fbef', symbols: '성장 · 확장 · 생명력',
      strong: '목(木)이 넉넉한 당신은 새로운 시작 앞에서 눈이 반짝이고, 작은 아이디어도 근사한 결과로 키워내는 사람이에요. 어디서든 "일단 해보자!"라는 말로 분위기를 앞으로 끌고 가고, 어제보다 조금 자란 오늘에서 진짜 기쁨을 느끼죠. 곁에 있는 사람들에게는 봄바람 같은 활력을 나눠주는 존재라, 당신이 움직이면 주변도 함께 자라나요. 지금처럼 계속 씨앗을 심어가면 돼요 — 당신의 봄은 아직 한창이니까요!' },
    { ko: '화', hj: '火', color: '#e8352e', text: '#e8352e', ink: '#ffffff', light: '#fff1f0', symbols: '표현 · 열정 · 빛',
      strong: '화(火)가 넉넉한 당신은 감정이 솔직해서, 함께 있으면 분위기가 금세 환해지는 사람이에요. 기쁘면 기쁜 대로, 좋으면 좋은 대로 표현할 줄 알아서 사람들은 당신 앞에서 마음이 편해지죠. 한번 열정에 불이 붙으면 놀라운 몰입을 보여주는 타입이라, 일이든 취미든 당신이 진심을 켜는 순간 공기가 달라져요. 그 반짝임을 아끼지 말고 마음껏 빛내면 돼요 — 오늘도 당신은 충분히 눈부셔요!' },
    { ko: '토', hj: '土', color: '#f5b800', text: '#b07d00', ink: '#4a3800', light: '#fff7d6', symbols: '안정 · 균형 · 기반',
      strong: '토(土)가 넉넉한 당신은 차분히 중심을 잡고 맡은 일은 끝까지 책임지는, 어디서든 든든한 땅 같은 사람이에요. 급할수록 오히려 침착해지고, 흔들리는 사람 곁에서 "괜찮아, 천천히 하자" 하고 말해줄 줄 알죠. 화려하게 나서진 않아도 시간이 지날수록 진가가 드러나는, 오래 볼수록 더 좋은 사람이에요. 당신만의 속도로 단단히 걸어가면 돼요 — 오늘도 충분히 단단해요!' },
    { ko: '금', hj: '金', color: '#c3cad1', text: '#8a929b', ink: '#454b52', light: '#f2f4f6', symbols: '판단 · 절제 · 구조',
      strong: '금(金)이 넉넉한 당신은 복잡한 걸 깔끔히 정리하고 핵심을 짚어내는 감각이 뛰어난 사람이에요. 다들 헤맬 때 "그래서 중요한 건 이거지" 하고 길을 내주는, 흐트러진 자리를 반듯하게 만드는 힘이 있죠. 겉은 서늘해 보여도 아끼는 사람에게는 누구보다 의리 있는 타입이에요. 당신만의 기준을 믿고 나아가면 돼요 — 오늘도 충분히 또렷하게 빛나요!' },
    { ko: '수', hj: '水', color: '#2b2f36', text: '#2b2f36', ink: '#ffffff', light: '#eef0f2', symbols: '지혜 · 흐름 · 직관',
      strong: '수(水)가 넉넉한 당신은 흐름을 읽어내는 지혜를 가진, 깊고 잔잔한 물 같은 사람이에요. 말수가 많지 않아도 한마디가 오래 남고, 사람 마음의 밑바닥을 알아채는 섬세한 감각이 있죠. 막힌 길 앞에서도 돌아 흐르는 물처럼 유연하게 답을 찾아내는 타입이에요. 당신만의 리듬으로 흘러가면 돼요 — 오늘도 충분히 깊고 아름다워요!' }
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
    // 자리별 가중 점수표 (2026-07-10 사용자 지시): 지지 — 년 10 · 월 30 · 일 15 ·
    // 시 15 / 천간 — 연·월·일·시간 각 10. (표 합계는 110이라 표기는 %로 환산;
    // 시간 모름이면 시주 25점 제외 후 85점을 100%로.) 풍성/부족 판정·캐릭터
    // 추천이 모두 이 가중 점수를 쓴다. 음양 카드는 글자 개수 그대로(비가중).
    var WEIGHTS = {
      stem: { year: 10, month: 10, day: 10, hour: 10 },
      branch: { year: 10, month: 30, day: 15, hour: 15 }
    };
    var counts = [0, 0, 0, 0, 0];
    var wPillars = [['year', yearP], ['month', monthP], ['day', dayP]];
    if (hourP) wPillars.push(['hour', hourP]);
    wPillars.forEach(function (kv) {
      counts[STEMS[kv[1].stem].el] += WEIGHTS.stem[kv[0]];
      counts[BRANCHES[kv[1].branch].el] += WEIGHTS.branch[kv[0]];
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
      whenLow: ['#하고싶은건많아', '#신중하게시작하는편', '#돌다리두드려보는편', '#천천히가도괜찮아', '#설렘은늘가득', '#작은한걸음부터', '#언젠가는꼭', '#가능성은무한', '#내속도가있어', '#준비되면시작', '#새싹처럼자라는중', '#모리와함께'],
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
      whenLow: ['#속으론할말많아', '#조용한관찰자', '#표현은아껴서더진심', '#리액션은마음속에', '#내사람한텐진심', '#은근한매력파', '#다정한게티나', '#천천히마음열어', '#따뜻한사람', '#가끔은솔직하게', '#반짝일준비', '#루아와함께'],
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
      whenLow: ['#하고싶은게너무많아', '#관심사가풍부한편', '#탭여러개파', '#호기심은재능', '#이것저것다재밌어', '#한번에하나씩', '#차근차근가는중', '#내페이스대로', '#언젠가다이룰거야', '#든든해지는중', '#바쁘게산하루', '#두리와함께'],
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
      whenLow: ['#다좋아보여서고민', '#장바구니는나의로망', '#고민많은다정한사람', '#뭐든소중히여겨', '#천천히골라도돼', '#내기준찾는중', '#선택도연습이야', '#마음이넓어서그래', '#조금씩덜어가는중', '#신중한선택파', '#또렷해지는중', '#세라와함께'],
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
      whenLow: ['#열심히사는사람', '#쉬는것도용기야', '#할일이늘많아', '#가끔은나도쉬어야지', '#10분쉼표어때', '#성실한게내매력', '#바쁜만큼멋진사람', '#잘쉬는게이기는거', '#나를위한멈춤', '#충전이필요해', '#토닥토닥나에게', '#노아와함께'],
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

  // 상세 분석 페이지용 오행별 생활 언어: gift(이 기운이 주는 힘) · tip(기분 좋게 채우는 법)
  var EL_DETAIL = [
    { gift: '새로 시작하고 키워내는 힘', tip: '초록이 보이는 산책, 화분 하나 들이기, 아주 작은 새 도전 — 목(木)의 기운은 "작은 시작"에서 자라나요.' },
    { gift: '표현하고 빛나게 하는 힘', tip: '좋아하는 사람들과의 수다, 몸이 데워지는 운동, 솔직한 감정 표현 한 번 — 화(火)의 기운은 표현할수록 밝아져요.' },
    { gift: '중심을 잡고 지켜내는 힘', tip: '나만의 루틴 하나, 책상 정리, 흙과 자연을 밟는 시간 — 토(土)의 기운은 반복되는 작은 약속에서 단단해져요.' },
    { gift: '정리하고 매듭짓는 힘', tip: '오늘 할 일 세 가지만 고르기, 안 쓰는 물건 비우기, 깔끔한 마무리 한 번 — 금(金)의 기운은 덜어낼수록 또렷해져요.' },
    { gift: '쉬어가며 깊어지는 힘', tip: '충분한 잠, 물가 산책, 조용한 독서 10분 — 수(水)의 기운은 잘 쉬는 만큼 깊어져요.' }
  ];

  // 상세 분석: 일간(日干) 10글자 프로필 — 오행이 아니라 글자 단위의 상(象)
  var STEM_PROFILE = [
    { sym: '곧게 뻗는 큰 나무', text: '위로 곧게 자라는 거목의 기운이라, 시작과 개척에 강하고 웬만해선 뜻을 굽히지 않는 단단한 심지가 있어요.' },
    { sym: '바람에 휘어도 꺾이지 않는 화초', text: '유연하게 감아 오르는 덩굴과 화초의 기운이라, 어떤 환경에서도 제 길을 찾아내는 섬세함과 강한 생존력이 있어요.' },
    { sym: '만물을 비추는 태양', text: '숨김없이 밝게 비추는 태양의 기운이라, 존재만으로 주변을 환하게 만들고 공명정대한 것을 좋아해요.' },
    { sym: '어둠을 밝히는 등불', text: '조용히 오래 타는 등불의 기운이라, 화려하진 않아도 꺼지지 않는 집중력과 깊은 온기를 지녔어요.' },
    { sym: '흔들림 없는 큰 산', text: '묵직하게 자리를 지키는 큰 산의 기운이라, 신뢰가 두텁고 품이 넓어 사람들이 자연스럽게 기대게 돼요.' },
    { sym: '만물을 기르는 옥토', text: '곡식을 길러내는 기름진 땅의 기운이라, 겸손하고 실속 있게 주변을 돌보는 힘이 있어요.' },
    { sym: '벼려질수록 단단해지는 무쇠', text: '두드릴수록 강해지는 무쇠의 기운이라, 결단력과 의리, 굵직한 추진력이 돋보여요.' },
    { sym: '세공을 마친 보석', text: '다듬어져 빛나는 보석의 기운이라, 예리한 감각과 정제된 완성도, 또렷한 자존감을 지녔어요.' },
    { sym: '크고 깊은 바다', text: '넓고 깊게 흐르는 바다의 기운이라, 담대한 포용력과 멀리 내다보는 지략이 있어요.' },
    { sym: '만물을 적시는 단비', text: '소리 없이 스며드는 빗물의 기운이라, 섬세한 통찰로 조용히 사람과 상황을 읽어내요.' }
  ];
  // 지장간(支藏干) — 각 지지에 담긴 천간(여기→정기 순, STEMS 인덱스)
  var JANGGAN = [
    [8, 9], [9, 7, 5], [4, 2, 0], [0, 1], [1, 9, 4], [4, 6, 2],
    [2, 5, 3], [3, 1, 5], [4, 8, 6], [6, 7], [7, 3, 4], [4, 0, 8]
  ];

  // 상세 분석: 오행별 '나와 잘 맞는 것들' (풍성한 기운을 잘 쓰는 법)
  var EL_FIT = [
    '새로 배우고 시작하는 환경과 잘 맞아요. 무언가를 자라게 하는 일 — 기획, 교육, 콘텐츠, 프로젝트의 초반 설계 — 에서 힘이 나고, 아침 시간대의 몰입과 초록이 보이는 공간에서 컨디션이 올라와요. 함께 성장 이야기를 나눌 수 있는 사람들 곁에서 가장 나다워져요.',
    '사람들 앞에 서고 표현하는 자리와 잘 맞아요. 발표, 공연, 브랜딩, SNS처럼 반응이 오가는 일에서 힘이 나고, 밝은 조명과 활기 있는 모임에서 에너지가 차올라요. 감정을 솔직하게 나눌 수 있는 관계에서 가장 빛나요.',
    '꾸준함이 쌓여 결과가 되는 일과 잘 맞아요. 운영, 관리, 돌봄처럼 신뢰가 자산이 되는 자리에서 힘이 나고, 익숙한 공간에서 나만의 루틴을 지킬 때 마음이 안정돼요. 오래 두고 보는 관계에서 진가가 드러나요.',
    '기준을 세우고 다듬는 일과 잘 맞아요. 편집, 정리, 품질을 끌어올리는 작업, 마감이 분명한 일에서 힘이 나고, 군더더기 없는 깔끔한 환경에서 집중이 잘 돼요. 서로의 선을 존중하는 담백한 관계가 편안해요.',
    '깊이 파고드는 일과 잘 맞아요. 연구, 글쓰기, 전략처럼 흐름을 읽는 일에서 힘이 나고, 조용한 저녁 시간과 물 가까운 공간에서 생각이 맑아져요. 말수가 적어도 마음이 통하는 관계에서 가장 편안해요.'
  ];

  // 상세 분석: 오행별 컬러 팔레트 + 추천 아이템 (부족 기운 채우기용)
  var EL_STYLE = [
    { colors: [{ c: '#2f9e44', n: '포레스트 그린' }, { c: '#94d82d', n: '라임' }, { c: '#6b8e23', n: '올리브' }], items: '미니 화분(플랜테리어), 그린 톤 폰케이스, 초록 잉크 펜' },
    { colors: [{ c: '#e8352e', n: '코럴 레드' }, { c: '#ff8787', n: '살몬 핑크' }, { c: '#ff922b', n: '선셋 오렌지' }], items: '레드 포인트 립·양말, 코럴 키링, 따뜻한 캔들 라이트' },
    { colors: [{ c: '#f5b800', n: '머스터드 옐로우' }, { c: '#e8d8b0', n: '베이지' }, { c: '#d9773f', n: '테라코타' }], items: '베이지 니트, 옐로우 머그, 우드 톤 데스크 소품' },
    { colors: [{ c: '#f1f3f5', n: '화이트' }, { c: '#c3cad1', n: '실버' }, { c: '#868e96', n: '쿨 그레이' }], items: '실버 액세서리, 화이트 데스크 셋업, 메탈 텀블러' },
    { colors: [{ c: '#1864ab', n: '딥 블루' }, { c: '#243b6b', n: '네이비' }, { c: '#212529', n: '블랙' }], items: '데님·네이비 아이템, 블랙 폰케이스, 늘 곁에 두는 물병' }
  ];

  // 지지 12글자의 상(象) — 글자 사전용 한 줄 뜻
  var BRANCH_SYM = [
    '한겨울의 깊은 물 · 쥐', '언 땅을 품은 흙 · 소', '이른 봄의 큰 나무 · 호랑이', '봄 들판의 초목 · 토끼',
    '봄비를 머금은 흙 · 용', '초여름의 뻗는 불 · 뱀', '한낮의 뜨거운 불 · 말', '여름 끝의 마른 흙 · 양',
    '단단하게 여문 쇠 · 원숭이', '세공된 금속과 보석 · 닭', '가을걷이 끝난 흙 · 개', '겨울로 흐르는 큰물 · 돼지'
  ];

  // 오행별 전통 배속 — 방위·숫자·계절 (행운 포인트)
  var EL_LUCK = [
    { dir: '동쪽', num: '3 · 8', season: '봄' },
    { dir: '남쪽', num: '2 · 7', season: '여름' },
    { dir: '중앙', num: '5 · 10', season: '환절기' },
    { dir: '서쪽', num: '4 · 9', season: '가을' },
    { dir: '북쪽', num: '1 · 6', season: '겨울' }
  ];

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

    // ── 일일 방문자 카운트 (두 페이지 공통 · IP 해시로 하루 1회) ──
    // 사주 입력값과 무관한 방문 신호만 보낸다. 표시 요소(#sj-visits)는 입력 페이지에만 있음.
    try {
      fetch('/api/saju-visit', { method: 'POST' })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (j) {
          var box = $('sj-visits');
          if (!j || !box) return;
          box.innerHTML = '지금까지 <b>' + (j.total || 0).toLocaleString('ko-KR') + '명</b>이 확인했어요 · 오늘 <b>' +
            (j.today || 0).toLocaleString('ko-KR') + '명</b>';
          box.style.display = '';
        })
        .catch(function () {});
    } catch (e) {}

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

    // ── 상세 분석 페이지(saju-detail.html): 쿼리스트링에서 읽어 계산·렌더 ──
    if ($('sjd-summary')) {
      var dq = new URLSearchParams(window.location.search);
      var ddv = dq.get('d');
      var dmp = ddv ? ddv.split('-').map(Number) : null;
      if (!dmp || dmp.length < 3 || !(dmp[0] >= 1900 && dmp[0] <= 2100)) {
        window.location.replace('/saju'); return;
      }
      var dNoTime = dq.get('nt') === '1';
      var dtp = (dq.get('t') || '12:0').split(':');
      renderDetail(compute({ y: dmp[0], m: dmp[1], d: dmp[2], hh: +dtp[0], mm: +dtp[1], timeKnown: !dNoTime }));
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

    function charCard(ch, isMain, whyHtml) {
      var el = ELEMENTS[ch.el];
      return '<div class="sj-char" style="background:' + el.light + '; border-color:' + el.text + '33;">' +
        '<div class="sj-char-head">' +
          '<div class="sj-char-emoji" style="background:' + el.color + ';">' + ch.emoji + '</div>' +
          '<div><div class="sj-char-tag" style="color:' + el.text + ';">' +
            (isMain ? '추천 캐릭터' : '함께 추천') + ' · ' + el.ko + '(' + el.hj + ')의 캐릭터</div>' +
          '<div class="sj-char-name">' + ch.name + ' <span>' + ch.type + '</span></div></div>' +
        '</div>' +
        (whyHtml ? '<div class="sj-char-why">' + whyHtml + '</div>' : '') +
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

      // 오행 분포 그래프 — 자리별 가중 점수를 100% 기준 %로 표기
      var total = r.counts.reduce(function (a, b) { return a + b; }, 0);
      $('sj-elements').innerHTML = ELEMENTS.map(function (el, i) {
        var c = r.counts[i], w = total ? Math.round(c / total * 100) : 0;
        return '<div class="sj-el-row">' +
          '<span class="sj-el-name" style="color:' + el.text + ';">' + el.ko + ' ' + el.hj + '</span>' +
          '<span class="sj-el-bar"><span style="width:' + Math.max(w, c ? 6 : 0) + '%; background:' + el.color + ';"></span></span>' +
          '<span class="sj-el-count">' + w + '%</span></div>';
      }).join('') +
        '<p class="sj-ey-note">※ 자리마다 힘이 달라 비중을 달리해 집계했어요 — 월지 30 · 일지 15 · 시지 15 · 년지 10 · 천간(연간·월간·일간·시간) 각 10. 전체 합을 100%로 환산해 표기하며' +
        (r.meta.timeKnown ? '' : ' (시간을 몰라 시주는 제외)') +
        ', 풍성한 기운·부족한 기운 판정에도 같은 비중이 반영돼요.</p>';

      // 가장 풍성한 기운 (강점 먼저, 기분 좋게)
      var strongEl = 0, maxc = -1;
      r.counts.forEach(function (c, i) { if (c > maxc) { maxc = c; strongEl = i; } });
      var sEl = ELEMENTS[strongEl];

      // 나를 나타내는 기운 = 일간(일주 천간)의 오행 — 최상단 캐릭터·배경의 기준
      // (개수가 가장 많은 오행이 아니라, 명리학에서 '나 자신'을 뜻하는 일간 기준)
      var dayEl = STEMS[pl.day.stem].el;
      var dEl = ELEMENTS[dayEl];

      // 결과 페이지 배경 그라데이션 — 화=빨강·목=초록·토=노랑·금=골드·수=파랑
      // (카드/글리프는 전통 오방색 유지, 배경만 보기 좋은 톤으로: 수 흑→파랑, 금 은→골드)
      var GLOW_COLORS = ['#2f9e44', '#e8352e', '#f5b800', '#e3b341', '#3b82f6'];
      var glow = document.querySelector('.sj-glow');
      if (glow) {
        var gc = GLOW_COLORS[dayEl].replace('#', '');
        var gr = parseInt(gc.substr(0, 2), 16), gg = parseInt(gc.substr(2, 2), 16), gb = parseInt(gc.substr(4, 2), 16);
        var lum = (0.299 * gr + 0.587 * gg + 0.114 * gb) / 255;         // 밝기
        var a1 = lum > 0.72 ? 0.5 : lum < 0.28 ? 0.22 : 0.34;           // 밝은색↑ 어두운색↓ 로 보정
        var rgb = gr + ',' + gg + ',' + gb;
        glow.style.background =
          'radial-gradient(circle at 28% 22%, rgba(' + rgb + ',' + a1 + '), transparent 58%),' +
          'radial-gradient(circle at 76% 56%, rgba(' + rgb + ',' + (a1 * 0.5).toFixed(3) + '), transparent 62%)';
      }

      // 최상단 엠블럼 — 일간(일주 천간) 오행의 캐릭터 (이미지 없으면 자동 숨김)
      var emblemEl = $('sj-strong-emblem');
      if (emblemEl) {
        var emKey = ['wood', 'fire', 'earth', 'metal', 'water'][dayEl];
        emblemEl.innerHTML =
          '<img class="sj-emblem-img" src="/assets/img/saju-el-' + emKey + '.png" ' +
          'alt="나의 일간 ' + dEl.ko + '(' + dEl.hj + ') 기운 캐릭터" ' +
          'onerror="var e=this.closest(\'.sj-emblem\'); if(e) e.style.display=\'none\';">' +
          '<div class="sj-emblem-cap" style="color:' + dEl.text + ';">나를 나타내는 기운 · ' +
          dEl.ko + '(' + dEl.hj + ') <span>일간(일주 천간) 기준</span></div>';
      }

      // ① 풍성한 기운 카드 (강점 서사) + ② 별도 문단: 전체 오행 구성 분석
      //    (분포 형태 · 상위 두 기운의 상생/상극 · 옅은 기운 — 실제 % 기반 동적 생성)
      var ovOrder = [0, 1, 2, 3, 4].sort(function (a, b) { return r.counts[b] - r.counts[a]; });
      var pctOf = function (i) { return total ? Math.round(r.counts[i] / total * 100) : 0; };
      var nm = function (i) { return '<b style="color:' + ELEMENTS[i].text + ';">' + ELEMENTS[i].ko + '(' + ELEMENTS[i].hj + ')</b>'; };
      var t1 = ovOrder[0], t2 = ovOrder[1], lo = ovOrder[4];
      var ovShape;
      if (pctOf(t1) - pctOf(lo) <= 15) {
        ovShape = '당신의 사주는 다섯 기운이 비교적 고르게 어우러진 <b>균형형</b>이에요. 상황에 따라 여러 결을 유연하게 꺼내 쓰는, 팔색조 같은 구성이죠.';
      } else if (pctOf(t1) >= 40) {
        ovShape = '당신의 사주는 ' + nm(t1) + ' 쪽으로 힘이 뚜렷하게 모인 <b>집중형</b>(' + pctOf(t1) + '%)이에요. 좋아하는 것과 잘하는 것이 분명한, 색깔 있는 구성이죠.';
      } else {
        ovShape = '당신의 사주는 ' + nm(t1) + '(' + pctOf(t1) + '%)를 중심으로 완만하게 기울어진 구성이에요. 중심 기운이 방향을 잡고 나머지 기운들이 받쳐주는 안정적인 형태죠.';
      }
      // 조사 선택 (목·금 = 받침 있음)
      var BATCHIM = [true, false, false, true, false];
      var ga = function (i) { return BATCHIM[i] ? '이' : '가'; };
      var eul = function (i) { return BATCHIM[i] ? '을' : '를'; };
      var ovRel, dTop = mod(t2 - t1, 5);
      if (dTop === 1 || dTop === 4) {
        var giver = dTop === 1 ? t1 : t2, taker = dTop === 1 ? t2 : t1;
        ovRel = '가장 강한 두 기운 ' + nm(t1) + '·' + nm(t2) + '는 ' + nm(giver) + ga(giver) + ' ' + nm(taker) + eul(taker) + ' 살려주는 <b>상생</b> 관계라, 힘이 한 방향으로 자연스럽게 이어지며 시너지를 내요. ' +
          ELEMENTS[t1].symbols + '의 힘과 ' + ELEMENTS[t2].symbols + '의 힘이 서로를 밀어주는 그림이죠.';
      } else {
        ovRel = '가장 강한 두 기운 ' + nm(t1) + '·' + nm(t2) + '는 서로 견제하는 <b>상극</b> 관계예요. 내 안에 ' +
          ELEMENTS[t1].symbols + '의 힘과 ' + ELEMENTS[t2].symbols + '의 힘이라는 서로 다른 두 목소리가 공존한다는 뜻이라, 그만큼 입체적이고 반전 매력이 있는 구성이죠.';
      }
      var ovLow = '반대로 ' + nm(lo) + ' 기운은 ' + pctOf(lo) + '%로 ' +
        (r.counts[lo] === 0 ? '거의 비어 있는 자리인데' : '가장 옅은 자리인데') +
        ', 이 얘기는 아래 “부족한 기운”에서 캐릭터랑 같이 이어서 볼게요.';

      $('sj-strong').innerHTML =
        '<div class="sj-strong-card" style="background:' + sEl.light + '; border-color:' + sEl.text + '33;">' +
        '<div class="sj-strong-badge" style="background:' + sEl.color + '; color:' + sEl.ink + ';">' + sEl.hj + '</div>' +
        '<div><div class="sj-strong-tag" style="color:' + sEl.text + ';">가장 풍성한 기운 · ' +
          sEl.ko + '(' + sEl.hj + ') · ' + pctOf(strongEl) + '%</div>' +
        '<p class="sj-strong-msg">' + sEl.strong.replace(/\n\n/g, '<br><br>') + '</p></div></div>' +
        '<div class="sj-strong-card" style="background:#fff; border-color:var(--line);">' +
        '<div class="sj-strong-badge" style="background:#f2f0f7; color:var(--muted); font-size:26px;">五行</div>' +
        '<div><div class="sj-strong-tag" style="color:var(--muted);">나의 오행 구성 분석</div>' +
        '<p class="sj-strong-msg">' + ovShape + ' ' + ovRel + '<br><br>' + ovLow + '</p></div></div>' +
        '<a class="sj-retry" style="margin-top:12px;" href="/saju-detail' + window.location.search + '">' +
        '<span class="msym" aria-hidden="true" style="font-size:19px;">search_insights</span> 좀 더 자세히 분석 보기</a>';

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
      //   천간: STEMS[i].yang (겉으로 드러나는 기질) · 지지: BRANCHES[i].yang = 용(실전·체용전도) 기준
      //   (자·오=음, 사·해=양 — 2026-07-10 체 기준에서 교체). 카드 하단에 기준 각주 표기.
      //   보정 참고로 일간(나 자신) 음양 + 월지 계절 음양감을 함께 표시. 단정·우열 판단은 피한다.
      var stemY = 0, branchY = 0, eyN = 0;
      [pl.year, pl.month, pl.day].concat(pl.hour ? [pl.hour] : []).forEach(function (p) {
        if (STEMS[p.stem].yang) stemY++;
        if (BRANCHES[p.branch].yang) branchY++;
        eyN++;
      });
      var stemE = eyN - stemY, branchE = eyN - branchY;
      var yang = stemY + branchY, eyTotal = eyN * 2, eum = eyTotal - yang, yp = yang / eyTotal;
      var YANG_C = ELEMENTS[1].color, EUM_C = ELEMENTS[4].color; // 화 적 / 수 흑

      // 기본 유형 라벨 (스펙 §7: 개수차 기준 — 6·8글자 공통)
      var eyDiff = Math.abs(yang - eum), eySideC = yang >= eum ? YANG_C : EUM_C;
      var eyType = eyDiff === 0 ? '음양 균형형'
        : (yang > eum ? '양' : '음') + ' 기운이 ' + (eyDiff >= 6 ? '매우 강한' : eyDiff >= 4 ? '강한' : '조금 강한') + ' 구조';

      // 본문 (스펙 §11·§12·§13 — 좋고 나쁨 아님, 방향성으로만)
      var eyMsg;
      if (yp > 0.5) {
        eyMsg = '<b style="color:' + YANG_C + ';">양</b>은 발산·표현·행동·확장의 방향이에요. 생각을 안에만 두기보다 밖으로 움직이며 풀어가는 힘이 강한 편으로 볼 수 있어요.';
      } else if (yp < 0.5) {
        eyMsg = '<b style="color:' + EUM_C + ';">음</b>은 수렴·저장·내면·정리의 방향이에요. 빠르게 드러내기보다 안에서 깊이 정리하고 관찰한 뒤 움직이는 편으로 볼 수 있어요.';
      } else {
        eyMsg = '양(발산·표현)과 음(수렴·정리)의 개수가 균형을 이뤄요. 상황에 따라 밖으로 움직이는 힘과 안에서 정리하는 힘을 함께 쓰는 결로 볼 수 있어요.';
      }

      // 보정 참고: 나 자신 / 태어난 계절 — 어려운 한자어 없이 쉬운 말로
      var dayYang = STEMS[pl.day.stem].yang;
      var season = (function (bi) { return (bi >= 2 && bi <= 4) ? '봄' : (bi >= 5 && bi <= 7) ? '여름' : (bi >= 8 && bi <= 10) ? '가을' : '겨울'; })(pl.month.branch);
      var seasonPlain = { '봄': '새로 피어나는 때', '여름': '가장 뜨거운 때', '가을': '차분히 거두는 때', '겨울': '깊이 가라앉는 때' }[season];
      // 숫자만 두면 뜻을 모르니, 각 항목을 쉬운 문장으로 풀고 개수는 근거로 작게 붙임
      var stemPhrase = stemY > stemE ? '생각·감정을 밖으로 잘 드러내는 편' : stemY < stemE ? '겉으론 차분하고 신중해 보이는 편' : '상황 따라 유연하게 드러내는 편';
      var branchPhrase = branchY > branchE ? '평소 생활 리듬도 활동적인 편' : branchY < branchE ? '속으론 차근차근 쌓아가는 편' : '겉과 속의 리듬이 균형 잡힌 편';
      var eyDetail =
        '<div class="sj-ey-detail">' +
          '<div><span>겉으로 드러나는 나</span>' + stemPhrase + '<i>양 ' + stemY + ' · 음 ' + stemE + '</i></div>' +
          '<div><span>속마음 · 생활 리듬</span>' + branchPhrase + '<i>양 ' + branchY + ' · 음 ' + branchE + '</i></div>' +
          '<div><span>나를 나타내는 기운</span>' + (dayYang ? '먼저 나서고 표현하는 쪽' : '차분히 살피고 정리하는 쪽') + '<i>사주에서 나 자신을 뜻하는 글자</i></div>' +
          '<div><span>태어난 계절</span>' + season + ' · ' + seasonPlain + '<i>' + ((season === '봄' || season === '여름') ? '기운이 밖으로 뻗는 양의 계절' : '기운이 안으로 모이는 음의 계절') + '</i></div>' +
        '</div>';

      // 캐릭터 추천은 맨 아래 '부족한 기운' 섹션에서 한 번만 — 여기선 캐릭터 언급 없음.
      var eyEl = $('sj-eumyang');
      if (eyEl) {
        eyEl.innerHTML =
          '<div class="sj-ey-head">' +
            '<span style="color:' + YANG_C + ';">양 <b>' + yang + '</b></span>' +
            '<span style="color:' + EUM_C + ';"><b>' + eum + '</b> 음</span>' +
          '</div>' +
          '<div class="sj-ey-bar">' +
            '<span class="sj-ey-seg" style="width:' + (yp * 100) + '%; background:' + YANG_C + ';"></span>' +
            '<span class="sj-ey-seg" style="width:' + ((1 - yp) * 100) + '%; background:' + EUM_C + ';"></span>' +
          '</div>' +
          '<div class="sj-ey-typerow"><span class="sj-ey-type" style="color:' + eySideC + '; border-color:' + eySideC + '55;">' + eyType + '</span></div>' +
          '<p class="sj-ey-msg">' + eyMsg + '</p>' +
          eyDetail +
          '<p class="sj-ey-note">※ 지지의 음양은 실전 명리 관행(체용전도)대로 자(子)·오(午)=음, 사(巳)·해(亥)=양으로 집계했어요. 학파에 따라 체(體) 기준(자·오=양, 사·해=음)으로 보기도 해요.</p>';
      }

      var vibe = '<div class="sj-vibe"><div class="sj-vibe-label">나를 위한 해시태그</div>' +
        '<div class="sj-vibe-pills">' +
        rec.main.whenLow.map(function (w) { return '<span class="sj-vibe-pill">' + w + '</span>'; }).join('') +
        '</div></div>';
      var vibeTop = $('sj-vibe-top');
      if (vibeTop) vibeTop.innerHTML = vibe;

      // 추천 근거 멘트 — 부족 오행(무엇이 옅은지) + 음양 밸런스(어떤 결로 채울지)를 엮어서
      var eyState = yang > eum
        ? '양 기운이 강해 밖으로 뻗는 힘이 큰 편이에요'
        : yang < eum
          ? '음 기운이 강해 안으로 모이는 힘이 큰 편이에요'
          : '음과 양은 고르게 균형을 이루고 있어요';
      var needTone = yang > eum
        ? '그 힘이 흩어지지 않게 차분히 모아주는'
        : yang < eum
          ? '그 깊이를 밖으로 살짝 이끌어주는'
          : '그 균형 위에 부족한 기운만 살짝 얹어주는';
      var whyHtml =
        '지금 당신의 사주에는 ' + lackEl.symbols + '을 뜻하는 <b style="color:' + lackEl.text + ';">' +
        lackEl.ko + '(' + lackEl.hj + ')</b> 기운이 살짝 옅고, ' + eyState +
        '. 그래서 ' + needTone + ', ' + rec.main.roleShort + ' <b>' + rec.main.name + '</b>를 추천해요.';

      var html = charCard(rec.main, true, whyHtml);
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

    /* ── 상세 분석 페이지 렌더 (전반적으로 긍정 톤) ───────── */
    // 일간 기준 다섯 가지 힘 — 십성(十星)을 정식 명칭과 함께 쉬운 말로
    function roleOf(el, dayEl) {
      if (el === dayEl) return { name: '비겁', desc: '나와 어깨를 나란히 하는 힘 — 주체성 · 자립 · 내 페이스' };
      if (mod(el + 1, 5) === dayEl) return { name: '인성', desc: '나를 기르는 힘 — 배움 · 지혜 · 든든한 후원' };
      if (mod(dayEl + 1, 5) === el) return { name: '식상', desc: '내가 낳는 힘 — 표현 · 창의 · 재능' };
      if (mod(dayEl + 2, 5) === el) return { name: '재성', desc: '내가 거두는 힘 — 성과 · 실리 · 현실 감각' };
      return { name: '관성', desc: '나를 다듬는 힘 — 책임 · 명예 · 절제' };
    }

    function renderDetail(r) {
      var pl = r.pillars;
      var total = r.counts.reduce(function (a, b) { return a + b; }, 0);
      var pctOf = function (i) { return total ? Math.round(r.counts[i] / total * 100) : 0; };
      var nm = function (i) { return '<b style="color:' + ELEMENTS[i].text + ';">' + ELEMENTS[i].ko + '(' + ELEMENTS[i].hj + ')</b>'; };
      var order = [0, 1, 2, 3, 4].sort(function (a, b) { return r.counts[b] - r.counts[a]; });
      var t1 = order[0], lo = order[4];
      var dayEl = STEMS[pl.day.stem].el, dEl = ELEMENTS[dayEl];

      // 배경 글로우 = 일간 오행 (결과 페이지와 동일)
      var GLOW_COLORS = ['#2f9e44', '#e8352e', '#f5b800', '#e3b341', '#3b82f6'];
      var glow = document.querySelector('.sj-glow');
      if (glow) {
        var gc = GLOW_COLORS[dayEl].replace('#', '');
        var gr = parseInt(gc.substr(0, 2), 16), gg = parseInt(gc.substr(2, 2), 16), gb = parseInt(gc.substr(4, 2), 16);
        var lum = (0.299 * gr + 0.587 * gg + 0.114 * gb) / 255;
        var a1 = lum > 0.72 ? 0.5 : lum < 0.28 ? 0.22 : 0.34;
        var rgb = gr + ',' + gg + ',' + gb;
        glow.style.background =
          'radial-gradient(circle at 28% 22%, rgba(' + rgb + ',' + a1 + '), transparent 58%),' +
          'radial-gradient(circle at 76% 56%, rgba(' + rgb + ',' + (a1 * 0.5).toFixed(3) + '), transparent 62%)';
      }

      // 돌아가기 링크 = 같은 입력의 결과 페이지
      var backHref = '/saju-result' + window.location.search;
      var backEl = $('sjd-back'), toResEl = $('sjd-to-result');
      if (backEl) backEl.href = backHref;
      if (toResEl) toResEl.href = backHref;

      var yb = BRANCHES[pl.year.branch];
      $('sjd-headline').textContent =
        r.meta.sajuYear + '년 ' + STEMS[pl.year.stem].ko + yb.ko + '(' + STEMS[pl.year.stem].hj + yb.hj + ')년 · ' + yb.animal + '띠 상세 분석' +
        (r.meta.timeKnown ? '' : ' · 시간 미상(6글자 기준)');

      // 한눈 스탯 타일 3개 — 일간 · 최강 기운 · 보완 포인트
      var statsEl = $('sjd-stats');
      if (statsEl) {
        var tile = function (label, valHtml, sub, col) {
          return '<div class="sjd-stat"><span class="sjd-stat-l">' + label + '</span>' +
            '<span class="sjd-stat-v" style="color:' + col + ';">' + valHtml + '</span>' +
            '<span class="sjd-stat-s">' + sub + '</span></div>';
        };
        statsEl.innerHTML =
          tile('나의 중심 · 일간', STEMS[pl.day.stem].ko + '<em style="font-size:.62em;">(' + STEMS[pl.day.stem].hj + ')</em>', STEM_PROFILE[pl.day.stem].sym, ELEMENTS[dayEl].text) +
          tile('가장 풍성한 기운', ELEMENTS[t1].ko + ' <em>' + pctOf(t1) + '%</em>', '기본 장착된 엔진', ELEMENTS[t1].text) +
          tile('보완 포인트', ELEMENTS[lo].ko + ' <em>' + pctOf(lo) + '%</em>', '채우면 확 좋아지는 자리', ELEMENTS[lo].text);
      }

      // 최상단 엠블럼 — 결과 페이지와 동일하게 일간 오행의 캐릭터 (이미지 없으면 자동 숨김)
      var demblem = $('sjd-emblem');
      if (demblem) {
        var demKey = ['wood', 'fire', 'earth', 'metal', 'water'][dayEl];
        demblem.innerHTML =
          '<img class="sj-emblem-img" src="/assets/img/saju-el-' + demKey + '.png" ' +
          'alt="나의 일간 ' + dEl.ko + ' 기운 캐릭터" ' +
          'onerror="var e=this.closest(\'.sj-emblem\'); if(e) e.style.display=\'none\';">' +
          '<div class="sj-emblem-cap" style="color:' + dEl.text + ';">나를 나타내는 기운 · ' + dEl.ko + ' <span>일간 기준</span></div>';
      }

      // ① 총평 — 한자 없이, 일간 글자 프로필 + 구성 + 계절 + 보완 예고 (분량 2배)
      var kn = function (i) { return '<b style="color:' + ELEMENTS[i].text + ';">' + ELEMENTS[i].ko + '(' + ELEMENTS[i].hj + ')</b>'; };
      var dStem = STEMS[pl.day.stem], dProf = STEM_PROFILE[pl.day.stem];
      var season = (function (bi) { return (bi >= 2 && bi <= 4) ? '봄' : (bi >= 5 && bi <= 7) ? '여름' : (bi >= 8 && bi <= 10) ? '가을' : '겨울'; })(pl.month.branch);
      var seasonLine = { '봄': '움트는 계절이라 시작하는 일에 힘이 실리는', '여름': '만개하는 계절이라 표현과 확장에 힘이 실리는', '가을': '거두는 계절이라 결실과 정리에 힘이 실리는', '겨울': '갈무리하는 계절이라 축적과 깊이에 힘이 실리는' }[season];
      var shapeLine;
      if (pctOf(t1) - pctOf(lo) <= 15) shapeLine = '다섯 기운이 고르게 깔린 <b>올라운더 균형형</b>';
      else if (pctOf(t1) >= 40) shapeLine = kn(t1) + ' 기운에 힘을 확실하게 몰아준 <b>원픽 집중형</b>(' + pctOf(t1) + '%)';
      else shapeLine = kn(t1) + ' 기운(' + pctOf(t1) + '%)을 중심으로 완만하게 기운 <b>안정형</b>';
      $('sjd-summary').innerHTML =
        '<p class="sj-strong-msg" style="margin:0;">결론부터 말하면, 나의 중심 글자(일간)는 <b style="color:' + dEl.text + ';">' +
        dStem.ko + '(' + dStem.hj + ')</b> — <b>' + dProf.sym + '</b>이에요. ' + dProf.text +
        ' 여덟 글자 중에 "나 자신"을 가리키는 글자가 바로 이거라, 모든 해석은 여기서 출발해요.' +
        '<br><br>전체 구성은 ' + shapeLine + '이에요. 가장 풍성한 ' + kn(t1) + ' 기운 <b>' + pctOf(t1) +
        '%</b>는 굳이 애쓰지 않아도 나오는 힘이에요. 일이든 관계든 이 결로 갈 때 제일 잘 풀리고요. 게다가 ' +
        season + ' 태생 — ' + seasonLine + ' 무대까지 기본으로 깔려 있어요.' +
        '<br><br>반대로 가장 옅은 ' + kn(lo) + ' 기운 <b>' + pctOf(lo) +
        '%</b>는요? 모자란 게 아니라 아직 안 쓴 근육에 가까워요. 챙기는 순간 밸런스가 확 좋아지는 진짜 보완 포인트죠. 이제 네 기둥 → 합·충 케미 → 오행 순환 → 다섯 가지 힘 → 신살 → 올해의 흐름 순서로 하나씩 풀어볼게요. 마지막엔 나랑 잘 맞는 것들과 채우는 법까지.</p>';

      // ② 네 기둥 — 한국어 표현(뿌리·무대·나·열매) + 흐름 스트립 + 숨은 기운
      var chip = function (isStem, idx) {
        var g = isStem ? STEMS[idx] : BRANCHES[idx];
        var el = ELEMENTS[g.el];
        return '<span class="sjd-mg"><b style="background:' + el.color + '; color:' + el.ink + ';">' + g.hj + '</b>' +
          '<i>' + (isStem ? '하늘' : '땅') + ' ' + g.ko + ' · ' + el.ko + ' · ' + (g.yang ? '양' : '음') + '</i></span>';
      };
      // 글자 사전 — 이 기둥 두 글자의 뜻 한 줄씩
      var glyphMean = function (p2) {
        var sg = STEMS[p2.stem], bg = BRANCHES[p2.branch];
        return '<div class="sjd-gm">' +
          '<span><b style="color:' + ELEMENTS[sg.el].text + ';">' + sg.ko + '(' + sg.hj + ')</b>' + STEM_PROFILE[p2.stem].sym + '</span>' +
          '<span><b style="color:' + ELEMENTS[bg.el].text + ';">' + bg.ko + '(' + bg.hj + ')</b>' + BRANCH_SYM[p2.branch] + '</span></div>';
      };
      var jgLine = function (bi) {
        return '<div class="sjd-jg">숨은 기운(지장간) — 이 땅 글자 안에 함께 들어 있는 기운: ' + JANGGAN[bi].map(function (si) {
          var g = STEMS[si], el = ELEMENTS[g.el];
          return '<b style="color:' + el.text + ';">' + g.ko + '(' + g.hj + '·' + el.ko + ')</b>';
        }).join(' · ') + '</div>';
      };
      var pCard = function (title, sub, p, body) {
        var sE = ELEMENTS[STEMS[p.stem].el];
        return '<div class="sjd-el" style="border-left-color:' + sE.color + ';">' +
          '<div class="sjd-el-head"><span>' + title + '</span><span class="sjd-state" style="color:var(--muted); border-color:var(--line); background:#faf9fd;">' + sub + '</span></div>' +
          '<div class="sjd-glyphs">' + chip(true, p.stem) + chip(false, p.branch) + '</div>' +
          glyphMean(p) +
          jgLine(p.branch) +
          '<p class="sjd-el-msg">' + body + '</p></div>';
      };
      var yS = STEMS[pl.year.stem].el, yB = BRANCHES[pl.year.branch].el;
      var mS = STEMS[pl.month.stem].el, mB = BRANCHES[pl.month.branch].el;
      var dB = BRANCHES[pl.day.branch].el;
      var flowStep = function (label, sub, p, color) {
        var g = p ? (STEMS[p.stem].ko + BRANCHES[p.branch].ko) : '미상';
        return '<div class="sjd-flow-step"><i style="background:' + color + ';"></i><b>' + label + '</b><span>' + sub + '</span><em>' + g + '</em></div>';
      };
      var pcGrid = [];
      var pcHtml =
        '<p class="sjd-lead">명리학은 네 기둥을 나무 한 그루로 봐요. 태어난 해는 뿌리, 달은 줄기와 싹, 날은 꽃, 시간은 열매 — 인생의 토대·무대·나 자신·앞날이 기둥 하나씩에 담겨 있는 거죠. 기둥마다 하늘 기운과 땅 기운이 짝을 이루고, 땅 글자 안엔 숨은 기운이 몇 겹 더 들어 있고요.</p>' +
        '<div class="sjd-flow">' +
        flowStep('연주', '뿌리 · 토대', pl.year, ELEMENTS[yS].color) + '<span class="sjd-flow-arr">→</span>' +
        flowStep('월주', '무대 · 사회', pl.month, ELEMENTS[mS].color) + '<span class="sjd-flow-arr">→</span>' +
        flowStep('일주', '꽃 · 나 자신', pl.day, dEl.color) + '<span class="sjd-flow-arr">→</span>' +
        flowStep('시주', '열매 · 앞날', pl.hour, pl.hour ? ELEMENTS[STEMS[pl.hour.stem].el].color : '#c9c3d6') +
        '</div>';
      pcGrid.push(pCard('연주 — 뿌리 자리', '인생의 토대', pl.year,
        '태어난 해의 기운으로, 유년의 배경과 물려받은 기질, 인생 전반의 토대를 읽는 자리예요. ' + yb.animal + '띠 해, 하늘 기운은 ' + kn(yS) + ' · 땅 기운은 ' + kn(yB) + '로 출발했어요. ' +
        ELEMENTS[yB].symbols + '의 무드가 당신 이야기의 바탕색인 셈이죠. 어린 시절 어떤 분위기에서 자기다움이 자랐는지 돌아볼 때 단서가 되는 자리예요.'));
      pcGrid.push(pCard('월주 — 무대 자리', '사회와 계절', pl.month,
        '성장 환경과 사회 활동의 무대를 읽는 자리로, 특히 달의 땅 기운(월지)은 사주 전체에서 비중이 가장 커요(30%). 당신의 무대는 ' + season + '의 ' + kn(mB) + ' — ' +
        seasonLine + ' 자리이고, 사회에서 쓰는 겉 에너지는 ' + kn(mS) + '의 결이에요. 진로나 일에서 어떤 분위기의 무대가 편안한지 볼 때 이 자리를 봐요.'));
      pcGrid.push(pCard('일주 — 꽃 자리', '나 자신', pl.day,
        '이 사주의 주인공, 나 자신을 읽는 자리예요. 하늘 기운 ' + dStem.ko + '(' + dStem.hj + ')는 ' + dProf.sym + ' — 나의 본체이고, 땅 기운 ' + kn(dB) + '는 마음 깊은 곳의 기본 정서예요. 겉과 속이 ' +
        (dayEl === dB ? '같은 결이라 안팎이 한결같다는 이야기를 자주 듣는 구조' : '서로 다른 결이라 알아갈수록 새로운 면이 나오는 깊이 있는 구조') + '예요. 가장 가까운 관계의 결도 이 자리에서 함께 읽어요.'));
      if (pl.hour) {
        var hS = STEMS[pl.hour.stem].el, hB = BRANCHES[pl.hour.branch].el;
        pcGrid.push(pCard('시주 — 열매 자리', '꿈과 앞날', pl.hour,
          '꿈과 말년, 앞으로 맺을 결실을 읽는 자리예요. ' + kn(hS) + '·' + kn(hB) + '의 조합이라, 인생 후반으로 갈수록 ' + ELEMENTS[hB].symbols +
          '의 이야기가 힘을 받는 흐름이에요. 마음 깊이 품은 방향이 궁금할 때 들여다보는, 마지막 장이 기대되는 자리죠.'));
      } else {
        pcGrid.push('<div class="sjd-el" style="border-left-color:#c9c3d6;">' +
          '<div class="sjd-el-head"><span>시주 — 열매 자리</span><span class="sjd-state" style="color:var(--muted); background:#f6f4fb;">시간 미상</span></div>' +
          '<p class="sjd-el-msg">꿈과 말년을 읽는 자리인데, 태어난 시간을 몰라 이번 분석에서는 비워 두었어요. 시간을 알게 되면 이 자리까지 해석이 열립니다.</p></div>');
      }
      $('sjd-pillar-cards').innerHTML = pcHtml + '<div class="sjd-pgrid">' + pcGrid.join('') + '</div>';

      // ②-b 오행 순환 다이어그램 (SVG) — 원 크기 = 내 사주 비중, 점선 테두리 = 일간
      var cycleEl = $('sjd-cycle');
      if (cycleEl) {
        var CX = 170, CY = 168, RR = 106, pts = [], rads = [];
        var maxP = Math.max.apply(null, [0, 1, 2, 3, 4].map(pctOf)) || 1;
        for (var ci = 0; ci < 5; ci++) {
          var ang = (-90 + ci * 72) * Math.PI / 180;
          pts.push([CX + RR * Math.cos(ang), CY + RR * Math.sin(ang)]);
          rads.push(19 + 19 * (pctOf(ci) / maxP));
        }
        var svgArrows = '', svgNodes = '';
        for (var ci = 0; ci < 5; ci++) {
          var cj = (ci + 1) % 5;
          var dx = pts[cj][0] - pts[ci][0], dy = pts[cj][1] - pts[ci][1];
          var ln = Math.sqrt(dx * dx + dy * dy);
          svgArrows += '<line x1="' + (pts[ci][0] + dx / ln * (rads[ci] + 5)).toFixed(1) + '" y1="' + (pts[ci][1] + dy / ln * (rads[ci] + 5)).toFixed(1) +
            '" x2="' + (pts[cj][0] - dx / ln * (rads[cj] + 11)).toFixed(1) + '" y2="' + (pts[cj][1] - dy / ln * (rads[cj] + 11)).toFixed(1) +
            '" stroke="#c9c3d6" stroke-width="2.5" marker-end="url(#sjdArr)"/>';
        }
        for (var ci = 0; ci < 5; ci++) {
          var el = ELEMENTS[ci], px = pts[ci][0].toFixed(1), py = pts[ci][1].toFixed(1);
          if (ci === dayEl) {
            svgNodes += '<circle cx="' + px + '" cy="' + py + '" r="' + (rads[ci] + 8).toFixed(1) + '" fill="none" stroke="' + el.text + '" stroke-width="2" stroke-dasharray="4 4"/>' +
              '<text x="' + px + '" y="' + (pts[ci][1] - rads[ci] - 14).toFixed(1) + '" text-anchor="middle" font-size="13" font-weight="800" fill="' + el.text + '">나</text>';
          }
          svgNodes += '<circle cx="' + px + '" cy="' + py + '" r="' + rads[ci].toFixed(1) + '" fill="' + el.color + '" stroke="#fff" stroke-width="3"/>' +
            '<text x="' + px + '" y="' + py + '" text-anchor="middle" fill="' + el.ink + '" font-weight="800">' +
            '<tspan x="' + px + '" dy="-2" font-size="15">' + el.ko + '</tspan>' +
            '<tspan x="' + px + '" dy="15" font-size="11.5">' + pctOf(ci) + '%</tspan></text>';
        }
        cycleEl.innerHTML =
          '<svg viewBox="0 0 340 336" role="img" aria-label="나의 오행 순환 지도">' +
          '<defs><marker id="sjdArr" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M1,1 L8,4.5 L1,8" fill="none" stroke="#b3abc6" stroke-width="1.8"/></marker></defs>' +
          svgArrows + svgNodes + '</svg>' +
          '<div class="sjd-cycle-legend">' +
          '<span>화살표 = 서로 살리는 순서(상생)</span>' +
          '<span>큰 원 = 풍성한 기운</span>' +
          '<span>점선 테두리 = 나(일간)</span></div>' +
          '<p class="sj-ey-note" style="text-align:center; margin-top:12px;">나무는 불을, 불은 흙을, 흙은 금을, 금은 물을, 물은 다시 나무를 키워요.</p>';
      }

      // ③ 십성 — 다섯 가지 힘의 균형
      $('sjd-roles').innerHTML =
        '<p class="sjd-roles-lead">일간(나)을 기준으로 나머지 기운을 다섯 가지 힘으로 읽는 게 십성이에요. 뭐가 중심이고 뭐가 여백인지 보면 내 에너지의 쓰임새가 보이거든요.</p>' +
        [0, 1, 2, 3, 4].map(function (i) {
          var el = ELEMENTS[i], p = pctOf(i), role = roleOf(i, dayEl);
          var st = p >= 20 ? '지금 중심을 잡아주는 힘이에요' : p >= 10 ? '딱 알맞게 자리 잡았어요' : p > 0 ? '은은하게 깔려 있어요' : '보완하면 좋은 자리예요';
          return '<div class="sjd-role">' +
            '<span class="sjd-role-el" style="color:' + el.text + ';">' + el.ko + '</span>' +
            '<span class="sjd-role-body"><b>' + role.name + '</b><i>' + role.desc + '</i>' + st + '</span>' +
            '<span class="sjd-role-pct">' + p + '%<span class="sjd-rb"><i style="width:' + Math.min(p * 2, 100) + '%; background:' + el.color + ';"></i></span></span></div>';
        }).join('') +
        '<p class="sjd-roles-note">지금 가장 옅은 힘은 <b>' + roleOf(lo, dayEl).name + '</b>(' + ELEMENTS[lo].ko + ' ' + pctOf(lo) + '%). 억지로 메우라는 게 아니에요 — 생활 속에서 그 결을 살짝 빌려오는 게 명리식 정석이거든요. 방법은 아래 보완 가이드에 다 정리해 뒀어요.</p>';

      // 신강·신약 저울 — 나를 돕는 힘(비겁+인성) vs 흘려보내는 힘(식상+재성+관성)
      var inSupEl = mod(dayEl + 4, 5);
      var support = pctOf(dayEl) + pctOf(inSupEl);
      var ssLabel, ssMsg;
      if (support >= 50) { ssLabel = '신강에 가까운 구조'; ssMsg = '나를 돕는 힘이 넉넉한 타입이에요. 스스로 끌고 가는 힘이 좋아서, 표현(식상)이나 성과(재성) 쪽으로 흘려보낼 때 제일 빛나요.'; }
      else if (support >= 35) { ssLabel = '중화에 가까운 구조'; ssMsg = '돕는 힘과 흘려보내는 힘이 밸런스를 이룬 상태예요. 상황 따라 유연하게 조절이 되는, 명리에서 제일 부러워하는 그림이죠.'; }
      else { ssLabel = '신약에 가까운 구조'; ssMsg = '주변의 서포트를 받으며 크는 타입이에요. 배움(인성)과 동료(비겁)가 진짜 버팀목이라, 혼자 다 짊어지기보다 같이 갈 때 운이 커져요.'; }
      $('sjd-roles').innerHTML +=
        '<div class="sjd-roles-note" style="margin-top:14px;"><b>기운의 저울 — ' + ssLabel + '</b>' +
        '<span class="sj-ey-bar" style="margin:12px 0 6px;"><span class="sj-ey-seg" style="width:' + support + '%; background:var(--brand);"></span><span class="sj-ey-seg" style="width:' + (100 - support) + '%; background:#e5e8eb;"></span></span>' +
        '<span style="display:block; font-size:13px; font-weight:700; color:var(--muted);">나를 돕는 힘(비겁·인성) ' + support + '% · 흘려보내는 힘(식상·재성·관성) ' + (100 - support) + '%</span>' +
        '<span style="display:block; margin-top:8px;">' + ssMsg + '</span></div>';

      // 글자들의 케미 — 육합·충 (내 지지들끼리)
      var posList = [['연지', pl.year.branch], ['월지', pl.month.branch], ['일지', pl.day.branch]];
      if (pl.hour) posList.push(['시지', pl.hour.branch]);
      var chemiBox = $('sjd-chemi');
      if (chemiBox) {
        var YUKHAP = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
        var chemiRows = [];
        for (var qa = 0; qa < posList.length; qa++) {
          for (var qb = qa + 1; qb < posList.length; qb++) {
            var A = posList[qa], B = posList[qb];
            var an = BRANCHES[A[1]].ko + '(' + BRANCHES[A[1]].hj + ')', bn = BRANCHES[B[1]].ko + '(' + BRANCHES[B[1]].hj + ')';
            if (YUKHAP[A[1]] === B[1]) {
              chemiRows.push('<div class="sjd-role"><span class="sjd-role-el" style="color:#2f9e44;">합</span><span class="sjd-role-body"><b>' + A[0] + ' ' + an + ' · ' + B[0] + ' ' + bn + '</b><i>서로 끌어안는 짝 (육합)</i>두 자리가 손을 잡아 순하게 어우러져요. 이 라인에서는 일이 부드럽게 풀리는 편이고요.</span></div>');
            } else if (mod(A[1] + 6, 12) === B[1]) {
              chemiRows.push('<div class="sjd-role"><span class="sjd-role-el" style="color:#e8352e;">충</span><span class="sjd-role-body"><b>' + A[0] + ' ' + an + ' · ' + B[0] + ' ' + bn + '</b><i>서로를 깨우는 맞은편 글자 (충)</i>싸우는 게 아니라 서로를 깨우는 관계예요. 변화·이동·새 국면을 만들어내는, 지루할 틈 없는 조합이죠.</span></div>');
            }
          }
        }
        chemiBox.innerHTML =
          '<p class="sjd-roles-lead">내 사주 안 글자들끼리도 케미가 있어요. 손을 잡는 합, 서로를 깨우는 충 — 내 안의 다이내믹 포인트죠.</p>' +
          (chemiRows.length ? chemiRows.join('') : '<p class="sjd-el-msg" style="margin-top:4px;">합도 충도 없는 담백한 구성이에요. 글자들이 서로 터치하지 않고 각자 할 일 하는, 잡음 제로 구조라는 뜻이죠.</p>');
      }

      // 신살 — 대표 길성 5종 (도화·역마·화개 = 삼합 조견표 / 천을·문창 = 일간 조견표)
      // 있는 별 = 의미·일상 발현·활용법까지 상세, 없는 별 = 한 줄 소개 (피드백: 설명·내용 보강)
      var sinsalBox = $('sjd-sinsal');
      if (sinsalBox) {
        var DOHWA = { 0: 9, 1: 6, 2: 3, 3: 0 }, YEOKMA = { 0: 2, 1: 11, 2: 8, 3: 5 }, HWAGAE = { 0: 4, 1: 1, 2: 10, 3: 7 };
        var CHEONEUL = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [6, 2], [3, 5], [3, 5]];
        var MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
        var have = {}; posList.forEach(function (pp) { if (!(pp[1] in have)) have[pp[1]] = pp[0]; });
        var bLabel = function (bi) { return BRANCHES[bi].ko + '(' + BRANCHES[bi].hj + ')'; };
        // 삼합 기준(연지·일지) 검사 → 근거 문자열 또는 null
        var checkTri = function (table) {
          var bases = [['연지', pl.year.branch], ['일지', pl.day.branch]];
          for (var bi2 = 0; bi2 < bases.length; bi2++) {
            var tgt = table[bases[bi2][1] % 4];
            if (tgt in have) return bases[bi2][0] + ' ' + bLabel(bases[bi2][1]) + ' 기준 → ' + have[tgt] + ' ' + bLabel(tgt) + '에서 성립';
          }
          return null;
        };
        var checkStem = function (targets) {
          for (var ti = 0; ti < targets.length; ti++) {
            if (targets[ti] in have) return '일간 ' + dStem.ko + '(' + dStem.hj + ') 기준 → ' + have[targets[ti]] + ' ' + bLabel(targets[ti]) + '에서 성립';
          }
          return null;
        };
        var SAL = [
          { name: '도화', hj: '桃花', title: '매력의 별', color: '#e8352e', found: checkTri(DOHWA),
            what: '복숭아꽃이라는 이름처럼, 사람을 끌어당기는 매력과 인기의 별이에요.',
            life: '첫인상이 좋고 어디 가든 은근히 기억에 남는 타입이라, 사람을 상대하는 일이나 콘텐츠·무대처럼 "보여지는" 영역에서 강점이 돼요. 옛날엔 구설의 별로도 봤지만, 요즘은 셀프 브랜딩 시대의 핵심 자원으로 읽죠.',
            tip: '매력이 곧 자원이니 사람 앞에 서는 기회를 피하지 말 것. 다만 호감을 사는 만큼 관계의 선은 또렷하게.',
            absent: '매력·인기의 별인데 이번 구성엔 안 보여요. 대신 관계가 담백하고 구설이 적은 편이라는 뜻이기도 해요.' },
          { name: '역마', hj: '驛馬', title: '이동의 별', color: '#1864ab', found: checkTri(YEOKMA),
            what: '옛날 파발을 나르던 역참의 말처럼, 이동과 변화의 별이에요.',
            life: '한자리에 오래 묶이면 답답해지고, 움직일 때 오히려 컨디션과 운이 올라오는 타입이에요. 여행·출장·이사·이직, 그리고 해외 인연과 연결이 깊죠. 요즘 식으로는 출장러·노마드 기질.',
            tip: '정체됐다 싶으면 환경부터 바꿔볼 것. 이 사주는 책상 앞에서 고민하는 것보다 일단 움직여야 풀려요.',
            absent: '이동·변화의 별인데 이번 구성엔 없어요. 한자리에서 깊게 쌓아 올리는 안정형에 가깝다는 뜻이죠.' },
          { name: '화개', hj: '華蓋', title: '몰입과 예술의 별', color: '#7c5cff', found: checkTri(HWAGAE),
            what: '"화려한 덮개"라는 뜻으로, 몰입·예술·정신세계를 상징하는 별이에요.',
            life: '혼자 깊이 파는 시간이 아깝지 않은 타입이에요. 예술, 연구, 기록, 철학처럼 내면이 깊어지는 영역과 인연이 있고, 유행보다 자기 세계가 뚜렷한 결이죠.',
            tip: '혼자만의 몰입 시간을 죄책감 없이 확보할 것. 이 별은 고독을 연료로 결과물을 만들어요.',
            absent: '몰입·예술의 별인데 이번 구성엔 없어요. 한 우물보다 여러 우물을 고루 살피는 제너럴리스트 결이라는 뜻.' },
          { name: '천을귀인', hj: '天乙貴人', title: '하늘이 돕는 별', color: '#b07d00', found: checkStem(CHEONEUL[pl.day.stem]),
            what: '"하늘의 도움"이라는 뜻 그대로, 명리에서 최고로 치는 으뜸 길성이에요.',
            life: '결정적인 순간에 도와주는 사람이 나타나고, 위기가 이상하게 잘 넘어가는 경험이 많은 타입이에요. 흉한 기운을 눌러주는 방패 역할도 한다고 봐요.',
            tip: '이 별은 관계에서 발동해요. 사람에게 진심으로 잘해 둘 것 — 그 인연이 귀인으로 돌아오거든요.',
            absent: '하늘이 돕는 별인데 이번 구성엔 없어요. 하지만 귀인은 결국 내가 쌓은 관계에서 오는 법 — 만들어 가면 돼요.' },
          { name: '문창귀인', hj: '文昌貴人', title: '공부와 글재주의 별', color: '#2f9e44', found: checkStem([MUNCHANG[pl.day.stem]]),
            what: '학문과 글, 총명함을 상징하는 별이에요.',
            life: '배우는 속도가 빠르고, 복잡한 걸 글이나 말로 깔끔하게 정리하는 재주가 있어요. 시험·자격증·글쓰기·기획 영역에서 강점이 되는 별이죠.',
            tip: '아는 걸 기록으로 남길 것. 이 별은 쓰고 정리하는 만큼 운이 쌓이는 타입이에요.',
            absent: '공부·글재주의 별인데 이번 구성엔 없어요. 머리로 외우기보다 몸과 경험으로 배울 때 더 빠른 타입일 수 있죠.' }
        ];
        var foundN = SAL.filter(function (x) { return x.found; }).length;
        sinsalBox.innerHTML =
          '<p class="sjd-roles-lead">신살은 여덟 글자의 조합에서 생기는 특수 기운이에요 — 사주에 붙는 별명 같은 거라 "별(星)"이라고도 부르죠. 태어난 해나 날의 글자를 기준으로 정해진 짝 글자가 사주 안에 있으면 성립하는 방식이라, 있고 없음이 사람마다 달라요. 대표 길성 다섯 가지를 전부 확인해 봤어요 — 당신에게는 <b>' + foundN + '개</b>가 있네요. 있는 별은 자세히, 없는 별은 어떤 별인지만 짚고 갈게요.</p>' +
          SAL.map(function (x) {
            if (x.found) {
              return '<div class="sjd-sal on">' +
                '<div class="sjd-sal-head"><b style="color:' + x.color + ';">' + x.name + '(' + x.hj + ')</b><span>' + x.title + '</span><em class="on">있음</em></div>' +
                '<i class="sjd-sal-base">' + x.found + '</i>' +
                '<p>' + x.what + ' ' + x.life + '</p>' +
                '<p class="sjd-sal-tip"><b>이렇게 써먹어요</b> — ' + x.tip + '</p></div>';
            }
            return '<div class="sjd-sal">' +
              '<div class="sjd-sal-head"><b style="color:var(--faint);">' + x.name + '(' + x.hj + ')</b><span>' + x.title + '</span><em>없음</em></div>' +
              '<p class="sjd-sal-off">' + x.absent + '</p></div>';
          }).join('') +
          '<p class="sj-ey-note">※ 신살은 전통 조견표 기반의 재미 요소예요 — 좋고 나쁨의 판정이 아니라, 내 사주의 개성 포인트로 봐주세요.</p>';
      }

      // 올해의 흐름 — 세운(입춘 기준 올해 간지)과 일간의 십성 관계
      var yearBox = $('sjd-year');
      if (yearBox) {
        var nowD = new Date();
        var nowYr = nowD.getFullYear();
        var curY = nowD.getTime() < ipchunUtcMs(nowYr) ? nowYr - 1 : nowYr;
        var yidx = mod(curY - 1984, 60), ysIdx = yidx % 10, ybIdx = yidx % 12;
        var yElNow = STEMS[ysIdx].el, yRole = roleOf(yElNow, dayEl);
        var YEAR_MSG = {
          '비겁': '내 편이 늘고 주체성이 세지는 해예요. 협업도 독립도 다 되는 타이밍이니, 나답게 밀고 가면 돼요.',
          '인성': '배움과 서포트가 들어오는 해예요. 공부, 자격증, 멘토 운이 좋은 타이밍이라 채우는 데 쓴 시간이 다 남아요.',
          '식상': '표현과 재능이 살아나는 해예요. 만들어 둔 걸 세상에 보여주기 좋은 타이밍 — 표현할수록 길이 열려요.',
          '재성': '성과와 실리가 손에 잡히는 해예요. 벌여 둔 일을 결실로 바꾸기 딱 좋은 타이밍이죠.',
          '관성': '책임과 무대가 커지는 해예요. 살짝 부담돼도 한 단계 올라서는 타이밍 — 다듬어질수록 단단해지거든요.'
        };
        yearBox.innerHTML =
          '<div class="sjd-glyphs" style="margin-top:0;">' + chip(true, ysIdx) + chip(false, ybIdx) + '</div>' +
          '<p class="sjd-el-msg">올해(' + curY + '년)는 ' + STEMS[ysIdx].ko + BRANCHES[ybIdx].ko + '(' + STEMS[ysIdx].hj + BRANCHES[ybIdx].hj + ')년 — ' + kn(yElNow) + ' 기운이 들어오는 해예요. 나(일간 ' + dStem.ko + ')에게 올해의 기운은 <b>' + yRole.name + '</b> — ' + yRole.desc.split(' — ')[0] + '이에요. ' + YEAR_MSG[yRole.name] + '</p>' +
          '<p class="sj-ey-note">※ 해의 경계는 1월 1일이 아니라 입춘 기준이에요 · 재미로 보는 흐름 읽기예요.</p>';
      }

      // ④-a 나와 잘 맞는 것들 — 일간의 결 + 가장 풍성한 기운
      var swRow = function (st) {
        return '<div class="sjd-sw-row">' + st.colors.map(function (c) { return '<span class="sjd-sw"><i style="background:' + c.c + ';"></i>' + c.n + '</span>'; }).join('') + '</div>';
      };
      var fitCard = function (i, tag, title, intro) {
        var el = ELEMENTS[i];
        return '<div class="sjd-el" style="border-left-color:' + el.color + ';">' +
          '<div class="sjd-el-head"><span style="color:' + el.text + ';">' + title + '</span>' +
          '<span class="sjd-state" style="color:' + el.text + '; border-color:' + el.text + '44; background:' + el.light + ';">' + tag + '</span></div>' +
          '<p class="sjd-el-msg">' + intro + ' ' + EL_FIT[i] + '</p>' +
          '<p class="sjd-el-msg" style="margin-top:20px;"><b>자연스럽게 어울리는 색</b> — 이미 갖고 있는 결이라 뭘 해도 잘 받는 컬러예요:</p>' + swRow(EL_STYLE[i]) + '</div>';
      };
      var fitHtml = fitCard(dayEl, '나의 결', ELEMENTS[dayEl].ko + ' — 나(일간)의 결과 잘 맞는 것',
        '나의 중심이 ' + ELEMENTS[dayEl].ko + ' 기운이라,');
      if (t1 !== dayEl) fitHtml += fitCard(t1, '가장 풍성', ELEMENTS[t1].ko + ' — 가장 풍성한 기운을 잘 쓰는 법',
        '사주에서 가장 넉넉한 ' + ELEMENTS[t1].ko + ' 기운(' + pctOf(t1) + '%) 덕분에,');
      $('sjd-fit').innerHTML = fitHtml;

      // ④-b 보완 가이드 — 부족 오행별 친구 · 색 · 생활 보완법 (한자 없이)
      var rec = recommend(r.counts, dayEl);
      $('sjd-final').innerHTML = rec.lacking.map(function (i) {
        var el = ELEMENTS[i], ch = CHARACTERS[i], st = EL_STYLE[i];
        return '<div class="sjd-el" style="border-left-color:' + el.color + ';">' +
          '<div class="sjd-el-head"><span style="color:' + el.text + ';">' + el.ko + ' 기운 보완 (' + pctOf(i) + '%)</span>' +
          '<span class="sjd-state" style="color:' + el.text + '; border-color:' + el.text + '44; background:' + el.light + ';">' + ch.emoji + ' ' + ch.name + '와 함께</span></div>' +
          '<p class="sjd-el-msg"><b>함께할 친구</b> — ' + ch.type + ' <b>' + ch.name + '</b>. ' + ch.short + '. ' + el.ko + '의 결을 곁에서 채워주는 존재예요. 책상 위 굿즈 하나면 이 기운을 상시 소환할 수 있죠.</p>' +
          '<p class="sjd-el-msg" style="margin-top:20px;"><b>가까이 둘 색</b> — 전통 오방색에서 ' + el.ko + '의 자리를 잇는 컬러들이에요. 옷이든 폰케이스든 책상 위든, 하루 한 스푼씩:</p>' +
          swRow(st) +
          '<p class="sjd-el-msg" style="margin-top:20px;"><b>생활 속 보완법</b> — ' + st.items + '. ' + EL_DETAIL[i].tip + '</p>' +
          '<p class="sjd-el-msg" style="margin-top:20px;"><b>행운 포인트</b> — 방위 ' + EL_LUCK[i].dir + ' · 숫자 ' + EL_LUCK[i].num + ' · 계절 ' + EL_LUCK[i].season + ' <span style="font-size:13px; color:var(--faint);">(전통 오행 배속)</span></p></div>';
      }).join('') +
        '<p class="sj-ey-note">※ 재미로 보는 콘텐츠지만, 다섯 기운을 고루 살피는 일은 전통 명리가 말하는 균형의 지혜이기도 해요. 옅은 기운은 결핍이 아니라 앞으로 채워질 여백입니다.</p>';
    }
  });
})();
