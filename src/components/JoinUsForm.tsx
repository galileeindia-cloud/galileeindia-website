"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { contactSchema, type ContactSchema } from "@/types/contactSchema";
import { createContact } from "@/services/contactService";
import { createPrayerRequest } from "@/services/prayerService";

export default function JoinUsForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(values: ContactSchema) {
    setSubmitError(null);

    try {
      const contact = await createContact({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        consent: values.consent,
      });

      if (values.prayer_request?.trim()) {
        await createPrayerRequest({
          contact_uuid: contact.contact_uuid,
          prayer_request: values.prayer_request,
        });
      }

      reset();
      setSubmitted(true);
    } catch {
      setSubmitError(
        "Something went wrong while submitting your request. Please try again."
      );
    }
  }

  if (submitted) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
        <CheckCircle2 className="mx-auto text-blue-900" size={48} />

        <h2 className="text-2xl font-bold text-blue-900 mt-4">Thank You!</h2>

        <p className="mt-2 text-gray-600">
          We&rsquo;ve received your details and will be in touch soon. God
          bless you.
        </p>

        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-blue-900 font-medium hover:underline"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-white p-8 md:p-10 rounded-2xl shadow-lg space-y-6"
    >
      <div>
        <label htmlFor="full_name" className="block font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          {...register("full_name")}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block font-medium text-gray-700 mb-2">
            Email <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="prayer_request" className="block font-medium text-gray-700 mb-2">
          Prayer Request <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="prayer_request"
          rows={5}
          {...register("prayer_request")}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
          placeholder="Share what's on your heart — we'd be honored to pray with you."
        />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
          />
          I agree to be contacted by Galilee Prayer Fellowship regarding my
          submission.
        </label>
        {errors.consent && (
          <p className="mt-1 text-sm text-red-600">{errors.consent.message}</p>
        )}
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
      >
        {isSubmitting && <Loader2 className="animate-spin" size={20} />}
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
