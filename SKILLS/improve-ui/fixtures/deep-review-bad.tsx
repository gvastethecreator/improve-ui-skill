export function DeepReviewBadFixture() {
  const items = ["alpha", "beta", "gamma"];
  const toastCss = "@keyframes toastIn { from { transform: translateY(100%); } to { transform: translateY(0); } } .toast { animation: toastIn 500ms ease-in; }";

  return (
    <section className="w-[960px] rounded-3xl bg-gradient-to-r from-purple-500 to-cyan-400">
      <button className="transition-all duration-300">
        <svg viewBox="0 0 16 16" />
      </button>
      <div className="popover scale-0 ease-in duration-500 hover:scale-110" style={{ transformOrigin: "center" }}>
        Motion trap
      </div>
      <div
        onClick={() => {
          const width = document.body.getBoundingClientRect().width;
          document.body.style.setProperty("--fixture-width", `${width}px`);
          document.body.style.setProperty("--drag-y", "12px");
        }}
      >
        Open
      </div>
      <div
        onPointerMove={(event) => {
          event.currentTarget.style.transform = `translateY(${event.clientY}px)`;
        }}
      >
        Drag surface
      </div>
      <style>{toastCss}</style>
      <img src="/placeholder" />
      {items.map((item) => (
        <div key={item} style={{ backdropFilter: "blur(20px)", boxShadow: "0 24px 80px #0008" }}>
          <span>SECTION 01</span>
          <span>John Doe from Acme Corp</span>
          <span>last sync 4s ago · main · v0.6.2-rc.1</span>
          <div className="mock-dashboard-preview">
            <div className="skeleton-row" />
          </div>
          {item}
        </div>
      ))}
    </section>
  );
}
