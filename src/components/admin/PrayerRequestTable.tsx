"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Eye, Pencil, RotateCcw, Save, X } from "lucide-react";
import { setPrayerRequestClosedAction, updatePrayerRequestAction } from "@/app/admin/actions";
import { PRAYER_REQUEST_TYPES } from "@/lib/prayerRequestTypes";

export interface PrayerRequestView {
  id: string;
  date: string; // YYYY-MM-DD
  dateLabel: string;
  familyId: string;
  familyHead: string;
  name: string;
  type: string | null;
  request: string;
  isClosed: boolean;
  recorded: string;
  closedLabel: string | null;
}

const button =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-60";

/** Marks one request closed (or reopens it). A small form so it works without JS too. */
function CloseToggle({ row, show, className = "" }: { row: PrayerRequestView; show: string; className?: string }) {
  return (
    <form action={setPrayerRequestClosedAction} className={className}>
      <input type="hidden" name="request_uuid" value={row.id} />
      <input type="hidden" name="close" value={row.isClosed ? "0" : "1"} />
      <input type="hidden" name="show" value={show} />
      <button
        type="submit"
        className={`${button} w-full ${
          row.isClosed
            ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
            : "border border-green-600 text-green-700 hover:bg-green-50"
        }`}
      >
        {row.isClosed ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
        {row.isClosed ? "Reopen" : "Close"}
      </button>
    </form>
  );
}

/** The "View" window: full details, with Edit, Close (the request) and Close Window. */
function ViewWindow({ row, show, onDismiss }: { row: PrayerRequestView; show: string; onDismiss: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const dismissRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dismissRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss();
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onDismiss]);

  const label = "block text-sm font-medium text-gray-700 mb-1";
  const input =
    "w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900";
  const detail = (term: string, value: React.ReactNode) => (
    <div className="py-2 sm:flex sm:gap-4">
      <dt className="sm:w-36 shrink-0 text-sm text-gray-500">{term}</dt>
      <dd className="font-medium text-gray-900 whitespace-pre-wrap break-words">{value}</dd>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Prayer request for ${row.name}`}
        className="w-full max-w-lg max-h-full overflow-y-auto bg-white rounded-2xl shadow-2xl animate-pop-in"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-blue-900">{editing ? "Edit Prayer Request" : "Prayer Request"}</h3>
          <button
            ref={dismissRef}
            type="button"
            onClick={onDismiss}
            aria-label="Close window"
            className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {editing ? (
          <form action={updatePrayerRequestAction} onSubmit={() => setSaving(true)} className="p-5 space-y-4">
            <input type="hidden" name="request_uuid" value={row.id} />
            <input type="hidden" name="show" value={show} />
            <p className="text-sm text-gray-600">
              For <span className="font-semibold text-gray-900">{row.name}</span> (family of {row.familyHead})
            </p>
            <div>
              <label htmlFor="edit_date" className={label}>Date</label>
              <input id="edit_date" name="request_date" type="date" defaultValue={row.date} required className={input} />
            </div>
            <div>
              <label htmlFor="edit_type" className={label}>Type of Request</label>
              <select id="edit_type" name="request_type" defaultValue={row.type ?? ""} required className={input}>
                <option value="" disabled>Select a type…</option>
                {PRAYER_REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit_request" className={label}>Prayer Request</label>
              <textarea id="edit_request" name="prayer_request" rows={5} defaultValue={row.request} required className={input} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className={`${button} py-2.5 sm:w-32 border border-gray-300 text-gray-700 hover:bg-gray-50`}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className={`${button} py-2.5 flex-1 bg-blue-900 text-white hover:bg-blue-800`}>
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 space-y-4">
            <dl className="divide-y divide-gray-100">
              {detail("Date", row.dateLabel)}
              {detail("Family Head", row.familyHead)}
              {detail("Name", row.name)}
              {detail("Type of Request", row.type ?? "—")}
              {detail("Prayer Request", row.request)}
              {detail("Status", row.isClosed ? `Closed${row.closedLabel ? ` · ${row.closedLabel}` : ""}` : "Open")}
              {detail("Recorded", row.recorded)}
            </dl>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={`${button} py-2.5 border border-blue-900 text-blue-900 hover:bg-blue-50`}
              >
                <Pencil size={15} />
                Edit
              </button>
              <CloseToggle row={row} show={show} />
              <button
                type="button"
                onClick={onDismiss}
                className={`${button} py-2.5 col-span-2 sm:col-span-1 bg-gray-100 text-gray-800 hover:bg-gray-200`}
              >
                <X size={15} />
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Groups requests by family, keeping the incoming (newest-first) order: a
 * family appears where its newest request would, with all its requests
 * together under it.
 */
function groupByFamily(rows: PrayerRequestView[]) {
  const groups = new Map<string, PrayerRequestView[]>();
  for (const row of rows) {
    const list = groups.get(row.familyId) ?? [];
    list.push(row);
    groups.set(row.familyId, list);
  }
  return [...groups.values()];
}

type SortKey = "family" | "name" | "date" | "problem";
type Sort = { key: SortKey; dir: "asc" | "desc" } | null;

const byText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

/** Ascending comparison for one column. Requests without a type sort last. */
function compare(a: PrayerRequestView, b: PrayerRequestView, key: SortKey) {
  switch (key) {
    case "family":
      return byText(a.familyHead, b.familyHead);
    case "name":
      return byText(a.name, b.name);
    case "date":
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    case "problem":
      if (a.type !== b.type) {
        if (!a.type) return 1;
        if (!b.type) return -1;
        return byText(a.type, b.type);
      }
      return byText(a.request, b.request);
  }
}

// Choices for the phone "Sort by" dropdown, which stands in for the headings.
const PHONE_SORTS: { value: string; label: string; sort: Sort }[] = [
  { value: "", label: "Family (newest first)", sort: null },
  { value: "family-asc", label: "Family Head (A–Z)", sort: { key: "family", dir: "asc" } },
  { value: "name-asc", label: "Name (A–Z)", sort: { key: "name", dir: "asc" } },
  { value: "date-desc", label: "Date (newest first)", sort: { key: "date", dir: "desc" } },
  { value: "date-asc", label: "Date (oldest first)", sort: { key: "date", dir: "asc" } },
  { value: "problem-asc", label: "Problem (A–Z)", sort: { key: "problem", dir: "asc" } },
];

/**
 * Saved prayer requests, with Close and View on every request. By default
 * they're grouped by family (one merged Family Head cell per family);
 * clicking a column heading sorts by it, and sorting by anything other
 * than Family Head lists one row per request instead.
 */
export default function PrayerRequestTable({ rows, show }: { rows: PrayerRequestView[]; show: string }) {
  const [viewing, setViewing] = useState<PrayerRequestView | null>(null);
  const [sort, setSort] = useState<Sort>(null);

  const grouped = !sort || sort.key === "family";
  const families = groupByFamily(rows);
  if (sort?.key === "family") {
    families.sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compare(a[0], b[0], "family"));
  }
  // Array sort is stable, so ties keep the incoming newest-first order.
  const flat = sort && !grouped ? [...rows].sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compare(a, b, sort.key)) : rows;

  const th = "text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2 whitespace-nowrap";
  const td = "px-3 py-2.5 text-sm text-gray-800 align-top";

  function toggle(key: SortKey) {
    setSort((current) =>
      current?.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "date" ? "desc" : "asc" }
    );
  }

  const header = (key: SortKey, label: string) => {
    const active = sort?.key === key;
    const Arrow = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th className={th} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          onClick={() => toggle(key)}
          className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-blue-900 ${active ? "text-blue-900" : ""}`}
        >
          {label}
          <Arrow size={13} className={active ? "" : "opacity-40"} />
        </button>
      </th>
    );
  };

  const nameCell = (r: PrayerRequestView) => (
    <>
      {r.name}
      {r.isClosed && (
        <span className="ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
          Closed
        </span>
      )}
    </>
  );
  const problemCell = (r: PrayerRequestView) => (
    <>
      {r.type && <span className="block text-xs font-semibold text-blue-900 mb-0.5">{r.type}</span>}
      <span className="line-clamp-2 text-gray-700">{r.request}</span>
    </>
  );
  const actions = (r: PrayerRequestView, layout: "row" | "grid") => (
    <div className={layout === "row" ? "flex justify-end gap-2" : "grid grid-cols-2 gap-2 pt-1"}>
      <CloseToggle row={r} show={show} />
      <button
        type="button"
        onClick={() => setViewing(r)}
        className={`${button} border border-blue-900 text-blue-900 hover:bg-blue-50`}
      >
        <Eye size={14} />
        View
      </button>
    </div>
  );
  const card = (r: PrayerRequestView, withFamily: boolean) => (
    <li key={r.id} className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{nameCell(r)}</p>
          {withFamily && <p className="text-xs text-gray-500">Family of {r.familyHead}</p>}
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{r.dateLabel}</span>
      </div>
      <div className="text-sm">{problemCell(r)}</div>
      {actions(r, "grid")}
    </li>
  );
  const phoneSortValue = PHONE_SORTS.find((o) => o.sort?.key === sort?.key && o.sort?.dir === sort?.dir)?.value ?? "";

  return (
    <>
      <div className="flex items-center justify-end gap-3 text-sm">
        <label className="md:hidden flex items-center gap-2 text-gray-600">
          Sort by
          <select
            value={phoneSortValue}
            onChange={(e) => setSort(PHONE_SORTS.find((o) => o.value === e.target.value)?.sort ?? null)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-900"
          >
            {PHONE_SORTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {sort && (
          <button type="button" onClick={() => setSort(null)} className="hidden md:inline text-blue-900 hover:underline">
            Reset to family view
          </button>
        )}
      </div>

      {/* Phones: cards, so nothing hides off the right edge. */}
      <div className="md:hidden space-y-4">
        {grouped ? (
          families.map((group) => (
            <section key={group[0].familyId} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <h3 className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-blue-900">
                Family of {group[0].familyHead}
                {group.length > 1 && <span className="font-normal text-gray-500"> · {group.length} requests</span>}
              </h3>
              <ul className="divide-y divide-gray-100">{group.map((r) => card(r, false))}</ul>
            </section>
          ))
        ) : (
          <ul className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {flat.map((r) => card(r, true))}
          </ul>
        )}
      </div>

      {/* Tablets and computers: the table. */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr>
              {header("family", "Family Head")}
              {header("name", "Name of the Person")}
              {header("date", "Date")}
              {header("problem", "Problem")}
              <th className={`${th} text-right`}></th>
            </tr>
          </thead>
          {grouped ? (
            // One tbody per family, so the merged Family Head cell and a
            // stronger divider mark where each family's requests start.
            families.map((group) => (
              <tbody key={group[0].familyId} className="border-t-2 border-gray-200">
                {group.map((r, i) => (
                  <tr key={r.id} className={i > 0 ? "border-t border-gray-100" : undefined}>
                    {i === 0 && (
                      <td rowSpan={group.length} className={`${td} font-medium text-gray-900 bg-gray-50/60 border-r border-gray-100`}>
                        {r.familyHead}
                        {group.length > 1 && (
                          <span className="block text-xs font-normal text-gray-500">{group.length} requests</span>
                        )}
                      </td>
                    )}
                    <td className={`${td} font-semibold text-gray-900`}>{nameCell(r)}</td>
                    <td className={`${td} whitespace-nowrap`}>{r.dateLabel}</td>
                    <td className={`${td} max-w-xs`}>{problemCell(r)}</td>
                    <td className={`${td} text-right`}>{actions(r, "row")}</td>
                  </tr>
                ))}
              </tbody>
            ))
          ) : (
            <tbody>
              {flat.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className={td}>{r.familyHead}</td>
                  <td className={`${td} font-semibold text-gray-900`}>{nameCell(r)}</td>
                  <td className={`${td} whitespace-nowrap`}>{r.dateLabel}</td>
                  <td className={`${td} max-w-xs`}>{problemCell(r)}</td>
                  <td className={`${td} text-right`}>{actions(r, "row")}</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {viewing && <ViewWindow row={viewing} show={show} onDismiss={() => setViewing(null)} />}
    </>
  );
}
