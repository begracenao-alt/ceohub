/* ===== 📱 SNS｜発信・フォロワー（発信とフォロワーをひとつに） ===== */
(function () {
  "use strict";
  var tab = "post"; // post | followers

  function render(view) {
    var html = '<div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap">' +
      '<button class="btn' + (tab === "post" ? " btn-primary" : "") + '" data-tab="post">📢 発信</button>' +
      '<button class="btn' + (tab === "followers" ? " btn-primary" : "") + '" data-tab="followers">📈 フォロワー</button>' +
      '</div><div id="snsSub"></div>';
    view.innerHTML = html;
    var sub = view.querySelector("#snsSub");
    if (tab === "post") BG.modules.content.render(sub);
    else BG.modules.snsfollowers.render(sub);
    view.querySelectorAll("[data-tab]").forEach(function (b) {
      b.onclick = function () { tab = b.getAttribute("data-tab"); render(view); };
    });
  }

  BG.modules = BG.modules || {};
  BG.modules.sns = { title: "SNS｜発信・フォロワー", render: render };
})();
