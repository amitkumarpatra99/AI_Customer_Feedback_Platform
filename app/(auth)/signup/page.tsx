import React from "react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-950 text-zinc-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Create a new workspace
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Or{" "}
          <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-zinc-800">
          <form className="space-y-6">
            <div>
              <label htmlFor="workspaceName" className="block text-sm font-medium text-zinc-300">
                Company / Workspace Name
              </label>
              <div className="mt-1">
                <input
                  id="workspaceName"
                  name="workspaceName"
                  type="text"
                  required
                  placeholder="Acme Corp"
                  className="block w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border border-zinc-800 bg-zinc-950 py-2 px-3 text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
