"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    workspaceName: "",
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        setIsLoading(false);
      } else {
        // Success! Redirect to login page with a success message
        router.push("/login?success=Account created successfully. Please login.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 overflow-hidden font-sans">
      {/* Ambient Glow Orbs */}
      <div className="pointer-events-none absolute top-1/4 right-1/3 h-96 w-96 rounded-full bg-blue-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-[130px]" />

      <div className="glass-panel relative z-10 w-full max-w-md space-y-8 rounded-2xl p-8 shadow-2xl backdrop-blur-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] text-xl text-white font-bold mb-2">
            🔄
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Create a new <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Workspace</span>
          </h2>
          <p className="text-sm text-zinc-400">
            Or{" "}
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4 decoration-blue-500/30">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs font-semibold text-red-400 backdrop-blur-md">
            ⚠️ {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="workspaceName" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Company / Workspace Name
            </label>
            <input
              id="workspaceName"
              name="workspaceName"
              type="text"
              required
              placeholder="Acme Corp"
              value={formData.workspaceName}
              onChange={handleChange}
              className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="glass-button w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? "Creating account..." : "Initialize Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}