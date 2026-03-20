create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  headquarters text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  full_name text not null,
  email text not null,
  role text not null default 'HR Admin',
  created_at timestamptz not null default now()
);

create table if not exists public.company_entities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  name text not null,
  legal_name text not null,
  entity_type text not null default 'LLC',
  tax_id text,
  registration_state text not null,
  headquarters text not null,
  payroll_frequency text not null default 'Biweekly',
  employee_count integer not null default 0 check (employee_count >= 0),
  status text not null default 'Active',
  primary_contact_name text,
  primary_contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.backup_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  backup_type text not null default 'Full',
  status text not null default 'Completed',
  started_at timestamptz,
  completed_at timestamptz,
  retention_until timestamptz,
  storage_path text not null,
  snapshot_size_mb numeric(12, 2) not null default 0 check (snapshot_size_mb >= 0),
  triggered_by_name text not null,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.recovery_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  backup_job_id uuid references public.backup_jobs (id) on delete set null,
  recovery_type text not null default 'Point-in-time',
  status text not null default 'Completed',
  started_at timestamptz,
  completed_at timestamptz,
  target_scope text not null,
  requested_by_name text not null,
  approved_by_name text,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  name text not null,
  code text,
  lead_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.access_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  name text not null,
  description text,
  status text not null default 'Active',
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  role_id uuid not null references public.access_roles (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  department_id uuid references public.departments (id) on delete set null,
  full_name text not null,
  email text not null,
  role text not null,
  status text not null default 'Active',
  location text not null,
  salary numeric(12, 2) not null check (salary >= 0),
  start_date date not null,
  manager_name text not null,
  next_review_at date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contractors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  full_name text not null,
  email text not null,
  specialization text not null,
  status text not null default 'Active',
  location text not null,
  payment_type text not null,
  hourly_rate numeric(12, 2) not null default 0 check (hourly_rate >= 0),
  flat_rate numeric(12, 2) not null default 0 check (flat_rate >= 0),
  tax_classification text not null default '1099',
  contract_start_date date not null,
  contract_end_date date,
  manager_name text not null,
  created_at timestamptz not null default now(),
  check (contract_end_date is null or contract_end_date >= contract_start_date)
);

create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  pay_period_id uuid references public.pay_periods (id) on delete set null,
  period_label text not null,
  pay_date date not null,
  status text not null default 'Scheduled',
  employee_count integer not null check (employee_count >= 0),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  variance_note text not null,
  notes text,
  calculated_at timestamptz,
  finalized_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  payroll_run_id uuid not null references public.payroll_runs (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  gross_pay numeric(12, 2) not null check (gross_pay >= 0),
  tax_amount numeric(12, 2) not null default 0 check (tax_amount >= 0),
  deductions_amount numeric(12, 2) not null default 0 check (deductions_amount >= 0),
  net_pay numeric(12, 2) not null check (net_pay >= 0),
  status text not null default 'Draft',
  created_at timestamptz not null default now()
);

create table if not exists public.pay_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  label text not null,
  start_date date not null,
  end_date date not null,
  pay_date date not null,
  status text not null default 'Open',
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  name text not null,
  holiday_date date not null,
  type text not null,
  applies_to text not null,
  status text not null default 'Scheduled',
  created_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  employee_id uuid not null references public.employees (id) on delete cascade,
  pay_period_id uuid references public.pay_periods (id) on delete set null,
  work_date date not null,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  break_minutes integer not null default 0 check (break_minutes >= 0),
  hours_worked numeric(6, 2) not null default 0 check (hours_worked >= 0),
  overtime_hours numeric(6, 2) not null default 0 check (overtime_hours >= 0),
  status text not null default 'Draft',
  notes text,
  created_at timestamptz not null default now(),
  check (clock_out_at is null or clock_in_at is null or clock_out_at >= clock_in_at)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  employee_id uuid references public.employees (id) on delete set null,
  employee_name text not null,
  type text not null,
  start_date date not null,
  end_date date not null,
  days integer not null check (days >= 0),
  status text not null default 'Pending',
  approver_name text not null,
  notes text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  employee_id uuid references public.employees (id) on delete set null,
  employee_name text not null,
  category text not null,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  incurred_on date not null,
  status text not null default 'Pending',
  approver_name text not null,
  notes text,
  receipt_file_name text,
  receipt_storage_path text,
  receipt_mime_type text,
  reimbursed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  name text not null,
  jurisdiction text not null,
  category text not null,
  deadline_date date not null,
  status text not null default 'Open',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  rule_id uuid not null references public.compliance_rules (id) on delete cascade,
  severity text not null,
  title text not null,
  message text not null,
  status text not null default 'Open',
  due_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tax_filings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  filing_name text not null,
  jurisdiction text not null,
  period_label text not null,
  due_date date not null,
  filed_at timestamptz,
  status text not null default 'Prepared',
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workers_comp_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  policy_name text not null,
  carrier_name text not null,
  policy_number text not null,
  coverage_start_date date not null,
  coverage_end_date date not null,
  status text not null default 'Active',
  states_covered jsonb not null default '[]'::jsonb,
  premium_amount numeric(12, 2) not null default 0 check (premium_amount >= 0),
  contact_name text,
  contact_email text,
  notes text,
  created_at timestamptz not null default now(),
  check (coverage_end_date >= coverage_start_date)
);

create table if not exists public.workers_comp_claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  employee_id uuid references public.employees (id) on delete set null,
  employee_name text not null,
  policy_id uuid references public.workers_comp_policies (id) on delete set null,
  policy_name text not null,
  incident_date date not null,
  reported_date date not null,
  claim_number text,
  claim_type text not null,
  status text not null default 'Open',
  description text,
  amount_reserved numeric(12, 2) not null default 0 check (amount_reserved >= 0),
  amount_paid numeric(12, 2) not null default 0 check (amount_paid >= 0),
  case_manager_name text,
  case_manager_email text,
  created_at timestamptz not null default now(),
  check (reported_date >= incident_date)
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  provider text not null,
  display_name text not null,
  category text not null,
  status text not null default 'Disconnected',
  connection_mode text not null default 'OAuth',
  scopes jsonb not null default '[]'::jsonb,
  config jsonb not null default '{}'::jsonb,
  external_account_id text,
  webhook_secret_hint text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.integration_sync_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  integration_id uuid not null references public.integrations (id) on delete cascade,
  trigger_source text not null,
  status text not null default 'Queued',
  started_at timestamptz,
  completed_at timestamptz,
  records_processed integer not null default 0 check (records_processed >= 0),
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  integration_id uuid references public.integrations (id) on delete set null,
  provider text not null,
  event_type text not null,
  delivery_status text not null default 'Received',
  external_event_id text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  entity_type text not null,
  entity_id uuid not null,
  requested_by_name text not null,
  assigned_to_name text not null,
  status text not null default 'Pending',
  decision_note text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  entity_type text not null,
  entity_id uuid not null,
  category text not null,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes >= 0),
  status text not null default 'Active',
  visibility text not null default 'Private',
  uploaded_by_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  employee_id uuid not null references public.employees (id) on delete cascade,
  account_holder_name text not null,
  bank_name text not null,
  account_type text not null,
  account_last4 text not null,
  routing_last4 text not null,
  status text not null default 'Pending Verification',
  is_primary boolean not null default false,
  provider_reference text not null,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.benefits_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  name text not null,
  provider_name text not null,
  category text not null,
  coverage_level text not null,
  employee_cost numeric(12, 2) not null default 0 check (employee_cost >= 0),
  employer_cost numeric(12, 2) not null default 0 check (employer_cost >= 0),
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.benefits_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  employee_id uuid references public.employees (id) on delete set null,
  employee_name text not null,
  plan_id uuid not null references public.benefits_plans (id) on delete cascade,
  status text not null default 'Pending',
  effective_date date not null,
  end_date date,
  payroll_deduction numeric(12, 2) not null default 0 check (payroll_deduction >= 0),
  notes text,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= effective_date)
);

