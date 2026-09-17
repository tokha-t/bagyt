import Link from "next/link";
export default function NotFound() {
  return (
    <main className="content panel">
      <p className="eyebrow">A DIFFERENT DIRECTION</p>
      <h1>This path does not exist.</h1>
      <p>Start with your profile to find your university options.</p>
      <Link className="button primary" href="/">
        Go home →
      </Link>
    </main>
  );
}
