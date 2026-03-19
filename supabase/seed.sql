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