create table if not exists public.performance_review_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  name text not null,
  cycle_label text not null,
  review_type text not null,
  status text not null default 'Active',
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  employee_id uuid references public.employees (id) on delete set null,
  employee_name text not null,
  template_id uuid not null references public.performance_review_templates (id) on delete cascade,
  reviewer_name text not null,
  status text not null default 'Draft',
  due_date date not null,
  submitted_at timestamptz,
  score numeric(4, 2),
  summary text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.onboarding_workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  employee_id uuid references public.employees (id) on delete set null,
  employee_name text not null,
  owner_name text not null,
  status text not null default 'Pending',
  start_date date not null,
  target_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  check (target_date >= start_date)
);

create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  workflow_id uuid not null references public.onboarding_workflows (id) on delete cascade,
  title text not null,
  category text not null,
  assigned_to_name text not null,
  status text not null default 'Pending',
  due_date date not null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  seed_key text not null default gen_random_uuid()::text,
  label text not null,
  title text not null,
  body text not null,
  display_order integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.departments add column if not exists seed_key text;
update public.departments set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.departments alter column seed_key set default gen_random_uuid()::text;
alter table public.departments alter column seed_key set not null;
alter table public.departments add column if not exists code text;
alter table public.departments add column if not exists lead_name text;

alter table public.access_roles add column if not exists seed_key text;
update public.access_roles set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.access_roles alter column seed_key set default gen_random_uuid()::text;
alter table public.access_roles alter column seed_key set not null;
alter table public.access_roles add column if not exists permissions jsonb;
update public.access_roles set permissions = '[]'::jsonb where permissions is null;
alter table public.access_roles alter column permissions set default '[]'::jsonb;
alter table public.access_roles alter column permissions set not null;

alter table public.role_assignments add column if not exists seed_key text;
update public.role_assignments set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.role_assignments alter column seed_key set default gen_random_uuid()::text;
alter table public.role_assignments alter column seed_key set not null;

alter table public.employees add column if not exists seed_key text;
update public.employees set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.employees alter column seed_key set default gen_random_uuid()::text;
alter table public.employees alter column seed_key set not null;
alter table public.employees add column if not exists department_id uuid references public.departments (id) on delete set null;
alter table public.employees add column if not exists email text;
update public.employees set email = concat(lower(replace(full_name, ' ', '.')), '@pulsehr.app') where coalesce(email, '') = '';
alter table public.employees alter column email set not null;
alter table public.employees alter column email drop default;

alter table public.contractors add column if not exists seed_key text;
update public.contractors set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.contractors alter column seed_key set default gen_random_uuid()::text;
alter table public.contractors alter column seed_key set not null;
alter table public.contractors add column if not exists email text;
update public.contractors set email = concat(lower(replace(full_name, ' ', '.')), '@contractor.pulsehr.app') where coalesce(email, '') = '';
alter table public.contractors alter column email set not null;
alter table public.contractors alter column email drop default;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'employees'
      and column_name = 'department'
  ) then
    insert into public.departments (organization_id, name, code, lead_name)
    select distinct
      employees.organization_id,
      employees.department,
      upper(left(regexp_replace(employees.department, '[^a-zA-Z0-9]+', '', 'g'), 6)),
      null
    from public.employees as employees
    left join public.departments as departments
      on departments.organization_id = employees.organization_id
     and departments.name = employees.department
    where employees.department is not null
      and employees.department <> ''
      and departments.id is null;

    update public.employees
    set department_id = public.departments.id
    from public.departments
    where public.employees.department_id is null
      and public.employees.organization_id = public.departments.organization_id
      and public.employees.department = public.departments.name;
  end if;
end
$$;

alter table public.employees drop column if exists department;

alter table public.payroll_runs add column if not exists seed_key text;
update public.payroll_runs set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.payroll_runs alter column seed_key set default gen_random_uuid()::text;
alter table public.payroll_runs alter column seed_key set not null;
alter table public.payroll_runs add column if not exists pay_period_id uuid references public.pay_periods (id) on delete set null;
alter table public.payroll_runs add column if not exists notes text;
alter table public.payroll_runs add column if not exists calculated_at timestamptz;
alter table public.payroll_runs add column if not exists finalized_at timestamptz;

alter table public.payroll_items add column if not exists seed_key text;
update public.payroll_items set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.payroll_items alter column seed_key set default gen_random_uuid()::text;
alter table public.payroll_items alter column seed_key set not null;

alter table public.pay_periods add column if not exists seed_key text;
update public.pay_periods set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.pay_periods alter column seed_key set default gen_random_uuid()::text;
alter table public.pay_periods alter column seed_key set not null;

alter table public.holidays add column if not exists seed_key text;
update public.holidays set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.holidays alter column seed_key set default gen_random_uuid()::text;
alter table public.holidays alter column seed_key set not null;

alter table public.time_entries add column if not exists seed_key text;
update public.time_entries set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.time_entries alter column seed_key set default gen_random_uuid()::text;
alter table public.time_entries alter column seed_key set not null;
alter table public.time_entries add column if not exists pay_period_id uuid references public.pay_periods (id) on delete set null;
alter table public.time_entries add column if not exists notes text;

alter table public.leave_requests add column if not exists seed_key text;
update public.leave_requests set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.leave_requests alter column seed_key set default gen_random_uuid()::text;
alter table public.leave_requests alter column seed_key set not null;
alter table public.leave_requests add column if not exists employee_id uuid references public.employees (id) on delete set null;
alter table public.leave_requests add column if not exists notes text;
update public.leave_requests
set employee_id = employees.id
from public.employees as employees
where public.leave_requests.employee_id is null
  and public.leave_requests.organization_id = employees.organization_id
  and public.leave_requests.employee_name = employees.full_name;

alter table public.expenses add column if not exists seed_key text;
update public.expenses set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.expenses alter column seed_key set default gen_random_uuid()::text;
alter table public.expenses alter column seed_key set not null;
alter table public.expenses add column if not exists employee_id uuid references public.employees (id) on delete set null;
alter table public.expenses add column if not exists notes text;
alter table public.expenses add column if not exists receipt_file_name text;
alter table public.expenses add column if not exists receipt_storage_path text;
alter table public.expenses add column if not exists receipt_mime_type text;
alter table public.expenses add column if not exists reimbursed_at timestamptz;
update public.expenses
set employee_id = employees.id
from public.employees as employees
where public.expenses.employee_id is null
  and public.expenses.organization_id = employees.organization_id
  and public.expenses.employee_name = employees.full_name;

