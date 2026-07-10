export function BrokenControls() {
  return (
    <main>
      <img src="hero.png" />
      <button><svg aria-hidden="true" /></button>
      <div onClick={save}>Save</div>
      <span role="button" onClick={remove}>Remove</span>
    </main>
  );
}
