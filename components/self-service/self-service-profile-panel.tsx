"use client";

import { useCallback, useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";

interface SelfServiceProfilePayload {
  profile: {
    fullName: string;
    email: string;
    role: string;
  };
  employee: {
    location: string;
    managerName: string;
    department: {
      name: string;
    } | null;
  };
  bankAccounts: Array<{
    id: string;
    bankName: string;
    accountLast4: string;
    status: string;
    isPrimary: boolean;
  }>;
}

export function SelfServiceProfilePanel() {
  const [payload, setPayload] = useState<SelfServiceProfilePayload | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await requestApi<SelfServiceProfilePayload>("/api/self-service/profile");
      setPayload(data);
      setFullName(data.profile.fullName);
      setEmail(data.profile.email);
      setLocation(data.employee.location);
      setError(null);
    } catch (loadError) {
      setPayload(null);
      setError(loadError instanceof Error ? loadError.message : "Failed to load self-service profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function saveProfile() {
    try {
      setSaving(true);
      setNotice(null);
      await requestApi("/api/self-service/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          email,
          location,
        }),
      });
      setNotice("Profile updated.");
      await loadProfile();
    } catch (saveError) {
      setNotice(null);
      setError(saveError instanceof Error ? saveError.message : "Profile update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Profile Settings</h3>
          <p className="panel-subtitle">Self-service profile editing, reporting line context, and linked disbursement accounts.</p>
        </div>
        <span className="pill">{loading ? "Loading" : payload?.profile.role ?? "Profile"}</span>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}
      {notice ? <p className="workspace-panel-message">{notice}</p> : null}

      {payload ? (
        <div className="workspace-form-grid">
          <div className="workspace-action-card">
            <strong>Edit profile</strong>
            <div className="field">
              <label htmlFor="self-profile-name">Full name</label>
              <input id="self-profile-name" onChange={(event) => setFullName(event.target.value)} value={fullName} />
            </div>
            <div className="field">
              <label htmlFor="self-profile-email">Email</label>
              <input id="self-profile-email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            </div>
            <div className="field">
              <label htmlFor="self-profile-location">Location</label>
              <input id="self-profile-location" onChange={(event) => setLocation(event.target.value)} value={location} />
            </div>
            <button className="button-secondary" disabled={saving} onClick={() => void saveProfile()} type="button">
              Save profile
            </button>
          </div>

          <div className="workspace-action-card">
            <strong>Employment details</strong>
            <div className="workspace-action-stack">
              <div className="workspace-mini-card">
                <span className="small-label">Department</span>
                <strong>{payload.employee.department?.name ?? "Unassigned"}</strong>
                <p className="muted">Manager: {payload.employee.managerName}</p>
              </div>
              {payload.bankAccounts.map((account) => (
                <div className="workspace-mini-card" key={account.id}>
                  <span className="small-label">Direct deposit</span>
                  <strong>{account.bankName}</strong>
                  <p className="muted">
                    Ending {account.accountLast4} · {account.status}
                    {account.isPrimary ? " · primary" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
