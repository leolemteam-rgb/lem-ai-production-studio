
import Link from "next/link";

export default function AccessDenied() {
  return (
    <main className="wrap">
      <section className="panel">
        <p className="gold">
          LARRY ELDER MINISTRIES
        </p>

        <h1>Access Denied</h1>

        <p>
          Your account does not currently have
          an active membership in the
          LEM AI Production Studio.
        </p>

        <p>
          Please contact your ministry
          administrator if you believe
          you should have access.
        </p>

        <Link href="/login" className="button">
          Return to Login
        </Link>
      </section>
    </main>
  );
}
