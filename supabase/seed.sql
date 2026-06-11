-- ============================================
-- ProjectFlow Manager - Seed Data
-- Run AFTER schema.sql
-- Note: Create an admin user via Supabase Auth first,
-- then run this seed file.
-- ============================================

-- ============================================
-- TEAM MEMBERS
-- ============================================
INSERT INTO public.team_members (name, job_title, phone, email, status) VALUES
  ('أحمد محمد علي', 'مطور واجهة أمامية', '01012345678', 'ahmed@example.com', 'active'),
  ('سارة أحمد حسن', 'مصممة UI/UX', '01023456789', 'sara@example.com', 'active'),
  ('محمود عبدالله', 'مطور خلفية', '01034567890', 'mahmoud@example.com', 'active'),
  ('نور الدين خالد', 'مدير مشاريع', '01045678901', 'nour@example.com', 'active'),
  ('ريم فاروق', 'مطورة تطبيقات موبايل', '01056789012', 'reem@example.com', 'active'),
  ('كريم وليد', 'مهندس اختبارات QA', '01067890123', 'karim@example.com', 'inactive'),
  ('منى سامي', 'مطورة فول ستاك', '01078901234', 'mona@example.com', 'active'),
  ('طارق حسين', 'مصمم جرافيك', '01089012345', 'tarek@example.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- CLIENTS
-- ============================================
INSERT INTO public.clients (name, phone, email, company, notes) VALUES
  ('شركة النور للتقنية', '0223456789', 'info@alnour.com', 'النور للتقنية', 'عميل VIP - يفضل التواصل عبر الإيميل'),
  ('مجموعة الفجر التجارية', '0234567890', 'contact@alfajr.com', 'الفجر التجارية', 'مشاريع كبيرة متعددة'),
  ('مؤسسة المستقبل الرقمي', '0245678901', 'hello@digital-future.com', 'المستقبل الرقمي', NULL),
  ('شركة البنيان للبرمجيات', '0256789012', 'info@albonyan.com', 'البنيان للبرمجيات', 'شريك استراتيجي'),
  ('د. خالد العمراني', '01090123456', 'dr.khaled@example.com', NULL, 'مشاريع تعليمية'),
  ('متجر الإبداع الإلكتروني', '0267890123', 'info@eibda3.com', 'الإبداع الإلكتروني', 'تجارة إلكترونية'),
  ('مركز التدريب المتقدم', '0278901234', 'info@training-center.com', 'مركز التدريب المتقدم', NULL),
  ('شركة البيانات الذكية', '0289012345', 'contact@smart-data.com', 'البيانات الذكية', 'مشاريع تحليل بيانات')
ON CONFLICT DO NOTHING;

-- ============================================
-- PROJECTS
-- ============================================
DO $$
DECLARE
  client1_id UUID;
  client2_id UUID;
  client3_id UUID;
  client4_id UUID;
  client5_id UUID;
  client6_id UUID;
  client7_id UUID;
  client8_id UUID;

  project1_id UUID;
  project2_id UUID;
  project3_id UUID;
  project4_id UUID;
  project5_id UUID;
  project6_id UUID;

  member1_id UUID;
  member2_id UUID;
  member3_id UUID;
  member4_id UUID;
  member5_id UUID;
  member7_id UUID;
BEGIN
  -- Get client IDs
  SELECT id INTO client1_id FROM public.clients WHERE email = 'info@alnour.com';
  SELECT id INTO client2_id FROM public.clients WHERE email = 'contact@alfajr.com';
  SELECT id INTO client3_id FROM public.clients WHERE email = 'hello@digital-future.com';
  SELECT id INTO client4_id FROM public.clients WHERE email = 'info@albonyan.com';
  SELECT id INTO client5_id FROM public.clients WHERE email = 'dr.khaled@example.com';
  SELECT id INTO client6_id FROM public.clients WHERE email = 'info@eibda3.com';
  SELECT id INTO client7_id FROM public.clients WHERE email = 'info@training-center.com';
  SELECT id INTO client8_id FROM public.clients WHERE email = 'contact@smart-data.com';

  -- Get member IDs
  SELECT id INTO member1_id FROM public.team_members WHERE email = 'ahmed@example.com';
  SELECT id INTO member2_id FROM public.team_members WHERE email = 'sara@example.com';
  SELECT id INTO member3_id FROM public.team_members WHERE email = 'mahmoud@example.com';
  SELECT id INTO member4_id FROM public.team_members WHERE email = 'nour@example.com';
  SELECT id INTO member5_id FROM public.team_members WHERE email = 'reem@example.com';
  SELECT id INTO member7_id FROM public.team_members WHERE email = 'mona@example.com';

  -- Project 1: Completed
  INSERT INTO public.projects (name, description, client_id, start_date, delivery_date, status, pricing_type, fixed_price, total_cost, notes)
  VALUES (
    'موقع الشركة الرئيسي',
    'تصميم وتطوير موقع ويب متكامل للشركة مع لوحة تحكم',
    client1_id,
    '2024-09-01', '2024-11-30',
    'completed', 'fixed', 15000, 15000,
    'تم التسليم في الموعد المحدد'
  ) RETURNING id INTO project1_id;

  -- Project 2: In Progress
  INSERT INTO public.projects (name, description, client_id, start_date, delivery_date, status, pricing_type, total_cost, google_drive_link)
  VALUES (
    'تطبيق إدارة المبيعات',
    'تطبيق موبايل لإدارة المبيعات والعملاء مع تقارير تفصيلية',
    client2_id,
    '2024-11-01', '2025-02-28',
    'in_progress', 'task_based', 0,
    'https://drive.google.com/drive/folders/example2'
  ) RETURNING id INTO project2_id;

  -- Project 3: Under Review
  INSERT INTO public.projects (name, description, client_id, start_date, delivery_date, status, pricing_type, fixed_price, total_cost)
  VALUES (
    'منصة التعلم الإلكتروني',
    'منصة تعليمية شاملة مع دورات مسجلة واختبارات إلكترونية',
    client3_id,
    '2024-10-15', '2025-01-15',
    'under_review', 'fixed', 35000, 35000
  ) RETURNING id INTO project3_id;

  -- Project 4: Not Started
  INSERT INTO public.projects (name, description, client_id, start_date, delivery_date, status, pricing_type, fixed_price, total_cost)
  VALUES (
    'نظام ERP متكامل',
    'نظام تخطيط موارد المؤسسات مع المحاسبة والمخزون والموارد البشرية',
    client4_id,
    '2025-02-01', '2025-08-31',
    'not_started', 'fixed', 80000, 80000
  ) RETURNING id INTO project4_id;

  -- Project 5: In Progress (overdue)
  INSERT INTO public.projects (name, description, client_id, start_date, delivery_date, status, pricing_type, total_cost)
  VALUES (
    'متجر إلكتروني متكامل',
    'متجر إلكتروني مع بوابة دفع وإدارة مخزون',
    client6_id,
    '2024-09-01', '2024-12-01',
    'in_progress', 'task_based', 0
  ) RETURNING id INTO project5_id;

  -- Project 6: Cancelled
  INSERT INTO public.projects (name, description, client_id, start_date, delivery_date, status, pricing_type, fixed_price, total_cost, notes)
  VALUES (
    'تطبيق توصيل الطلبات',
    'تطبيق توصيل للمطاعم مع تتبع الطلبات',
    client5_id,
    '2024-08-01', '2024-10-31',
    'cancelled', 'fixed', 25000, 0,
    'تم إلغاء المشروع من قبل العميل'
  ) RETURNING id INTO project6_id;

  -- ============================================
  -- PRICING TASKS for Project 2
  -- ============================================
  INSERT INTO public.pricing_tasks (project_id, name, description, price) VALUES
    (project2_id, 'تصميم UI/UX', 'تصميم كامل للتطبيق', 5000),
    (project2_id, 'تطوير الواجهة الأمامية', 'تطوير Flutter للموبايل', 8000),
    (project2_id, 'تطوير API', 'باك اند Node.js + PostgreSQL', 7000),
    (project2_id, 'نظام التقارير', 'تقارير مبيعات تفصيلية', 3000),
    (project2_id, 'اختبار وتسليم', 'QA وnop نشر', 2000);

  -- PRICING TASKS for Project 5
  INSERT INTO public.pricing_tasks (project_id, name, description, price) VALUES
    (project5_id, 'تصميم الموقع', 'تصميم UI متكامل', 4000),
    (project5_id, 'صفحات المنتجات', 'كاتالوج المنتجات', 5000),
    (project5_id, 'سلة التسوق والدفع', 'بوابة دفع Stripe', 6000),
    (project5_id, 'لوحة التحكم', 'إدارة المتجر', 5000);

  -- ============================================
  -- PROJECT TEAM MEMBERS
  -- ============================================
  -- Project 1 team
  INSERT INTO public.project_team_members (project_id, team_member_id) VALUES
    (project1_id, member1_id), (project1_id, member2_id), (project1_id, member4_id);

  -- Project 2 team
  INSERT INTO public.project_team_members (project_id, team_member_id) VALUES
    (project2_id, member1_id), (project2_id, member3_id), (project2_id, member5_id), (project2_id, member4_id);

  -- Project 3 team
  INSERT INTO public.project_team_members (project_id, team_member_id) VALUES
    (project3_id, member2_id), (project3_id, member7_id), (project3_id, member3_id);

  -- Project 4 team
  INSERT INTO public.project_team_members (project_id, team_member_id) VALUES
    (project4_id, member4_id), (project4_id, member1_id), (project4_id, member3_id), (project4_id, member7_id);

  -- Project 5 team
  INSERT INTO public.project_team_members (project_id, team_member_id) VALUES
    (project5_id, member1_id), (project5_id, member2_id), (project5_id, member3_id);

  -- ============================================
  -- TASKS for Project 1 (Completed)
  -- ============================================
  INSERT INTO public.tasks (project_id, name, assigned_to, start_date, end_date, status) VALUES
    (project1_id, 'إعداد البيئة وقاعدة البيانات', member3_id, '2024-09-01', '2024-09-07', 'completed'),
    (project1_id, 'تصميم الصفحة الرئيسية', member2_id, '2024-09-05', '2024-09-15', 'completed'),
    (project1_id, 'تطوير الصفحات الداخلية', member1_id, '2024-09-10', '2024-10-15', 'completed'),
    (project1_id, 'لوحة التحكم', member1_id, '2024-10-01', '2024-11-01', 'completed'),
    (project1_id, 'الاختبار والتسليم', member4_id, '2024-11-15', '2024-11-30', 'completed');

  -- TASKS for Project 2 (In Progress)
  INSERT INTO public.tasks (project_id, name, assigned_to, start_date, end_date, status) VALUES
    (project2_id, 'تصميم الواجهة', member2_id, '2024-11-01', '2024-11-20', 'completed'),  
    (project2_id, 'إعداد قاعدة البيانات', member3_id, '2024-11-05', '2024-11-15', 'completed'),
    (project2_id, 'تطوير API المبيعات', member3_id, '2024-11-15', '2024-12-15', 'completed'),
    (project2_id, 'تطوير واجهة الموبايل', member5_id, '2024-11-20', '2025-01-20', 'in_progress'),
    (project2_id, 'نظام التقارير', member1_id, '2025-01-01', '2025-02-01', 'in_progress'),
    (project2_id, 'الاختبار والتسليم', member4_id, '2025-02-10', '2025-02-28', 'not_started');

  -- TASKS for Project 3 (Under Review)
  INSERT INTO public.tasks (project_id, name, assigned_to, start_date, end_date, status) VALUES
    (project3_id, 'تصميم منصة التعلم', member2_id, '2024-10-15', '2024-11-01', 'completed'),
    (project3_id, 'تطوير نظام الدورات', member7_id, '2024-11-01', '2024-12-01', 'completed'),
    (project3_id, 'نظام الاختبارات', member3_id, '2024-12-01', '2024-12-20', 'completed'),
    (project3_id, 'نظام الشهادات', member7_id, '2024-12-15', '2025-01-05', 'completed'),
    (project3_id, 'مراجعة نهائية وإطلاق', member4_id, '2025-01-05', '2025-01-15', 'in_progress');

  -- ============================================
  -- NOTIFICATIONS
  -- ============================================
  INSERT INTO public.notifications (project_id, type, message, is_read) VALUES
    (project2_id, 'deadline_approaching', 'مشروع "تطبيق إدارة المبيعات" - موعد التسليم بعد 3 أيام', false),
    (project5_id, 'deadline_passed', 'مشروع "متجر إلكتروني متكامل" - تجاوز موعد التسليم!', false),
    (project1_id, 'project_completed', 'تم إكمال مشروع "موقع الشركة الرئيسي" بنجاح', true);

END $$;
