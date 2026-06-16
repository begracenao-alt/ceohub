/* ===== ④ CONTENT｜発信管理 ===== */
(function () {
  "use strict";
  var S = BG.store, U = BG.ui;

  var CATS = ["Instagramリール", "ストーリーズ", "LINE", "YouTube", "ブログ", "メルマガ"];

  function calc() {
    var cs = S.list("contents");
    var posted = 0, notPosted = 0, shotNotPosted = 0, inquiry = 0, consult = 0;
    cs.forEach(function (c) {
      if (c.posted) { if (U.inThisMonth(c.scheduledDate) || !c.scheduledDate) posted++; }
      else {
        notPosted++;
        if (c.shot) shotNotPosted++;
      }
      if (c.ledInquiry) inquiry++;
      if (c.ledConsult) consult++;
    });
    return { posted: posted, notPosted: notPosted, shotNotPosted: shotNotPosted, inquiry: inquiry, consult: consult };
  }

  var fields = [
    { name: "title", label: "タイトル", type: "text" },
    { name: "category", label: "カテゴリー", type: "select", options: CATS },
    { name: "scheduledDate", label: "投稿予定日", type: "date" },
    { name: "idea", label: "アイデア／内容", type: "textarea", full: true },
    { name: "shot", label: "撮影済", type: "checkbox" },
    { name: "edited", label: "編集済", type: "checkbox" },
    { name: "posted", label: "投稿済", type: "checkbox" },
    { name: "ledInquiry", label: "問い合わせにつながった", type: "checkbox" },
    { name: "ledConsult", label: "相談につながった", type: "checkbox" },
    { name: "reactionMemo", label: "反応メモ", type: "textarea", full: true }
  ];

  function chk(b) { return b ? '✓' : '—'; }

  function render(view) {
    var c = calc();
    var html = '<p class="page-lead">投稿数だけでなく、問い合わせ・相談・契約につながる発信を見える化します。</p>';
    html += '<div class="grid grid-4">' +
      U.stat("今月投稿数", c.posted + "件", null, "accent") +
      U.stat("未投稿", c.notPosted + "件", "うち撮影済 " + c.shotNotPosted + "件") +
      U.stat("問い合わせ", c.inquiry + "件", null, "rose") +
      U.stat("相談誘導", c.consult + "件") +
      '</div>';

    html += '<div class="card mt">' + U.sectionHead("発信リスト", "発信を追加", "addCo");
    var rows = S.list("contents");
    var body = rows.length ? rows.map(function (r) {
      return '<tr>' +
        '<td>' + U.esc(r.title) + '</td>' +
        '<td><span class="badge gray">' + U.esc(r.category) + '</span></td>' +
        '<td>' + U.fmtDate(r.scheduledDate) + '</td>' +
        '<td style="text-align:center">' + chk(r.shot) + '</td>' +
        '<td style="text-align:center">' + chk(r.edited) + '</td>' +
        '<td style="text-align:center">' + (r.posted ? '<span class="badge ok">済</span>' : '<span class="badge gray">未</span>') + '</td>' +
        '<td style="text-align:center">' + (r.ledInquiry ? '<span class="badge ok">問</span> ' : '') + (r.ledConsult ? '<span class="badge hot">商</span>' : '') + (!r.ledInquiry && !r.ledConsult ? '<span class="muted">—</span>' : '') + '</td>' +
        '<td class="row-actions">' +
        '<button class="btn btn-sm" data-edit="' + r.id + '">編集</button>' +
        '<button class="btn btn-sm btn-danger" data-del="' + r.id + '">削除</button></td>' +
        '</tr>';
    }).join("") : U.emptyRow(8, "発信アイデアを追加してみましょう");
    html += '<div class="table-wrap"><table><thead><tr>' +
      '<th>タイトル</th><th>カテゴリー</th><th>予定日</th><th>撮影</th><th>編集</th><th>投稿</th><th>反応</th><th></th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div></div>';

    view.innerHTML = html;
    document.getElementById("addCo").onclick = function () {
      U.recordModal({ title: "発信を追加", fields: fields, values: { category: "Instagramリール" },
        onSave: function (v) { S.add("contents", v); U.toast("追加しました"); render(view); } });
    };
    view.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-edit");
        U.recordModal({ title: "発信を編集", fields: fields, values: S.find("contents", id),
          onSave: function (v) { S.update("contents", id, v); U.toast("更新しました"); render(view); } });
      };
    });
    view.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        U.confirmDelete("この発信を削除しますか？", function () { S.remove("contents", id); U.toast("削除しました"); render(view); });
      };
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.content = { title: "CONTENT｜発信管理", render: render };
  BG.calc = BG.calc || {};
  BG.calc.content = calc;
})();
