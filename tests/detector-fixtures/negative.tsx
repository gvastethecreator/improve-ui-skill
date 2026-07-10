export function AccessibleControls() {
  return (
    <main>
      <img src="hero.png" alt="Product dashboard" width="1200" height="800" />
      <button aria-label="Close"><svg aria-hidden="true" /></button>
      <button onClick={save}>Save</button>
    </main>
  );
}
