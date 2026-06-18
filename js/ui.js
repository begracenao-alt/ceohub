/* ============================================================
   Be Grace CEO Hub — 画面部品 (ui.js)
   各モジュールが使う共通ヘルパー
   ============================================================ */
(function () {
  "use strict";

  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function yen(n) {
    n = Number(n) || 0;
    return "¥" + n.toLocaleString("ja-JP");
  }

  function num(v) {
    var n = Number(String(v).replace(/[^\d.-]/g, ""));
    return isNaN(n) ? 0 : n;
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }

  function ymOf(dateStr) {
    return (dateStr || "").slice(0, 7); // YYYY-MM
  }

  function curYM() { return todayStr().slice(0, 7); }
  function curYear() { return todayStr().slice(0, 4); }

  function inThisMonth(dateStr) { return ymOf(dateStr) === curYM(); }
  function inThisYear(dateStr) { return (dateStr || "").slice(0, 4) === curYear(); }

  function fmtDate(d) {
    if (!d) return "—";
    var p = d.split("-");
    if (p.length < 3) return d;
    return p[1] + "/" + p[2];
  }

  // トースト
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }

  // モーダル
  function openModal(title, bodyHTML, onMount) {
    var bd = document.getElementById("modalBackdrop");
    var m = document.getElementById("modal");
    m.innerHTML =
      '<div class="modal-head"><h3>' + esc(title) + '</h3>' +
      '<button class="modal-close" data-close>&times;</button></div>' +
      '<div class="modal-body">' + bodyHTML + '</div>';
    bd.hidden = false;
    m.querySelector("[data-close]").onclick = closeModal;
    bd.onclick = function (e) { if (e.target === bd) closeModal(); };
    if (onMount) onMount(m);
  }
  function closeModal() {
    document.getElementById("modalBackdrop").hidden = true;
    document.getElementById("modal").innerHTML = "";
  }

  function confirmDelete(msg, onYes) {
    openModal("確認", '<p>' + esc(msg) + '</p>' +
      '<div class="modal-foot"><button class="btn" data-no>キャンセル</button>' +
      '<button class="btn btn-primary btn-danger" data-yes>削除する</button></div>',
      function (m) {
        m.querySelector("[data-no]").onclick = closeModal;
        m.querySelector("[data-yes]").onclick = function () { closeModal(); onYes(); };
      });
  }

  /* フォーム生成
     fields: [{name,label,type,options,full,value,placeholder}]
     type: text|number|date|select|textarea|checkbox
  */
  function formHTML(fields, values) {
    values = values || {};
    var html = '<form class="form-grid" id="bgForm">';
    fields.forEach(function (f) {
      var v = values[f.name] !== undefined ? values[f.name] : (f.value || "");
      var cls = "field" + (f.full ? " full" : "");
      if (f.type === "checkbox") {
        html += '<div class="' + cls + '"><div class="check-row">' +
          '<input type="checkbox" name="' + f.name + '" id="f_' + f.name + '"' + (v ? " checked" : "") + '>' +
          '<label for="f_' + f.name + '">' + esc(f.label) + '</label></div></div>';
        return;
      }
      html += '<div class="' + cls + '"><label for="f_' + f.name + '">' + esc(f.label) + '</label>';
      if (f.type === "checks") {
        var arr = Array.isArray(v) ? v : (v ? [v] : []);
        html += '<div class="checks-group">';
        (f.options || []).forEach(function (o, idx) {
          html += '<label class="check-row" style="display:inline-flex;gap:6px;margin:0 14px 8px 0">' +
            '<input type="checkbox" data-checks="' + f.name + '" value="' + esc(o) + '" id="f_' + f.name + '_' + idx + '"' + (arr.indexOf(o) >= 0 ? " checked" : "") + '>' +
            '<span>' + esc(o) + '</span></label>';
        });
        html += '</div>';
      } else if (f.type === "select") {
        html += '<select name="' + f.name + '" id="f_' + f.name + '">';
        (f.options || []).forEach(function (o) {
          html += '<option value="' + esc(o) + '"' + (String(v) === String(o) ? " selected" : "") + '>' + esc(o) + '</option>';
        });
        html += '</select>';
      } else if (f.type === "datalist") {
        var lid = "dl_" + f.name;
        html += '<input type="text" name="' + f.name + '" id="f_' + f.name + '" list="' + lid + '" autocomplete="off" value="' + esc(v) + '" placeholder="' + esc(f.placeholder || "") + '">';
        html += '<datalist id="' + lid + '">';
        (f.options || []).forEach(function (o) { html += '<option value="' + esc(o) + '"></option>'; });
        html += '</datalist>';
      } else if (f.type === "money") {
        var mv = (v !== "" && v != null) ? Number(String(v).replace(/[^\d]/g, "") || 0) : "";
        html += '<input type="number" inputmode="numeric" step="1" min="0" class="money-input" data-prev="prev_' + f.name + '" name="' + f.name + '" id="f_' + f.name + '" value="' + mv + '" placeholder="' + esc(f.placeholder || "例：1000000") + '">';
        html += '<div class="money-preview" id="prev_' + f.name + '" style="font-size:13px;color:var(--gold-deep,#a9854a);font-weight:600;margin-top:4px;min-height:18px"></div>';
      } else if (f.type === "textarea") {
        html += '<textarea name="' + f.name + '" id="f_' + f.name + '" placeholder="' + esc(f.placeholder || "") + '">' + esc(v) + '</textarea>';
      } else {
        html += '<input type="' + (f.type || "text") + '" name="' + f.name + '" id="f_' + f.name +
          '" value="' + esc(v) + '" placeholder="' + esc(f.placeholder || "") + '">';
      }
      html += '</div>';
    });
    html += '</form>';
    return html;
  }

  function readForm(formEl, fields) {
    var out = {};
    fields.forEach(function (f) {
      if (f.type === "checks") {
        var arr = [];
        formEl.querySelectorAll('[data-checks="' + f.name + '"]').forEach(function (n) { if (n.checked) arr.push(n.value); });
        out[f.name] = arr;
        return;
      }
      var el = formEl.querySelector('[name="' + f.name + '"]');
      if (!el) return;
      if (f.type === "checkbox") out[f.name] = el.checked;
      else if (f.type === "number" || f.type === "money") out[f.name] = num(el.value);
      else out[f.name] = el.value.trim();
    });
    return out;
  }

  // 編集モーダル（追加/更新共通）
  function recordModal(opts) {
    // opts: {title, fields, values, onSave}
    var body = formHTML(opts.fields, opts.values) +
      '<div class="modal-foot"><button class="btn" data-cancel>キャンセル</button>' +
      '<button class="btn btn-primary" data-save>保存</button></div>';
    openModal(opts.title, body, function (m) {
      m.querySelectorAll(".money-input").forEach(function (inp) {
        // 数字専用入力（確実に打てる）＋ すぐ下にコンマ付きで「＝ ¥1,000,000」表示
        var prev = m.querySelector("#" + inp.getAttribute("data-prev"));
        function upd() { if (prev) prev.textContent = inp.value ? "＝ ¥" + Number(inp.value).toLocaleString("ja-JP") : ""; }
        inp.addEventListener("input", upd);
        upd();
      });
      m.querySelector("[data-cancel]").onclick = closeModal;
      m.querySelector("[data-save]").onclick = function () {
        var vals = readForm(m.querySelector("#bgForm"), opts.fields);
        opts.onSave(vals);
        closeModal();
      };
    });
  }

  function stat(label, value, sub, cls) {
    return '<div class="stat ' + (cls || "") + '">' +
      '<div class="stat-label">' + esc(label) + '</div>' +
      '<div class="stat-value">' + value + '</div>' +
      (sub ? '<div class="stat-sub">' + sub + '</div>' : '') + '</div>';
  }

  function sectionHead(title, btnLabel, btnId) {
    return '<div class="section-head"><h2>' + esc(title) + '</h2>' +
      (btnLabel ? '<button class="btn btn-primary" id="' + btnId + '">+ ' + esc(btnLabel) + '</button>' : '') +
      '</div>';
  }

  function emptyRow(cols, msg) {
    return '<tr><td colspan="' + cols + '" class="empty">' + esc(msg || "まだデータがありません") + '</td></tr>';
  }

  window.BG = window.BG || {};
  window.BG.ui = {
    esc: esc, yen: yen, num: num, todayStr: todayStr, ymOf: ymOf, curYM: curYM, curYear: curYear,
    inThisMonth: inThisMonth, inThisYear: inThisYear, fmtDate: fmtDate,
    toast: toast, openModal: openModal, closeModal: closeModal, confirmDelete: confirmDelete,
    formHTML: formHTML, readForm: readForm, recordModal: recordModal,
    stat: stat, sectionHead: sectionHead, emptyRow: emptyRow
  };
})();
