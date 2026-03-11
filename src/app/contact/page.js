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
      if (!db) {
        console.error("Firestore not initialized: missing NEXT_PUBLIC_FIREBASE_* env vars or firebase init failed");
        toast.error("Failed to send request: Firebase not configured");
        setSubmitting(false);
        return;
      }
      // generate a unique 6-char PIN
      function generatePIN() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let pin = "";
        const arr = new Uint32Array(6);
        crypto.getRandomValues(arr);
        for (let i = 0; i < 6; i++) pin += chars[arr[i] % chars.length];
        return pin;
      }

      // ensure uniqueness with a few retries
      let pin = generatePIN();
      for (let attempt = 0; attempt < 5; attempt++) {
        const q = query(collection(db, "requests"), where("pin", "==", pin));
        const snap = await getDocs(q);
        if (snap.empty) break;
        pin = generatePIN();
      }

      await addDoc(collection(db, "requests"), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        pin,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setLastPin(pin);
      toast.success(`Request submitted — PIN: ${pin}`);
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
            <p className="text-slate-400 mb-8">
              Fill out the form below and our team will contact you to discuss
              your institution's requirements.
            </p>
          </AnimatedSection>
          {/* Show generated PIN to user after submit */}
          {/* Temporary debug panel: shows frontend project and Firestore error for troubleshooting */}
          <AnimatedSection delay={0.15}>
            <div className="mt-6 text-xs text-slate-500">
              <div>Firebase Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "(not set)"}</div>
              <div>Firestore initialized: {db ? "yes" : "no"}</div>
              {lastError && (
                <div className="mt-2 p-3 bg-black/40 rounded text-xs text-red-300">
                  <div className="font-medium">Last error (full):</div>
                  <pre className="whitespace-pre-wrap max-h-48 overflow-auto text-xs mt-1">{JSON.stringify(lastError, Object.getOwnPropertyNames(lastError), 2)}</pre>
                </div>
              )}
            </div>
          </AnimatedSection>
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
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
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
