/* Lorem Gen — placeholder text from built-in word lists. Nothing is fetched. */
(function () {
  "use strict";
  var $ = S3.$, $$ = S3.$$;

  var WORDS = {
    lorem: ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua " +
      "enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in " +
      "reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui " +
      "officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nunc pulvinar sapien ligula vitae accumsan " +
      "faucibus orci luctus ultrices posuere cubilia integer feugiat scelerisque varius morbi blandit cursus risus viverra maecenas " +
      "pharetra convallis aenean euismod elementum nisl purus mattis vulputate dignissim suspendisse potenti nullam porttitor").split(" "),
    english: ("the a and of to in that it with as for on was this by from at but they have one all were we when your can said there " +
      "use each which she do how their if will up other about out many then them these so some her would make like him into time " +
      "has look two more write go see number no way could people my than first water been call who oil its now find long down day " +
      "did get come made may part over new sound take only little work know place year live back give most very after thing our " +
      "just name good sentence man think say great where help through much before line right too mean old any same tell boy follow " +
      "came want show also around form three small set put end does another well large must big even such because turn here why " +
      "ask went men read need land different home us move try kind hand picture again change off play spell air away animal house " +
      "point page letter mother answer found study still learn should world high every near add food between own below country plant " +
      "last school father keep tree never start city earth eye light thought head under story saw left few while along might close " +
      "something seem next hard open example begin life always those both paper together got group often run important until " +
      "children side feet car mile night walk white sea began grow took river four carry state once book hear stop without second " +
      "later miss idea enough eat face watch far real almost let above girl sometimes mountain cut young talk soon list song being " +
      "leave family quiet bright simple design gentle").split(" "),
    arabic: ("في من على إلى عن مع هذا هذه التي الذي كان يكون كل بعض بين عند حتى أن لكن ثم قد لقد ما لا هو هي نحن هم " +
      "الوقت اليوم العالم الناس الحياة الطريق البيت المدينة الكتاب العمل الفكرة الصورة النص المساحة الشكل التصميم الموقع الصفحة " +
      "القارئ الكلمات الحروف الفقرة المحتوى المثال الطبيعي الجديد الجميل الواضح البسيط الكبير الصغير الأول الأخير الحقيقي " +
      "يمكن يجب يبدو يستطيع يعطي يقدم يساعد يجعل يظهر يكتب يقرأ يعرف يرى يأتي يذهب يبقى يعمل يحتاج يستخدم يختار يضيف " +
      "توزيع مقبول طويل قصير سهل جيد أفضل أكثر أقل دائما أحيانا كثيرا قليلا معا هنا هناك أيضا فقط تماما ربما " +
      "مصمم عميل مشروع نموذج تجربة فكرة رسالة قصة لون ضوء ماء سماء أرض شمس قمر بحر جبل شجرة زهرة طفل صديق معلم").split(" ")
  };
  var OPENER = {
    lorem: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    english: "The quick brown fox jumps over the lazy dog",
    arabic: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة"
  };
  var LIMITS = { paragraphs: 100, sentences: 500, words: 10000 };
  var SLIDER = { paragraphs: 20, sentences: 50, words: 500 };

  // Seeded PRNG (mulberry32) so the self-test is repeatable.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function between(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function pickWords(style, n, r, prev) {
    var list = WORDS[style], out = [];
    for (var i = 0; i < n; i++) {
      var w;
      do { w = list[Math.floor(r() * list.length)]; } while (w === (out.length ? out[out.length - 1] : prev) && list.length > 1);
      out.push(w);
    }
    return out;
  }

  function sentence(style, r, opener) {
    var comma = style === "arabic" ? "،" : ",";
    var words = opener ? OPENER[style].split(" ") : [];
    var extra = opener ? between(r, 0, 4) : between(r, 6, 14);
    words = words.concat(pickWords(style, extra, r, words[words.length - 1]));
    if (!opener && words.length > 7 && r() < 0.5) { var at = between(r, 2, words.length - 3); words[at] += comma; }
    var s = words.join(" ");
    return (style === "arabic" ? s : cap(s)) + ".";
  }

  // opts: {style, unit, count, opener, html, seed}
  function generate(opts) {
    var r = rng(opts.seed), style = opts.style, n = Math.max(1, Math.min(LIMITS[opts.unit], opts.count | 0 || 1));
    var paras = [];
    if (opts.unit === "words") {
      var w = opts.opener ? OPENER[style].replace(/,/g, "").split(" ").slice(0, n) : [];
      w = w.concat(pickWords(style, n - w.length, r, w[w.length - 1]));
      var t = w.join(" ");
      paras.push((style === "arabic" ? t : cap(t)) + ".");
    } else if (opts.unit === "sentences") {
      var ss = [];
      for (var i = 0; i < n; i++) ss.push(sentence(style, r, opts.opener && i === 0));
      paras.push(ss.join(" "));
    } else {
      for (var p = 0; p < n; p++) {
        var k = between(r, 3, 7), list = [];
        for (var j = 0; j < k; j++) list.push(sentence(style, r, opts.opener && p === 0 && j === 0));
        paras.push(list.join(" "));
      }
    }
    if (opts.html) return paras.map(function (x) { return "<p>" + S3.esc(x) + "</p>"; }).join("\n");
    return paras.join("\n\n");
  }

  function countWords(text) { var m = text.replace(/<\/?p>/g, " ").match(/[^\s]+/g); return m ? m.length : 0; }

  // ---------- UI ----------
  var out = $("#out"), stats = $("#stats"), count = $("#count"), range = $("#countRange");
  var saved = S3.store("lorem.settings") || {};
  var state = {
    style: WORDS[saved.style] ? saved.style : "lorem",
    unit: LIMITS[saved.unit] ? saved.unit : "paragraphs",
    count: saved.count || 3,
    opener: saved.opener !== false,
    html: !!saved.html,
    text: ""
  };

  function seg(el, value, onPick) {
    $$("button", el).forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.v === value));
      b.addEventListener("click", function () {
        $$("button", el).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        onPick(b.dataset.v);
      });
    });
  }
  function stat(label, value) { return '<div class="stat"><b>' + S3.esc(value) + "</b><span>" + S3.esc(label) + "</span></div>"; }

  function syncControls() {
    count.max = LIMITS[state.unit];
    range.max = SLIDER[state.unit];
    count.value = state.count;
    range.value = Math.min(state.count, SLIDER[state.unit]);
    $("#opener").checked = state.opener;
    $("#html").checked = state.html;
    $("#openerLabel").textContent = "Start with “" + OPENER[state.style].split(" ").slice(0, 4).join(" ").replace(/,$/, "") + "…”";
    $("#ext").textContent = state.html ? ".html" : ".txt";
  }

  function run(user) {
    state.count = Math.max(1, Math.min(LIMITS[state.unit], parseInt(count.value, 10) || 1));
    S3.store("lorem.settings", { style: state.style, unit: state.unit, count: state.count, opener: state.opener, html: state.html });
    state.text = generate({ style: state.style, unit: state.unit, count: state.count, opener: state.opener, html: state.html, seed: (Math.random() * 4294967296) >>> 0 });
    out.textContent = state.text;
    out.setAttribute("dir", state.style === "arabic" ? "rtl" : "ltr");
    out.classList.toggle("ar", state.style === "arabic");
    out.classList.toggle("code", state.html);
    var plain = state.text.replace(/<\/?p>/g, "");
    stats.innerHTML = stat("words", countWords(state.text).toLocaleString()) + stat("characters", plain.replace(/\n/g, "").length.toLocaleString()) +
      stat(state.unit === "paragraphs" ? "paragraphs" : "sentences", state.unit === "paragraphs" ? state.count : (plain.match(/[.]/g) || []).length);
    if (user) S3.done();
  }

  seg($("#style"), state.style, function (v) { state.style = v; syncControls(); run(); });
  seg($("#unit"), state.unit, function (v) {
    state.unit = v; state.count = { paragraphs: 3, sentences: 5, words: 50 }[v]; syncControls(); run();
  });
  range.addEventListener("input", function () { count.value = range.value; run(); });
  count.addEventListener("input", S3.debounce(function () { range.value = Math.min(+count.value || 1, SLIDER[state.unit]); run(); }, 200));
  $("#opener").addEventListener("change", function (e) { state.opener = e.target.checked; run(); });
  $("#html").addEventListener("change", function (e) { state.html = e.target.checked; syncControls(); run(); });
  $("#gen").addEventListener("click", function () { run(true); });
  $("#copy").addEventListener("click", function () { S3.copy(state.text); S3.done(); });
  $("#save").addEventListener("click", function () {
    if (state.html) S3.download(state.text + "\n", "placeholder.html", "text/html");
    else S3.download(state.text + "\n", "placeholder.txt", "text/plain");
    S3.done();
  });

  syncControls();
  run();

  window.S3_DEMO = function () { $("#style button[data-v=lorem]").click(); $("#unit button[data-v=paragraphs]").click(); count.value = 3; run(); };

  window.S3_SELFTEST = function () {
    var base = { style: "lorem", unit: "words", count: 25, opener: true, html: false, seed: 42 };
    var w = generate(base);
    var okWords = countWords(w) === 25 && w.indexOf("Lorem ipsum dolor sit amet") === 0 && /\.$/.test(w);
    var p = generate({ style: "english", unit: "paragraphs", count: 4, opener: false, html: false, seed: 7 });
    var okParas = p.split("\n\n").length === 4 && p.indexOf("Lorem") === -1;
    var s = generate({ style: "lorem", unit: "sentences", count: 6, opener: false, html: false, seed: 3 });
    var okSent = (s.match(/\./g) || []).length === 6;
    var a = generate({ style: "arabic", unit: "paragraphs", count: 2, opener: true, html: false, seed: 9 });
    var okAr = a.indexOf(OPENER.arabic) === 0 && !/[A-Za-z]/.test(a) && /^[؀-ۿ\s.،]+$/.test(a);
    var h = generate({ style: "lorem", unit: "paragraphs", count: 2, opener: false, html: true, seed: 1 });
    var okHtml = /^<p>[^<>]+<\/p>\n<p>[^<>]+<\/p>$/.test(h);
    var same = generate(base) === w; // seeded = repeatable
    var clamp = countWords(generate({ style: "lorem", unit: "words", count: 99999, opener: false, html: false, seed: 1 })) === LIMITS.words;
    return okWords && okParas && okSent && okAr && okHtml && same && clamp;
  };
})();
