-- ============================================
-- ProjectFlow Manager - Database Schema
-- PostgreSQL / Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  google_drive_link TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'under_review', 'completed', 'cancelled')
  ),
  pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'task_based')),
  fixed_price NUMERIC(12, 2),
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PRICING TASKS TABLE (for task-based pricing)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pricing_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PROJECT TEAM MEMBERS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_team_members (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, team_member_id)
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'completed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN ('deadline_approaching', 'deadline_passed', 'project_completed')
  ),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_delivery_date ON public.projects(delivery_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Pricing tasks index
CREATE INDEX IF NOT EXISTS idx_pricing_tasks_project_id ON public.pricing_tasks(project_id);

-- Project team members indexes
CREATE INDEX IF NOT EXISTS idx_ptm_project_id ON public.project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_ptm_member_id ON public.project_team_members(team_member_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON public.notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate project total cost for task-based pricing
CREATE OR REPLACE FUNCTION update_project_total_cost()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.projects
    SET total_cost = (
      SELECT COALESCE(SUM(price), 0)
      FROM public.pricing_tasks
      WHERE project_id = OLD.project_id
    )
    WHERE id = OLD.project_id AND pricing_type = 'task_based';
    RETURN OLD;
  ELSE
    UPDATE public.projects
    SET total_cost = (
      SELECT COALESCE(SUM(price), 0)
      FROM public.pricing_tasks
      WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id AND pricing_type = 'task_based';
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_project_total_cost
  AFTER INSERT OR UPDATE OR DELETE ON public.pricing_tasks
  FOR EACH ROW EXECUTE FUNCTION update_project_total_cost();

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (get_user_role() = 'admin');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- TEAM MEMBERS POLICIES
-- ============================================
CREATE POLICY "All authenticated users can view team members"
  ON public.team_members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and Manager can insert team members"
  ON public.team_members FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admin and Manager can update team members"
  ON public.team_members FOR UPDATE
  USING (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admin can delete team members"
  ON public.team_members FOR DELETE
  USING (get_user_role() = 'admin');

-- ============================================
-- CLIENTS POLICIES
-- ============================================
CREATE POLICY "Admin and Manager can view clients"
  ON public.clients FOR SELECT
  USING (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admin and Manager can insert clients"
  ON public.clients FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admin and Manager can update clients"
  ON public.clients FOR UPDATE
  USING (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admin can delete clients"
  ON public.clients FOR DELETE
  USING (get_user_role() = 'admin');

-- ============================================
-- PROJECTS POLICIES
-- ============================================
CREATE POLICY "Admin and Manager can view all projects"
  ON public.projects FOR SELECT
  USING (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Members can view assigned projects"
  ON public.projects FOR SELECT
  USING (
    get_user_role() = 'member' AND
    id IN (
      SELECT ptm.project_id
      FROM public.project_team_members ptm
      JOIN public.team_members tm ON tm.id = ptm.team_member_id
      WHERE tm.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admin and Manager can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admin and Manager can update projects"
  ON public.projects FOR UPDATE
  USING (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Admin can delete projects"
  ON public.projects FOR DELETE
  USING (get_user_role() = 'admin');

-- ============================================
-- PRICING TASKS POLICIES
-- ============================================
CREATE POLICY "View pricing tasks based on project access"
  ON public.pricing_tasks FOR SELECT
  USING (
    project_id IN (SELECT id FROM public.projects)
  );

CREATE POLICY "Admin and Manager can manage pricing tasks"
  ON public.pricing_tasks FOR ALL
  USING (get_user_role() IN ('admin', 'manager'));

-- ============================================
-- PROJECT TEAM MEMBERS POLICIES
-- ============================================
CREATE POLICY "All users can view project team members"
  ON public.project_team_members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and Manager can manage project team members"
  ON public.project_team_members FOR ALL
  USING (get_user_role() IN ('admin', 'manager'));

-- ============================================
-- TASKS POLICIES
-- ============================================
CREATE POLICY "Admin and Manager can view all tasks"
  ON public.tasks FOR SELECT
  USING (get_user_role() IN ('admin', 'manager'));

CREATE POLICY "Members can view assigned tasks"
  ON public.tasks FOR SELECT
  USING (
    get_user_role() = 'member' AND
    project_id IN (SELECT id FROM public.projects)
  );

CREATE POLICY "Admin and Manager can manage tasks"
  ON public.tasks FOR ALL
  USING (get_user_role() IN ('admin', 'manager'));

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "All authenticated users can view notifications"
  ON public.notifications FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "All users can update notifications (mark as read)"
  ON public.notifications FOR UPDATE
  USING (auth.role() = 'authenticated');
