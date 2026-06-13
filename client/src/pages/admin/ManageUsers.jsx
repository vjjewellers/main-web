import { useEffect, useState } from "react";
import { RefreshCcw, Users, ShieldCheck, Power } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

const roles = ["user", "admin", "super_admin"];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/admin/users");

      setUsers(data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId, role) => {
    try {
      setUpdatingId(userId);

      await api.patch(`/admin/users/${userId}/role`, {
        role,
      });

      toast.success("User role updated");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Role update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (userId, isActive) => {
    try {
      setUpdatingId(userId);

      await api.patch(`/admin/users/${userId}/status`, {
        isActive,
      });

      toast.success(isActive ? "User activated" : "User deactivated");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingId(null);
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
            View customers, change user roles and activate or deactivate
            accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold">Users</h2>
            <p className="mt-1 text-sm text-stone-600">
              Total users: {users.length}
            </p>
          </div>

          <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <Users />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-3xl bg-vjj-ivory"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-3xl bg-vjj-ivory p-10 text-center">
            <h3 className="font-serif text-2xl font-bold">No users found</h3>
            <p className="mt-2 text-stone-600">
              Registered customers will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => {
              const isUpdating = updatingId === user._id;

              return (
                <div
                  key={user._id}
                  className="grid gap-4 rounded-3xl border border-black/10 bg-vjj-ivory p-5 xl:grid-cols-[1fr_220px_180px]"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-vjj-bronze">
                      {user.role}
                    </p>

                    <h3 className="mt-1 font-serif text-2xl font-bold text-vjj-black">
                      {user.name}
                    </h3>

                    <div className="mt-2 grid gap-1 text-sm text-stone-600">
                      <p>{user.email}</p>
                      <p>{user.phone || "No phone added"}</p>
                      <p>
                        Joined:{" "}
                        {new Date(user.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                      <ShieldCheck size={15} />
                      Role
                    </label>

                    <select
                      value={user.role}
                      disabled={isUpdating}
                      onChange={(event) =>
                        updateRole(user._id, event.target.value)
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold outline-none"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                      <Power size={15} />
                      Status
                    </label>

                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatus(user._id, !user.isActive)}
                      className={`w-full rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        user.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