alter table public.compliance_rules add column if not exists seed_key text;
update public.compliance_rules set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.compliance_rules alter column seed_key set default gen_random_uuid()::text;
alter table public.compliance_rules alter column seed_key set not null;
alter table public.compliance_rules add column if not exists notes text;

alter table public.compliance_alerts add column if not exists seed_key text;
update public.compliance_alerts set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.compliance_alerts alter column seed_key set default gen_random_uuid()::text;
alter table public.compliance_alerts alter column seed_key set not null;

alter table public.tax_filings add column if not exists seed_key text;
update public.tax_filings set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.tax_filings alter column seed_key set default gen_random_uuid()::text;
alter table public.tax_filings alter column seed_key set not null;
alter table public.tax_filings add column if not exists filed_at timestamptz;
alter table public.tax_filings add column if not exists notes text;

alter table public.workers_comp_policies add column if not exists seed_key text;
update public.workers_comp_policies set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.workers_comp_policies alter column seed_key set default gen_random_uuid()::text;
alter table public.workers_comp_policies alter column seed_key set not null;
alter table public.workers_comp_policies add column if not exists states_covered jsonb;
update public.workers_comp_policies set states_covered = '[]'::jsonb where states_covered is null;
alter table public.workers_comp_policies alter column states_covered set default '[]'::jsonb;
alter table public.workers_comp_policies alter column states_covered set not null;
alter table public.workers_comp_policies add column if not exists premium_amount numeric(12, 2);
update public.workers_comp_policies set premium_amount = 0 where premium_amount is null;
alter table public.workers_comp_policies alter column premium_amount set default 0;
alter table public.workers_comp_policies alter column premium_amount set not null;
alter table public.workers_comp_policies add column if not exists contact_name text;
alter table public.workers_comp_policies add column if not exists contact_email text;
alter table public.workers_comp_policies add column if not exists notes text;

alter table public.workers_comp_claims add column if not exists seed_key text;
update public.workers_comp_claims set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.workers_comp_claims alter column seed_key set default gen_random_uuid()::text;
alter table public.workers_comp_claims alter column seed_key set not null;
alter table public.workers_comp_claims add column if not exists employee_id uuid references public.employees (id) on delete set null;
alter table public.workers_comp_claims add column if not exists policy_id uuid references public.workers_comp_policies (id) on delete set null;
alter table public.workers_comp_claims add column if not exists claim_number text;
alter table public.workers_comp_claims add column if not exists claim_type text;
alter table public.workers_comp_claims add column if not exists description text;
alter table public.workers_comp_claims add column if not exists amount_reserved numeric(12, 2);
update public.workers_comp_claims set amount_reserved = 0 where amount_reserved is null;
alter table public.workers_comp_claims alter column amount_reserved set default 0;
alter table public.workers_comp_claims alter column amount_reserved set not null;
alter table public.workers_comp_claims add column if not exists amount_paid numeric(12, 2);
update public.workers_comp_claims set amount_paid = 0 where amount_paid is null;
alter table public.workers_comp_claims alter column amount_paid set default 0;
alter table public.workers_comp_claims alter column amount_paid set not null;
alter table public.workers_comp_claims add column if not exists case_manager_name text;
alter table public.workers_comp_claims add column if not exists case_manager_email text;
update public.workers_comp_claims
set employee_id = employees.id
from public.employees as employees
where public.workers_comp_claims.employee_id is null
  and public.workers_comp_claims.organization_id = employees.organization_id
  and public.workers_comp_claims.employee_name = employees.full_name;

alter table public.integrations add column if not exists seed_key text;
update public.integrations set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.integrations alter column seed_key set default gen_random_uuid()::text;
alter table public.integrations alter column seed_key set not null;
alter table public.integrations add column if not exists scopes jsonb;
update public.integrations set scopes = '[]'::jsonb where scopes is null;
alter table public.integrations alter column scopes set default '[]'::jsonb;
alter table public.integrations alter column scopes set not null;
alter table public.integrations add column if not exists config jsonb;
update public.integrations set config = '{}'::jsonb where config is null;
alter table public.integrations alter column config set default '{}'::jsonb;
alter table public.integrations alter column config set not null;
alter table public.integrations add column if not exists display_name text;
update public.integrations set display_name = coalesce(display_name, provider, 'Integration');
alter table public.integrations alter column display_name set not null;
alter table public.integrations add column if not exists connection_mode text;
update public.integrations set connection_mode = 'OAuth' where connection_mode is null;
alter table public.integrations alter column connection_mode set default 'OAuth';
alter table public.integrations alter column connection_mode set not null;
alter table public.integrations add column if not exists external_account_id text;
alter table public.integrations add column if not exists webhook_secret_hint text;
alter table public.integrations add column if not exists last_synced_at timestamptz;

alter table public.integration_sync_runs add column if not exists seed_key text;
update public.integration_sync_runs set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.integration_sync_runs alter column seed_key set default gen_random_uuid()::text;
alter table public.integration_sync_runs alter column seed_key set not null;
alter table public.integration_sync_runs add column if not exists started_at timestamptz;
alter table public.integration_sync_runs add column if not exists completed_at timestamptz;
alter table public.integration_sync_runs add column if not exists records_processed integer;
update public.integration_sync_runs set records_processed = 0 where records_processed is null;
alter table public.integration_sync_runs alter column records_processed set default 0;
alter table public.integration_sync_runs alter column records_processed set not null;
alter table public.integration_sync_runs add column if not exists summary text;

alter table public.webhook_events add column if not exists seed_key text;
update public.webhook_events set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.webhook_events alter column seed_key set default gen_random_uuid()::text;
alter table public.webhook_events alter column seed_key set not null;
alter table public.webhook_events add column if not exists integration_id uuid references public.integrations (id) on delete set null;
alter table public.webhook_events add column if not exists external_event_id text;
alter table public.webhook_events add column if not exists payload jsonb;
update public.webhook_events set payload = '{}'::jsonb where payload is null;
alter table public.webhook_events alter column payload set default '{}'::jsonb;
alter table public.webhook_events alter column payload set not null;
alter table public.webhook_events add column if not exists processed_at timestamptz;
alter table public.webhook_events add column if not exists error_message text;

alter table public.approvals add column if not exists seed_key text;
update public.approvals set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.approvals alter column seed_key set default gen_random_uuid()::text;
alter table public.approvals alter column seed_key set not null;
alter table public.approvals add column if not exists decision_note text;
alter table public.approvals add column if not exists decided_at timestamptz;

alter table public.documents add column if not exists seed_key text;
update public.documents set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.documents alter column seed_key set default gen_random_uuid()::text;
alter table public.documents alter column seed_key set not null;

alter table public.bank_accounts add column if not exists seed_key text;
update public.bank_accounts set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.bank_accounts alter column seed_key set default gen_random_uuid()::text;
alter table public.bank_accounts alter column seed_key set not null;
alter table public.bank_accounts add column if not exists notes text;
alter table public.bank_accounts add column if not exists verified_at timestamptz;
alter table public.bank_accounts add column if not exists is_primary boolean;
update public.bank_accounts set is_primary = false where is_primary is null;
alter table public.bank_accounts alter column is_primary set default false;
alter table public.bank_accounts alter column is_primary set not null;

