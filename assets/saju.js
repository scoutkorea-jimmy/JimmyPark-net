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
    { ko: '목', hj: '木', color: '#0ca678', light: '#e6fcf5', symbols: '성장 · 확장 · 생명력',
      strong: '목(木)이 넉넉한 당신은 늘 새로운 걸 시작하고 쑥쑥 키워내는 사람이에요. 호기심과 추진력이 있어서 주변에도 "우리 한번 해보자!"는 좋은 에너지를 나눠주죠. 가능성을 알아보는 눈이 반짝여서, 아무것도 없던 자리에 뭔가를 자라나게 만드는 재주가 있어요. 봄처럼 생기 넘치는 게 당신의 매력이에요!' },
    { ko: '화', hj: '火', color: '#fa5252', light: '#fff0f2', symbols: '표현 · 열정 · 빛',
      strong: '화(火)가 넉넉한 당신은 감정과 매력을 환하게 표현할 줄 아는 사람이에요. 함께 있으면 분위기가 따뜻해지고, 사람들이 자연스레 당신 곁으로 모여들죠. 좋아하는 걸 이야기할 때 눈이 반짝이는 그 열정이 당신의 가장 큰 무기예요. 존재만으로도 주변을 밝히는 타입이랍니다!' },
    { ko: '토', hj: '土', color: '#f08c00', light: '#fff6e6', symbols: '안정 · 균형 · 기반',
      strong: '토(土)가 넉넉한 당신은 어디서든 중심을 잡아주는 든든한 사람이에요. 다들 흔들리는 순간에도 침착하게 버텨주고, 곁의 사람에게 "괜찮아, 여기 있어" 하는 안정감을 주죠. 약속을 지키고 꾸준히 해내는 힘이 있어서, 믿고 기댈 수 있는 언덕 같은 존재예요. 당신이 있으면 팀이 든든해져요!' },
    { ko: '금', hj: '金', color: '#7048e8', light: '#f3f0ff', symbols: '판단 · 절제 · 구조',
      strong: '금(金)이 넉넉한 당신은 복잡한 상황을 깔끔하게 정리하는 감각이 뛰어난 사람이에요. 핵심을 딱 짚어내고, 필요할 때 단호하게 결정할 줄 알죠. 기준이 분명해서 "이 사람 말은 믿을 만해" 하는 신뢰를 주고요. 어수선한 곳에 질서를 세우는, 똑 부러진 매력의 소유자예요!' },
    { ko: '수', hj: '水', color: '#3b5bdb', light: '#edf2ff', symbols: '지혜 · 흐름 · 직관',
      strong: '수(水)가 넉넉한 당신은 깊이 생각하고 흐름을 읽어내는 지혜로운 사람이에요. 서두르지 않고 상황을 통찰하며, 어떤 변화에도 유연하게 대처할 줄 알죠. 조용히 듣고 헤아려주는 다정함이 있어서, 사람들이 속마음을 털어놓게 되고요. 잔잔해 보이지만 속은 단단한 내공의 소유자예요!' }
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
      lackMsg: '목(木)은 "일단 한번 해보자!" 하고 폴짝 몸을 일으키는 새싹 같은 기운이에요. 봄이 되면 아무도 시키지 않아도 쑥 올라오는 그 초록빛 에너지죠. 당신의 사주에서는 이 목 기운이 살짝 옅게 나왔어요. 그렇다고 큰일 난 건 절대 아니에요! 오히려 당신은 아무 데나 막 뛰어들지 않는, 신중하고 사려 깊은 사람일 확률이 높아요. 머릿속 하고 싶은 리스트는 이미 가득한데, 이상하게 첫 발을 뗄 때마다 발이 천근만근이죠. "이거 시작하면 끝까지 할 수 있을까?" 하는 생각이 먼저 드는 타입이에요. 새 취미를 검색하는 데엔 세 시간을 쓰지만, 정작 결제 버튼 앞에서는 슬그머니 창을 닫기도 하고요.\n\n하지만 여기 아주 중요한 비밀 하나! 당신에게 부족한 건 능력이 아니라 "작은 시작 스위치" 딱 하나예요. 목의 기운은 대단한 결심이 아니라 오늘의 한 걸음에서 자라나거든요. 물 한 컵 주듯, 하루 5분짜리 작은 행동이면 충분해요. 새싹은 원래 눈에 안 보일 만큼 천천히 자라잖아요. 그러니 조급해할 필요가 하나도 없어요. 완벽하게 준비된 순간은 사실 영원히 안 오기도 하고요. 지금 필요한 건 채찍질이 아니라, 옆에서 "오 좋은데? 한 발만 더 가볼까?" 하고 밀어주는 다정한 응원이에요.\n\n그래서 우리가 데려온 친구가 새싹 정령 모리예요. 모리는 거창한 변화를 말하지 않아요. 대신 오늘 할 수 있는 가장 작은 시작을 조용히 함께 떼어줘요. 완벽하지 않아도 괜찮으니, 일단 씨앗 하나만 심어보기로 해요. 그 작은 초록이 어디까지 자랄지는, 시작해본 사람만 알 수 있으니까요. 당신의 봄은 이제 막 시작됐어요!',
      whenLow: ['#일단저지르기', '#작심삼일탈출각', '#새싹력충전', '#검색만세시간', '#장바구니요정', '#오늘딱한걸음', '#시작이반이라며', '#내일부터진짜', '#성장캐릭터각', '#첫발떼기챌린지', '#루틴새싹', '#가능성만렙'],
      roleShort: '작은 시작과 성장을 도와주는',
      products: ['새싹 키링', '성장 다이어리', '루틴 체크 스티커', '"오늘의 작은 시작" 카드'],
      cta: '모리와 함께 오늘의 작은 시작을 만들어보세요.'
    },
    {
      id: 'fire_rua', el: 1, name: '루아', type: '불꽃 요정', emoji: '🔥',
      short: '마음속 불씨를 밝혀주는 작은 불꽃 요정',
      long: '루아는 어두운 곳에서도 작게 반짝이는 불꽃 요정입니다. 늘 강하게 타오르지는 않지만, 필요한 순간 마음속 불씨를 다시 밝혀줍니다. 감정과 생각을 조금 더 밖으로 표현할 수 있도록 돕는 캐릭터입니다.',
      quote: '루아는 당신을 억지로 빛나게 만들지 않습니다.\n다만 이미 안에 있던 작은 불씨를 다시 보이게 합니다.',
      lackMsg: '화(火)는 마음속 생각을 밖으로 "반짝" 꺼내 보이는 따뜻한 불빛 같은 기운이에요. 촛불 하나가 방 전체 분위기를 바꾸는 것처럼요. 당신의 사주에서는 이 화 기운이 조금 은은하게 나왔어요. 그래서 속에는 할 말도, 감정도, 아이디어도 가득한데 밖으로는 살짝 아껴 꺼내는 편이에요. 단톡방에서는 대부분 조용한 관찰자 포지션이죠. 리액션은 늘 "아 네네", "오 좋아요" 정도로 담백하게 끝나고요. 누가 칭찬이라도 하면 손사래부터 치며 "아니에요 아니에요"를 시전하기도 해요. 이런 모습이 은근한 매력인 건 분명해요. 조용히 깊은 사람은 오히려 더 신뢰가 가니까요.\n\n그런데 가끔은 스스로도 좀 답답할 때가 있죠. "아까 그 말 할걸", "그때 웃으면서 표현할걸" 하고 이불킥을 하기도 하고요. 여기 반가운 소식 하나! 당신에게 부족한 건 열정이 아니라, 이미 안에 있는 불씨를 살짝 키우는 "작은 부채질"이에요. 화의 기운은 억지로 활활 타오르는 게 아니에요. 좋아하는 걸 이야기할 때 살짝 올라가는 목소리, 딱 그 정도면 충분해요. 오늘은 딱 한 번만, 느낀 걸 솔직하게 표현해보는 거예요. "나 이거 진짜 좋아해!" 한마디가 당신을 훨씬 반짝이게 만들 거예요.\n\n그래서 데려온 친구가 불꽃 요정 루아예요. 루아는 당신을 억지로 빛나게 만들지 않아요. 다만 이미 당신 안에 있던 작은 불씨를 다시 보이게 도와줘요. 당신은 원래 따뜻하고 빛나는 사람이라는 걸, 이제 세상도 알아볼 시간이에요!',
      whenLow: ['#표현력구독각', '#단톡방침묵요정', '#조용한관찰자', '#리액션부자되기', '#이불킥방지', '#내불씨어디감', '#칭찬은손사래', '#오늘은솔직하게', '#따뜻한텐션', '#존재감ON', '#내가좋아하는거', '#반짝반짝루아'],
      roleShort: '표현과 자신감을 밝혀주는',
      products: ['불꽃 키링', '응원 메시지 카드', '자신감 부스터 스티커', '"오늘의 불씨" 랜덤 카드'],
      cta: '루아와 함께 마음속 불씨를 다시 밝혀보세요.'
    },
    {
      id: 'earth_duri', el: 2, name: '두리', type: '둥근 흙곰', emoji: '🐻',
      short: '흩어진 마음의 중심을 잡아주는 둥근 흙곰',
      long: '두리는 느리지만 단단한 흙곰 캐릭터입니다. 급하게 달리기보다는, 흩어진 것들을 모으고 다시 중심을 잡아주는 역할을 합니다. 생각이 많아지거나 생활이 흐트러질 때, 다시 땅을 밟게 해주는 캐릭터입니다.',
      quote: '두리는 빠른 답을 주지 않습니다.\n대신 무너지지 않도록 옆에서 묵직하게 버텨줍니다.',
      lackMsg: '토(土)는 여기저기 흩어진 걸 "자, 우리 여기 앉자" 하고 모아 중심을 잡아주는 든든한 땅 같은 기운이에요. 아무리 바람이 불어도 꿈쩍 않는 커다란 언덕처럼요. 당신의 사주에서는 이 토 기운이 살짝 옅게 나왔어요. 그래서 마음도, 일정도, 관심사도 쉽게 우르르 흩어지는 편이에요. 열정과 아이디어는 넘치는데 발이 땅에 잘 안 닿는 느낌이랄까요. 노트북 탭은 기본 30개, 머릿속 탭은 300개쯤 열려 있죠. 계획표는 늘 화려한데 실행은 자주 미궁에 빠지고요. 하루를 마치고 "나 오늘 대체 뭐 한 거지?" 하고 갸웃한 적도 많을 거예요.\n\n하지만 이건 당신이 게을러서가 절대 아니에요. 오히려 세상 모든 게 재미있어 보이는, 호기심 넘치는 사람이라는 증거죠. 다만 지금 살짝 필요한 건 "무게중심" 하나예요. 흩어진 풍선들을 하나로 묶어줄 든든한 손잡이 같은 거요. 토의 기운은 빠르게 달리는 힘이 아니라, 넘어지지 않게 버텨주는 힘이에요. 오늘은 딱 한 가지만 골라서 끝까지 앉아있어 보는 거예요. 책상 정리든, 5분 명상이든, 따뜻한 차 한 잔이든 다 좋아요. 그렇게 땅을 한 번 밟으면, 신기하게 마음도 차분히 가라앉거든요.\n\n그래서 데려온 친구가 둥근 흙곰 두리예요. 두리는 빠른 답을 주지 않아요. 대신 당신이 무너지지 않도록 옆에서 묵직하게 버텨줘요. 조급해하지 말아요, 당신에겐 이미 단단해질 힘이 충분하니까요!',
      whenLow: ['#탭30개오픈런', '#멀티태스킹의늪', '#계획만화려', '#중심잡기챌린지', '#오늘뭐했더라', '#땅에발붙이기', '#든든한흙곰', '#정신차려중력', '#호기심천국', '#한가지만끝까지', '#안정력충전', '#두리와중심잡기'],
      roleShort: '안정과 중심을 잡아주는',
      products: ['흙곰 인형', '안정 루틴 플래너', '"오늘의 중심" 카드', '베이지톤 힐링 스티커'],
      cta: '두리와 함께 오늘의 중심을 잡아보세요.'
    },
    {
      id: 'metal_sera', el: 3, name: '세라', type: '은빛 여우', emoji: '🦊',
      short: '복잡한 생각을 정리해주는 은빛 여우',
      long: '세라는 조용하고 예리한 은빛 여우 캐릭터입니다. 복잡한 상황 속에서도 필요한 것과 불필요한 것을 구분하는 감각을 가지고 있습니다. 선택을 미루거나 생각이 복잡해졌을 때, 기준을 세우고 정리할 수 있도록 돕는 캐릭터입니다.',
      quote: '세라는 많은 말을 하지 않습니다.\n대신 무엇을 남기고 무엇을 덜어낼지 조용히 알려줍니다.',
      lackMsg: '금(金)은 복잡하게 엉킨 걸 "이건 남기고, 이건 안녕" 하고 착착 정리해주는 서늘하고 예리한 기운이에요. 잘 든 가위가 실타래를 싹둑 정리하는 것처럼요. 당신의 사주에서는 이 금 기운이 살짝 옅게 나왔어요. 그래서 생각도, 물건도, 감정도 자꾸 쌓아두는 편이에요. 장바구니와 위시리스트는 이미 무한 적립 중이죠. 누가 "뭐 먹을래?" 하고 물으면 "아무거나"가 세상에서 제일 어려운 대답이고요. 정리 유튜브는 열심히 정주행하지만, 정작 내 책상은 그대로일 때도 많아요. 결정 앞에서는 이 생각 저 생각 하며 한참을 서성이기도 하죠.\n\n그런데 이건 당신이 우유부단해서가 절대 아니에요. 오히려 모든 가능성을 소중히 여기는, 마음이 넓고 다정한 사람이라는 뜻이에요. 다 좋아 보이니까 못 버리는 거잖아요. 다만 지금 살짝 필요한 건 "나만의 기준" 하나예요. "이건 내게 진짜 중요해, 이건 아니야"를 딱 나눠줄 잣대요. 금의 기운은 차갑게 쳐내는 게 아니라, 소중한 걸 더 잘 지키려고 정리하는 힘이에요. 오늘은 딱 하나만 골라보는 연습을 해봐요. 서랍 한 칸이든, 할 일 세 개 중 하나든 좋아요. 덜어내고 나면, 남은 것들이 훨씬 또렷하게 빛날 거예요.\n\n그래서 데려온 친구가 은빛 여우 세라예요. 세라는 많은 말을 하지 않아요. 대신 무엇을 남기고 무엇을 덜어낼지 조용히 알려줘요. 당신의 다정함은 그대로 두고, 선택만 살짝 가벼워지게 도와줄 거예요!',
      whenLow: ['#장바구니무한적립', '#아무거나가제일어려움', '#정리유튜브정주행', '#결정장애탈출각', '#위시리스트요정', '#덜어내기연습', '#나만의기준세우기', '#다정해서못버림', '#미니멀도전', '#선택은가볍게', '#은빛여우세라', '#싹둑정리각'],
      roleShort: '정리와 결단을 도와주는',
      products: ['은빛 여우 키링', '할 일 정리 메모패드', '미니멀 스티커팩', '"오늘의 기준" 체크리스트'],
      cta: '세라와 함께 복잡한 생각을 정리해보세요.'
    },
    {
      id: 'water_noa', el: 4, name: '노아', type: '물방울 고래', emoji: '🐳',
      short: '멈춤과 회복을 도와주는 물방울 고래',
      long: '노아는 조용히 흐르는 물방울 고래 캐릭터입니다. 감정을 크게 드러내지는 않지만, 깊은 곳에서 흐름을 읽고 지친 에너지를 회복시켜줍니다. 너무 오래 긴장하거나 생각이 메말랐을 때, 다시 천천히 흐를 수 있도록 도와주는 캐릭터입니다.',
      quote: '노아는 재촉하지 않습니다.\n잠시 멈추고, 숨을 고르고, 다시 흐르게 합니다.',
      lackMsg: '수(水)는 잠깐 멈춰서 "후—" 하고 숨을 고르며 흐름을 읽는 잔잔한 물 같은 기운이에요. 급할수록 오히려 천천히 도는 깊은 강물처럼요. 당신의 사주에서는 이 수 기운이 살짝 옅게 나왔어요. 그래서 쉬는 법을 자꾸 잊고, 몸도 마음도 바짝 마른 느낌이 들 때가 있어요. 쉬는 날에도 "뭔가 해야 할 것 같은" 기분에 사로잡히죠. 생각은 낮보다 밤에 더 시끄럽게 재잘대고요. "번아웃"이라는 단어가 남 얘기 같지 않게 느껴진 적도 있을 거예요. 늘 켜져 있는 노트북처럼, 당신은 꺼지는 법을 잘 모르는 사람이에요.\n\n그런데 이건 당신이 유난스러워서가 절대 아니에요. 오히려 그만큼 성실하고, 뭐든 열심히 해내는 멋진 사람이라는 증거죠. 다만 지금 살짝 필요한 건 "잠깐의 쉼표" 하나예요. 계속 흐르기만 하던 물길에 잔잔한 웅덩이 하나를 만들어주는 거요. 수의 기운은 게으름이 아니라, 다시 잘 흐르기 위한 회복의 힘이에요. 오늘은 딱 10분만, 아무것도 하지 않는 시간을 스스로에게 선물해봐요. 좋아하는 음악 한 곡, 따뜻한 샤워, 창밖 멍때리기도 완벽해요. 잘 쉰 사람이 결국 더 멀리, 더 오래 흐르거든요.\n\n그래서 데려온 친구가 물방울 고래 노아예요. 노아는 절대 재촉하지 않아요. 잠시 멈추고, 숨을 고르고, 다시 천천히 흐르게 도와줘요. 오늘만큼은 아무것도 안 해도 괜찮다고, 당신에게 꼭 말해주고 싶어요!',
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

    // ── 입력 페이지(saju.html): 값 검증 후 결과 페이지로 이동 ──
    var form = $('saju-form');
    if (form) {
      var tSel = $('sj-birthtime');
      for (var h = 0; h < 24; h++) {
        for (var m = 0; m < 60; m += 30) tSel.add(new Option(pad2(h) + ':' + pad2(m), h + ':' + m));
      }
      tSel.value = '12:0';
      $('sj-noTime').addEventListener('change', function () {
        tSel.disabled = this.checked;
        tSel.style.opacity = this.checked ? .45 : 1;
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var dv = $('sj-date').value;
        if (!dv) { alert('생년월일을 입력해 주세요.'); return; }
        var y = +dv.split('-')[0];
        if (y < 1900 || y > 2100) { alert('1900–2100년 범위만 지원합니다.'); return; }
        var noTime = $('sj-noTime').checked;
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
        '<a href="' + SHOP_URL + '" target="_blank" rel="noopener noreferrer" class="sj-cta" style="background:' + el.color + ';">' +
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
          '<span class="sj-el-name" style="color:' + el.color + ';">' + el.ko + ' ' + el.hj + '</span>' +
          '<span class="sj-el-bar"><span style="width:' + Math.max(w, c ? 6 : 0) + '%; background:' + el.color + ';"></span></span>' +
          '<span class="sj-el-count">' + c + '개</span></div>';
      }).join('');

      // 가장 풍성한 기운 (강점 먼저, 기분 좋게)
      var strongEl = 0, maxc = -1;
      r.counts.forEach(function (c, i) { if (c > maxc) { maxc = c; strongEl = i; } });
      var sEl = ELEMENTS[strongEl];
      $('sj-strong').innerHTML =
        '<div class="sj-strong-card" style="background:' + sEl.light + '; border-color:' + sEl.color + '33;">' +
        '<div class="sj-strong-badge" style="background:' + sEl.color + ';">' + sEl.hj + '</div>' +
        '<div><div class="sj-strong-tag" style="color:' + sEl.color + ';">가장 풍성한 기운 · ' +
          sEl.ko + '(' + sEl.hj + ')</div>' +
        '<p class="sj-strong-msg">' + sEl.strong + '</p></div></div>';

      // 부족 오행 + 캐릭터 추천
      var rec = recommend(r.counts, STEMS[pl.day.stem].el);
      var lackEl = ELEMENTS[rec.main.el];
      var lackNames = rec.lacking.map(function (i) { return '"' + ELEMENTS[i].ko + '"'; }).join(', ');

      $('sj-lack-title').innerHTML =
        '지금 당신에게 살짝 부족한 오행은<br><strong style="color:' +
        lackEl.color + ';">' + lackNames + '</strong> 이에요!';
      $('sj-lack-desc').innerHTML =
        '<b style="color:' + lackEl.color + ';">' + lackEl.ko + '(' + lackEl.hj + ')</b>은 ' +
        lackEl.symbols + '의 기운이에요.<br><br>' + rec.main.lackMsg.replace(/\n\n/g, '<br><br>');

      var vibe = '<div class="sj-vibe"><div class="sj-vibe-label">나를 위한 해시태그 🏷️</div>' +
        '<div class="sj-vibe-pills">' +
        rec.main.whenLow.map(function (w) { return '<span class="sj-vibe-pill">' + w + '</span>'; }).join('') +
        '</div></div>';

      var html = vibe + charCard(rec.main, true);
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
