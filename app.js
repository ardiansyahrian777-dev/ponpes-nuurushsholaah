(function () {
  "use strict";
  var S = window.SITE;
  if (!S) {
    document.body.textContent = "Berkas content.js tidak ditemukan atau ada kesalahan penulisan di dalamnya.";
    return;
  }

  /* ---------- alat bantu ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    var a = attrs || {};
    Object.keys(a).forEach(function (k) {
      var v = a[k];
      if (v === null || v === undefined || v === false || v === "") return;
      if (k === "class") el.className = v;
      else el.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) return c.forEach(function (x) { append(el, x); });
    el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }
  function has(v) {
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && String(v).trim() !== "";
  }
  function safeUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/|[\w\-]+\/|[\w\-]+\.\w+$)/i.test(u) && !/^javascript:/i.test(u)) return u;
    return "";
  }
  function external(u) { return /^https?:/i.test(u); }
  function link(label, url, cls) {
    var href = safeUrl(url);
    if (!href) return null;
    var a = h("a", { href: href, class: cls }, label);
    if (external(href)) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
    return a;
  }
  var STAR = '<svg viewBox="0 0 64 64" fill="none" stroke="#D4A24A" stroke-width="2.5" aria-hidden="true"><rect x="14" y="14" width="36" height="36"/><rect x="14" y="14" width="36" height="36" transform="rotate(45 32 32)"/></svg>';
  function starSvg() { var d = document.createElement("div"); d.innerHTML = STAR; return d.firstChild; }

  /* ---------- tema ---------- */
  var t = S.tema || {};
  var root = document.documentElement.style;
  if (t.utama) root.setProperty("--pine", t.utama);
  if (t.emas) root.setProperty("--gold", t.emas);
  if (t.emasTeks) root.setProperty("--gold-ink", t.emasTeks);

  var id = S.identitas || {};
  document.title = id.nama || "Pondok Pesantren";
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && id.tagline) metaDesc.setAttribute("content", id.tagline);

  /* ---------- bagian-bagian halaman ---------- */
  /* ---------- pratinjau foto (klik untuk memperbesar) ---------- */
  var lb = null;
  var lbState = { group: null, i: 0, opener: null };
  function buildLightbox() {
    var img = h("img", { alt: "" });
    var cap = h("figcaption");
    var close = h("button", { class: "lb-btn lb-close", type: "button", "aria-label": "Tutup" }, "\u00d7");
    var prev = h("button", { class: "lb-btn lb-prev", type: "button", "aria-label": "Foto sebelumnya" }, "\u2039");
    var next = h("button", { class: "lb-btn lb-next", type: "button", "aria-label": "Foto berikutnya" }, "\u203a");
    var box = h("div", { class: "lb", role: "dialog", "aria-modal": "true", "aria-label": "Pratinjau foto" },
      close, prev, h("figure", { class: "lb-fig" }, img, cap), next);
    box.hidden = true;
    document.body.appendChild(box);
    lb = { box: box, img: img, cap: cap, close: close, prev: prev, next: next };
    close.addEventListener("click", closeLb);
    prev.addEventListener("click", function () { stepLb(-1); });
    next.addEventListener("click", function () { stepLb(1); });
    box.addEventListener("click", function (e) { if (e.target === box || e.target.classList.contains("lb-fig")) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") stepLb(-1);
      else if (e.key === "ArrowRight") stepLb(1);
      else if (e.key === "Tab") {
        var f = [close, prev, next].filter(function (b) { return !b.hidden; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function showLb(i) {
    var g = lbState.group, e = g[i];
    lbState.i = i;
    lb.img.src = e.src;
    lb.img.alt = e.caption || "";
    lb.cap.textContent = e.caption || "";
    var many = g.filter(function (x) { return x.ok; }).length > 1;
    lb.prev.hidden = !many;
    lb.next.hidden = !many;
  }
  function stepLb(dir) {
    var g = lbState.group, n = g.length;
    for (var k = 1; k <= n; k++) {
      var j = (((lbState.i + dir * k) % n) + n) % n;
      if (g[j].ok) { showLb(j); return; }
    }
  }
  function openLb(group, i, opener) {
    if (!lb) buildLightbox();
    lbState.group = group; lbState.opener = opener;
    showLb(i);
    lb.box.hidden = false;
    document.body.style.overflow = "hidden";
    lb.close.focus();
  }
  function closeLb() {
    lb.box.hidden = true;
    lb.img.removeAttribute("src");
    document.body.style.overflow = "";
    if (lbState.opener && lbState.opener.focus) lbState.opener.focus();
  }
  // Membuat foto yang bisa diklik. onFail dipanggil bila berkas foto tidak ditemukan.
  function zoomPhoto(group, src, caption, onFail) {
    var entry = { src: src, caption: caption || "", ok: true };
    group.push(entry);
    var img = h("img", { src: src, alt: caption || "", loading: "lazy" });
    var btn = h("button", { class: "zoomable", type: "button", "aria-label": "Perbesar foto" + (caption ? ": " + caption : "") }, img);
    img.addEventListener("error", function () { entry.ok = false; if (onFail) onFail(); });
    btn.addEventListener("click", function () { openLb(group, group.indexOf(entry), btn); });
    return btn;
  }

  var main = document.getElementById("isi");
  var menu = [];

  function part(key, cls, build) {
    var d = S[key];
    if (!d || !has(d.judul)) return;
    var inner = build(d);
    if (!inner) return;
    var sec = h("section", { class: "part " + (cls || ""), id: key },
      h("div", { class: "wrap" }, inner));
    main.appendChild(sec);
    if (has(d.menu)) menu.push({ id: key, label: d.menu });
  }
  function heading(d) {
    return h("div", { class: "head" }, h("h2", null, d.judul), has(d.intro) ? h("p", { class: "intro" }, d.intro) : null);
  }

  // Hero
  (function () {
    var hero = S.hero || {};
    var card = h("div", { class: "hero-card" });
    function noPhoto() { card.classList.add("no-photo"); var s = card.querySelector(".hero-bg"); if (s) s.remove(); }
    if (has(hero.foto)) {
      var img = h("img", { class: "hero-bg", src: hero.foto, alt: "", loading: "eager" });
      img.addEventListener("error", noPhoto);
      card.appendChild(img);
    } else card.classList.add("no-photo");
    card.appendChild(h("div", { class: "hero-shade" }));
    var b1 = hero.tombolUtama ? link(hero.tombolUtama.teks, hero.tombolUtama.link, "btn btn-gold") : null;
    var b2 = hero.tombolKedua ? link(hero.tombolKedua.teks, hero.tombolKedua.link, "btn btn-line") : null;
    card.appendChild(h("div", { class: "hero-content" },
      h("div", null,
        id.tampilkanBismillah ? h("p", { class: "bismillah", lang: "ar", dir: "rtl" }, "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ") : null,
        h("h1", null, hero.judul || id.nama || "")),
      h("div", { class: "hero-bottom" },
        has(hero.deskripsi) ? h("p", { class: "lead" }, hero.deskripsi) : null,
        (b1 || b2) ? h("div", { class: "btns" }, b1, b2) : null)
    ));
    main.appendChild(h("section", { class: "hero", id: "beranda" }, h("div", { class: "wrap" }, card)));
  })();

  // Tentang
  part("tentang", "", function (d) {
    var left = h("div", null,
      h("h2", null, d.judul),
      (d.paragraf || []).filter(has).map(function (p) { return h("p", null, p); }),
      has(d.sejarah) ? h("div", { class: "history" }, h("h3", null, "Sejarah singkat"), h("p", null, d.sejarah)) : null
    );
    var right = h("div", null,
      has(d.visi) ? h("div", { class: "vision" }, h("h3", null, "Visi"), h("blockquote", null, d.visi)) : null,
      has(d.misi) ? h("div", { class: "mission" }, h("h3", null, "Misi"),
        h("ul", null, d.misi.filter(has).map(function (m) { return h("li", null, m); }))) : null
    );
    return h("div", { class: "about" }, left, right);
  });

  // Program
  part("program", "tint", function (d) {
    if (!has(d.daftar)) return null;
    return [heading(d), h("div", { class: "rows" }, d.daftar.map(function (p) {
      return h("div", { class: "row" },
        h("h3", null, p.nama, has(p.jenjang) ? h("span", { class: "tag" }, p.jenjang) : null),
        h("p", null, p.deskripsi || ""));
    }))];
  });

  // Kegiatan
  part("kegiatan", "dark", function (d) {
    if (!has(d.jadwal)) return null;
    return [heading(d), h("ol", { class: "timeline" }, d.jadwal.map(function (j) {
      return h("li", null, h("time", null, j.waktu || ""), h("span", null, j.kegiatan || ""));
    }))];
  });

  // Fasilitas
  part("fasilitas", "", function (d) {
    if (!has(d.daftar)) return null;
    var group = [];
    return [heading(d), h("div", { class: "facilities" }, d.daftar.map(function (f) {
      var media = null;
      if (has(f.foto)) {
        media = h("div", { class: "facility-img" });
        media.appendChild(zoomPhoto(group, f.foto, f.nama, function () {
          media.textContent = "";
          media.classList.add("empty");
          media.appendChild(h("span", null, "Foto belum ditambahkan"));
        }));
      }
      return h("div", { class: "facility" }, media, h("h3", null, f.nama), has(f.deskripsi) ? h("p", null, f.deskripsi) : null);
    }))];
  });

  // Pengasuh
  part("pengasuh", "tint", function (d) {
    if (!has(d.daftar)) return null;
    return [heading(d), h("div", { class: "people" }, d.daftar.map(function (p) {
      var av = h("div", { class: "avatar" });
      function fallback() { av.textContent = ""; av.appendChild(starSvg()); }
      if (has(p.foto)) {
        var img = h("img", { src: p.foto, alt: p.nama || "", loading: "lazy" });
        img.addEventListener("error", fallback);
        av.appendChild(img);
      } else fallback();
      return h("div", { class: "person" }, av, h("h3", null, p.nama),
        has(p.jabatan) ? h("p", { class: "role" }, p.jabatan) : null,
        has(p.keterangan) ? h("p", null, p.keterangan) : null);
    }))];
  });

  // Berita
  part("berita", "", function (d) {
    if (!has(d.daftar)) return null;
    return [heading(d), h("div", { class: "news" }, d.daftar.map(function (n) {
      var title = link(n.judul, n.link) || n.judul;
      return h("article", { class: "news-item" },
        h("time", null, n.tanggal || ""),
        h("div", null, h("h3", null, title), has(n.ringkasan) ? h("p", null, n.ringkasan) : null));
    }))];
  });

  // Galeri (6 foto terlihat, sisanya digeser)
  part("galeri", "tint", function (d) {
    if (!has(d.foto)) return null;
    var group = [];
    var scroller = h("div", { class: "gallery" });
    d.foto.forEach(function (f) {
      var fig = h("figure", null);
      if (has(f.src)) {
        fig.appendChild(zoomPhoto(group, f.src, f.keterangan, function () {
          fig.textContent = "";
          fig.appendChild(h("div", { class: "ph" }, has(f.keterangan) ? f.keterangan : "Foto belum ditambahkan"));
        }));
        if (has(f.keterangan)) fig.appendChild(h("figcaption", null, f.keterangan));
      } else {
        fig.appendChild(h("div", { class: "ph" }, has(f.keterangan) ? f.keterangan : "Foto belum ditambahkan"));
      }
      scroller.appendChild(fig);
    });
    var prev = h("button", { class: "car-btn", type: "button", "aria-label": "Geser foto ke kiri" }, "\u2039");
    var next = h("button", { class: "car-btn", type: "button", "aria-label": "Geser foto ke kanan" }, "\u203a");
    var ctl = h("div", { class: "car-ctl" }, prev, next);
    var gap = 14;
    var smooth = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    function page(dir) { scroller.scrollBy({ left: dir * (scroller.clientWidth + gap), behavior: smooth ? "smooth" : "auto" }); }
    function update() {
      var overflow = scroller.scrollWidth > scroller.clientWidth + 2;
      ctl.hidden = !overflow;
      prev.disabled = scroller.scrollLeft <= 2;
      next.disabled = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2;
    }
    prev.addEventListener("click", function () { page(-1); });
    next.addEventListener("click", function () { page(1); });
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    setTimeout(update, 0);
    return [h("div", { class: "head head-row" },
      h("div", null, h("h2", null, d.judul), has(d.intro) ? h("p", { class: "intro" }, d.intro) : null), ctl),
      scroller];
  });

  // Pendaftaran
  part("pendaftaran", "dark", function (d) {
    var formUrl = d.tombol ? d.tombol.link : "";
    if (!has(formUrl) && has((S.kontak || {}).whatsapp)) {
      formUrl = "https://wa.me/" + String(S.kontak.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent("Assalamu'alaikum, saya ingin mendaftar sebagai santri baru.");
    }
    var btn = d.tombol ? link(d.tombol.teks, formUrl, "btn btn-gold") : null;
    return [heading(d), h("div", { class: "reg" },
      has(d.alur) ? h("ol", { class: "steps" }, d.alur.map(function (a) {
        return h("li", null, h("div", null, h("h3", null, a.judul), h("p", null, a.keterangan || "")));
      })) : h("div"),
      (has(d.syarat) || btn) ? h("div", { class: "reqs" },
        has(d.syarat) ? [h("h3", null, "Syarat pendaftaran"), h("ul", null, d.syarat.filter(has).map(function (s) { return h("li", null, s); }))] : null,
        btn) : null
    )];
  });

  // Kontak
  part("kontak", "", function (d) {
    var dl = h("dl", null);
    function row(label, val) { if (has(val)) dl.appendChild(h("dt", null, label)); if (has(val)) dl.appendChild(h("dd", null, val)); }
    row("Alamat", d.alamat);
    row("Jam layanan", d.jamLayanan);
    if (has(d.whatsapp)) {
      var num = String(d.whatsapp).replace(/\D/g, "");
      dl.appendChild(h("dt", null, "WhatsApp"));
      dl.appendChild(h("dd", null, h("a", { href: "https://wa.me/" + num, target: "_blank", rel: "noopener" }, d.whatsapp)));
    }
    if (has(d.telepon)) {
      dl.appendChild(h("dt", null, "Telepon"));
      dl.appendChild(h("dd", null, h("a", { href: "tel:" + String(d.telepon).replace(/[^\d+]/g, "") }, d.telepon)));
    }
    if (has(d.email)) {
      dl.appendChild(h("dt", null, "Email"));
      dl.appendChild(h("dd", null, h("a", { href: "mailto:" + d.email }, d.email)));
    }
    var soc = (d.sosial || []).map(function (s) { return link(s.nama, s.link); }).filter(Boolean);
    var map = null;
    if (has(d.peta) && /^https:\/\//i.test(d.peta)) {
      map = h("div", { class: "map" }, h("iframe", { src: d.peta, loading: "lazy", title: "Peta lokasi pesantren", referrerpolicy: "no-referrer-when-downgrade", allowfullscreen: "" }));
    }
    return h("div", { class: "contact" },
      h("div", null, h("h2", null, d.judul), dl, soc.length ? h("div", { class: "social" }, soc) : null),
      map || h("div"));
  });

  /* ---------- bilah atas ---------- */
  (function () {
    var top = document.getElementById("topbar");
    var mark = h("span", { class: "brand-mark" });
    if (has(id.logo)) {
      var li = h("img", { src: id.logo, alt: "" });
      li.addEventListener("error", function () { mark.textContent = ""; mark.appendChild(starSvg()); });
      mark.appendChild(li);
    } else mark.appendChild(starSvg());

    var nav = h("nav", { class: "nav", id: "nav", "aria-label": "Menu utama" });
    menu.forEach(function (m) {
      var cls = m.id === "pendaftaran" ? "cta" : "";
      nav.appendChild(h("a", { href: "#" + m.id, class: cls }, m.label));
    });
    var btn = h("button", { class: "menu-btn", type: "button", "aria-expanded": "false", "aria-controls": "nav" }, "Menu");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
    top.appendChild(h("div", { class: "wrap" },
      h("a", { class: "brand", href: "#beranda" }, mark, id.namaSingkat || id.nama || ""),
      btn, nav));
  })();

  /* ---------- kaki halaman ---------- */
  (function () {
    var f = S.footer || {};
    document.getElementById("footer").appendChild(h("div", { class: "wrap" },
      h("span", null, "© " + new Date().getFullYear() + " " + (id.nama || "") + (has(f.teks) ? ". " + f.teks : "")),
      h("a", { href: "#beranda" }, "Kembali ke atas")));
  })();
})();
