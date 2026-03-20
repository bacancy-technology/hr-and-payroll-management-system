"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderDate } from "@/components/workspace-data/api-table-panel";

interface EmployeeRecord {
  id: string;
  fullName: string;
  role: string;
}

interface TimeEntryRecord {
  id: string;
  workDate: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  status: string;
  employee: {
    full_name?: string;
    fullName?: string;
  } | null;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TimeClockPanel() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);

  const [clockInEmployeeId, setClockInEmployeeId] = useState("");
  const [clockInDate, setClockInDate] = useState(today());
  const [clockInNotes, setClockInNotes] = useState("");

  const [clockOutEntryId, setClockOutEntryId] = useState("");
  const [breakMinutes, setBreakMinutes] = useState("30");
  const [clockOutNotes, setClockOutNotes] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeeData, entryData] = await Promise.all([
        requestApi<EmployeeRecord[]>("/api/employees"),
        requestApi<TimeEntryRecord[]>("/api/time-tracking/entries"),
      ]);
      setEmployees(employeeData);
      setTimeEntries(entryData);
      setClockInEmployeeId((current) => current || employeeData[0]?.id || "");
      setClockOutEntryId((current) => current || entryData.find((entry) => !entry.clockOutAt)?.id || "");
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load time tracking.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openEntries = useMemo(
    () => timeEntries.filter((entry) => !entry.clockOutAt),
    [timeEntries],
  );

  async function submitClockIn() {
    try {
      setClockingIn(true);
      setNotice(null);
      await requestApi("/api/time-tracking/clock-in", {
        method: "POST",
        body: JSON.stringify({
          employeeId: clockInEmployeeId,
          workDate: clockInDate,
          notes: clockInNotes || null,
        }),
      });
      setNotice("Clock-in recorded successfully.");
      setClockInNotes("");
      await loadData();
    } catch (submitError) {
      setNotice(null);
      setError(submitError instanceof Error ? submitError.message : "Clock-in failed.");
    } finally {
      setClockingIn(false);
    }
  }

  async function submitClockOut() {
    try {
      setClockingOut(true);
      setNotice(null);
      await requestApi("/api/time-tracking/clock-out", {
        method: "POST",
        body: JSON.stringify({
          timeEntryId: clockOutEntryId,
          breakMinutes: Number(breakMinutes),
          notes: clockOutNotes || null,
        }),
      });
      setNotice("Clock-out submitted successfully.");
      setClockOutNotes("");
      await loadData();
    } catch (submitError) {
      setNotice(null);
      setError(submitError instanceof Error ? submitError.message : "Clock-out failed.");
    } finally {
      setClockingOut(false);
    }
  }

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Time Clock Actions</h3>
          <p className="panel-subtitle">Cover clock-in and clock-out workflows for the operational time tracking routes.</p>
        </div>
        <span className="pill">{loading ? "Loading" : `${openEntries.length} open entries`}</span>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}
      {notice ? <p className="workspace-panel-message">{notice}</p> : null}

      <div className="workspace-form-grid">
        <div className="workspace-action-card">
          <strong>Clock In</strong>
          <div className="field">
            <label htmlFor="clock-in-employee">Employee</label>
            <select
              id="clock-in-employee"
              onChange={(event) => setClockInEmployeeId(event.target.value)}
              value={clockInEmployeeId}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} · {employee.role}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="clock-in-date">Work date</label>
            <input
              id="clock-in-date"
              onChange={(event) => setClockInDate(event.target.value)}
              type="date"
              value={clockInDate}
            />
          </div>
          <div className="field">
            <label htmlFor="clock-in-notes">Notes</label>
            <textarea
              id="clock-in-notes"
              onChange={(event) => setClockInNotes(event.target.value)}
              placeholder="Optional shift notes."
              value={clockInNotes}
            />
          </div>
          <button
            className="button-secondary"
            disabled={!clockInEmployeeId || clockingIn}
            onClick={() => void submitClockIn()}
            type="button"
          >
            Clock in
          </button>
        </div>

        <div className="workspace-action-card">
          <strong>Clock Out</strong>
          <div className="field">
            <label htmlFor="clock-out-entry">Open entry</label>
            <select
              id="clock-out-entry"
              onChange={(event) => setClockOutEntryId(event.target.value)}
              value={clockOutEntryId}
            >
              {openEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {(entry.employee?.fullName ?? entry.employee?.full_name ?? "Employee")} · {renderDate(entry.workDate)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="clock-out-break">Break minutes</label>
            <input
              id="clock-out-break"
              min="0"
              onChange={(event) => setBreakMinutes(event.target.value)}
              type="number"
              value={breakMinutes}
            />
          </div>
          <div className="field">
            <label htmlFor="clock-out-notes">Notes</label>
            <textarea
              id="clock-out-notes"
              onChange={(event) => setClockOutNotes(event.target.value)}
              placeholder="Shift closure notes."
              value={clockOutNotes}
            />
          </div>
          <button
            className="button"
            disabled={!clockOutEntryId || clockingOut}
            onClick={() => void submitClockOut()}
            type="button"
          >
            Clock out
          </button>
        </div>
      </div>
    </article>
  );
}
