"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import AnimatedSection from "@/components/AnimatedSection";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [lastPin, setLastPin] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      // send to server API which uses admin SDK (bypasses rules)
      const resp = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "request failed");
      setLastPin(data.pin);
      toast.success(`Request submitted — PIN: ${data.pin}`);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Contact form submission error:", err);
      setLastError(err);
      toast.error(`Failed to send request: ${err?.message || "unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pt-24 pb-16">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1 className="text-3xl font-extrabold text-white mb-4">
              Request a Custom Build
            </h1>
            <p className="text-slate-400 mb-8 max-w-xl">
              Fill out the short form and our team will reach out with a branded
              installer. You’ll receive a secure PIN once the build is ready.
            </p>
          </AnimatedSection>
          {/* Show generated PIN to user after submit */}

          {lastPin && (
            <AnimatedSection delay={0.2}>
              <div className="mt-6 p-4 bg-black/50 rounded-md max-w-lg">
                <div className="text-sm text-slate-400">Your request has been submitted.</div>
                <div className="mt-2 font-mono text-white text-lg">PIN: {lastPin}</div>
                <div className="text-xs text-slate-500 mt-2">Save this PIN to track your custom build progress. We'll also notify you when status updates.</div>
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection delay={0.1}>
            <div className="glass rounded-2xl p-8 max-w-lg mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Institution / Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-dark w-full px-4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark w-full px-4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Message / Requirements
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-dark w-full px-4 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-6 py-3 disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Submit Request"}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </>
  );
}
