"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");

  const [grocList, setGrocList] = useState(false);

  const [country, setCountry] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);

    console.log(
      JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        city,
        country,
        g: grocList ? 1 : 0,
      })
    );

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        city,
        country,
        grocList: grocList ? 1 : 0,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      // API SETS COOKIE, DW ABT IT
      router.push("/home");
    }
  }

  return (
    <div className="min-h-screen py-10 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 text-black">
      <Head>
        <title>Sign In</title>
        <meta name="description" content="Sign in to your account" />
      </Head>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-emerald-400">
          {/* <div className="h-1.5 bg-gradient-to-r from-green-300 to-blue-400"></div> */}

          <div className="px-8 pt-8 pb-6">
            <div className="flex items-center justify-center">
              <Image src="/logo.png" width={120} height={120} alt="logo" />
              <h1 className="text-3xl font-bold text-slate-800 text-center mr-10">
                agri
              </h1>
            </div>

            <p className="text-slate-500 text-center text-md mt-1">
              Welcome to Agri! Sign up to get started :)
            </p>
          </div>

          {error && (
            <div className="mx-8 mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-slate-700"
                  >
                    First Name
                  </label>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="py-3 px-4 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    placeholder="Enter first name"
                  />
                </div>
              </div>
              <div className="w-1/2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Last Name
                  </label>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="py-3 px-4 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="py-3 pl-10 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="py-3 pl-10 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="w-1/2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-slate-700"
                  >
                    City
                  </label>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="py-3 px-4 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div className="w-1/2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Country
                  </label>
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="py-3 px-4 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                onChange={(e) => setGrocList(e.target.checked)}
                type="checkbox"
                className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-slate-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-700"
              >
                Auto-populate my grocery list
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-gradient-to-r bg-emerald-500 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 sm:px-10">
            <p className="text-sm text-center text-slate-500">
              Have an account already?{" "}
              <Link
                href="/signin"
                className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* OAuth providers */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-blue-50 to-green-50 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
