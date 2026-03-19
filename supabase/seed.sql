insert into public.organizations (id, name, industry, headquarters)
values (
  '11111111-1111-1111-1111-111111111111',
  'Northstar People Ops',
  'SaaS',
  'Bengaluru'
)
on conflict (id) do update
set
  name = excluded.name,
  industry = excluded.industry,
  headquarters = excluded.headquarters;

insert into public.departments (
  organization_id,
  seed_key,
  name,
  code,
  lead_name
)
values
  ('11111111-1111-1111-1111-111111111111', 'department-people', 'People', 'PEOPLE', 'Anika Raman'),
  ('11111111-1111-1111-1111-111111111111', 'department-engineering', 'Engineering', 'ENG', 'Mina Carter'),
  ('11111111-1111-1111-1111-111111111111', 'department-finance', 'Finance', 'FIN', 'Priya Nair'),
  ('11111111-1111-1111-1111-111111111111', 'department-design', 'Design', 'DES', 'Daniel Moss')
on conflict (organization_id, seed_key) do update
set
  name = excluded.name,
  code = excluded.code,
  lead_name = excluded.lead_name;

insert into public.access_roles (
  organization_id,
  seed_key,
  name,
  description,
  status,
  permissions
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'access-role-hr-admin',
    'HR Admin',
    'Full workforce operations access.',
    'Active',
    '["employees:read", "employees:write", "payroll:read", "payroll:write", "compliance:read", "compliance:write", "reports:read"]'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'access-role-manager',
    'Manager',
    'Team-level people operations access.',
    'Active',
    '["employees:read", "pto:approve", "expenses:approve", "performance:write", "reports:read"]'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'access-role-employee',
    'Employee',
    'Self-service access for personal records.',
    'Active',
    '["self-service:read", "pto:write", "expenses:write", "documents:read"]'::jsonb
  )
on conflict (organization_id, seed_key) do update
set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  permissions = excluded.permissions;

insert into public.employees (
  organization_id,
  seed_key,
  department_id,
  full_name,
  email,
  role,
  status,
  location,
  salary,
  start_date,
  manager_name,
  next_review_at
)
values
  ('11111111-1111-1111-1111-111111111111', 'employee-anika-raman', (select id from public.departments where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'department-people'), 'Anika Raman', 'anika@pulsehr.app', 'VP, People Operations', 'Active', 'Bengaluru', 148000, '2022-05-09', 'Executive Team', '2026-04-12'),
  ('11111111-1111-1111-1111-111111111111', 'employee-jordan-blake', (select id from public.departments where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'department-engineering'), 'Jordan Blake', 'jordan@pulsehr.app', 'Senior Backend Engineer', 'Active', 'Remote', 132000, '2023-01-16', 'Mina Carter', '2026-05-03'),
  ('11111111-1111-1111-1111-111111111111', 'employee-priya-nair', (select id from public.departments where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'department-finance'), 'Priya Nair', 'priya@pulsehr.app', 'Payroll Specialist', 'Active', 'Mumbai', 96000, '2021-11-22', 'Anika Raman', '2026-04-28'),
  ('11111111-1111-1111-1111-111111111111', 'employee-marcus-lee', (select id from public.departments where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'department-design'), 'Marcus Lee', 'marcus@pulsehr.app', 'Product Designer', 'On Leave', 'Singapore', 104000, '2024-02-05', 'Daniel Moss', '2026-06-14'),
  ('11111111-1111-1111-1111-111111111111', 'employee-elena-torres', (select id from public.departments where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'department-people'), 'Elena Torres', 'elena@pulsehr.app', 'Talent Partner', 'Active', 'Barcelona', 92000, '2023-08-14', 'Anika Raman', '2026-04-19'),
  ('11111111-1111-1111-1111-111111111111', 'employee-noah-kim', (select id from public.departments where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'department-finance'), 'Noah Kim', 'noah@pulsehr.app', 'Finance Analyst', 'In Review', 'Seoul', 88000, '2025-01-06', 'Priya Nair', '2026-04-07')
on conflict (organization_id, seed_key) do update
set
  department_id = excluded.department_id,
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  status = excluded.status,
  location = excluded.location,
  salary = excluded.salary,
  start_date = excluded.start_date,
  manager_name = excluded.manager_name,
  next_review_at = excluded.next_review_at;

