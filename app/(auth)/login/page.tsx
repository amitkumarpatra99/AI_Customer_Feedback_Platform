// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const [email, setEmail] = useState("admin@acme.com");
//   const [password, setPassword] = useState("hashed_password_123");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     const result = await signIn("credentials", {
//       redirect: false,
//       email,
//       password,
//     });

//     if (result?.error) {
//       setError("Invalid email or password. Try admin@acme.com");
//       setIsLoading(false);
//     } else {
//       router.push("/dashboard");
//       router.refresh();
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
//       <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
//         <div className="text-center">
//           <h2 className="text-3xl font-bold text-gray-900">Welcome to LOOP</h2>
//           <p className="mt-2 text-sm text-gray-600">Sign in to your workspace</p>
//         </div>

//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
//               {error}
//             </div>
//           )}

//           <div className="space-y-4">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {isLoading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>

//         <div className="mt-6 rounded-md bg-gray-50 p-4 text-center text-xs text-gray-600 border border-gray-200">
//           <p className="font-semibold mb-2">Demo Credentials:</p>
//           <p>👑 Admin: <span className="font-mono text-indigo-600">admin@acme.com</span></p>
//           <p>📊 Analyst: <span className="font-mono text-indigo-600">analyst@acme.com</span></p>
//           <p>👁️ Viewer: <span className="font-mono text-indigo-600">viewer@acme.com</span></p>
//           <p className="mt-1">🔑 Password: <span className="font-mono text-indigo-600">hashed_password_123</span></p>
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // 👈 Ye import add kiya hai

export default function LoginPage() {
  const [email, setEmail] = useState("admin@acme.com");
  const [password, setPassword] = useState("hashed_password_123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password. Try admin@acme.com");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 px-4 overflow-hidden font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-blue-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-[130px]" />

      <div className="glass-panel relative z-10 w-full max-w-md space-y-8 rounded-2xl p-8 shadow-2xl backdrop-blur-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] text-xl text-white font-bold mb-2">
            🔄
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">LOOP AI</span>
          </h2>
          <p className="text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4 decoration-blue-500/30">
              Sign up here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs font-semibold text-red-400 backdrop-blur-md">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm"
                placeholder="admin@acme.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input block w-full rounded-xl px-4 py-2.5 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="glass-button w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in to Workspace"}
          </button>
        </form>

        <div className="glass-card rounded-xl p-4 text-center text-xs text-zinc-400 space-y-1.5">
          <p className="font-semibold text-zinc-200 tracking-wide">Demo Quick Login Credentials:</p>
          <div className="pt-1 text-zinc-400 space-y-1 font-mono text-[11px]">
            <p>👑 Admin: <span className="text-blue-400 font-semibold">admin@acme.com</span></p>
            <p>📊 Analyst: <span className="text-blue-400 font-semibold">analyst@acme.com</span></p>
            <p>👁️ Viewer: <span className="text-blue-400 font-semibold">viewer@acme.com</span></p>
            <p className="pt-1 text-zinc-500">🔑 Password: <span className="text-indigo-300">hashed_password_123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}