alter table public.benefits_plans add column if not exists seed_key text;
update public.benefits_plans set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.benefits_plans alter column seed_key set default gen_random_uuid()::text;
alter table public.benefits_plans alter column seed_key set not null;

alter table public.benefits_enrollments add column if not exists seed_key text;
update public.benefits_enrollments set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.benefits_enrollments alter column seed_key set default gen_random_uuid()::text;
alter table public.benefits_enrollments alter column seed_key set not null;
alter table public.benefits_enrollments add column if not exists employee_id uuid references public.employees (id) on delete set null;
alter table public.benefits_enrollments add column if not exists end_date date;
alter table public.benefits_enrollments add column if not exists payroll_deduction numeric(12, 2);
update public.benefits_enrollments set payroll_deduction = 0 where payroll_deduction is null;
alter table public.benefits_enrollments alter column payroll_deduction set default 0;
alter table public.benefits_enrollments alter column payroll_deduction set not null;
alter table public.benefits_enrollments add column if not exists notes text;
update public.benefits_enrollments
set employee_id = employees.id
from public.employees as employees
where public.benefits_enrollments.employee_id is null
  and public.benefits_enrollments.organization_id = employees.organization_id
  and public.benefits_enrollments.employee_name = employees.full_name;

alter table public.performance_review_templates add column if not exists seed_key text;
update public.performance_review_templates set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.performance_review_templates alter column seed_key set default gen_random_uuid()::text;
alter table public.performance_review_templates alter column seed_key set not null;
alter table public.performance_review_templates add column if not exists questions jsonb;
update public.performance_review_templates set questions = '[]'::jsonb where questions is null;
alter table public.performance_review_templates alter column questions set default '[]'::jsonb;
alter table public.performance_review_templates alter column questions set not null;

alter table public.performance_reviews add column if not exists seed_key text;
update public.performance_reviews set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.performance_reviews alter column seed_key set default gen_random_uuid()::text;
alter table public.performance_reviews alter column seed_key set not null;
alter table public.performance_reviews add column if not exists employee_id uuid references public.employees (id) on delete set null;
alter table public.performance_reviews add column if not exists submitted_at timestamptz;
alter table public.performance_reviews add column if not exists score numeric(4, 2);
alter table public.performance_reviews add column if not exists summary text;
alter table public.performance_reviews add column if not exists notes text;
update public.performance_reviews
set employee_id = employees.id
from public.employees as employees
where public.performance_reviews.employee_id is null
  and public.performance_reviews.organization_id = employees.organization_id
  and public.performance_reviews.employee_name = employees.full_name;

alter table public.onboarding_workflows add column if not exists seed_key text;
update public.onboarding_workflows set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.onboarding_workflows alter column seed_key set default gen_random_uuid()::text;
alter table public.onboarding_workflows alter column seed_key set not null;
alter table public.onboarding_workflows add column if not exists employee_id uuid references public.employees (id) on delete set null;
alter table public.onboarding_workflows add column if not exists notes text;
update public.onboarding_workflows
set employee_id = employees.id
from public.employees as employees
where public.onboarding_workflows.employee_id is null
  and public.onboarding_workflows.organization_id = employees.organization_id
  and public.onboarding_workflows.employee_name = employees.full_name;

alter table public.onboarding_tasks add column if not exists seed_key text;
update public.onboarding_tasks set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.onboarding_tasks alter column seed_key set default gen_random_uuid()::text;
alter table public.onboarding_tasks alter column seed_key set not null;
alter table public.onboarding_tasks add column if not exists completed_at timestamptz;
alter table public.onboarding_tasks add column if not exists notes text;

alter table public.announcements add column if not exists seed_key text;
update public.announcements set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.announcements alter column seed_key set default gen_random_uuid()::text;
alter table public.announcements alter column seed_key set not null;

alter table public.company_entities add column if not exists seed_key text;
update public.company_entities set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.company_entities alter column seed_key set default gen_random_uuid()::text;
alter table public.company_entities alter column seed_key set not null;
alter table public.company_entities add column if not exists legal_name text;
update public.company_entities set legal_name = coalesce(legal_name, name, 'Entity') where legal_name is null;
alter table public.company_entities alter column legal_name set not null;
alter table public.company_entities add column if not exists entity_type text;
update public.company_entities set entity_type = 'LLC' where entity_type is null;
alter table public.company_entities alter column entity_type set default 'LLC';
alter table public.company_entities alter column entity_type set not null;
alter table public.company_entities add column if not exists tax_id text;
alter table public.company_entities add column if not exists registration_state text;
update public.company_entities set registration_state = 'Unknown' where registration_state is null;
alter table public.company_entities alter column registration_state set not null;
alter table public.company_entities add column if not exists headquarters text;
update public.company_entities set headquarters = 'Unknown' where headquarters is null;
alter table public.company_entities alter column headquarters set not null;
alter table public.company_entities add column if not exists payroll_frequency text;
update public.company_entities set payroll_frequency = 'Biweekly' where payroll_frequency is null;
alter table public.company_entities alter column payroll_frequency set default 'Biweekly';
alter table public.company_entities alter column payroll_frequency set not null;
alter table public.company_entities add column if not exists employee_count integer;
update public.company_entities set employee_count = 0 where employee_count is null;
alter table public.company_entities alter column employee_count set default 0;
alter table public.company_entities alter column employee_count set not null;
alter table public.company_entities add column if not exists status text;
update public.company_entities set status = 'Active' where status is null;
alter table public.company_entities alter column status set default 'Active';
alter table public.company_entities alter column status set not null;
alter table public.company_entities add column if not exists primary_contact_name text;
alter table public.company_entities add column if not exists primary_contact_email text;

alter table public.backup_jobs add column if not exists seed_key text;
update public.backup_jobs set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.backup_jobs alter column seed_key set default gen_random_uuid()::text;
alter table public.backup_jobs alter column seed_key set not null;
alter table public.backup_jobs add column if not exists backup_type text;
update public.backup_jobs set backup_type = 'Full' where backup_type is null;
alter table public.backup_jobs alter column backup_type set default 'Full';
alter table public.backup_jobs alter column backup_type set not null;
alter table public.backup_jobs add column if not exists started_at timestamptz;
alter table public.backup_jobs add column if not exists completed_at timestamptz;
alter table public.backup_jobs add column if not exists retention_until timestamptz;
alter table public.backup_jobs add column if not exists storage_path text;
update public.backup_jobs set storage_path = 'backups/unknown' where storage_path is null;
alter table public.backup_jobs alter column storage_path set not null;
alter table public.backup_jobs add column if not exists snapshot_size_mb numeric(12, 2);
update public.backup_jobs set snapshot_size_mb = 0 where snapshot_size_mb is null;
alter table public.backup_jobs alter column snapshot_size_mb set default 0;
alter table public.backup_jobs alter column snapshot_size_mb set not null;
alter table public.backup_jobs add column if not exists triggered_by_name text;
update public.backup_jobs set triggered_by_name = 'System' where triggered_by_name is null;
alter table public.backup_jobs alter column triggered_by_name set not null;
alter table public.backup_jobs add column if not exists summary text;

