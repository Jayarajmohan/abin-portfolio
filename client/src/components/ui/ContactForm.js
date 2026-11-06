import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import Button from "@/components/ui/Button";
import { site } from "@/data/site";
import { ease } from "@/lib/animations";

// Public by design (Web3Forms keys only allow sending to the owner's inbox);
// set it in .env.local / the build environment.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const inputCls =
  "w-full rounded-lg border border-line-strong bg-surface/80 px-4 py-3 text-fg placeholder:text-fg-subtle/70 backdrop-blur transition-colors focus:border-accent focus:outline-none aria-[invalid=true]:border-red-400";

function Field({ label, id, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-fg-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-red-300">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sent | error
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // The site is static (Firebase Hosting), so the form posts straight to
  // Web3Forms, which emails each enquiry to the address the access key belongs to.
  const onSubmit = async ({ company, ...data }) => {
    if (company) {
      // honeypot filled → a bot; pretend it worked
      setStatus("sent");
      reset();
      return;
    }
    try {
      if (!WEB3FORMS_KEY) throw new Error("NEXT_PUBLIC_WEB3FORMS_KEY is not set");
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New project enquiry from ${data.name}`,
          from_name: `${site.name} — Portfolio`,
          replyto: data.email,
          ...data,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || "Request failed");
      setStatus("sent");
      reset();
    } catch (e) {
      console.error("Contact form:", e);
      setStatus("error");
    }
  };

  const aria = (name) => ({
    "aria-invalid": errors[name] ? "true" : "false",
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="rounded-xl border border-line bg-panel/80 p-8"
            role="status"
          >
            <span className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-accent text-xl text-ink" aria-hidden>
              ✓
            </span>
            <p className="font-display text-2xl font-semibold tracking-tight">Message received.</p>
            <p className="mt-2 text-fg-muted">Thanks — I&apos;ll get back to you within one working day.</p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-6 text-sm text-fg-subtle underline underline-offset-4 hover:text-fg"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid gap-4 sm:grid-cols-2"
          >
            <Field label="Name" id="name" error={errors.name}>
              <input id="name" autoComplete="name" className={inputCls} {...aria("name")} {...register("name", { required: "Please add your name." })} />
            </Field>
            <Field label="Email" id="email" error={errors.email}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={inputCls}
                {...aria("email")}
                {...register("email", {
                  required: "Please add your email.",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "That email doesn't look right." },
                })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Project details" id="message" error={errors.message}>
                <textarea
                  id="message"
                  rows={4}
                  data-lenis-prevent
                  placeholder="What are we making, when is it due, and where's the footage?"
                  className={`${inputCls} resize-y`}
                  {...aria("message")}
                  {...register("message", {
                    required: "Tell me a little about the project.",
                    minLength: { value: 10, message: "A few more words, please." },
                  })}
                />
              </Field>
            </div>

            {/* Honeypot: hidden from people, bots fill it in */}
            <div className="absolute -left-[9999px]" aria-hidden>
              <label htmlFor="company">Company</label>
              <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
            </div>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send message"}
                {!isSubmitting && <span aria-hidden>→</span>}
              </Button>
              {status === "error" && (
                <p role="alert" className="text-sm text-red-300">
                  Something went wrong. Please try again or email {site.email}.
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