insert into public.contractors (
  organization_id,
  seed_key,
  full_name,
  email,
  specialization,
  status,
  location,
  payment_type,
  hourly_rate,
  flat_rate,
  tax_classification,
  contract_start_date,
  contract_end_date,
  manager_name
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'contractor-rhea-singh',
    'Rhea Singh',
    'rhea.singh@contractor.pulsehr.app',
    'Content Operations Consultant',
    'Active',
    'Delhi',
    'Monthly Retainer',
    0,
    6400,
    '1099',
    '2025-11-01',
    '2026-08-31',
    'Anika Raman'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'contractor-liam-chen',
    'Liam Chen',
    'liam.chen@contractor.pulsehr.app',
    'Frontend Accessibility Specialist',
    'Active',
    'Taipei',
    'Hourly',
    110,
    0,
    '1099',
    '2026-01-15',
    '2026-06-30',
    'Mina Carter'
  )
on conflict (organization_id, seed_key) do update
set
  full_name = excluded.full_name,
  email = excluded.email,
  specialization = excluded.specialization,
  status = excluded.status,
  location = excluded.location,
  payment_type = excluded.payment_type,
  hourly_rate = excluded.hourly_rate,
  flat_rate = excluded.flat_rate,
  tax_classification = excluded.tax_classification,
  contract_start_date = excluded.contract_start_date,
  contract_end_date = excluded.contract_end_date,
  manager_name = excluded.manager_name;

insert into public.payroll_runs (
  organization_id,
  seed_key,
  pay_period_id,
  period_label,
  pay_date,
  status,
  employee_count,
  total_amount,
  variance_note,
  notes,
  calculated_at,
  finalized_at
)
values
  ('11111111-1111-1111-1111-111111111111', 'payroll-run-2026-03', (select id from public.pay_periods where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'pay-period-2026-03b'), 'March 2026', '2026-03-29', 'Processing', 62, 412840, '+2.3% vs last month', 'Pre-close variance flagged for overtime review.', '2026-03-19T09:00:00Z', null),
  ('11111111-1111-1111-1111-111111111111', 'payroll-run-2026-02', (select id from public.pay_periods where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'pay-period-2026-03'), 'February 2026', '2026-02-27', 'Paid', 61, 403620, '+1 new starter', 'Closed and remitted.', '2026-02-26T10:30:00Z', '2026-02-27T14:00:00Z'),
  ('11111111-1111-1111-1111-111111111111', 'payroll-run-2026-01', (select id from public.pay_periods where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'pay-period-2026-03'), 'January 2026', '2026-01-30', 'Paid', 60, 397200, 'No payroll exceptions', 'Closed and remitted.', '2026-01-29T11:15:00Z', '2026-01-30T13:30:00Z')
on conflict (organization_id, seed_key) do update
set
  pay_period_id = excluded.pay_period_id,
  period_label = excluded.period_label,
  pay_date = excluded.pay_date,
  status = excluded.status,
  employee_count = excluded.employee_count,
  total_amount = excluded.total_amount,
  variance_note = excluded.variance_note,
  notes = excluded.notes,
  calculated_at = excluded.calculated_at,
  finalized_at = excluded.finalized_at;

insert into public.payroll_items (
  organization_id,
  seed_key,
  payroll_run_id,
  employee_id,
  gross_pay,
  tax_amount,
  deductions_amount,
  net_pay,
  status
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'payroll-item-anika-2026-03',
    (select id from public.payroll_runs where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'payroll-run-2026-03'),
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-anika-raman'),
    6167,
    1233,
    320,
    4614,
    'Calculated'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'payroll-item-jordan-2026-03',
    (select id from public.payroll_runs where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'payroll-run-2026-03'),
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-jordan-blake'),
    5738,
    1148,
    290,
    4300,
    'Calculated'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'payroll-item-priya-2026-03',
    (select id from public.payroll_runs where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'payroll-run-2026-03'),
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-priya-nair'),
    4178,
    836,
    201,
    3141,
    'Calculated'
  )