alter table public.recovery_events add column if not exists seed_key text;
update public.recovery_events set seed_key = gen_random_uuid()::text where seed_key is null;
alter table public.recovery_events alter column seed_key set default gen_random_uuid()::text;
alter table public.recovery_events alter column seed_key set not null;
alter table public.recovery_events add column if not exists backup_job_id uuid references public.backup_jobs (id) on delete set null;
alter table public.recovery_events add column if not exists recovery_type text;
update public.recovery_events set recovery_type = 'Point-in-time' where recovery_type is null;
alter table public.recovery_events alter column recovery_type set default 'Point-in-time';
alter table public.recovery_events alter column recovery_type set not null;
alter table public.recovery_events add column if not exists started_at timestamptz;
alter table public.recovery_events add column if not exists completed_at timestamptz;
alter table public.recovery_events add column if not exists target_scope text;
update public.recovery_events set target_scope = 'Organization' where target_scope is null;
alter table public.recovery_events alter column target_scope set not null;
alter table public.recovery_events add column if not exists requested_by_name text;
update public.recovery_events set requested_by_name = 'System' where requested_by_name is null;
alter table public.recovery_events alter column requested_by_name set not null;
alter table public.recovery_events add column if not exists approved_by_name text;
alter table public.recovery_events add column if not exists summary text;

create index if not exists departments_organization_id_idx on public.departments (organization_id);
create index if not exists company_entities_organization_id_idx on public.company_entities (organization_id);
create index if not exists backup_jobs_organization_id_idx on public.backup_jobs (organization_id);
create index if not exists recovery_events_organization_id_idx on public.recovery_events (organization_id);
create index if not exists recovery_events_backup_job_id_idx on public.recovery_events (backup_job_id);
create index if not exists access_roles_organization_id_idx on public.access_roles (organization_id);
create index if not exists role_assignments_organization_id_idx on public.role_assignments (organization_id);
create index if not exists role_assignments_role_id_idx on public.role_assignments (role_id);
create index if not exists role_assignments_profile_id_idx on public.role_assignments (profile_id);
create index if not exists employees_organization_id_idx on public.employees (organization_id);
create index if not exists contractors_organization_id_idx on public.contractors (organization_id);
create index if not exists payroll_runs_organization_id_idx on public.payroll_runs (organization_id);
create index if not exists payroll_items_organization_id_idx on public.payroll_items (organization_id);
create index if not exists payroll_items_payroll_run_id_idx on public.payroll_items (payroll_run_id);
create index if not exists pay_periods_organization_id_idx on public.pay_periods (organization_id);
create index if not exists holidays_organization_id_idx on public.holidays (organization_id);
create index if not exists time_entries_organization_id_idx on public.time_entries (organization_id);
create index if not exists time_entries_employee_id_idx on public.time_entries (employee_id);
create index if not exists leave_requests_organization_id_idx on public.leave_requests (organization_id);
create index if not exists expenses_organization_id_idx on public.expenses (organization_id);
create index if not exists expenses_employee_id_idx on public.expenses (employee_id);
create index if not exists compliance_rules_organization_id_idx on public.compliance_rules (organization_id);
create index if not exists compliance_alerts_organization_id_idx on public.compliance_alerts (organization_id);
create index if not exists compliance_alerts_rule_id_idx on public.compliance_alerts (rule_id);
create index if not exists tax_filings_organization_id_idx on public.tax_filings (organization_id);
create index if not exists workers_comp_policies_organization_id_idx on public.workers_comp_policies (organization_id);
create index if not exists workers_comp_claims_organization_id_idx on public.workers_comp_claims (organization_id);
create index if not exists workers_comp_claims_employee_id_idx on public.workers_comp_claims (employee_id);
create index if not exists workers_comp_claims_policy_id_idx on public.workers_comp_claims (policy_id);
create index if not exists integrations_organization_id_idx on public.integrations (organization_id);
create index if not exists integration_sync_runs_organization_id_idx on public.integration_sync_runs (organization_id);
create index if not exists integration_sync_runs_integration_id_idx on public.integration_sync_runs (integration_id);
create index if not exists webhook_events_organization_id_idx on public.webhook_events (organization_id);
create index if not exists webhook_events_integration_id_idx on public.webhook_events (integration_id);
create index if not exists approvals_organization_id_idx on public.approvals (organization_id);
create index if not exists approvals_entity_idx on public.approvals (entity_type, entity_id);
create index if not exists documents_organization_id_idx on public.documents (organization_id);
create index if not exists documents_entity_idx on public.documents (entity_type, entity_id);
create index if not exists bank_accounts_organization_id_idx on public.bank_accounts (organization_id);
create index if not exists bank_accounts_employee_id_idx on public.bank_accounts (employee_id);
create index if not exists benefits_plans_organization_id_idx on public.benefits_plans (organization_id);
create index if not exists benefits_enrollments_organization_id_idx on public.benefits_enrollments (organization_id);
create index if not exists benefits_enrollments_employee_id_idx on public.benefits_enrollments (employee_id);
create index if not exists benefits_enrollments_plan_id_idx on public.benefits_enrollments (plan_id);
create index if not exists performance_review_templates_organization_id_idx on public.performance_review_templates (organization_id);
create index if not exists performance_reviews_organization_id_idx on public.performance_reviews (organization_id);
create index if not exists performance_reviews_employee_id_idx on public.performance_reviews (employee_id);
create index if not exists performance_reviews_template_id_idx on public.performance_reviews (template_id);
create index if not exists onboarding_workflows_organization_id_idx on public.onboarding_workflows (organization_id);
create index if not exists onboarding_workflows_employee_id_idx on public.onboarding_workflows (employee_id);
create index if not exists onboarding_tasks_organization_id_idx on public.onboarding_tasks (organization_id);
create index if not exists onboarding_tasks_workflow_id_idx on public.onboarding_tasks (workflow_id);
create index if not exists announcements_organization_id_idx on public.announcements (organization_id);
create index if not exists profiles_organization_id_idx on public.profiles (organization_id);

create unique index if not exists departments_organization_seed_key_idx
  on public.departments (organization_id, seed_key);
create unique index if not exists departments_organization_name_idx
  on public.departments (organization_id, name);
create unique index if not exists company_entities_organization_seed_key_idx
  on public.company_entities (organization_id, seed_key);
create unique index if not exists company_entities_organization_name_idx
  on public.company_entities (organization_id, name);
create unique index if not exists backup_jobs_organization_seed_key_idx
  on public.backup_jobs (organization_id, seed_key);
create unique index if not exists recovery_events_organization_seed_key_idx
  on public.recovery_events (organization_id, seed_key);
create unique index if not exists access_roles_organization_seed_key_idx
  on public.access_roles (organization_id, seed_key);
create unique index if not exists access_roles_organization_name_idx
  on public.access_roles (organization_id, name);
create unique index if not exists role_assignments_organization_seed_key_idx
  on public.role_assignments (organization_id, seed_key);
create unique index if not exists role_assignments_role_profile_idx
  on public.role_assignments (role_id, profile_id);
create unique index if not exists employees_organization_seed_key_idx
  on public.employees (organization_id, seed_key);
create unique index if not exists employees_organization_email_idx
  on public.employees (organization_id, email);
create unique index if not exists contractors_organization_seed_key_idx
  on public.contractors (organization_id, seed_key);
create unique index if not exists contractors_organization_email_idx
  on public.contractors (organization_id, email);
