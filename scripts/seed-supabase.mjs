import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, "..");
const seedDataPath = path.join(projectRoot, "supabase", "seed-data.json");

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function loadSeedData() {
  const content = await readFile(seedDataPath, "utf8");

  return JSON.parse(content);
}

async function main() {
  const supabaseUrl = readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const seedEmail = readRequiredEnv("SUPABASE_SEED_EMAIL");
  const seedPassword = readRequiredEnv("SUPABASE_SEED_PASSWORD");
  const seedData = await loadSeedData();

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: seedEmail,
    password: seedPassword,
  });

  if (signInError) {
    throw new Error(`Failed to authenticate seed user: ${signInError.message}`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? "Seed user session could not be established.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to load seed user profile: ${profileError.message}`);
  }

  if (!profile?.organization_id) {
    throw new Error("The seed user does not have an organization assigned in public.profiles.");
  }

  const organizationId = profile.organization_id;

  const { error: organizationError } = await supabase
    .from("organizations")
    .update({
      name: seedData.organization.name,
      industry: seedData.organization.industry,
      headquarters: seedData.organization.headquarters,
    })
    .eq("id", organizationId);

  if (organizationError) {
    throw new Error(`Failed to update organization: ${organizationError.message}`);
  }

  const departments = seedData.departments.map((department) => ({
    organization_id: organizationId,
    seed_key: department.seedKey,
    name: department.name,
    code: department.code,
    lead_name: department.leadName,
  }));

  const { error: departmentsError } = await supabase.from("departments").upsert(departments, {
    onConflict: "organization_id,seed_key",
  });

  if (departmentsError) {
    throw new Error(`Failed to seed departments: ${departmentsError.message}`);
  }

  const { data: departmentRows, error: departmentRowsError } = await supabase
    .from("departments")
    .select("id, name")
    .eq("organization_id", organizationId);

  if (departmentRowsError) {
    throw new Error(`Failed to load departments after seeding: ${departmentRowsError.message}`);
  }

  const departmentIdByName = new Map(departmentRows.map((department) => [department.name, department.id]));

  const employees = seedData.employees.map((employee) => ({
    organization_id: organizationId,
    seed_key: employee.seedKey,
    department_id: departmentIdByName.get(employee.department) ?? null,
    full_name: employee.fullName,
    email: `${employee.fullName.toLowerCase().replaceAll(" ", ".")}@pulsehr.app`,
    role: employee.role,
    status: employee.status,
    location: employee.location,
    salary: employee.salary,
    start_date: employee.startDate,
    manager_name: employee.managerName,
    next_review_at: employee.nextReviewAt,
  }));

  const contractors = (seedData.contractors ?? []).map((contractor) => ({
    organization_id: organizationId,
    seed_key: contractor.seedKey,
    full_name: contractor.fullName,
    email: contractor.email,
    specialization: contractor.specialization,
    status: contractor.status,
    location: contractor.location,
    payment_type: contractor.paymentType,
    hourly_rate: contractor.hourlyRate,
    flat_rate: contractor.flatRate,
    tax_classification: contractor.taxClassification,
    contract_start_date: contractor.contractStartDate,
    contract_end_date: contractor.contractEndDate,
    manager_name: contractor.managerName,
  }));

  const payrollRuns = seedData.payrollRuns.map((run) => ({
    organization_id: organizationId,
    seed_key: run.seedKey,
    pay_period_id: null,
    period_label: run.periodLabel,
    pay_date: run.payDate,
    status: run.status,
    employee_count: run.employeeCount,
    total_amount: run.totalAmount,
    variance_note: run.varianceNote,
    notes: run.status === "Processing" ? "Pre-close variance flagged for overtime review." : "Closed and remitted.",
    calculated_at: new Date().toISOString(),
    finalized_at: run.status === "Paid" ? new Date().toISOString() : null,
  }));

  const payPeriods = seedData.payPeriods.map((period) => ({
    organization_id: organizationId,
    seed_key: period.seedKey,
    label: period.label,
    start_date: period.startDate,
    end_date: period.endDate,
    pay_date: period.payDate,
    status: period.status,
  }));

  const holidays = (seedData.holidays ?? []).map((holiday) => ({
    organization_id: organizationId,
    seed_key: holiday.seedKey,
    name: holiday.name,
    holiday_date: holiday.holidayDate,
    type: holiday.type,
    applies_to: holiday.appliesTo,
    status: holiday.status,
  }));

  const employeeIdByName = new Map(
    seedData.employees.map((employee) => [employee.fullName, employee.seedKey]),
  );

  const leaveRequests = seedData.leaveRequests.map((request) => ({
    organization_id: organizationId,
    seed_key: request.seedKey,
    employee_id: null,
    employee_name: request.employeeName,
    type: request.type,
    start_date: request.startDate,
    end_date: request.endDate,
    days: request.days,
    status: request.status,
    approver_name: request.approverName,
  }));

  const expenses = (seedData.expenses ?? []).map((expense) => ({
    organization_id: organizationId,
    seed_key: expense.seedKey,
    employee_id: null,
    employee_name: expense.employeeName,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    incurred_on: expense.incurredOn,
    status: expense.status,
    approver_name: expense.approverName,
    notes: expense.notes ?? null,
    receipt_file_name: expense.receiptFileName ?? null,
    receipt_storage_path: expense.receiptStoragePath ?? null,
    receipt_mime_type: expense.receiptMimeType ?? null,
  }));
  const complianceRules = (seedData.complianceRules ?? []).map((rule) => ({
    organization_id: organizationId,
    seed_key: rule.seedKey,
    name: rule.name,
    jurisdiction: rule.jurisdiction,
    category: rule.category,
    deadline_date: rule.deadlineDate,
    status: rule.status,
    notes: rule.notes ?? null,
  }));
  const complianceAlertsSeed = seedData.complianceAlerts ?? [];
  const taxFilings = (seedData.taxFilings ?? []).map((filing) => ({
    organization_id: organizationId,
    seed_key: filing.seedKey,
    filing_name: filing.filingName,
    jurisdiction: filing.jurisdiction,
    period_label: filing.periodLabel,
    due_date: filing.dueDate,
    filed_at: filing.filedAt ?? null,
    status: filing.status,
    amount: filing.amount,
    notes: filing.notes ?? null,
  }));

  const onboardingWorkflows = (seedData.onboardingWorkflows ?? []).map((workflow) => ({
    organization_id: organizationId,
    seed_key: workflow.seedKey,
    employee_id: null,
    employee_name: workflow.employeeName,
    owner_name: workflow.ownerName,
    status: workflow.status,
    start_date: workflow.startDate,
    target_date: workflow.targetDate,
    notes: workflow.notes ?? null,
  }));

  const onboardingTasksSeed = seedData.onboardingTasks ?? [];
  const bankAccountsSeed = seedData.bankAccounts ?? [];
  const benefitsPlans = (seedData.benefitsPlans ?? []).map((plan) => ({
    organization_id: organizationId,
    seed_key: plan.seedKey,
    name: plan.name,
    provider_name: plan.providerName,
    category: plan.category,
    coverage_level: plan.coverageLevel,
    employee_cost: plan.employeeCost,
    employer_cost: plan.employerCost,
    status: plan.status,
  }));
  const benefitsEnrollmentsSeed = seedData.benefitsEnrollments ?? [];
  const performanceReviewTemplates = (seedData.performanceReviewTemplates ?? []).map((template) => ({
    organization_id: organizationId,
    seed_key: template.seedKey,
    name: template.name,
    cycle_label: template.cycleLabel,
    review_type: template.reviewType,
    status: template.status,
    questions: template.questions,
  }));
  const performanceReviewsSeed = seedData.performanceReviews ?? [];

  const announcements = seedData.announcements.map((announcement) => ({
    organization_id: organizationId,
    seed_key: announcement.seedKey,
    label: announcement.label,
    title: announcement.title,
    body: announcement.body,
    display_order: announcement.displayOrder,
  }));

  const [{ error: employeesError }, { error: contractorsError }, { error: payrollError }, { error: payPeriodsError }, { error: holidaysError }, { error: leaveError }, { error: expensesError }, { error: complianceRulesError }, { error: taxFilingsError }, { error: benefitsPlansError }, { error: performanceTemplatesError }, { error: announcementsError }] =
    await Promise.all([
      supabase.from("employees").upsert(employees, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("contractors").upsert(contractors, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("payroll_runs").upsert(payrollRuns, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("pay_periods").upsert(payPeriods, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("holidays").upsert(holidays, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("leave_requests").upsert(leaveRequests, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("expenses").upsert(expenses, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("compliance_rules").upsert(complianceRules, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("tax_filings").upsert(taxFilings, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("benefits_plans").upsert(benefitsPlans, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("performance_review_templates").upsert(performanceReviewTemplates, {
        onConflict: "organization_id,seed_key",
      }),
      supabase.from("announcements").upsert(announcements, {
        onConflict: "organization_id,seed_key",
      }),
    ]);

  if (employeesError) {
    throw new Error(`Failed to seed employees: ${employeesError.message}`);
  }

  if (payrollError) {
    throw new Error(`Failed to seed payroll runs: ${payrollError.message}`);
  }

  if (contractorsError) {
    throw new Error(`Failed to seed contractors: ${contractorsError.message}`);
  }

  if (payPeriodsError) {
    throw new Error(`Failed to seed pay periods: ${payPeriodsError.message}`);
  }

  if (holidaysError) {
    throw new Error(`Failed to seed holidays: ${holidaysError.message}`);
  }

  if (leaveError) {
    throw new Error(`Failed to seed leave requests: ${leaveError.message}`);
  }

  if (expensesError) {
    throw new Error(`Failed to seed expenses: ${expensesError.message}`);
  }

  if (complianceRulesError) {
    throw new Error(`Failed to seed compliance rules: ${complianceRulesError.message}`);
  }

  if (taxFilingsError) {
    throw new Error(`Failed to seed tax filings: ${taxFilingsError.message}`);
  }

  if (benefitsPlansError) {
    throw new Error(`Failed to seed benefits plans: ${benefitsPlansError.message}`);
  }

  if (performanceTemplatesError) {
    throw new Error(`Failed to seed performance review templates: ${performanceTemplatesError.message}`);
  }

  if (announcementsError) {
    throw new Error(`Failed to seed announcements: ${announcementsError.message}`);
  }

  const { data: employeeRows, error: employeeRowsError } = await supabase
    .from("employees")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (employeeRowsError) {
    throw new Error(`Failed to load employees after seeding: ${employeeRowsError.message}`);
  }

  const { data: payPeriodRows, error: payPeriodRowsError } = await supabase
    .from("pay_periods")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (payPeriodRowsError) {
    throw new Error(`Failed to load pay periods after seeding: ${payPeriodRowsError.message}`);
  }

  const employeeIdBySeedKey = new Map(employeeRows.map((employee) => [employee.seed_key, employee.id]));
  const payPeriodIdBySeedKey = new Map(payPeriodRows.map((period) => [period.seed_key, period.id]));
  const payPeriodSeedKeyByLabel = new Map(seedData.payPeriods.map((period) => [period.label, period.seedKey]));

  const bankAccounts = bankAccountsSeed.map((account) => ({
    organization_id: organizationId,
    seed_key: account.seedKey,
    employee_id: employeeIdBySeedKey.get(employeeIdByName.get(account.employeeName)) ?? null,
    account_holder_name: account.accountHolderName,
    bank_name: account.bankName,
    account_type: account.accountType,
    account_last4: account.accountLast4,
    routing_last4: account.routingLast4,
    status: account.status,
    is_primary: Boolean(account.isPrimary),
    provider_reference: account.providerReference ?? `seed-${randomUUID()}`,
    verified_at: account.verifiedAt ?? null,
    notes: account.notes ?? null,
  }));

  const payrollRunsWithPayPeriods = payrollRuns.map((run) => ({
    ...run,
    pay_period_id: payPeriodIdBySeedKey.get(
      seedData.payrollRuns.find((item) => item.seedKey === run.seed_key)?.payPeriodLabel
        ? payPeriodSeedKeyByLabel.get(
            seedData.payrollRuns.find((item) => item.seedKey === run.seed_key)?.payPeriodLabel,
          )
        : undefined,
    ) ?? null,
  }));

  const { error: payrollRunsWithPayPeriodsError } = await supabase.from("payroll_runs").upsert(payrollRunsWithPayPeriods, {
    onConflict: "organization_id,seed_key",
  });

  if (payrollRunsWithPayPeriodsError) {
    throw new Error(`Failed to update payroll runs with pay periods: ${payrollRunsWithPayPeriodsError.message}`);
  }

  const { data: payrollRunRows, error: payrollRunRowsError } = await supabase
    .from("payroll_runs")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (payrollRunRowsError) {
    throw new Error(`Failed to load payroll runs after seeding: ${payrollRunRowsError.message}`);
  }

  const payrollRunIdBySeedKey = new Map(payrollRunRows.map((run) => [run.seed_key, run.id]));

  const leaveRequestsWithEmployeeIds = leaveRequests.map((request) => ({
    ...request,
    employee_id: employeeIdBySeedKey.get(employeeIdByName.get(request.employee_name)) ?? null,
  }));

  const { error: leaveRequestsWithEmployeesError } = await supabase.from("leave_requests").upsert(leaveRequestsWithEmployeeIds, {
    onConflict: "organization_id,seed_key",
  });

  if (leaveRequestsWithEmployeesError) {
    throw new Error(`Failed to update leave requests with employee references: ${leaveRequestsWithEmployeesError.message}`);
  }

  const expensesWithEmployeeIds = expenses.map((expense) => ({
    ...expense,
    employee_id: employeeIdBySeedKey.get(employeeIdByName.get(expense.employee_name)) ?? null,
  }));

  const { error: expensesWithEmployeesError } = await supabase.from("expenses").upsert(expensesWithEmployeeIds, {
    onConflict: "organization_id,seed_key",
  });

  if (expensesWithEmployeesError) {
    throw new Error(`Failed to update expenses with employee references: ${expensesWithEmployeesError.message}`);
  }

  const primaryEmployeeIds = new Set(
    bankAccounts.filter((account) => account.is_primary && account.employee_id).map((account) => account.employee_id),
  );

  if (primaryEmployeeIds.size > 0) {
    const { error: clearPrimaryBankAccountsError } = await supabase
      .from("bank_accounts")
      .update({ is_primary: false })
      .eq("organization_id", organizationId)
      .in("employee_id", [...primaryEmployeeIds]);

    if (clearPrimaryBankAccountsError) {
      throw new Error(`Failed to reset primary bank accounts before seeding: ${clearPrimaryBankAccountsError.message}`);
    }
  }

  const { error: bankAccountsError } = await supabase.from("bank_accounts").upsert(bankAccounts, {
    onConflict: "organization_id,seed_key",
  });

  if (bankAccountsError) {
    throw new Error(`Failed to seed bank accounts: ${bankAccountsError.message}`);
  }

  const onboardingWorkflowsWithEmployeeIds = onboardingWorkflows.map((workflow) => ({
    ...workflow,
    employee_id: employeeIdBySeedKey.get(employeeIdByName.get(workflow.employee_name)) ?? null,
  }));

  const { error: onboardingWorkflowsError } = await supabase.from("onboarding_workflows").upsert(onboardingWorkflowsWithEmployeeIds, {
    onConflict: "organization_id,seed_key",
  });

  if (onboardingWorkflowsError) {
    throw new Error(`Failed to seed onboarding workflows: ${onboardingWorkflowsError.message}`);
  }

  const { data: onboardingWorkflowRows, error: onboardingWorkflowRowsError } = await supabase
    .from("onboarding_workflows")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (onboardingWorkflowRowsError) {
    throw new Error(`Failed to load onboarding workflows after seeding: ${onboardingWorkflowRowsError.message}`);
  }

  const onboardingWorkflowIdBySeedKey = new Map(
    onboardingWorkflowRows.map((workflow) => [workflow.seed_key, workflow.id]),
  );

  const { data: leaveRequestRows, error: leaveRequestRowsError } = await supabase
    .from("leave_requests")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (leaveRequestRowsError) {
    throw new Error(`Failed to load leave requests after seeding: ${leaveRequestRowsError.message}`);
  }

  const leaveRequestIdBySeedKey = new Map(leaveRequestRows.map((request) => [request.seed_key, request.id]));

  const { data: expenseRows, error: expenseRowsError } = await supabase
    .from("expenses")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (expenseRowsError) {
    throw new Error(`Failed to load expenses after seeding: ${expenseRowsError.message}`);
  }

  const expenseIdBySeedKey = new Map(expenseRows.map((expense) => [expense.seed_key, expense.id]));

  const { data: benefitsPlanRows, error: benefitsPlanRowsError } = await supabase
    .from("benefits_plans")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (benefitsPlanRowsError) {
    throw new Error(`Failed to load benefits plans after seeding: ${benefitsPlanRowsError.message}`);
  }

  const benefitsPlanIdBySeedKey = new Map(benefitsPlanRows.map((plan) => [plan.seed_key, plan.id]));

  const benefitsEnrollments = benefitsEnrollmentsSeed.map((enrollment) => ({
    organization_id: organizationId,
    seed_key: enrollment.seedKey,
    employee_id: employeeIdBySeedKey.get(employeeIdByName.get(enrollment.employeeName)) ?? null,
    employee_name: enrollment.employeeName,
    plan_id: benefitsPlanIdBySeedKey.get(enrollment.planSeedKey) ?? null,
    status: enrollment.status,
    effective_date: enrollment.effectiveDate,
    end_date: enrollment.endDate ?? null,
    payroll_deduction: enrollment.payrollDeduction,
    notes: enrollment.notes ?? null,
  }));

  const { error: benefitsEnrollmentsError } = await supabase.from("benefits_enrollments").upsert(benefitsEnrollments, {
    onConflict: "organization_id,seed_key",
  });

  if (benefitsEnrollmentsError) {
    throw new Error(`Failed to seed benefits enrollments: ${benefitsEnrollmentsError.message}`);
  }

  const { data: performanceTemplateRows, error: performanceTemplateRowsError } = await supabase
    .from("performance_review_templates")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (performanceTemplateRowsError) {
    throw new Error(
      `Failed to load performance review templates after seeding: ${performanceTemplateRowsError.message}`,
    );
  }

  const performanceTemplateIdBySeedKey = new Map(
    performanceTemplateRows.map((template) => [template.seed_key, template.id]),
  );

  const performanceReviews = performanceReviewsSeed.map((review) => ({
    organization_id: organizationId,
    seed_key: review.seedKey,
    employee_id: employeeIdBySeedKey.get(employeeIdByName.get(review.employeeName)) ?? null,
    employee_name: review.employeeName,
    template_id: performanceTemplateIdBySeedKey.get(review.templateSeedKey) ?? null,
    reviewer_name: review.reviewerName,
    status: review.status,
    due_date: review.dueDate,
    submitted_at: review.submittedAt ?? null,
    score: review.score ?? null,
    summary: review.summary ?? null,
    notes: review.notes ?? null,
  }));

  const { error: performanceReviewsError } = await supabase.from("performance_reviews").upsert(performanceReviews, {
    onConflict: "organization_id,seed_key",
  });

  if (performanceReviewsError) {
    throw new Error(`Failed to seed performance reviews: ${performanceReviewsError.message}`);
  }

  const { data: complianceRuleRows, error: complianceRuleRowsError } = await supabase
    .from("compliance_rules")
    .select("id, seed_key")
    .eq("organization_id", organizationId);

  if (complianceRuleRowsError) {
    throw new Error(`Failed to load compliance rules after seeding: ${complianceRuleRowsError.message}`);
  }

  const complianceRuleIdBySeedKey = new Map(complianceRuleRows.map((rule) => [rule.seed_key, rule.id]));

  const complianceAlerts = complianceAlertsSeed.map((alert) => ({
    organization_id: organizationId,
    seed_key: alert.seedKey,
    rule_id: complianceRuleIdBySeedKey.get(alert.ruleSeedKey) ?? null,
    severity: alert.severity,
    title: alert.title,
    message: alert.message,
    status: alert.status,
    due_date: alert.dueDate,
  }));

  const { error: complianceAlertsError } = await supabase.from("compliance_alerts").upsert(complianceAlerts, {
    onConflict: "organization_id,seed_key",
  });

  if (complianceAlertsError) {
    throw new Error(`Failed to seed compliance alerts: ${complianceAlertsError.message}`);
  }

  const timeEntries = seedData.timeEntries.map((entry) => ({
    organization_id: organizationId,
    seed_key: entry.seedKey,
    employee_id: employeeIdBySeedKey.get(employeeIdByName.get(entry.employeeName)) ?? null,
    pay_period_id: payPeriodIdBySeedKey.get(payPeriodSeedKeyByLabel.get(entry.payPeriodLabel)) ?? null,
    work_date: entry.workDate,
    clock_in_at: entry.clockInAt,
    clock_out_at: entry.clockOutAt,
    break_minutes: entry.breakMinutes,
    hours_worked: entry.hoursWorked,
    overtime_hours: entry.overtimeHours,
    status: entry.status,
  }));

  const { error: timeEntriesError } = await supabase.from("time_entries").upsert(timeEntries, {
    onConflict: "organization_id,seed_key",
  });

  if (timeEntriesError) {
    throw new Error(`Failed to seed time entries: ${timeEntriesError.message}`);
  }

  const payrollRunSeedKeyByLabel = new Map(seedData.payrollRuns.map((run) => [run.periodLabel, run.seedKey]));
  const payrollItems = seedData.payrollItems.map((item) => ({
    organization_id: organizationId,
    seed_key: item.seedKey,
    payroll_run_id: payrollRunIdBySeedKey.get(payrollRunSeedKeyByLabel.get(item.payrollRunLabel)) ?? null,
    employee_id: employeeIdBySeedKey.get(employeeIdByName.get(item.employeeName)) ?? null,
    gross_pay: item.grossPay,
    tax_amount: item.taxAmount,
    deductions_amount: item.deductionsAmount,
    net_pay: item.netPay,
    status: item.status,
  }));

  const { error: payrollItemsError } = await supabase.from("payroll_items").upsert(payrollItems, {
    onConflict: "organization_id,seed_key",
  });

  if (payrollItemsError) {
    throw new Error(`Failed to seed payroll items: ${payrollItemsError.message}`);
  }

  const approvals = seedData.approvals.map((approval) => ({
    organization_id: organizationId,
    seed_key: approval.seedKey,
    entity_type: approval.entityType,
    entity_id:
      approval.entityType === "leave_request"
        ? leaveRequestIdBySeedKey.get(approval.entitySeedKey) ?? null
        : approval.entityType === "expense"
          ? expenseIdBySeedKey.get(approval.entitySeedKey) ?? null
          : null,
    requested_by_name: approval.requestedByName,
    assigned_to_name: approval.assignedToName,
    status: approval.status,
    decision_note: approval.decisionNote,
    decided_at: approval.status === "Approved" || approval.status === "Rejected" ? new Date().toISOString() : null,
  }));

  const { error: approvalsError } = await supabase.from("approvals").upsert(approvals, {
    onConflict: "organization_id,seed_key",
  });

  if (approvalsError) {
    throw new Error(`Failed to seed approvals: ${approvalsError.message}`);
  }

  const documents = seedData.documents.map((document) => ({
    organization_id: organizationId,
    seed_key: document.seedKey,
    entity_type: document.entityType,
    entity_id:
      document.entityType === "company"
        ? organizationId
        : employeeIdBySeedKey.get(employeeIdByName.get(document.entityName)) ?? null,
    category: document.category,
    file_name: document.fileName,
    storage_path: document.storagePath,
    mime_type: document.mimeType,
    size_bytes: document.sizeBytes,
    status: document.status,
    visibility: document.visibility,
    uploaded_by_name: "Maya Chen",
  }));

  const { error: documentsError } = await supabase.from("documents").upsert(documents, {
    onConflict: "organization_id,seed_key",
  });

  if (documentsError) {
    throw new Error(`Failed to seed documents: ${documentsError.message}`);
  }

  const onboardingTasks = onboardingTasksSeed.map((task) => ({
    organization_id: organizationId,
    seed_key: task.seedKey,
    workflow_id: onboardingWorkflowIdBySeedKey.get(task.workflowSeedKey) ?? null,
    title: task.title,
    category: task.category,
    assigned_to_name: task.assignedToName,
    status: task.status,
    due_date: task.dueDate,
    completed_at: task.completedAt ?? (task.status === "Completed" ? new Date().toISOString() : null),
    notes: task.notes ?? null,
  }));

  const { error: onboardingTasksError } = await supabase.from("onboarding_tasks").upsert(onboardingTasks, {
    onConflict: "organization_id,seed_key",
  });

  if (onboardingTasksError) {
    throw new Error(`Failed to seed onboarding tasks: ${onboardingTasksError.message}`);
  }

  console.log(`Seeded organization ${organizationId}`);
  console.log(`Departments: ${departments.length}`);
  console.log(`Employees: ${employees.length}`);
  console.log(`Contractors: ${contractors.length}`);
  console.log(`Payroll runs: ${payrollRuns.length}`);
  console.log(`Payroll items: ${payrollItems.length}`);
  console.log(`Pay periods: ${payPeriods.length}`);
  console.log(`Holidays: ${holidays.length}`);
  console.log(`Time entries: ${timeEntries.length}`);
  console.log(`Leave requests: ${leaveRequests.length}`);
  console.log(`Expenses: ${expenses.length}`);
  console.log(`Compliance rules: ${complianceRules.length}`);
  console.log(`Compliance alerts: ${complianceAlerts.length}`);
  console.log(`Tax filings: ${taxFilings.length}`);
  console.log(`Benefits plans: ${benefitsPlans.length}`);
  console.log(`Benefits enrollments: ${benefitsEnrollments.length}`);
  console.log(`Performance review templates: ${performanceReviewTemplates.length}`);
  console.log(`Performance reviews: ${performanceReviews.length}`);
  console.log(`Approvals: ${approvals.length}`);
  console.log(`Documents: ${documents.length}`);
  console.log(`Bank accounts: ${bankAccounts.length}`);
  console.log(`Onboarding workflows: ${onboardingWorkflows.length}`);
  console.log(`Onboarding tasks: ${onboardingTasks.length}`);
  console.log(`Announcements: ${announcements.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
