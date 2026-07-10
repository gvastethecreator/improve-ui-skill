export function CommandMenu() {
  return (
    <section className="command-menu">
      <button onClick={openMenu}><Icon /></button>
      <div onClick={() => undefined}>Open recent project</div>
      <img src="/keyboard-shortcut.png" />
    </section>
  );
}

function Icon() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" />;
}

function openMenu() {}