on conflict (organization_id, seed_key) do update
set
  payroll_run_id = excluded.payroll_run_id,
  employee_id = excluded.employee_id,
  gross_pay = excluded.gross_pay,
  tax_amount = excluded.tax_amount,
  deductions_amount = excluded.deductions_amount,
  net_pay = excluded.net_pay,
  status = excluded.status;

insert into public.pay_periods (
  organization_id,
  seed_key,
  label,
  start_date,
  end_date,
  pay_date,
  status
)
values
  ('11111111-1111-1111-1111-111111111111', 'pay-period-2026-03', 'March 2026', '2026-03-01', '2026-03-15', '2026-03-20', 'Open'),
  ('11111111-1111-1111-1111-111111111111', 'pay-period-2026-03b', 'Late March 2026', '2026-03-16', '2026-03-31', '2026-04-04', 'Scheduled')
on conflict (organization_id, seed_key) do update
set
  label = excluded.label,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  pay_date = excluded.pay_date,
  status = excluded.status;

insert into public.holidays (
  organization_id,
  seed_key,
  name,
  holiday_date,
  type,
  applies_to,
  status
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'holiday-holi-2026',
    'Holi',
    '2026-03-14',
    'Public Holiday',
    'India',
    'Observed'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'holiday-company-offsite-recovery',
    'Company Offsite Recovery Day',
    '2026-03-30',
    'Company Holiday',
    'Global',
    'Scheduled'
  )
on conflict (organization_id, seed_key) do update
set
  name = excluded.name,
  holiday_date = excluded.holiday_date,
  type = excluded.type,
  applies_to = excluded.applies_to,
  status = excluded.status;

insert into public.time_entries (
  organization_id,
  seed_key,
  employee_id,
  pay_period_id,
  work_date,
  clock_in_at,
  clock_out_at,
  break_minutes,
  hours_worked,
  overtime_hours,
  status
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'time-entry-anika-2026-03-18',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-anika-raman'),
    (select id from public.pay_periods where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'pay-period-2026-03b'),
    '2026-03-18',
    '2026-03-18T09:02:00Z',
    '2026-03-18T17:46:00Z',
    45,
    7.98,
    0,
    'Approved'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'time-entry-jordan-2026-03-18',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-jordan-blake'),
    (select id from public.pay_periods where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'pay-period-2026-03b'),
    '2026-03-18',
    '2026-03-18T08:31:00Z',
    '2026-03-18T18:12:00Z',
    50,
    8.85,
    0.85,
    'Approved'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'time-entry-priya-2026-03-18',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-priya-nair'),
    (select id from public.pay_periods where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'pay-period-2026-03b'),
    '2026-03-18',
    '2026-03-18T09:14:00Z',
    '2026-03-18T18:01:00Z',
    35,
    8.2,
    0.2,
    'Submitted'
  )
on conflict (organization_id, seed_key) do update
set
  employee_id = excluded.employee_id,
  pay_period_id = excluded.pay_period_id,
  work_date = excluded.work_date,
  clock_in_at = excluded.clock_in_at,
  clock_out_at = excluded.clock_out_at,
  break_minutes = excluded.break_minutes,
  hours_worked = excluded.hours_worked,
  overtime_hours = excluded.overtime_hours,
  status = excluded.status;

