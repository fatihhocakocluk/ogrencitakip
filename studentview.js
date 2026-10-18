import { $ } from "./common.js";
import { mountCollection, mountChat } from "./records.js";
import { mountReport } from "./report.js";

// Öğrenci sekmeleri; öğretmen ve veli paneli ortak kullanır. role: "ogretmen" | "veli"
export function mountStudent(host, sid, st, role) {
  const teacher = role === "ogretmen";
  const tabs = [["lessons", "Dersler ve Konular"], ["exams", "Denemeler"], ["books", "Kitaplar"], ["report", teacher ? "Rapor" : "Raporlar"], ["chat", "Mesajlar"]];
  host.innerHTML = `<div class="tabs">${tabs.map(([k, l], i) => `<button class="tab${i ? "" : " on"}" data-k="${k}">${l}</button>`).join("")}</div><div id="pane"></div>`;
  let stop = () => {};
  const show = k => {
    stop();
    const p = $("#pane", host); p.innerHTML = "";
    stop = k === "report" ? mountReport(p, sid, st, teacher)
      : k === "chat" ? mountChat(p, sid, role)
      : mountCollection(p, sid, k, teacher);
  };
  host.querySelectorAll(".tab").forEach(b => b.onclick = () => {
    host.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x === b));
    show(b.dataset.k);
  });
  show("lessons");
  return () => { stop(); host.innerHTML = ""; };
}
