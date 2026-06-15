import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      toast.success("Password changed successfully");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
          Admin Security
        </p>

        <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
          Change Password
        </h1>

        <p className="mt-3 max-w-2xl text-stone-600">
          Update your admin account password regularly to keep the store secure.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-[2rem] border border-black/10 bg-vjj-black p-8 text-white shadow-luxury">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-vjj-champagne/10 text-vjj-champagne">
            <ShieldCheck size={34} />
          </div>

          <h2 className="mt-6 font-serif text-4xl font-bold">
            Keep admin access safe
          </h2>

          <p className="mt-4 leading-7 text-stone-300">
            Use a strong password with letters, numbers and symbols. Do not
            share the admin password with anyone except authorized staff.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-bold text-vjj-champagne">
              Suggested password format
            </p>
            <p className="mt-2 text-sm text-stone-300">
              Example: Vjj@Store2026#Secure
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
              <KeyRound />
            </div>

            <div>
              <h2 className="font-serif text-3xl font-bold text-vjj-black">
                Update Password
              </h2>
              <p className="text-sm text-stone-600">
                Enter your current password and set a new one.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <input
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              type="password"
              placeholder="Current password"
              className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
            />

            <input
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              type="password"
              placeholder="New password"
              className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
            />

            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              type="password"
              placeholder="Confirm new password"
              className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
            />

            <button
              disabled={loading}
              className="mt-3 rounded-full bg-vjj-black px-6 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