create unique index if not exists payroll_runs_organization_seed_key_idx
  on public.payroll_runs (organization_id, seed_key);
create unique index if not exists payroll_items_organization_seed_key_idx
  on public.payroll_items (organization_id, seed_key);
create unique index if not exists payroll_items_run_employee_idx
  on public.payroll_items (payroll_run_id, employee_id);
create unique index if not exists pay_periods_organization_seed_key_idx
  on public.pay_periods (organization_id, seed_key);
create unique index if not exists holidays_organization_seed_key_idx
  on public.holidays (organization_id, seed_key);
create unique index if not exists time_entries_organization_seed_key_idx
  on public.time_entries (organization_id, seed_key);
create unique index if not exists leave_requests_organization_seed_key_idx
  on public.leave_requests (organization_id, seed_key);
create unique index if not exists expenses_organization_seed_key_idx
  on public.expenses (organization_id, seed_key);
create unique index if not exists compliance_rules_organization_seed_key_idx
  on public.compliance_rules (organization_id, seed_key);
create unique index if not exists compliance_alerts_organization_seed_key_idx
  on public.compliance_alerts (organization_id, seed_key);
create unique index if not exists tax_filings_organization_seed_key_idx
  on public.tax_filings (organization_id, seed_key);
create unique index if not exists workers_comp_policies_organization_seed_key_idx
  on public.workers_comp_policies (organization_id, seed_key);
create unique index if not exists workers_comp_policies_organization_policy_number_idx
  on public.workers_comp_policies (organization_id, policy_number);
create unique index if not exists workers_comp_claims_organization_seed_key_idx
  on public.workers_comp_claims (organization_id, seed_key);
create unique index if not exists integrations_organization_seed_key_idx
  on public.integrations (organization_id, seed_key);
create unique index if not exists integration_sync_runs_organization_seed_key_idx
  on public.integration_sync_runs (organization_id, seed_key);
create unique index if not exists webhook_events_organization_seed_key_idx
  on public.webhook_events (organization_id, seed_key);
create unique index if not exists approvals_organization_seed_key_idx
  on public.approvals (organization_id, seed_key);
create unique index if not exists documents_organization_seed_key_idx
  on public.documents (organization_id, seed_key);
create unique index if not exists bank_accounts_organization_seed_key_idx
  on public.bank_accounts (organization_id, seed_key);
create unique index if not exists bank_accounts_primary_employee_idx
  on public.bank_accounts (employee_id)
  where is_primary;
create unique index if not exists benefits_plans_organization_seed_key_idx
  on public.benefits_plans (organization_id, seed_key);
create unique index if not exists benefits_enrollments_organization_seed_key_idx
  on public.benefits_enrollments (organization_id, seed_key);
create unique index if not exists performance_review_templates_organization_seed_key_idx
  on public.performance_review_templates (organization_id, seed_key);
create unique index if not exists performance_reviews_organization_seed_key_idx
  on public.performance_reviews (organization_id, seed_key);
create unique index if not exists onboarding_workflows_organization_seed_key_idx
  on public.onboarding_workflows (organization_id, seed_key);
create unique index if not exists onboarding_tasks_organization_seed_key_idx
  on public.onboarding_tasks (organization_id, seed_key);
create unique index if not exists announcements_organization_seed_key_idx
  on public.announcements (organization_id, seed_key);

create or replace function public.current_user_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.profiles
  where id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.company_entities enable row level security;
alter table public.backup_jobs enable row level security;
alter table public.recovery_events enable row level security;
alter table public.departments enable row level security;
alter table public.access_roles enable row level security;
alter table public.role_assignments enable row level security;
alter table public.employees enable row level security;
alter table public.contractors enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_items enable row level security;
alter table public.pay_periods enable row level security;
alter table public.holidays enable row level security;
alter table public.time_entries enable row level security;
alter table public.leave_requests enable row level security;
alter table public.expenses enable row level security;
alter table public.compliance_rules enable row level security;
alter table public.compliance_alerts enable row level security;
alter table public.tax_filings enable row level security;
alter table public.workers_comp_policies enable row level security;
alter table public.workers_comp_claims enable row level security;
alter table public.integrations enable row level security;
alter table public.integration_sync_runs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.approvals enable row level security;
alter table public.documents enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.benefits_plans enable row level security;
alter table public.benefits_enrollments enable row level security;
alter table public.performance_review_templates enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.onboarding_workflows enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.announcements enable row level security;
alter table public.organizations enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users can read own organization" on public.organizations;
create policy "users can read own organization"
on public.organizations
for select
to authenticated
using (id = public.current_user_organization_id());

drop policy if exists "users can update own organization" on public.organizations;
create policy "users can update own organization"
on public.organizations
for update
to authenticated
using (id = public.current_user_organization_id())
with check (id = public.current_user_organization_id());

