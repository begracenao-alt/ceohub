/* ===== ⑤ BODY & ENERGY｜あなたの状態 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  function calc() {
    var logs = S.list("bodyLogs").filter(function (l) { return U.inThisMonth(l.date); });
    if (!logs.length) return { sleep: 0, energy: 0, moves: 0, resetRate: 0, count: 0 };
    var sleepSum = 0, energySum = 0, moves = 0, resetDays = 0;
    logs.forEach(function (l) {
      sleepSum += U.num(l.sleep);
      energySum += U.num(l.energy);
      if (l.pillow) moves++;
      if (l.yoga) moves++;
      if (l.walk) moves++;
      if (l.resetTime) resetDays++;
    });
    return {
      sleep: (sleepSum / logs.length).toFixed(1),
      energy: (energySum / logs.length).toFixed(1),
      moves: moves,
      resetRate: Math.round(resetDays / logs.length * 100),
      count: logs.length
    };
  }

  var fields = [
    { name: "date", label: "日付", type: "date", value: U.todayStr() },
    { name: "sleep", label: "睡眠時間（時間）", type: "number" },
    { name: "energy", label: "今日のエネルギー（1〜10）", type: "number" },
    { name: "pillow", label: "枕運動", type: "checkbox" },
    { name: "yoga", label: "ヨガ", type: "checkbox" },
    { name: "walk", label: "散歩", type: "checkbox" },
    { name: "resetTime", label: "リセット時間をとった", type: "checkbox" },
    { name: "conditionMemo", label: "体調メモ", type: "textarea", full: true },
    { name: "emotionMemo", label: "感情メモ", type: "textarea", full: true }
  ];

  var chart;

  function render(view) {
    var c = calc();
    var html = '<p class="page-lead">あなたが倒れず、枯れず、いい状態で事業を育てるために。<br>' +
      '<span class="flow"><span class="step">睡眠</span><span class="arrow">→</span><span class="step">エネルギー</span>' +
      '<span class="arrow">→</span><span class="step">判断力</span><span class="arrow">→</span><span class="step">行動量</span>' +
      '<span class="arrow">→</span><span class="step">売上</span><span class="arrow">→</span><span class="step">チーム</span></span></p>';

    html += '<div class="grid grid-4">' +
      U.stat("睡眠平均", c.sleep + "h", "今月" + c.count + "日記録", "accent") +
      U.stat("エネルギー平均", c.energy + " /10", null, "rose") +
      U.stat("運動回数", c.moves + "回", "今月の合計") +
      U.stat("リセット率", c.resetRate + "%") +
      '</div>';

    html += '<div class="card mt"><div class="card-title">エネルギー & 睡眠の流れ</div>' +
      '<canvas id="bodyChart" height="90"></canvas></div>';

    html += '<div class="card">' + U.sectionHead("毎日の記録", "今日を記録", "addB");
    var rows = S.list("bodyLogs").slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    var body = rows.length ? rows.map(function (r) {
      return '<tr>' +
        '<td>' + U.fmtDate(r.date) + '</td>' +
        '<td class="num">' + (r.sleep || "—") + 'h</td>' +
        '<td class="num">' + (r.energy || "—") + '</td>' +
        '<td>' + (r.pillow ? '枕 ' : '') + (r.yoga ? 'ヨガ ' : '') + (r.walk ? '散歩' : '') + (!r.pillow && !r.yoga && !r.walk ? '—' : '') + '</td>' +
        '<td style="text-align:center">' + (r.resetTime ? '✓' : '—') + '</td>' +
        '<td>' + U.esc((r.conditionMemo || r.emotionMemo || "").slice(0, 24)) + '</td>' +
        '<td class="row-actions">' +
        '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></td>' +
        '</tr>';
    }).join("") : U.emptyRow(7, "今日のカラダを記録してみましょう");
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>日付</th><th class="num">睡眠</th><th class="num">活力</th><th>運動</th><th>リセット</th><th>メモ</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div></div>';

    view.innerHTML = html;
    drawChart();

    document.getElementById("addB").onclick = function () {
      U.recordModal({ title: "今日のカラダを記録", fields: fields, values: { date: U.todayStr() },
        onSave: function (v) { S.add("bodyLogs", v); U.toast("記録しました"); render(view); } });
    };
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "記録を編集", fields: fields, values: S.find("bodyLogs", id),
          onSave: function (v) { S.update("bodyLogs", id, v); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("この記録を削除しますか？", function () { S.remove("bodyLogs", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  function drawChart() {
    var el = document.getElementById("bodyChart");
    if (!el || typeof Chart === "undefined") return;
    var rows = S.list("bodyLogs").slice().sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); }).slice(-21);
    var labels = rows.map(function (r) { return U.fmtDate(r.date); });
    if (chart) chart.destroy();
    chart = new Chart(el, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          { label: "エネルギー", data: rows.map(function (r) { return U.num(r.energy); }), borderColor: "#c89488", backgroundColor: "rgba(200,148,136,0.1)", tension: 0.35, fill: true, yAxisID: "y" },
          { label: "睡眠(h)", data: rows.map(function (r) { return U.num(r.sleep); }), borderColor: "#c2a36b", backgroundColor: "rgba(194,163,107,0.08)", tension: 0.35, fill: true, yAxisID: "y" }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { labels: { font: { family: "'Noto Sans JP'" } } } },
        scales: { y: { beginAtZero: true, suggestedMax: 10 } }
      }
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.body = { title: "BODY & ENERGY｜あなたの状態", render: render };
  BG.calc = BG.calc || {};
  BG.calc.body = calc;
})();
