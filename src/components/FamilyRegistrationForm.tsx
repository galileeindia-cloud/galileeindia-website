"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  familyRegistrationSchema,
  DEPENDENT_RELATIONSHIPS,
  RELATIONSHIP_LABELS,
  MONTHS,
  SALUTATIONS,
  CITIES,
  DEFAULT_CITY,
  OTHER_CITY,
  type FamilyRegistrationSchema,
} from "@/types/familyRegistrationSchema";
import {
  registerFamily,
  type FamilyInput,
  type MemberInput,
  type Salutation,
} from "@/services/familyService";

const inputClass =
  "w-full min-w-0 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900";
// Narrow fields (title, day/month/year) need less side padding so their
// text isn't clipped on phones.
const compactInputClass =
  "w-full min-w-0 rounded-lg border border-gray-300 px-2 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900";
const labelClass = "block font-medium text-gray-700 mb-2";
const errorClass = "mt-1 text-sm text-red-600";

// <input type="month"> value format (YYYY-MM): January 2025.
const DEFAULT_ATTENDING_SINCE = "2025-01";

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();

/** "2012-06" (from <input type="month">) -> "2012-06-01", or null. */
function monthToDate(month: string | undefined): string | null {
  if (!month) return null;
  return `${month}-01`;
}

/** "" -> null, otherwise the parsed number. */
function toNumberOrNull(value: string | undefined): number | null {
  return value ? Number(value) : null;
}

/** "3", "6", "1990" -> "3 June 1990"; no day/month -> "—". */
function formatBirthday(day?: string, month?: string, year?: string): string {
  if (!day || !month) return "—";
  return [day, MONTHS[Number(month) - 1], year].filter(Boolean).join(" ");
}

/** "2025-01" -> "January 2025"; "" -> "—". */
function formatMonth(month?: string): string {
  if (!month) return "—";
  const [year, m] = month.split("-");
  return `${MONTHS[Number(m) - 1]} ${year}`;
}

function cityOf(values: FamilyRegistrationSchema): string {
  return (values.city === OTHER_CITY ? values.city_other?.trim() : values.city) || "";
}

/** Turns validated form values into the family row and its member rows. */
function toRegistration(values: FamilyRegistrationSchema): {
  family: FamilyInput;
  members: MemberInput[];
} {
  // Salutations are checked against SALUTATIONS by the schema before this runs.
  const members: MemberInput[] = [
    {
      salutation: values.head_salutation as Salutation,
      full_name: values.head_name,
      relationship: "head",
      birth_day: toNumberOrNull(values.head_birth_day),
      birth_month: toNumberOrNull(values.head_birth_month),
      birth_year: toNumberOrNull(values.head_birth_year),
      phone: values.head_phone,
      email: values.head_email || null,
      consent: values.consent,
      is_baptized: values.head_is_baptized,
    },
    ...values.dependents.map((dependent) => ({
      salutation: dependent.salutation as Salutation,
      full_name: dependent.full_name,
      relationship: dependent.relationship,
      birth_day: toNumberOrNull(dependent.birth_day),
      birth_month: toNumberOrNull(dependent.birth_month),
      birth_year: toNumberOrNull(dependent.birth_year),
      phone: dependent.phone || null,
      email: dependent.email || null,
      consent: values.consent,
      is_baptized: dependent.is_baptized,
    })),
  ];

  return {
    family: {
      anniversary_date: values.anniversary_date || null,
      attending_since: monthToDate(values.attending_since),
      address: values.address || null,
      city: cityOf(values) || null,
      zip_code: values.zip_code || null,
    },
    members,
  };
}

const EMPTY_FORM = {
  head_salutation: "",
  head_is_baptized: false,
  dependents: [],
  consent: false,
  city: DEFAULT_CITY,
  attending_since: DEFAULT_ATTENDING_SINCE,
};