drop policy if exists "users can read company entities in their organization" on public.company_entities;
create policy "users can read company entities in their organization"
on public.company_entities
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert company entities in their organization" on public.company_entities;
create policy "users can insert company entities in their organization"
on public.company_entities
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update company entities in their organization" on public.company_entities;
create policy "users can update company entities in their organization"
on public.company_entities
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete company entities in their organization" on public.company_entities;
create policy "users can delete company entities in their organization"
on public.company_entities
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read backup jobs in their organization" on public.backup_jobs;
create policy "users can read backup jobs in their organization"
on public.backup_jobs
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert backup jobs in their organization" on public.backup_jobs;
create policy "users can insert backup jobs in their organization"
on public.backup_jobs
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update backup jobs in their organization" on public.backup_jobs;
create policy "users can update backup jobs in their organization"
on public.backup_jobs
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete backup jobs in their organization" on public.backup_jobs;
create policy "users can delete backup jobs in their organization"
on public.backup_jobs
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read recovery events in their organization" on public.recovery_events;
create policy "users can read recovery events in their organization"
on public.recovery_events
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert recovery events in their organization" on public.recovery_events;
create policy "users can insert recovery events in their organization"
on public.recovery_events
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update recovery events in their organization" on public.recovery_events;
create policy "users can update recovery events in their organization"
on public.recovery_events
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete recovery events in their organization" on public.recovery_events;
create policy "users can delete recovery events in their organization"
on public.recovery_events
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read roles in their organization" on public.access_roles;
create policy "users can read roles in their organization"
on public.access_roles
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert roles in their organization" on public.access_roles;
create policy "users can insert roles in their organization"
on public.access_roles
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update roles in their organization" on public.access_roles;
create policy "users can update roles in their organization"
on public.access_roles
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete roles in their organization" on public.access_roles;
create policy "users can delete roles in their organization"
on public.access_roles
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read role assignments in their organization" on public.role_assignments;
create policy "users can read role assignments in their organization"
on public.role_assignments
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert role assignments in their organization" on public.role_assignments;
create policy "users can insert role assignments in their organization"
on public.role_assignments
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update role assignments in their organization" on public.role_assignments;
create policy "users can update role assignments in their organization"
on public.role_assignments
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete role assignments in their organization" on public.role_assignments;
create policy "users can delete role assignments in their organization"
on public.role_assignments
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read employees in their organization" on public.employees;
create policy "users can read employees in their organization"
on public.employees
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert employees in their organization" on public.employees;
create policy "users can insert employees in their organization"
on public.employees
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update employees in their organization" on public.employees;
create policy "users can update employees in their organization"
on public.employees
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete employees in their organization" on public.employees;
create policy "users can delete employees in their organization"
on public.employees
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read contractors in their organization" on public.contractors;
create policy "users can read contractors in their organization"
on public.contractors
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert contractors in their organization" on public.contractors;
create policy "users can insert contractors in their organization"
on public.contractors
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update contractors in their organization" on public.contractors;
create policy "users can update contractors in their organization"
on public.contractors
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete contractors in their organization" on public.contractors;
create policy "users can delete contractors in their organization"
on public.contractors
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read departments in their organization" on public.departments;
create policy "users can read departments in their organization"
on public.departments
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert departments in their organization" on public.departments;
create policy "users can insert departments in their organization"
on public.departments
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update departments in their organization" on public.departments;
create policy "users can update departments in their organization"
on public.departments
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete departments in their organization" on public.departments;
create policy "users can delete departments in their organization"
on public.departments
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read payroll runs in their organization" on public.payroll_runs;
create policy "users can read payroll runs in their organization"
on public.payroll_runs
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert payroll runs in their organization" on public.payroll_runs;
create policy "users can insert payroll runs in their organization"
on public.payroll_runs
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update payroll runs in their organization" on public.payroll_runs;
create policy "users can update payroll runs in their organization"
on public.payroll_runs
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete payroll runs in their organization" on public.payroll_runs;
create policy "users can delete payroll runs in their organization"
on public.payroll_runs
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read payroll items in their organization" on public.payroll_items;
create policy "users can read payroll items in their organization"
on public.payroll_items
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert payroll items in their organization" on public.payroll_items;
create policy "users can insert payroll items in their organization"
on public.payroll_items
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update payroll items in their organization" on public.payroll_items;
create policy "users can update payroll items in their organization"
on public.payroll_items
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete payroll items in their organization" on public.payroll_items;
create policy "users can delete payroll items in their organization"
on public.payroll_items
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read pay periods in their organization" on public.pay_periods;
create policy "users can read pay periods in their organization"
on public.pay_periods
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert pay periods in their organization" on public.pay_periods;
create policy "users can insert pay periods in their organization"
on public.pay_periods
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update pay periods in their organization" on public.pay_periods;
create policy "users can update pay periods in their organization"
on public.pay_periods
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete pay periods in their organization" on public.pay_periods;
create policy "users can delete pay periods in their organization"
on public.pay_periods
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read holidays in their organization" on public.holidays;
create policy "users can read holidays in their organization"
on public.holidays
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert holidays in their organization" on public.holidays;
create policy "users can insert holidays in their organization"
on public.holidays
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update holidays in their organization" on public.holidays;
create policy "users can update holidays in their organization"
on public.holidays
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete holidays in their organization" on public.holidays;
create policy "users can delete holidays in their organization"
on public.holidays
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read time entries in their organization" on public.time_entries;
create policy "users can read time entries in their organization"
on public.time_entries
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert time entries in their organization" on public.time_entries;
create policy "users can insert time entries in their organization"
on public.time_entries
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update time entries in their organization" on public.time_entries;
create policy "users can update time entries in their organization"
on public.time_entries
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete time entries in their organization" on public.time_entries;
create policy "users can delete time entries in their organization"
on public.time_entries
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read leave requests in their organization" on public.leave_requests;
create policy "users can read leave requests in their organization"
on public.leave_requests
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert leave requests in their organization" on public.leave_requests;
create policy "users can insert leave requests in their organization"
on public.leave_requests
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update leave requests in their organization" on public.leave_requests;
create policy "users can update leave requests in their organization"
on public.leave_requests
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete leave requests in their organization" on public.leave_requests;
create policy "users can delete leave requests in their organization"
on public.leave_requests
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read expenses in their organization" on public.expenses;
create policy "users can read expenses in their organization"
on public.expenses
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert expenses in their organization" on public.expenses;
create policy "users can insert expenses in their organization"
on public.expenses
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update expenses in their organization" on public.expenses;
create policy "users can update expenses in their organization"
on public.expenses
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete expenses in their organization" on public.expenses;
create policy "users can delete expenses in their organization"
on public.expenses
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read compliance rules in their organization" on public.compliance_rules;
create policy "users can read compliance rules in their organization"
on public.compliance_rules
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert compliance rules in their organization" on public.compliance_rules;
create policy "users can insert compliance rules in their organization"
on public.compliance_rules
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update compliance rules in their organization" on public.compliance_rules;
create policy "users can update compliance rules in their organization"
on public.compliance_rules
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete compliance rules in their organization" on public.compliance_rules;
create policy "users can delete compliance rules in their organization"
on public.compliance_rules
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read compliance alerts in their organization" on public.compliance_alerts;
create policy "users can read compliance alerts in their organization"
on public.compliance_alerts
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert compliance alerts in their organization" on public.compliance_alerts;
create policy "users can insert compliance alerts in their organization"
on public.compliance_alerts
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update compliance alerts in their organization" on public.compliance_alerts;
create policy "users can update compliance alerts in their organization"
on public.compliance_alerts
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete compliance alerts in their organization" on public.compliance_alerts;
create policy "users can delete compliance alerts in their organization"
on public.compliance_alerts
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read tax filings in their organization" on public.tax_filings;
create policy "users can read tax filings in their organization"
on public.tax_filings
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert tax filings in their organization" on public.tax_filings;
create policy "users can insert tax filings in their organization"
on public.tax_filings
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update tax filings in their organization" on public.tax_filings;
create policy "users can update tax filings in their organization"
on public.tax_filings
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete tax filings in their organization" on public.tax_filings;
create policy "users can delete tax filings in their organization"
on public.tax_filings
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read workers comp policies in their organization" on public.workers_comp_policies;
create policy "users can read workers comp policies in their organization"
on public.workers_comp_policies
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert workers comp policies in their organization" on public.workers_comp_policies;
create policy "users can insert workers comp policies in their organization"
on public.workers_comp_policies
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update workers comp policies in their organization" on public.workers_comp_policies;
create policy "users can update workers comp policies in their organization"
on public.workers_comp_policies
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete workers comp policies in their organization" on public.workers_comp_policies;
create policy "users can delete workers comp policies in their organization"
on public.workers_comp_policies
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read workers comp claims in their organization" on public.workers_comp_claims;
create policy "users can read workers comp claims in their organization"
on public.workers_comp_claims
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert workers comp claims in their organization" on public.workers_comp_claims;
create policy "users can insert workers comp claims in their organization"
on public.workers_comp_claims
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update workers comp claims in their organization" on public.workers_comp_claims;
create policy "users can update workers comp claims in their organization"
on public.workers_comp_claims
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete workers comp claims in their organization" on public.workers_comp_claims;
create policy "users can delete workers comp claims in their organization"
on public.workers_comp_claims
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read integrations in their organization" on public.integrations;
create policy "users can read integrations in their organization"
on public.integrations
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert integrations in their organization" on public.integrations;
create policy "users can insert integrations in their organization"
on public.integrations
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update integrations in their organization" on public.integrations;
create policy "users can update integrations in their organization"
on public.integrations
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete integrations in their organization" on public.integrations;
create policy "users can delete integrations in their organization"
on public.integrations
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read integration sync runs in their organization" on public.integration_sync_runs;
create policy "users can read integration sync runs in their organization"
on public.integration_sync_runs
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert integration sync runs in their organization" on public.integration_sync_runs;
create policy "users can insert integration sync runs in their organization"
on public.integration_sync_runs
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update integration sync runs in their organization" on public.integration_sync_runs;
create policy "users can update integration sync runs in their organization"
on public.integration_sync_runs
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete integration sync runs in their organization" on public.integration_sync_runs;
create policy "users can delete integration sync runs in their organization"
on public.integration_sync_runs
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read webhook events in their organization" on public.webhook_events;
create policy "users can read webhook events in their organization"
on public.webhook_events
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert webhook events in their organization" on public.webhook_events;
create policy "users can insert webhook events in their organization"
on public.webhook_events
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update webhook events in their organization" on public.webhook_events;
create policy "users can update webhook events in their organization"
on public.webhook_events
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete webhook events in their organization" on public.webhook_events;
create policy "users can delete webhook events in their organization"
on public.webhook_events
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read approvals in their organization" on public.approvals;
create policy "users can read approvals in their organization"
on public.approvals
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert approvals in their organization" on public.approvals;
create policy "users can insert approvals in their organization"
on public.approvals
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update approvals in their organization" on public.approvals;
create policy "users can update approvals in their organization"
on public.approvals
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete approvals in their organization" on public.approvals;
create policy "users can delete approvals in their organization"
on public.approvals
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read documents in their organization" on public.documents;
create policy "users can read documents in their organization"
on public.documents
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert documents in their organization" on public.documents;
create policy "users can insert documents in their organization"
on public.documents
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update documents in their organization" on public.documents;
create policy "users can update documents in their organization"
on public.documents
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete documents in their organization" on public.documents;
create policy "users can delete documents in their organization"
on public.documents
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read bank accounts in their organization" on public.bank_accounts;
create policy "users can read bank accounts in their organization"
on public.bank_accounts
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert bank accounts in their organization" on public.bank_accounts;
create policy "users can insert bank accounts in their organization"
on public.bank_accounts
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update bank accounts in their organization" on public.bank_accounts;
create policy "users can update bank accounts in their organization"
on public.bank_accounts
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete bank accounts in their organization" on public.bank_accounts;
create policy "users can delete bank accounts in their organization"
on public.bank_accounts
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read benefits plans in their organization" on public.benefits_plans;
create policy "users can read benefits plans in their organization"
on public.benefits_plans
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert benefits plans in their organization" on public.benefits_plans;
create policy "users can insert benefits plans in their organization"
on public.benefits_plans
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update benefits plans in their organization" on public.benefits_plans;
create policy "users can update benefits plans in their organization"
on public.benefits_plans
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete benefits plans in their organization" on public.benefits_plans;
create policy "users can delete benefits plans in their organization"
on public.benefits_plans
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read benefits enrollments in their organization" on public.benefits_enrollments;
create policy "users can read benefits enrollments in their organization"
on public.benefits_enrollments
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert benefits enrollments in their organization" on public.benefits_enrollments;
create policy "users can insert benefits enrollments in their organization"
on public.benefits_enrollments
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update benefits enrollments in their organization" on public.benefits_enrollments;
create policy "users can update benefits enrollments in their organization"
on public.benefits_enrollments
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete benefits enrollments in their organization" on public.benefits_enrollments;
create policy "users can delete benefits enrollments in their organization"
on public.benefits_enrollments
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read performance review templates in their organization" on public.performance_review_templates;
create policy "users can read performance review templates in their organization"
on public.performance_review_templates
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert performance review templates in their organization" on public.performance_review_templates;
create policy "users can insert performance review templates in their organization"
on public.performance_review_templates
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update performance review templates in their organization" on public.performance_review_templates;
create policy "users can update performance review templates in their organization"
on public.performance_review_templates
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete performance review templates in their organization" on public.performance_review_templates;
create policy "users can delete performance review templates in their organization"
on public.performance_review_templates
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read performance reviews in their organization" on public.performance_reviews;
create policy "users can read performance reviews in their organization"
on public.performance_reviews
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert performance reviews in their organization" on public.performance_reviews;
create policy "users can insert performance reviews in their organization"
on public.performance_reviews
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update performance reviews in their organization" on public.performance_reviews;
create policy "users can update performance reviews in their organization"
on public.performance_reviews
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete performance reviews in their organization" on public.performance_reviews;
create policy "users can delete performance reviews in their organization"
on public.performance_reviews
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read onboarding workflows in their organization" on public.onboarding_workflows;
create policy "users can read onboarding workflows in their organization"
on public.onboarding_workflows
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert onboarding workflows in their organization" on public.onboarding_workflows;
create policy "users can insert onboarding workflows in their organization"
on public.onboarding_workflows
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update onboarding workflows in their organization" on public.onboarding_workflows;
create policy "users can update onboarding workflows in their organization"
on public.onboarding_workflows
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete onboarding workflows in their organization" on public.onboarding_workflows;
create policy "users can delete onboarding workflows in their organization"
on public.onboarding_workflows
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read onboarding tasks in their organization" on public.onboarding_tasks;
create policy "users can read onboarding tasks in their organization"
on public.onboarding_tasks
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert onboarding tasks in their organization" on public.onboarding_tasks;
create policy "users can insert onboarding tasks in their organization"
on public.onboarding_tasks
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update onboarding tasks in their organization" on public.onboarding_tasks;
create policy "users can update onboarding tasks in their organization"
on public.onboarding_tasks
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete onboarding tasks in their organization" on public.onboarding_tasks;
create policy "users can delete onboarding tasks in their organization"
on public.onboarding_tasks
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can read announcements in their organization" on public.announcements;
create policy "users can read announcements in their organization"
on public.announcements
for select
to authenticated
using (organization_id = public.current_user_organization_id());

drop policy if exists "users can insert announcements in their organization" on public.announcements;
create policy "users can insert announcements in their organization"
on public.announcements
for insert
to authenticated
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can update announcements in their organization" on public.announcements;
create policy "users can update announcements in their organization"
on public.announcements
for update
to authenticated
using (organization_id = public.current_user_organization_id())
with check (organization_id = public.current_user_organization_id());

drop policy if exists "users can delete announcements in their organization" on public.announcements;
create policy "users can delete announcements in their organization"
on public.announcements
for delete
to authenticated
using (organization_id = public.current_user_organization_id());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_org_id uuid;
begin
  select id into default_org_id
  from public.organizations
  order by created_at asc
  limit 1;

  if default_org_id is null then
    insert into public.organizations (name, industry, headquarters)
    values ('Northstar People Ops', 'SaaS', 'Bengaluru')
    returning id into default_org_id;
  end if;

  insert into public.profiles (id, organization_id, full_name, email, role)
  values (
    new.id,
    default_org_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'admin@pulsehr.app'), '@', 1)),
    coalesce(new.email, 'admin@pulsehr.app'),
    'HR Admin'
  )
  on conflict (id) do update
  set
    organization_id = excluded.organization_id,
    full_name = excluded.full_name,
    email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
