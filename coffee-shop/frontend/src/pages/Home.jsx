import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="hero">
      <h1>Fresh coffee, simple ordering.</h1>
      <p>Home page</p>
      <Link className="button" to="/menu">Browse Menu</Link>
    </section>
  );
}
