"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Check, Eye, Pencil, UserPlus } from "lucide-react";
import { addPrayerRequestAction } from "@/app/admin/actions";
import { PRAYER_REQUEST_TYPES } from "@/lib/prayerRequestTypes";

export interface MemberChoice {
  id: string;
  label: string;
}

/**
 * Type-to-search member picker: shows every member whose name contains the
 * typed letters (anywhere in the name, any case). When the letters match
 * exactly one member, that member is selected automatically; otherwise a
 * click, Enter or Tab picks one. Leaving the box with a selection fills in
 * the full name.
 */
function matchesFor(members: MemberChoice[], query: string) {
  const needle = query.trim().toLowerCase();
  return (needle ? members.filter((m) => m.label.toLowerCase().includes(needle)) : members).slice(0, 50);
}

function MemberSearch({
  members,
  value,
  onChange,
  inputClass,
  invalid,
}: {
  members: MemberChoice[];
  value: string;
  onChange: (id: string) => void;
  inputClass: string;
  invalid: boolean;
}) {
  const [query, setQuery] = useState(() => members.find((m) => m.id === value)?.label ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const matches = matchesFor(members, query);
  const selected = members.find((m) => m.id === value);

  function choose(m: MemberChoice) {
    onChange(m.id);
    setQuery(m.label);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        id="member_search"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder="Type a name to search…"
        value={query}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          setActive(0);
          setOpen(true);
          // Only one member has these letters in their name: select them.
          const found = matchesFor(members, next);
          const only = next.trim().length >= 2 && found.length === 1 ? found[0].id : "";
          if (only !== value) onChange(only);
        }}
        onFocus={() => setOpen(true)}
        // Delay so a tap on a list item registers before the list closes.
        onBlur={() =>
          setTimeout(() => {
            setOpen(false);
            if (selected) setQuery(selected.label);
          }, 150)
        }
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && open && matches[active]) {
            e.preventDefault();
            choose(matches[active]);
          } else if (e.key === "Tab" && open && query.trim() && matches[active]) {
            // Tab picks the highlighted name and moves on, without stopping focus.
            choose(matches[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={`${inputClass} ${invalid ? "border-red-500 ring-1 ring-red-500" : ""}`}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">No member with &ldquo;{query.trim()}&rdquo; in their name.</li>
          ) : (
            matches.map((m, i) => (
              <li
                key={m.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={m.id === value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(m)}
                onMouseEnter={() => setActive(i)}
                className={`px-3 py-2 cursor-pointer text-gray-900 ${i === active ? "bg-blue-50" : ""}`}
              >
                {m.label}
              </li>
            ))
          )}
        </ul>
      )}
      {selected && <p className="mt-1 text-sm text-green-700">✓ Selected: {selected.label}</p>}
    </div>
  );
}

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * New prayer request: fill in, Submit shows a preview, and only Confirm &
 * Save writes it. Edit goes back to the form with everything kept.
 */
export default function PrayerRequestForm({ members, today }: { members: MemberChoice[]; today: string }) {
  const [date, setDate] = useState(today);
  const [memberId, setMemberId] = useState("");
  const [requestType, setRequestType] = useState("");
  const [request, setRequest] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameMissing, setNameMissing] = useState(false);

  const label = "block text-sm font-medium text-gray-700 mb-1";
  const input =
    "w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900";
  const card = "bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 max-w-3xl";
  const memberName = members.find((m) => m.id === memberId)?.label ?? "";

  if (previewing) {
    return (
      <form action={addPrayerRequestAction} onSubmit={() => setSaving(true)} className={card}>
        <h2 className="font-bold text-blue-900">Please check before saving</h2>
        <input type="hidden" name="request_date" value={date} />
        <input type="hidden" name="member_uuid" value={memberId} />
        <input type="hidden" name="request_type" value={requestType} />
        <input type="hidden" name="prayer_request" value={request} />

        <dl className="divide-y divide-gray-100">
          <div className="py-2 sm:flex sm:gap-4">
            <dt className="sm:w-44 shrink-0 text-sm text-gray-500">Date</dt>
            <dd className="font-medium text-gray-900">{DATE.format(new Date(`${date}T00:00:00Z`))}</dd>
          </div>
          <div className="py-2 sm:flex sm:gap-4">
            <dt className="sm:w-44 shrink-0 text-sm text-gray-500">Name of the Person</dt>
            <dd className="font-medium text-gray-900">{memberName}</dd>
          </div>
          <div className="py-2 sm:flex sm:gap-4">
            <dt className="sm:w-44 shrink-0 text-sm text-gray-500">Type of Request</dt>
            <dd className="font-medium text-gray-900">{requestType}</dd>
          </div>
          <div className="py-2 sm:flex sm:gap-4">
            <dt className="sm:w-44 shrink-0 text-sm text-gray-500">Prayer Request</dt>
            <dd className="font-medium text-gray-900 whitespace-pre-wrap">{request.trim()}</dd>
          </div>
        </dl>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            disabled={saving}
            className="sm:w-40 inline-flex items-center justify-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-50 disabled:opacity-60 font-semibold px-5 py-2.5 rounded-lg"
          >
            <Pencil size={16} />
            Edit
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg"
          >
            <Check size={16} />
            {saving ? "Saving..." : "Confirm & Save"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!memberId) {
          setNameMissing(true);
          document.getElementById("member_search")?.focus();
          return;
        }
        setPreviewing(true);
      }}
      className={card}
    >
      <h2 className="font-bold text-blue-900">New Prayer Request</h2>

      <div className="sm:max-w-xs">
        <label htmlFor="request_date" className={label}>
          Date
        </label>
        <input
          id="request_date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={input}
        />
      </div>

      <div>
        <label htmlFor="member_search" className={label}>
          Name of the Person
        </label>
        <MemberSearch
          members={members}
          value={memberId}
          onChange={(id) => {
            setMemberId(id);
            if (id) setNameMissing(false);
          }}
          inputClass={input}
          invalid={nameMissing}
        />
        {nameMissing && <p className="text-sm text-red-600 mt-1">Choose a name from the list.</p>}
        <p className="text-sm text-gray-500 mt-1">
          Not in the list?{" "}
          <Link
            href="/member-registration"
            target="_blank"
            className="inline-flex items-center gap-1 text-blue-900 font-medium hover:underline"
          >
            <UserPlus size={14} />
            Register them first
          </Link>
          , then reload this page.
        </p>
      </div>

      <div>
        <label htmlFor="request_type" className={label}>
          Type of Request
        </label>
        <select
          id="request_type"
          value={requestType}
          onChange={(e) => setRequestType(e.target.value)}
          required
          className={input}
        >
          <option value="" disabled>
            Select a type…
          </option>
          {PRAYER_REQUEST_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="prayer_request" className={label}>
          Prayer Request
        </label>
        <textarea
          id="prayer_request"
          rows={4}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          required
          className={input}
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg"
      >
        <Eye size={16} />
        Submit
      </button>
    </form>
  );
}