export default function FamilyRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Validated values awaiting the user's confirmation; null while editing.
  const [review, setReview] = useState<FamilyRegistrationSchema | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyRegistrationSchema>({
    resolver: zodResolver(familyRegistrationSchema),
    defaultValues: EMPTY_FORM,
  });

  const isOtherCity = useWatch({ control, name: "city" }) === OTHER_CITY;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependents",
  });

  function onReview(values: FamilyRegistrationSchema) {
    setSubmitError(null);
    setReview(values);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToEdit() {
    setSubmitError(null);
    setReview(null);
  }

  async function confirmSubmit() {
    if (!review) return;
    setSubmitError(null);
    setIsSaving(true);

    try {
      const { family, members } = toRegistration(review);
      await registerFamily(family, members);

      reset(EMPTY_FORM);
      setReview(null);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Family registration submission failed:", err);
      setSubmitError(
        "Something went wrong while submitting your family's details. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-lg text-center">
        <CheckCircle2 className="mx-auto text-blue-900" size={48} />

        <h2 className="text-2xl font-bold text-blue-900 mt-4">Thank You!</h2>

        <p className="mt-2 text-gray-600">
          We&rsquo;ve added your family to our records. God bless you and your
          household.
        </p>

        <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          To change any of these details, please contact the <strong>Admin</strong>.
        </p>

        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-blue-900 font-medium hover:underline"
        >
          Register another family
        </button>
      </div>
    );
  }

  return (
    <>
      {review && (
        <ReviewPanel
          values={review}
          isSaving={isSaving}
          submitError={submitError}
          onEdit={backToEdit}
          onConfirm={confirmSubmit}
        />
      )}

      {/* Kept mounted (just hidden) while reviewing, so "Edit" returns to
          the form with everything still filled in. */}
      <form
        onSubmit={handleSubmit(onReview)}
        noValidate
        hidden={review !== null}
        className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-lg space-y-8 sm:space-y-10"
      >
        {/* ---------- Head of family ---------- */}
        <div>
          <h2 className="text-xl font-bold text-blue-900 mb-1">Head of Family</h2>
          <p className="text-sm text-gray-500 mb-6">
            This is you, or whoever heads your household.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-[5.5rem_1fr] sm:grid-cols-[7rem_1fr] gap-3 items-start">
              <div>
                <label htmlFor="head_salutation" className={labelClass}>
                  Title
                </label>
                <select id="head_salutation" {...register("head_salutation")} className={compactInputClass}>
                  <option value="" disabled>
                    Select
                  </option>
                  {SALUTATIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.head_salutation && (
                  <p className={errorClass}>{errors.head_salutation.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="head_name" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="head_name"
                  type="text"
                  autoComplete="name"
                  {...register("head_name")}
                  className={inputClass}
                />
                {errors.head_name && <p className={errorClass}>{errors.head_name.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Date of Birth</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <select
                    id="head_birth_day"
                    aria-label="Day of birth"
                    defaultValue=""
                    {...register("head_birth_day")}
                    className={compactInputClass}
                  >
                    <option value="" disabled>
                      Day
                    </option>
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    id="head_birth_month"
                    aria-label="Month of birth"
                    defaultValue=""
                    {...register("head_birth_month")}
                    className={compactInputClass}
                  >
                    <option value="" disabled>
                      Mon
                    </option>
                    {MONTHS.map((month, i) => (
                      <option key={month} value={i + 1}>
                        {month.slice(0, 3)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    id="head_birth_year"
                    type="number"
                    inputMode="numeric"
                    placeholder="Year"
                    min={1900}
                    max={CURRENT_YEAR}
                    {...register("head_birth_year")}
                    className={compactInputClass}
                  />
                </div>
              </div>
              {(errors.head_birth_day || errors.head_birth_month) && (
                <p className={errorClass}>
                  {errors.head_birth_day?.message || errors.head_birth_month?.message}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div>
                <label htmlFor="head_phone" className={labelClass}>
                  Phone Number
                </label>
                <input
                  id="head_phone"
                  type="tel"
                  autoComplete="tel"
                  {...register("head_phone")}
                  className={inputClass}
                />
                {errors.head_phone && <p className={errorClass}>{errors.head_phone.message}</p>}
              </div>

              <div>
                <label htmlFor="head_email" className={labelClass}>
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="head_email"
                  type="email"
                  autoComplete="email"
                  {...register("head_email")}
                  className={inputClass}
                />
                {errors.head_email && <p className={errorClass}>{errors.head_email.message}</p>}
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                id="head_is_baptized"
                type="checkbox"
                {...register("head_is_baptized")}
                className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
              />
              I am baptized
            </label>
          </div>
        </div>

        {/* ---------- Marriage & church ---------- */}
        <div>
          <h2 className="text-xl font-bold text-blue-900 mb-1">Marriage &amp; Church</h2>
          <p className="text-sm text-gray-500 mb-6">Both optional — leave blank if not applicable.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="anniversary_date" className={labelClass}>
                Wedding Anniversary
              </label>
              <input
                id="anniversary_date"
                type="date"
                {...register("anniversary_date")}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="attending_since" className={labelClass}>
                Attending Galilee Since
              </label>
              <input
                id="attending_since"
                type="month"
                {...register("attending_since")}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ---------- Address ---------- */}
        <div>
          <h2 className="text-xl font-bold text-blue-900 mb-1">Address</h2>
          <p className="text-sm text-gray-500 mb-6">Optional — one address for the whole household.</p>

          <div className="space-y-6">
            <div>
              <label htmlFor="address" className={labelClass}>
                Address
              </label>
              <input
                id="address"
                type="text"
                autoComplete="street-address"
                {...register("address")}
                className={inputClass}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <select id="city" {...register("city")} className={inputClass}>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {isOtherCity && (
                  <>
                    <input
                      id="city_other"
                      type="text"
                      aria-label="City name"
                      placeholder="Enter your city"
                      autoComplete="address-level2"
                      {...register("city_other")}
                      className={`${inputClass} mt-3`}
                    />
                    {errors.city_other && (
                      <p className={errorClass}>{errors.city_other.message}</p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label htmlFor="zip_code" className={labelClass}>
                  ZIP / PIN Code
                </label>
                <input
                  id="zip_code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  {...register("zip_code")}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Dependents ---------- */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-blue-900">Family Members</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Add your spouse, children, or any parent or in-law living with you.
          </p>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4 bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove this family member"
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>

                <div className="grid md:grid-cols-2 gap-6 md:pr-8">
                  <div>
                    <label htmlFor={`dependents.${index}.relationship`} className={labelClass}>
                      Relationship
                    </label>
                    <select
                      id={`dependents.${index}.relationship`}
                      {...register(`dependents.${index}.relationship` as const)}
                      className={inputClass}
                    >
                      {DEPENDENT_RELATIONSHIPS.map((value) => (
                        <option key={value} value={value}>
                          {RELATIONSHIP_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-[5.5rem_1fr] gap-3 items-start">
                    <div>
                      <label htmlFor={`dependents.${index}.salutation`} className={labelClass}>
                        Title
                      </label>
                      <select
                        id={`dependents.${index}.salutation`}
                        {...register(`dependents.${index}.salutation` as const)}
                        className={compactInputClass}
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {SALUTATIONS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      {errors.dependents?.[index]?.salutation && (
                        <p className={errorClass}>{errors.dependents[index]?.salutation?.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`dependents.${index}.full_name`} className={labelClass}>
                        Full Name
                      </label>
                      <input
                        id={`dependents.${index}.full_name`}
                        type="text"
                        {...register(`dependents.${index}.full_name` as const)}
                        className={inputClass}
                      />
                      {errors.dependents?.[index]?.full_name && (
                        <p className={errorClass}>{errors.dependents[index]?.full_name?.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Date of Birth <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      id={`dependents.${index}.birth_day`}
                      aria-label="Day of birth"
                      defaultValue=""
                      {...register(`dependents.${index}.birth_day` as const)}
                      className={compactInputClass}
                    >
                      <option value="">Day</option>
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <select
                      id={`dependents.${index}.birth_month`}
                      aria-label="Month of birth"
                      defaultValue=""
                      {...register(`dependents.${index}.birth_month` as const)}
                      className={compactInputClass}
                    >
                      <option value="">Mon</option>
                      {MONTHS.map((month, i) => (
                        <option key={month} value={i + 1}>
                          {month.slice(0, 3)}
                        </option>
                      ))}
                    </select>
                    <input
                      id={`dependents.${index}.birth_year`}
                      type="number"
                      inputMode="numeric"
                      placeholder="Year"
                      min={1900}
                      max={CURRENT_YEAR}
                      {...register(`dependents.${index}.birth_year` as const)}
                      className={compactInputClass}
                    />
                  </div>
                  {errors.dependents?.[index]?.birth_day && (
                    <p className={errorClass}>{errors.dependents[index]?.birth_day?.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor={`dependents.${index}.phone`} className={labelClass}>
                      Phone <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id={`dependents.${index}.phone`}
                      type="tel"
                      {...register(`dependents.${index}.phone` as const)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor={`dependents.${index}.email`} className={labelClass}>
                      Email <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id={`dependents.${index}.email`}
                      type="email"
                      {...register(`dependents.${index}.email` as const)}
                      className={inputClass}
                    />
                    {errors.dependents?.[index]?.email && (
                      <p className={errorClass}>{errors.dependents[index]?.email?.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      id={`dependents.${index}.is_baptized`}
                      type="checkbox"
                      {...register(`dependents.${index}.is_baptized` as const)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                    />
                    Baptized
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                relationship: "child",
                salutation: "",
                full_name: "",
                birth_day: "",
                birth_month: "",
                birth_year: "",
                phone: "",
                email: "",
                is_baptized: false,
              })
            }
            className="mt-4 inline-flex items-center gap-2 text-blue-900 font-medium hover:underline"
          >
            <Plus size={18} />
            Add Family Member
          </button>
        </div>

        {/* ---------- Consent & submit ---------- */}
        <div>
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              id="consent"
              type="checkbox"
              {...register("consent")}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
            />
            I agree, on behalf of myself and the family members listed above, to
            Galilee Prayer Fellowship contacting us with birthday, anniversary,
            and other occasion greetings, and displaying our names on the church
            screens during our birthday week.
          </label>
          {errors.consent && <p className={errorClass}>{errors.consent.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
        >
          Review Our Details
        </button>
      </form>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-b-0">
      <dt className="sm:w-48 shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium break-words">{value || "—"}</dd>
    </div>
  );
}

function ReviewPanel({
  values,
  isSaving,
  submitError,
  onEdit,
  onConfirm,
}: {
  values: FamilyRegistrationSchema;
  isSaving: boolean;
  submitError: string | null;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  const sectionTitle = "text-lg font-bold text-blue-900 mb-2";

  return (
    <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-lg space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-blue-900">Please Review Your Details</h2>
        <p className="mt-1 text-gray-600">
          Check everything below. Tap <strong>Edit</strong> to make changes, or{" "}
          <strong>Confirm &amp; Submit</strong> if it&rsquo;s all correct.
        </p>
      </div>

      <section>
        <h3 className={sectionTitle}>Head of Family</h3>
        <dl>
          <ReviewRow label="Name" value={`${values.head_salutation} ${values.head_name}`} />
          <ReviewRow
            label="Date of Birth"
            value={formatBirthday(values.head_birth_day, values.head_birth_month, values.head_birth_year)}
          />
          <ReviewRow label="Phone" value={values.head_phone} />
          <ReviewRow label="Email" value={values.head_email ?? ""} />
          <ReviewRow label="Baptized" value={values.head_is_baptized ? "Yes" : "No"} />
        </dl>
      </section>

      <section>
        <h3 className={sectionTitle}>Marriage &amp; Church</h3>
        <dl>
          <ReviewRow label="Wedding Anniversary" value={values.anniversary_date ?? ""} />
          <ReviewRow label="Attending Galilee Since" value={formatMonth(values.attending_since)} />
        </dl>
      </section>

      <section>
        <h3 className={sectionTitle}>Address</h3>
        <dl>
          <ReviewRow label="Address" value={values.address ?? ""} />
          <ReviewRow label="City" value={cityOf(values)} />
          <ReviewRow label="ZIP / PIN Code" value={values.zip_code ?? ""} />
        </dl>
      </section>

      <section>
        <h3 className={sectionTitle}>Family Members</h3>
        {values.dependents.length === 0 ? (
          <p className="text-gray-500 text-sm">No family members added.</p>
        ) : (
          <div className="space-y-4">
            {values.dependents.map((dependent, i) => (
              <dl key={i} className="border border-gray-200 rounded-xl px-4 py-2 bg-gray-50">
                <ReviewRow label="Name" value={`${dependent.salutation} ${dependent.full_name}`} />
                <ReviewRow label="Relationship" value={RELATIONSHIP_LABELS[dependent.relationship]} />
                <ReviewRow
                  label="Date of Birth"
                  value={formatBirthday(dependent.birth_day, dependent.birth_month, dependent.birth_year)}
                />
                <ReviewRow label="Phone" value={dependent.phone ?? ""} />
                <ReviewRow label="Email" value={dependent.email ?? ""} />
                <ReviewRow label="Baptized" value={dependent.is_baptized ? "Yes" : "No"} />
              </dl>
            ))}
          </div>
        )}
      </section>

      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        Once submitted, your details can&rsquo;t be changed here. Please contact the{" "}
        <strong>Admin</strong> to change any details.
      </p>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button
          type="button"
          onClick={onEdit}
          disabled={isSaving}
          className="sm:w-1/3 flex items-center justify-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-50 disabled:opacity-60 font-semibold py-3 rounded-lg transition"
        >
          <Pencil size={18} />
          Edit
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
        >
          {isSaving && <Loader2 className="animate-spin" size={20} />}
          {isSaving ? "Submitting..." : "Confirm & Submit"}
        </button>
      </div>
    </div>
  );
}
