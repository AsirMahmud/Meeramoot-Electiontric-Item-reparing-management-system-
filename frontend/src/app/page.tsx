import { APP_DISPLAY_NAME } from "@/lib/constants";
import { fetchApiHealth } from "@/lib/api-health";

export default async function Home() {
  const health = await fetchApiHealth();

  return (
    <div className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-700">
              Meeramoot
            </span>
            <h1 className="text-lg font-semibold leading-tight text-slate-900">
              {APP_DISPLAY_NAME}
            </h1>
          </div>
          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-block">
            Next.js frontend · separate server
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-medium text-sky-800">Welcome</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Repair operations in one place
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            This interface runs on its own host while the Express API and Prisma
            database run elsewhere. Configure{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800">
              NEXT_PUBLIC_API_URL
            </code>{" "}
            to point at your API, and ensure{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800">
              FRONTEND_ORIGIN
            </code>{" "}
            on the backend allows this origin for CORS.
          </p>
        </section>

        <section
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
          aria-labelledby="api-status-heading"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2
                id="api-status-heading"
                className="text-lg font-semibold text-slate-900"
              >
                API connection
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Live check against{" "}
                <span className="font-mono text-slate-800">
                  {health.baseUrl}
                </span>
              </p>
            </div>
            <div
              className={
                health.ok && health.data.ok
                  ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200"
                  : "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-800 ring-1 ring-rose-200"
              }
            >
              <span
                className={
                  health.ok && health.data.ok
                    ? "size-2 rounded-full bg-emerald-500"
                    : "size-2 rounded-full bg-rose-500"
                }
                aria-hidden
              />
              {health.ok && health.data.ok ? "Reachable" : "Issue"}
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Backend name
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {health.ok && health.data.app
                  ? health.data.app
                  : "—"}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Slug
              </dt>
              <dd className="mt-1 break-all font-mono text-sm text-slate-800">
                {health.ok && health.data.slug
                  ? health.data.slug
                  : "—"}
              </dd>
            </div>
          </dl>

          {!health.ok && (
            <p className="mt-4 text-sm text-rose-700" role="status">
              {health.message}. Start the API (e.g.{" "}
              <code className="rounded bg-rose-100/80 px-1 py-0.5 font-mono text-xs">
                npm run dev
              </code>{" "}
              in{" "}
              <code className="rounded bg-rose-100/80 px-1 py-0.5 font-mono text-xs">
                backend
              </code>
              ) or fix the API URL.
            </p>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Meeramoot · Electric item repair management
      </footer>
    </div>
  );
}
