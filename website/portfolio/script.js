// Hero name: letters pop in one by one
fetch("../navbar.html")
  .then(r => r.text())
  .then(html => {
    const box = document.getElementById("site-nav");
    box.innerHTML = html;
    // scripts inserted with innerHTML don't run, so re-create them
    box.querySelectorAll("script").forEach(old => {
      const s = document.createElement("script");
      if (old.src) s.src = old.getAttribute("src"); else s.textContent = old.textContent;
      old.replaceWith(s);
    });
  });
const h1 = document.querySelector(".hero h1");
h1.innerHTML = [...h1.textContent].map((c, i) =>
  c === " " ? " " : `<span style="animation-delay:${0.1 + i * 0.07}s">${c}</span>`).join("");

// Scroll progress bar + active nav link
const bar = document.getElementById("bar");
const links = [...document.querySelectorAll(".page-nav a")];
const secs = links.map(a => document.querySelector(a.getAttribute("href")));
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (scrollY / max) * 100 + "%";
  let cur = -1;
  secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
  links.forEach((a, i) => a.classList.toggle("on", i === cur));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Reveal blocks as they enter the screen
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// Accordions
document.querySelectorAll(".acc > button").forEach(btn => {
  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", () => {
    const accordion = btn.parentElement;
    const open = accordion.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);

    const image = accordion.dataset.bg;
    if (image) {
      accordion.style.backgroundImage = open
    ? `linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.65)), url("${image}")`
    : "none";
      accordion.style.backgroundSize = "cover";
      accordion.style.backgroundPosition = "center";
    }
  });
});

// Tabs
function setPanelBackground(panel, visible) {
  const image = panel.dataset.bg;
  if (!image) return;

  panel.style.backgroundImage = visible
    ? `linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.65)), url("${image}")`
    : "none";
  panel.style.backgroundSize = "cover";
  panel.style.backgroundPosition = "center";
}

document.querySelectorAll("[data-tabs]").forEach(group => {
  const tabs = [...group.querySelectorAll("[role=tab]")];
  const panels = [...group.parentElement.querySelectorAll(".panel")];
  panels.forEach(panel => setPanelBackground(panel, panel.classList.contains("show")));
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    tabs.forEach((x, j) => x.setAttribute("aria-selected", i === j));
    panels.forEach((p, j) => {
      const visible = i === j;
      p.classList.toggle("show", visible);
      setPanelBackground(p, visible);
    });
  }));
});
//awards section
const awardsToggle = document.getElementById('awards-toggle');
const awardsMore = document.getElementById('awards-more');
if (awardsToggle && awardsMore) {
  awardsToggle.addEventListener('click', () => {
    const show = awardsMore.hidden;
    awardsMore.hidden = !show;
    awardsToggle.setAttribute('aria-expanded', show);
    awardsToggle.textContent = show ? 'Show less' : 'Show all';
  });
}