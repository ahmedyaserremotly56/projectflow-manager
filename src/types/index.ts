// ============================================
// ProjectFlow Manager - Type Definitions
// ============================================

export type UserRole = "admin" | "manager" | "member";

export type ProjectStatus =
  | "not_started"
  | "in_progress"
  | "under_review"
  | "completed"
  | "cancelled";

export type TaskStatus = "not_started" | "in_progress" | "completed";

export type PricingType = "fixed" | "task_based";

export type MemberStatus = "active" | "inactive";

// ============================================
// User & Auth Types
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Team Member Types
// ============================================

export interface TeamMember {
  id: string;
  name: string;
  job_title: string;
  phone: string;
  email: string;
  avatar_url?: string;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberFormData {
  name: string;
  job_title: string;
  phone: string;
  email: string;
  avatar_url?: string;
  status: MemberStatus;
}

// ============================================
// Client Types
// ============================================

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes?: string;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  client?: Client;
  start_date: string;
  delivery_date: string;
  google_drive_link?: string;
  notes?: string;
  status: ProjectStatus;
  pricing_type: PricingType;
  fixed_price?: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
  // Relations
  tasks?: Task[];
  team_members?: TeamMember[];
  pricing_tasks?: PricingTask[];
  progress?: number;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  client_id: string;
  start_date: string;
  delivery_date: string;
  google_drive_link?: string;
  notes?: string;
  status: ProjectStatus;
  pricing_type: PricingType;
  fixed_price?: number;
}

// ============================================
// Pricing Task Types
// ============================================

export interface PricingTask {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  price: number;
  created_at: string;
}

export interface PricingTaskFormData {
  name: string;
  description?: string;
  price: number;
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string;
  project_id: string;
  name: string;
  assigned_to?: string;
  assignee?: TeamMember;
  start_date: string;
  end_date: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  name: string;
  assigned_to?: string;
  start_date: string;
  end_date: string;
  status: TaskStatus;
}

// ============================================
// Project Team Member (Junction)
// ============================================

export interface ProjectTeamMember {
  project_id: string;
  team_member_id: string;
  team_member?: TeamMember;
  assigned_at: string;
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | "deadline_approaching"
  | "deadline_passed"
  | "project_completed";

export interface Notification {
  id: string;
  project_id: string;
  project?: Project;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalRevenue: number;
  currentMonthRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface ProjectStatusData {
  status: string;
  count: number;
  color: string;
}

export interface TeamProductivityData {
  name: string;
  completed: number;
  inProgress: number;
}

// ============================================
// Report Types
// ============================================

export interface ProjectReport {
  id: string;
  name: string;
  client_name: string;
  status: ProjectStatus;
  total_cost: number;
  start_date: string;
  delivery_date: string;
  progress: number;
  team_count: number;
}

export interface RevenueReport {
  month: string;
  total_revenue: number;
  project_count: number;
}

export interface ClientReport {
  id: string;
  name: string;
  company: string;
  total_projects: number;
  total_revenue: number;
  active_projects: number;
}

export interface TeamPerformanceReport {
  id: string;
  name: string;
  job_title: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  completion_rate: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// ============================================
// Filter & Sort Types
// ============================================

export interface ProjectFilters {
  status?: ProjectStatus | "all";
  client_id?: string;
  search?: string;
  sort_by?: "name" | "delivery_date" | "created_at" | "total_cost";
  sort_order?: "asc" | "desc";
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}
