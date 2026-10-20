import { MONTHS, SALUTATIONS } from "@/types/familyRegistrationSchema";

export const adminInput =
  "w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900";
export const adminLabel = "block text-sm font-medium text-gray-700 mb-1";

const RELATIONSHIPS: [string, string][] = [
  ["head", "Head of Family"],
  ["spouse", "Spouse"],
  ["child", "Child"],
  ["parent", "Parent"],
  ["in_law", "In-law"],
];

export interface MemberDefaults {
  salutation?: string | null;
  full_name?: string;
  relationship?: string;
  birth_day?: number | null;
  birth_month?: number | null;
  birth_year?: number | null;
  phone?: string | null;
  email?: string | null;
  is_baptized?: boolean;
  consent?: boolean;
}

/** The member inputs shared by the edit and add forms (names match the actions). */
export default function MemberFields({
  defaults = {},
  allowHead = true,
  idPrefix = "",
}: {
  defaults?: MemberDefaults;
  allowHead?: boolean;
  idPrefix?: string;
}) {
  const id = (name: string) => `${idPrefix}${name}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[6rem_1fr] sm:grid-cols-[7rem_1fr_12rem] gap-3">
        <div>
          <label htmlFor={id("salutation")} className={adminLabel}>Title</label>
          <select id={id("salutation")} name="salutation" defaultValue={defaults.salutation ?? ""} required className={adminInput}>
            <option value="" disabled>Select</option>
            {SALUTATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={id("full_name")} className={adminLabel}>Full Name</label>
          <input id={id("full_name")} name="full_name" defaultValue={defaults.full_name ?? ""} required minLength={2} className={adminInput} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor={id("relationship")} className={adminLabel}>Relationship</label>
          <select id={id("relationship")} name="relationship" defaultValue={defaults.relationship ?? "child"} className={adminInput}>
            {RELATIONSHIPS.filter(([value]) => allowHead || value !== "head").map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className={adminLabel}>Date of Birth</span>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <select aria-label="Day of birth" name="birth_day" defaultValue={defaults.birth_day ?? ""} className={adminInput}>
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select aria-label="Month of birth" name="birth_month" defaultValue={defaults.birth_month ?? ""} className={adminInput}>
            <option value="">Mon</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m.slice(0, 3)}</option>
            ))}
          </select>
          <input aria-label="Year of birth" name="birth_year" type="number" min={1900} max={2100} placeholder="Year" defaultValue={defaults.birth_year ?? ""} className={adminInput} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={id("phone")} className={adminLabel}>Phone</label>
          <input id={id("phone")} name="phone" type="tel" defaultValue={defaults.phone ?? ""} className={adminInput} />
        </div>
        <div>
          <label htmlFor={id("email")} className={adminLabel}>Email</label>
          <input id={id("email")} name="email" type="email" defaultValue={defaults.email ?? ""} className={adminInput} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_baptized" defaultChecked={defaults.is_baptized ?? false} className="h-4 w-4" />
          Baptized
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="consent" defaultChecked={defaults.consent ?? true} className="h-4 w-4" />
          Agreed to greetings and LED screens
        </label>
      </div>
    </div>
  );
}
