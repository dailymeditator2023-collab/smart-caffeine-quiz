"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExisting, setShowExisting] = useState(false);
  const [existingUser, setExistingUser] = useState<{ name: string; email: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowExisting(false);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("All fields are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "").slice(-10);
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // Email already registered
        setExistingUser(data.user);
        setShowExisting(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Save to localStorage
      localStorage.setItem("bb_email", data.user.email);
      localStorage.setItem("bb_name", data.user.name);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  function handleContinueAsExisting() {
    if (!existingUser) return;
    localStorage.setItem("bb_email", existingUser.email);
    localStorage.setItem("bb_name", existingUser.name);
    router.push("/");
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange/10 mb-4">
            <span className="text-3xl">☕</span>
          </div>
          <h1
            className="text-3xl font-bold text-brand-orange mb-1"
            style={{ fontFamily: "var(--font-bricolage)" }}
          >
            How Smart Are You?
          </h1>
          <p className="text-text-secondary text-sm">
            by Smart Caffeine · Weekly Quiz Challenge
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand-orange/50 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand-orange/50 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit number"
              className="w-full px-4 py-3 bg-bg-card border border-white/10 rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand-orange/50 transition"
            />
          </div>

          {error && <p className="text-neon-pink text-sm">{error}</p>}

          {/* Existing user prompt */}
          {showExisting && existingUser && (
            <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-xl p-4 animate-fade-in">
              <p className="text-neon-blue text-sm font-medium mb-3">
                This email is already registered as {existingUser.name}.
              </p>
              <button
                type="button"
                onClick={handleContinueAsExisting}
                className="w-full py-2.5 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue rounded-lg font-medium hover:bg-neon-blue/30 transition"
              >
                Continue as {existingUser.name} →
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-orange text-bg-dark font-bold text-lg rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
          >
            {loading ? "Creating account..." : "Join the Quiz →"}
          </button>
        </form>

        <p className="text-center text-text-secondary/50 text-xs mt-6">
          Your email is your identity. No password needed.
        </p>
      </div>
    </main>
  );
}
