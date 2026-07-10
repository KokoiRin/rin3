import { EntranceGates } from "./entrance-gates";

export default function Home() {
  return (
    <main className="entrance">
      <header className="brand-lockup">
        <p className="brand-kicker">A PERSONAL LEARNING ARCHIVE</p>
        <h1>RIN III</h1>
        <p className="brand-note">Three disciplines. One continuous practice.</p>
      </header>

      <EntranceGates />

      <p className="swipe-hint" aria-hidden="true">SWIPE TO EXPLORE</p>
    </main>
  );
}