insert into public.leave_requests (
  organization_id,
  seed_key,
  employee_id,
  employee_name,
  type,
  start_date,
  end_date,
  days,
  status,
  approver_name
)
values
  ('11111111-1111-1111-1111-111111111111', 'leave-request-marcus-lee', (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-marcus-lee'), 'Marcus Lee', 'Annual Leave', '2026-03-21', '2026-03-28', 6, 'Approved', 'Daniel Moss'),
  ('11111111-1111-1111-1111-111111111111', 'leave-request-elena-torres', (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-elena-torres'), 'Elena Torres', 'Work From Anywhere', '2026-04-08', '2026-04-18', 7, 'Pending', 'Anika Raman'),
  ('11111111-1111-1111-1111-111111111111', 'leave-request-noah-kim', (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-noah-kim'), 'Noah Kim', 'Family Care', '2026-03-26', '2026-03-27', 2, 'In Review', 'Priya Nair')
on conflict (organization_id, seed_key) do update
set
  employee_id = excluded.employee_id,
  employee_name = excluded.employee_name,
  type = excluded.type,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  days = excluded.days,
  status = excluded.status,
  approver_name = excluded.approver_name;

insert into public.expenses (
  organization_id,
  seed_key,
  employee_id,
  employee_name,
  category,
  description,
  amount,
  currency,
  incurred_on,
  status,
  approver_name,
  notes,
  receipt_file_name,
  receipt_storage_path,
  receipt_mime_type
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'expense-jordan-home-office',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-jordan-blake'),
    'Jordan Blake',
    'Home Office',
    'Ergonomic chair for remote workspace',
    420,
    'USD',
    '2026-03-14',
    'Approved',
    'Mina Carter',
    'Approved under the annual home office stipend.',
    'jordan-chair-receipt.pdf',
    'documents/expenses/jordan-blake/chair-receipt.pdf',
    'application/pdf'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'expense-priya-travel',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-priya-nair'),
    'Priya Nair',
    'Travel',
    'Taxi and airport transfer for payroll vendor meeting',
    96.50,
    'USD',
    '2026-03-17',
    'Pending',
    'Anika Raman',
    'Awaiting manager review.',
    'priya-travel-receipt.pdf',
    'documents/expenses/priya-nair/travel-receipt.pdf',
    'application/pdf'
  )
on conflict (organization_id, seed_key) do update
set
  employee_id = excluded.employee_id,
  employee_name = excluded.employee_name,
  category = excluded.category,
  description = excluded.description,
  amount = excluded.amount,
  currency = excluded.currency,
  incurred_on = excluded.incurred_on,
  status = excluded.status,
  approver_name = excluded.approver_name,
  notes = excluded.notes,
  receipt_file_name = excluded.receipt_file_name,
  receipt_storage_path = excluded.receipt_storage_path,
  receipt_mime_type = excluded.receipt_mime_type;

insert into public.compliance_rules (
  organization_id,
  seed_key,
  name,
  jurisdiction,
  category,
  deadline_date,
  status,
  notes
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'compliance-rule-federal-941-q1',
    'Federal Form 941 Q1 Filing',
    'United States - Federal',
    'Payroll Tax',
    '2026-04-30',
    'Open',
    'Quarterly federal payroll tax return.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'compliance-rule-state-ca-ui-q1',
    'California UI Wage Report',
    'California',
    'State Payroll Tax',
    '2026-04-30',
    'Open',
    'Quarterly wage detail and unemployment filing.'
  )
on conflict (organization_id, seed_key) do update
set
  name = excluded.name,
  jurisdiction = excluded.jurisdiction,
  category = excluded.category,
  deadline_date = excluded.deadline_date,
  status = excluded.status,
  notes = excluded.notes;

insert into public.compliance_alerts (
  organization_id,
  seed_key,
  rule_id,
  severity,
  title,
  message,
  status,
  due_date
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'compliance-alert-federal-941-q1',
    (select id from public.compliance_rules where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'compliance-rule-federal-941-q1'),
    'High',
    'Federal Q1 filing deadline approaching',
    'Form 941 filing package should be reviewed before month end.',
    'Open',
    '2026-04-23'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'compliance-alert-ca-ui-q1',
    (select id from public.compliance_rules where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'compliance-rule-state-ca-ui-q1'),
    'Medium',
    'California wage report pending validation',
    'Verify wage detail export before submitting the state unemployment filing.',
    'In Review',
    '2026-04-25'
  )
on conflict (organization_id, seed_key) do update
set
  rule_id = excluded.rule_id,
  severity = excluded.severity,
  title = excluded.title,
  message = excluded.message,
  status = excluded.status,
  due_date = excluded.due_date;

insert into public.tax_filings (
  organization_id,
  seed_key,
  filing_name,
  jurisdiction,
  period_label,
  due_date,
  status,
  amount,
  notes
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'tax-filing-federal-941-q1',
    'Form 941 Q1 2026',
    'United States - Federal',
    'Q1 2026',
    '2026-04-30',
    'Prepared',
    86420,
    'Prepared for final sign-off.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'tax-filing-ca-ui-q1',
    'California UI Q1 2026',
    'California',
    'Q1 2026',
    '2026-04-30',
    'In Review',
    12480,
    'Waiting on final wage reconciliation.'
  )
on conflict (organization_id, seed_key) do update
set
  filing_name = excluded.filing_name,
  jurisdiction = excluded.jurisdiction,
  period_label = excluded.period_label,
  due_date = excluded.due_date,
  status = excluded.status,
  amount = excluded.amount,
  notes = excluded.notes;

insert into public.approvals (
  organization_id,
  seed_key,
  entity_type,
  entity_id,
  requested_by_name,
  assigned_to_name,
  status,
  decision_note,
  decided_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'approval-leave-marcus-lee',
    'leave_request',
    (select id from public.leave_requests where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'leave-request-marcus-lee'),
    'Marcus Lee',
    'Daniel Moss',
    'Approved',
    'Coverage is already arranged for the design review sprint.',
    '2026-03-18T11:00:00Z'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'approval-leave-elena-torres',
    'leave_request',
    (select id from public.leave_requests where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'leave-request-elena-torres'),
    'Elena Torres',
    'Anika Raman',
    'Pending',
    null,
    null
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'approval-leave-noah-kim',
    'leave_request',
    (select id from public.leave_requests where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'leave-request-noah-kim'),
    'Noah Kim',
    'Priya Nair',
    'In Review',
    'Waiting for payroll close timing confirmation.',
    null
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'approval-expense-jordan-home-office',
    'expense',
    (select id from public.expenses where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'expense-jordan-home-office'),
    'Jordan Blake',
    'Mina Carter',
    'Approved',
    'Approved under the annual home office stipend.',
    '2026-03-18T10:00:00Z'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'approval-expense-priya-travel',
    'expense',
    (select id from public.expenses where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'expense-priya-travel'),
    'Priya Nair',
    'Anika Raman',
    'Pending',
    'Awaiting manager review.',
    null
  )
on conflict (organization_id, seed_key) do update
set
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  requested_by_name = excluded.requested_by_name,
  assigned_to_name = excluded.assigned_to_name,
  status = excluded.status,
  decision_note = excluded.decision_note,
  decided_at = excluded.decided_at;

insert into public.documents (
  organization_id,
  seed_key,
  entity_type,
  entity_id,
  category,
  file_name,
  storage_path,
  mime_type,
  size_bytes,
  status,
  visibility,
  uploaded_by_name
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'document-employee-anika-offer-letter',
    'employee',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-anika-raman'),
    'Offer Letter',
    'anika-raman-offer-letter.pdf',
    'documents/employees/anika-raman/offer-letter.pdf',
    'application/pdf',
    248231,
    'Active',
    'Private',
    'Maya Chen'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'document-employee-jordan-tax-form',
    'employee',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-jordan-blake'),
    'Tax Form',
    'jordan-blake-w4.pdf',
    'documents/employees/jordan-blake/w4.pdf',
    'application/pdf',
    126540,
    'Active',
    'Private',
    'Maya Chen'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'document-company-payroll-policy',
    'company',
    '11111111-1111-1111-1111-111111111111',
    'Policy',
    'northstar-payroll-policy.pdf',
    'documents/company/payroll-policy.pdf',
    'application/pdf',
    331008,
    'Active',
    'Internal',
    'Maya Chen'
  )
on conflict (organization_id, seed_key) do update
set
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  category = excluded.category,
  file_name = excluded.file_name,
  storage_path = excluded.storage_path,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  status = excluded.status,
  visibility = excluded.visibility,
  uploaded_by_name = excluded.uploaded_by_name;

insert into public.bank_accounts (
  organization_id,
  seed_key,
  employee_id,
  account_holder_name,
  bank_name,
  account_type,
  account_last4,
  routing_last4,
  status,
  is_primary,
  provider_reference,
  verified_at,
  notes
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'bank-account-anika-primary',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-anika-raman'),
    'Anika Raman',
    'HDFC Bank',
    'Checking',
    '4182',
    '0091',
    'Verified',
    true,
    'seed-bank-account-anika-primary',
    '2026-03-05T10:00:00Z',
    'Primary payroll disbursement account.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'bank-account-priya-primary',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-priya-nair'),
    'Priya Nair',
    'ICICI Bank',
    'Checking',
    '5724',
    '4820',
    'Pending Verification',
    true,
    'seed-bank-account-priya-primary',
    null,
    'Awaiting penny test confirmation.'
  )
on conflict (organization_id, seed_key) do update
set
  employee_id = excluded.employee_id,
  account_holder_name = excluded.account_holder_name,
  bank_name = excluded.bank_name,
  account_type = excluded.account_type,
  account_last4 = excluded.account_last4,
  routing_last4 = excluded.routing_last4,
  status = excluded.status,
  is_primary = excluded.is_primary,
  provider_reference = excluded.provider_reference,
  verified_at = excluded.verified_at,
  notes = excluded.notes;

insert into public.benefits_plans (
  organization_id,
  seed_key,
  name,
  provider_name,
  category,
  coverage_level,
  employee_cost,
  employer_cost,
  status
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'benefits-plan-health-plus',
    'Health Plus PPO',
    'NovaCare',
    'Health Insurance',
    'Employee + Family',
    240,
    610,
    'Active'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'benefits-plan-retirement-match',
    'Retirement Match 401(k)',
    'FutureNest',
    'Retirement',
    'Employee',
    180,
    180,
    'Active'
  )
on conflict (organization_id, seed_key) do update
set
  name = excluded.name,
  provider_name = excluded.provider_name,
  category = excluded.category,
  coverage_level = excluded.coverage_level,
  employee_cost = excluded.employee_cost,
  employer_cost = excluded.employer_cost,
  status = excluded.status;

insert into public.benefits_enrollments (
  organization_id,
  seed_key,
  employee_id,
  employee_name,
  plan_id,
  status,
  effective_date,
  payroll_deduction,
  notes
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'benefits-enrollment-anika-health',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-anika-raman'),
    'Anika Raman',
    (select id from public.benefits_plans where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'benefits-plan-health-plus'),
    'Active',
    '2026-01-01',
    240,
    'Family health coverage for FY26.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'benefits-enrollment-jordan-retirement',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-jordan-blake'),
    'Jordan Blake',
    (select id from public.benefits_plans where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'benefits-plan-retirement-match'),
    'Pending',
    '2026-04-01',
    180,
    'Awaiting employee confirmation during open enrollment.'
  )
on conflict (organization_id, seed_key) do update
set
  employee_id = excluded.employee_id,
  employee_name = excluded.employee_name,
  plan_id = excluded.plan_id,
  status = excluded.status,
  effective_date = excluded.effective_date,
  payroll_deduction = excluded.payroll_deduction,
  notes = excluded.notes;

insert into public.performance_review_templates (
  organization_id,
  seed_key,
  name,
  cycle_label,
  review_type,
  status,
  questions
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'performance-template-quarterly-growth',
    'Quarterly Growth Review',
    'Q2 2026',
    'Quarterly',
    'Active',
    '["What outcomes did the employee own this cycle?", "Where did they raise the quality bar for the team?", "What is the highest-impact growth area for next quarter?"]'::jsonb
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'performance-template-manager-checkin',
    'Manager Check-In',
    'Monthly',
    'Check-In',
    'Active',
    '["What progress was made against current goals?", "What support or blockers need escalation?", "Which skills should be coached in the next month?"]'::jsonb
  )
on conflict (organization_id, seed_key) do update
set
  name = excluded.name,
  cycle_label = excluded.cycle_label,
  review_type = excluded.review_type,
  status = excluded.status,
  questions = excluded.questions;

insert into public.performance_reviews (
  organization_id,
  seed_key,
  employee_id,
  employee_name,
  template_id,
  reviewer_name,
  status,
  due_date,
  score,
  summary,
  notes
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'performance-review-jordan-q2',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-jordan-blake'),
    'Jordan Blake',
    (select id from public.performance_review_templates where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'performance-template-quarterly-growth'),
    'Mina Carter',
    'In Review',
    '2026-04-05',
    4.40,
    'Strong delivery against platform reliability goals with clear ownership on backend modernization.',
    'Pending final calibration feedback.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'performance-review-elena-checkin',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-elena-torres'),
    'Elena Torres',
    (select id from public.performance_review_templates where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'performance-template-manager-checkin'),
    'Anika Raman',
    'Draft',
    '2026-03-28',
    null,
    'New hiring funnel experiments are showing better recruiter response rates.',
    'Manager draft is still in progress.'
  )
on conflict (organization_id, seed_key) do update
set
  employee_id = excluded.employee_id,
  employee_name = excluded.employee_name,
  template_id = excluded.template_id,
  reviewer_name = excluded.reviewer_name,
  status = excluded.status,
  due_date = excluded.due_date,
  score = excluded.score,
  summary = excluded.summary,
  notes = excluded.notes;

insert into public.onboarding_workflows (
  organization_id,
  seed_key,
  employee_id,
  employee_name,
  owner_name,
  status,
  start_date,
  target_date,
  notes
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'onboarding-elena-torres',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-elena-torres'),
    'Elena Torres',
    'Anika Raman',
    'In Progress',
    '2026-03-10',
    '2026-03-24',
    'Cross-functional setup is in flight for the Barcelona team handoff.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'onboarding-noah-kim',
    (select id from public.employees where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'employee-noah-kim'),
    'Noah Kim',
    'Priya Nair',
    'Pending',
    '2026-03-18',
    '2026-04-01',
    'Pending payroll and finance system enrollment.'
  )
on conflict (organization_id, seed_key) do update
set
  employee_id = excluded.employee_id,
  employee_name = excluded.employee_name,
  owner_name = excluded.owner_name,
  status = excluded.status,
  start_date = excluded.start_date,
  target_date = excluded.target_date,
  notes = excluded.notes;

insert into public.onboarding_tasks (
  organization_id,
  seed_key,
  workflow_id,
  title,
  category,
  assigned_to_name,
  status,
  due_date,
  completed_at,
  notes
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'onboarding-task-elena-offer',
    (select id from public.onboarding_workflows where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'onboarding-elena-torres'),
    'Collect signed offer letter',
    'Documents',
    'Elena Torres',
    'Completed',
    '2026-03-12',
    '2026-03-12T15:00:00Z',
    'Signed copy received and stored in the employee document folder.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'onboarding-task-elena-it',
    (select id from public.onboarding_workflows where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'onboarding-elena-torres'),
    'Provision laptop and Slack access',
    'IT',
    'Anika Raman',
    'In Progress',
    '2026-03-20',
    null,
    'IT equipment has shipped and access setup is underway.'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'onboarding-task-noah-tax',
    (select id from public.onboarding_workflows where organization_id = '11111111-1111-1111-1111-111111111111' and seed_key = 'onboarding-noah-kim'),
    'Submit tax and bank details',
    'Payroll',
    'Noah Kim',
    'Pending',
    '2026-03-22',
    null,
    'Awaiting employee completion in the self-service workflow.'
  )
on conflict (organization_id, seed_key) do update
set
  workflow_id = excluded.workflow_id,
  title = excluded.title,
  category = excluded.category,
  assigned_to_name = excluded.assigned_to_name,
  status = excluded.status,
  due_date = excluded.due_date,
  completed_at = excluded.completed_at,
  notes = excluded.notes;

insert into public.announcements (
  organization_id,
  seed_key,
  label,
  title,
  body,
  display_order
)
values
  ('11111111-1111-1111-1111-111111111111', 'announcement-q2-review', 'Performance', 'Q2 compensation review window opens next Monday', 'Managers can finalize performance inputs directly in the workspace before April 8.', 1),
  ('11111111-1111-1111-1111-111111111111', 'announcement-payroll-exception-rate', 'Payroll', 'Payroll exception rate dropped below 1%', 'Automated checks on reimbursements and bonuses are clearing with fewer manual interventions.', 2),
  ('11111111-1111-1111-1111-111111111111', 'announcement-onboarding-playbook', 'People Ops', 'Hybrid onboarding playbook was refreshed', 'The new checklist shortens time-to-setup for global hires and syncs with IT handoffs.', 3)
on conflict (organization_id, seed_key) do update
set
  label = excluded.label,
  title = excluded.title,
  body = excluded.body,
  display_order = excluded.display_order;
