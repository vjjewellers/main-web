import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Crown,
  Mail,
  RefreshCcw,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

const getUserName = (user) =>
  user?.name || user?.displayName || user?.fullName || "User";

const getUserEmail = (user) => user?.email || "N/A";

const getUserRole = (user) =>
  String(user?.role || "user")
    .toLowerCase()
    .replace("_", " ");

const getRoleClass = (role) => {
  const cleanRole = String(role || "").toLowerCase();

  if (cleanRole.includes("super")) {
    return "bg-vjj-black text-vjj-champagne border-vjj-black";
  }

  if (cleanRole.includes("admin")) {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }

  return "bg-green-50 text-green-700 border-green-100";
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/admin/users");

      setUsers(data.users || data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;

    const admins = users.filter((user) =>
      String(user.role || "")
        .toLowerCase()
        .includes("admin"),
    ).length;

    const customers = users.filter(
      (user) =>
        !String(user.role || "")
          .toLowerCase()
          .includes("admin"),
    ).length;

    const recentUsers = users.filter((user) => {
      if (!user.createdAt) return false;

      const createdDate = new Date(user.createdAt);
      const now = new Date();
      const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);

      return diffDays <= 30;
    }).length;

    return {
      total,
      admins,
      customers,
      recentUsers,
    };
  }, [users]);

  const availableRoles = useMemo(() => {
    const roles = users
      .map((user) => String(user.role || "user").toLowerCase())
      .filter(Boolean);

    return [...new Set(roles)];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        getUserName(user).toLowerCase().includes(search) ||
        getUserEmail(user).toLowerCase().includes(search) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(search) ||
        String(user.role || "")
          .toLowerCase()
          .includes(search);

      const matchesRole =
        roleFilter === "all" ||
        String(user.role || "user").toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
  };

  const copyEmail = async (email) => {
    if (!email || email === "N/A") {
      toast.error("Email not found");
      return;
    }

    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Unable to copy email");
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Admin Users
          </p>

          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Manage Users
          </h1>

          <p className="mt-3 max-w-2xl text-stone-600">
            View registered customers and admin accounts from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.total}
          icon={<Users />}
          dark
        />

        <StatCard label="Customers" value={stats.customers} icon={<User />} />

        <StatCard label="Admins" value={stats.admins} icon={<ShieldCheck />} />

        <StatCard
          label="New This Month"
          value={stats.recentUsers}
          icon={<Crown />}
        />
      </div>

      <div className="mb-6 rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              User Filters
            </h2>
            <p className="text-sm text-stone-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-vjj-ivory px-5 py-2.5 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
          >
            <X size={16} />
            Clear Filters
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3">
            <Search size={18} className="text-stone-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, phone or role..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3 text-sm font-semibold capitalize outline-none focus:border-vjj-gold"
          >
            <option value="all">All Roles</option>

            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <Users />
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              Users
            </h2>
            <p className="text-sm text-stone-600">
              Registered users and admin accounts.
            </p>
          </div>
        </div>

        {loading ? (
          <UserListSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-3xl bg-vjj-ivory p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-vjj-bronze">
              <Search />
            </div>

            <h3 className="mt-4 font-serif text-2xl font-bold text-vjj-black">
              No users found
            </h3>

            <p className="mt-2 text-stone-600">
              No user matched your selected filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => {
              const role = getUserRole(user);
              const email = getUserEmail(user);

              return (
                <div
                  key={user._id || user.id || email}
                  className="rounded-3xl border border-black/10 bg-vjj-ivory p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-vjj-black font-serif text-2xl font-bold uppercase text-vjj-champagne">
                        {getUserName(user).charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-2xl font-bold text-vjj-black">
                            {getUserName(user)}
                          </h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getRoleClass(
                              role,
                            )}`}
                          >
                            {role}
                          </span>
                        </div>

                        <div className="mt-2 grid gap-1 text-sm text-stone-600">
                          <p className="break-all">
                            <strong className="text-vjj-black">Email:</strong>{" "}
                            {email}
                          </p>

                          <p>
                            <strong className="text-vjj-black">Phone:</strong>{" "}
                            {user.phone || "N/A"}
                          </p>

                          <p>
                            <strong className="text-vjj-black">Joined:</strong>{" "}
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => copyEmail(email)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                      >
                        <Copy size={15} />
                        Copy Email
                      </button>

                      {email !== "N/A" && (
                        <a
                          href={`mailto:${email}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-4 py-2 text-sm font-bold text-white transition hover:bg-vjj-bronze"
                        >
                          <Mail size={15} />
                          Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, dark = false }) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 shadow-sm ${
        dark
          ? "border-vjj-black bg-vjj-black text-white"
          : "border-black/10 bg-white text-vjj-black"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-[0.22em] ${
              dark ? "text-vjj-champagne" : "text-stone-400"
            }`}
          >
            {label}
          </p>

          <p className="mt-3 font-serif text-3xl font-bold">{value}</p>
        </div>

        <div
          className={`grid h-11 w-11 place-items-center rounded-full ${
            dark
              ? "bg-white/10 text-vjj-champagne"
              : "bg-vjj-ivory text-vjj-bronze"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function UserListSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-32 animate-pulse rounded-3xl bg-vjj-ivory"
        />
      ))}
    </div>
  );
}
