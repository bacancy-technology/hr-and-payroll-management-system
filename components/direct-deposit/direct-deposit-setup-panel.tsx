"use client";

import { useCallback, useEffect, useState } from "react";

import { requestApi } from "@/components/workspace-data/api-client";
import { renderDate, renderStatus } from "@/components/workspace-data/api-table-panel";

interface EmployeeRecord {
  id: string;
  fullName: string;
  email: string;
}

interface BankAccountRecord {
  id: string;
  bankName: string;
  accountType: string;
  accountLast4: string;
  status: string;
  isPrimary: boolean;
  verifiedAt: string | null;
  employee: {
    id: string;
    full_name?: string;
    fullName?: string;
  } | null;
}

export function DirectDepositSetupPanel() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [accounts, setAccounts] = useState<BankAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("Checking");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeeData, accountData] = await Promise.all([
        requestApi<EmployeeRecord[]>("/api/employees"),
        requestApi<BankAccountRecord[]>("/api/bank-accounts"),
      ]);
      setEmployees(employeeData);
      setAccounts(accountData);
      setEmployeeId((current) => current || employeeData[0]?.id || "");
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load direct deposit data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function submitAccount() {
    try {
      setSubmitting(true);
      setNotice(null);
      await requestApi("/api/direct-deposit/setup", {
        method: "POST",
        body: JSON.stringify({
          employeeId,
          accountHolderName,
          bankName,
          accountType,
          accountNumber,
          routingNumber,
          isPrimary,
        }),
      });
      setNotice("Direct deposit account created.");
      setAccountHolderName("");
      setBankName("");
      setAccountNumber("");
      setRoutingNumber("");
      await loadData();
    } catch (submitError) {
      setNotice(null);
      setError(submitError instanceof Error ? submitError.message : "Direct deposit setup failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyAccount(bankAccountId: string) {
    try {
      setVerifyingId(bankAccountId);
      setNotice(null);
      await requestApi("/api/direct-deposit/verify", {
        method: "POST",
        body: JSON.stringify({ bankAccountId }),
      });
      setNotice("Bank account verified.");
      await loadData();
    } catch (submitError) {
      setNotice(null);
      setError(submitError instanceof Error ? submitError.message : "Verification failed.");
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <article className="panel">
      <div className="panel-top">
        <div>
          <h3>Direct Deposit Setup</h3>
          <p className="panel-subtitle">Create and verify bank accounts from the frontend against the direct deposit APIs.</p>
        </div>
        <span className="pill">{loading ? "Loading" : `${accounts.length} accounts`}</span>
      </div>

      {error ? <p className="workspace-panel-message workspace-panel-message-error">{error}</p> : null}
      {notice ? <p className="workspace-panel-message">{notice}</p> : null}

      <div className="workspace-form-grid">
        <div className="workspace-action-card">
          <strong>New account</strong>
          <div className="field">
            <label htmlFor="deposit-employee">Employee</label>
            <select
              id="deposit-employee"
              onChange={(event) => setEmployeeId(event.target.value)}
              value={employeeId}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} · {employee.email}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="deposit-holder">Account holder name</label>
            <input
              id="deposit-holder"
              onChange={(event) => setAccountHolderName(event.target.value)}
              placeholder="Account holder"
              value={accountHolderName}
            />
          </div>
          <div className="workspace-form-grid workspace-form-grid-compact">
            <div className="field">
              <label htmlFor="deposit-bank">Bank name</label>
              <input
                id="deposit-bank"
                onChange={(event) => setBankName(event.target.value)}
                placeholder="Northwind Bank"
                value={bankName}
              />
            </div>
            <div className="field">
              <label htmlFor="deposit-type">Account type</label>
              <select
                id="deposit-type"
                onChange={(event) => setAccountType(event.target.value)}
                value={accountType}
              >
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
              </select>
            </div>
          </div>
          <div className="workspace-form-grid workspace-form-grid-compact">
            <div className="field">
              <label htmlFor="deposit-number">Account number</label>
              <input
                id="deposit-number"
                onChange={(event) => setAccountNumber(event.target.value)}
                placeholder="1234567890"
                value={accountNumber}
              />
            </div>
            <div className="field">
              <label htmlFor="deposit-routing">Routing number</label>
              <input
                id="deposit-routing"
                onChange={(event) => setRoutingNumber(event.target.value)}
                placeholder="021000021"
                value={routingNumber}
              />
            </div>
          </div>
          <label className="workspace-checkbox">
            <input
              checked={isPrimary}
              onChange={(event) => setIsPrimary(event.target.checked)}
              type="checkbox"
            />
            <span>Make this the primary disbursement account</span>
          </label>
          <button
            className="button-secondary"
            disabled={
              !employeeId ||
              !accountHolderName ||
              !bankName ||
              !accountNumber ||
              !routingNumber ||
              submitting
            }
            onClick={() => void submitAccount()}
            type="button"
          >
            Save account
          </button>
        </div>

        <div className="workspace-action-card">
          <strong>Verification queue</strong>
          {accounts.length === 0 ? <p className="muted">No bank accounts are available yet.</p> : null}
          <div className="workspace-action-stack">
            {accounts.map((account) => (
              <div className="workspace-mini-card" key={account.id}>
                <div className="split">
                  <div>
                    <strong>
                      {(account.employee?.fullName ?? account.employee?.full_name ?? "Employee")} · {account.bankName}
                    </strong>
                    <p className="muted">
                      {account.accountType} ending {account.accountLast4}
                      {account.isPrimary ? " · primary" : ""}
                    </p>
                  </div>
                  {renderStatus(account.status)}
                </div>
                <p className="muted">
                  Verified {account.verifiedAt ? renderDate(account.verifiedAt) : "not yet"}
                </p>
                <button
                  className="button-ghost"
                  disabled={account.status === "Verified" || verifyingId === account.id}
                  onClick={() => void verifyAccount(account.id)}
                  type="button"
                >
                  {account.status === "Verified" ? "Verified" : "Verify account"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
