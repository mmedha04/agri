// src/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import "./profile-buttons.css";
import Navbar from "@/components/navbar";

interface UserProfile {
  name: string;
  email: string;
  location: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // edit state
  const [editField, setEditField] = useState<keyof UserProfile | null>(null);
  const [editValue, setEditValue] = useState("");

  // password reset state
  const [showReset, setShowReset] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // 1) on mount, load profile
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw await res.json();
        const data = (await res.json()) as {
          firstName: string;
          lastName: string;
          email: string;
          city: string;
          country: string;
        };
        setProfile({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          location: `${data.city}, ${data.country}`,
        });
      } catch (e: any) {
        setError(e.error ?? e.message ?? "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) handlers
  const handleEdit = (field: keyof UserProfile) => {
    if (!profile) return;
    setEditField(field);
    setEditValue(profile[field]);
  };

  const handleCancel = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (!profile || !editField) return;

    // derive the 5 fields we need
    let firstName = profile.name.split(" ")[0]!;
    let lastName = profile.name.split(" ")[1] ?? "";
    let newEmail = profile.email;
    let city = profile.location.split(",")[0].trim();
    let country = profile.location.split(",")[1]?.trim() ?? "";

    if (editField === "name") {
      const [newFirst, newLast = ""] = editValue.split(" ");
      firstName = newFirst;
      lastName = newLast;
    }
    if (editField === "email") {
      newEmail = editValue;
    }
    if (editField === "location") {
      const [newCity, newCountry = ""] = editValue.split(",");
      city = newCity.trim();
      country = newCountry.trim();
    }

    try {
      const res = await fetch("/api/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, newEmail, city, country }),
      });
      const body = await res.json();
      if (!res.ok) throw body;

      // update local state
      setProfile({
        name: `${firstName} ${lastName}`,
        email: newEmail,
        location: `${city}, ${country}`,
      });
      setEditField(null);
    } catch (e: any) {
      alert(`Update failed: ${e.error ?? e.message}`);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setResetMessage("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetMessage("New passwords do not match.");
      return;
    }
    // TODO: wire up your password‐reset API
    setResetMessage("Password reset successfully (placeholder)");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // 3) render loading / error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error: {error ?? "Unknown error"}</p>
      </div>
    );
  }

  // 4) render form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 text-black">
      <Navbar />
      <main className="p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl flex flex-col gap-8">
          <section className="mb-8 bg-white p-8 rounded-xl shadow border">
            <h2 className="text-3xl font-bold mb-6 text-emerald-900">Profile</h2>

            {/* Name */}
            <div className="flex items-center gap-6 mb-4">
              <span className="w-32 text-gray-700">Name</span>
              {editField === "name" ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 border rounded px-4 py-2"
                  />
                  <button onClick={handleSave} className="btn">
                    Save
                  </button>
                  <button onClick={handleCancel} className="btn-gray" style={{ color: "red" }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{profile.name}</span>
                  <button
                    onClick={() => handleEdit("name")}
                    disabled={!!editField}
                    className="btn"
                    style={{ color: "#23890a" }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-6 mb-4">
              <span className="w-32 text-gray-700">Email</span>
              {editField === "email" ? (
                <>
                  <input
                    type="email"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 border rounded px-4 py-2"
                  />
                  <button onClick={handleSave} className="btn">
                    Save
                  </button>
                  <button onClick={handleCancel} className="btn-gray" style={{ color: "red" }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{profile.email}</span>
                  <button
                    onClick={() => handleEdit("email")}
                    disabled={!!editField}
                    className="btn"
                    style={{ color: "#23890a" }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-6 mb-6">
              <span className="w-32 text-gray-700">Location</span>
              {editField === "location" ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 border rounded px-4 py-2"
                  />
                  <button onClick={handleSave} className="btn">
                    Save
                  </button>
                  <button onClick={handleCancel} className="btn-gray" style={{ color: "red" }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{profile.location}</span>
                  <button
                    onClick={() => handleEdit("location")}
                    disabled={!!editField}
                    className="btn"
                    style={{ color: "#23890a" }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>

            {/* Password Reset */}
            <div className="mt-8 text-center">
              <button onClick={() => setShowReset((v) => !v)} className="btn" style={{ color: "red" }}>
                {showReset ? "Cancel" : "Reset Password"}
              </button>
              {showReset && (
                <form
                  onSubmit={handlePasswordReset}
                  className="mt-4 space-y-4 border-t pt-4"
                >
                  <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full border rounded px-4 py-2"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded px-4 py-2"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded px-4 py-2"
                  />
                  <button type="submit" className="btn w-full">
                    Reset Password
                  </button>
                  {resetMessage && (
                    <p className="text-red-600">{resetMessage}</p>
                  )}
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
