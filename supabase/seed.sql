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
  period_label,
  pay_date,
  status,
  employee_count,
  total_amount,
  variance_note
)
values
  ('11111111-1111-1111-1111-111111111111', 'payroll-run-2026-03', 'March 2026', '2026-03-29', 'Processing', 62, 412840, '+2.3% vs last month'),
  ('11111111-1111-1111-1111-111111111111', 'payroll-run-2026-02', 'February 2026', '2026-02-27', 'Paid', 61, 403620, '+1 new starter'),
  ('11111111-1111-1111-1111-111111111111', 'payroll-run-2026-01', 'January 2026', '2026-01-30', 'Paid', 60, 397200, 'No payroll exceptions')
on conflict (organization_id, seed_key) do update
set
  period_label = excluded.period_label,
  pay_date = excluded.pay_date,
  status = excluded.status,
  employee_count = excluded.employee_count,
  total_amount = excluded.total_amount,
  variance_note = excluded.variance_note;

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
  employee_name,
  type,
  start_date,
  end_date,
  days,
  status,
  approver_name
)
values
  ('11111111-1111-1111-1111-111111111111', 'leave-request-marcus-lee', 'Marcus Lee', 'Annual Leave', '2026-03-21', '2026-03-28', 6, 'Approved', 'Daniel Moss'),
  ('11111111-1111-1111-1111-111111111111', 'leave-request-elena-torres', 'Elena Torres', 'Work From Anywhere', '2026-04-08', '2026-04-18', 7, 'Pending', 'Anika Raman'),
  ('11111111-1111-1111-1111-111111111111', 'leave-request-noah-kim', 'Noah Kim', 'Family Care', '2026-03-26', '2026-03-27', 2, 'In Review', 'Priya Nair')
on conflict (organization_id, seed_key) do update
set
  employee_name = excluded.employee_name,
  type = excluded.type,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  days = excluded.days,
  status = excluded.status,
  approver_name = excluded.approver_name;

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
