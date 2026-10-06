"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import {
  familyRegistrationSchema,
  DEPENDENT_RELATIONSHIPS,
  RELATIONSHIP_LABELS,
  type FamilyRegistrationSchema,
} from "@/types/familyRegistrationSchema";
import { registerFamily, type MemberInput } from "@/services/familyService";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900";
const labelClass = "block font-medium text-gray-700 mb-2";
const errorClass = "mt-1 text-sm text-red-600";

/** "2012-06" (from <input type="month">) -> "2012-06-01", or null. */
function monthToDate(month: string | undefined): string | null {
  if (!month) return null;
  return `${month}-01`;
}

export default function FamilyRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FamilyRegistrationSchema>({
    resolver: zodResolver(familyRegistrationSchema),
    defaultValues: {
      head_is_baptized: false,
      dependents: [],
      consent: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dependents",
  });

  async function onSubmit(values: FamilyRegistrationSchema) {
    setSubmitError(null);

    try {
      const members: MemberInput[] = [
        {
          full_name: values.head_name,
          relationship: "head",
          date_of_birth: values.head_date_of_birth || null,
          phone: values.head_phone,
          email: values.head_email || null,
          consent: values.consent,
          is_baptized: values.head_is_baptized,
        },
        ...values.dependents.map((dependent) => ({
          full_name: dependent.full_name,
          relationship: dependent.relationship,
          date_of_birth: dependent.date_of_birth || null,
          phone: dependent.phone || null,
          email: dependent.email || null,
          consent: values.consent,
          is_baptized: dependent.is_baptized,
        })),
      ];

      await registerFamily(
        {
          head_name: values.head_name,
          anniversary_date: values.anniversary_date || null,
          attending_since: monthToDate(values.attending_since),
        },
        members
      );

      reset({ head_is_baptized: false, dependents: [], consent: false });
      setSubmitted(true);
    } catch (err) {
      console.error("Family registration submission failed:", err);
      setSubmitError(
        "Something went wrong while submitting your family's details. Please try again."
      );
    }
  }

  if (submitted) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
        <CheckCircle2 className="mx-auto text-blue-900" size={48} />

        <h2 className="text-2xl font-bold text-blue-900 mt-4">Thank You!</h2>

        <p className="mt-2 text-gray-600">
          We&rsquo;ve added your family to our records. God bless you and your
          household.
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-white p-8 md:p-10 rounded-2xl shadow-lg space-y-10"
    >
      {/* ---------- Head of family ---------- */}
      <div>
        <h2 className="text-xl font-bold text-blue-900 mb-1">Head of Family</h2>
        <p className="text-sm text-gray-500 mb-6">
          This is you, or whoever heads your household.
        </p>

        <div className="space-y-6">
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

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="head_date_of_birth" className={labelClass}>
                Date of Birth
              </label>
              <input
                id="head_date_of_birth"
                type="date"
                {...register("head_date_of_birth")}
                className={inputClass}
              />
              {errors.head_date_of_birth && (
                <p className={errorClass}>{errors.head_date_of_birth.message}</p>
              )}
            </div>

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
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
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

            <label className="flex items-center gap-3 text-sm text-gray-700 md:pt-9">
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
              className="relative border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove this family member"
                className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>

              <div className="grid md:grid-cols-2 gap-6 pr-8">
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor={`dependents.${index}.date_of_birth`} className={labelClass}>
                    Date of Birth <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id={`dependents.${index}.date_of_birth`}
                    type="date"
                    {...register(`dependents.${index}.date_of_birth` as const)}
                    className={inputClass}
                  />
                </div>

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
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-start">
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

                <label className="flex items-center gap-3 text-sm text-gray-700 md:pt-9">
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
              full_name: "",
              date_of_birth: "",
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
          and other occasion greetings.
        </label>
        {errors.consent && <p className={errorClass}>{errors.consent.message}</p>}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={20} />}
        {isSubmitting ? "Submitting..." : "Register Our Family"}
      </button>
    </form>
  );
}
