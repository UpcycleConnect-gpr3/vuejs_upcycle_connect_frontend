export * from './api'

export interface Timestamps {
  created_at: string
  updated_at: string
}

export interface DeliveryMethod extends Timestamps {
  id: number
  name: string
}

export interface DeliveryMethodPayload {
  name: string
}

export interface UpcycleEvent extends Timestamps {
  id: number
  name: string
  description: string
  image_path: string
  started_at: string
  finished_at: string
  location: string
  delivery_method: string
  created_by_user_id: string
}

export type EventPayload = Omit<UpcycleEvent, 'id' | 'created_at' | 'updated_at'>

export interface EventStep extends Timestamps {
  id: number
  event_id: number
  name: string
  description: string
  image_path: string
  scheduled_at: string
}

export type EventStepPayload = Omit<EventStep, 'id' | 'created_at' | 'updated_at'>
export type EventStepUpdatePayload = Omit<EventStepPayload, 'event_id'>

export interface StepSummary {
  id: string | number
  name: string
  description: string
  image_path: string
  scheduled_at: string
}

export interface UpcycleObject extends Timestamps {
  id: string
  name: string
  description: string
  price: number
  image_path: string
  column_for_calc_the_score: string
  category: string
  condition: string
  quantity: number
  user_id: string
  score: number
  is_ad_validated: boolean
  status?: string
}

export interface ScoreConfig {
  categories: Record<string, number>
  conditions: Record<string, number>
}

export type ObjectPayload = Omit<UpcycleObject, 'created_at' | 'updated_at'>
export type ObjectUpdatePayload = Omit<ObjectPayload, 'id'>

export interface ObjectScore {
  object_id: string
  score: number
}

export interface DeliveryMethodRef {
  id: number
  name: string
}

export interface ProjectRef {
  id: number
  name: string
}

export interface ObjectRef {
  id: string
  name: string
}

export interface UserRef {
  id: string
  username: string
}

export interface Project extends Timestamps {
  id: number
  name: string
  description: string
  image_path: string
  user_id: string
  featured?: boolean
}

export interface Ad {
  id: number
  user_id: string
  title: string
  description: string
  budget: number
  status: string
  created_at: string
  updated_at: string
}

export interface AdPayload {
  title: string
  description: string
  budget: number
  status: string
}

export interface CategoryCount {
  category: string
  count: number
}

export interface UserStats {
  objects_count: number
  projects_count: number
  co2_total: number
  by_category: CategoryCount[]
}

export interface Subscription {
  id: string
  user_id: string
  price_id: string
  status: string
  created_at: string
  updated_at: string
}

export type ProjectPayload = Omit<Project, 'id' | 'created_at' | 'updated_at'>

export interface Step extends Timestamps {
  id: string
  name: string
  description: string
  image_path: string
  user_id: string
  project_id: number
  scheduled_at: string
}

export type StepPayload = Omit<Step, 'id' | 'created_at' | 'updated_at'>

export interface Order extends Timestamps {
  id: string
  street: string
  city: string
  zip_code: string
  user_id: string
}

export type OrderPayload = Omit<Order, 'id' | 'created_at' | 'updated_at'>

export interface Locker extends Timestamps {
  id: string
  name: string
  street: string
  city: string
  zip_code: string
  capacity?: number
  available_slots?: number
}

export interface DepositResult {
  code: string
  expiry_date: string
  score: number
  package_id: string
}

export interface PackageInfo {
  id: string
  code: string
  locker_id: string
  object_id: string
  status: string
  expiry_date: string
  weight: number
}

export type LockerPayload = Omit<Locker, 'id' | 'created_at' | 'updated_at'>

export interface Package extends Timestamps {
  id: string
  weight: number
  code: string
  locker_id: string
  order_id: string
}

export type PackagePayload = Omit<Package, 'id' | 'created_at' | 'updated_at'>

export interface ObjectOrder extends Timestamps {
  id: number
  object_id: string
  order_id: string
  amount: number
}

export type ObjectOrderPayload = Omit<ObjectOrder, 'id' | 'created_at' | 'updated_at'>

export interface OrderDeliveryMethod extends Timestamps {
  order_id: string
  delivery_method_id: number
  price: number
}

export type OrderDeliveryMethodPayload = Omit<OrderDeliveryMethod, 'created_at' | 'updated_at'>

export interface HealthStatus {
  status: string
}

export interface ForumUser extends Timestamps {
  id: string
  username: string
  firstname: string | null
  lastname: string | null
  email: string
}

export interface ForumUserUpdatePayload {
  username: string
  firstname: string
  lastname: string
}

export interface ForumCategory extends Timestamps {
  id: number
  name: string
  description: string
}

export interface ForumCategoryPayload {
  name: string
  description: string
}

export interface ForumEvent {
  id: number
  title: string
  date: string
}

export type ForumEventPayload = Omit<ForumEvent, 'id'>

export interface Talk extends Timestamps {
  id: number
  title: string
  type: string
  status: string
  description: string
}

export type TalkCreatePayload = Omit<Talk, 'id' | 'created_at' | 'updated_at'>

export interface TalkUpdatePayload {
  title: string
  status: string
}

export interface TalkMessage {
  id: number
  content: string
  user_id: string
  talk_id: number
  created_at: string
}

export interface Training {
  id: number
  name: string
  type: string
  mode_of_delivery: string
  duration: string
  minimum_number_of_participants: number
  maximum_number_of_participants: number
  location: string
  price: number
}

export interface TrainingPayload {
  name: string
  type?: string
  mode_of_delivery?: string
  duration?: string
  minimum_number_of_participants?: number
  maximum_number_of_participants?: number
  location?: string
  price?: number
}

export interface TrainingCurriculum {
  id: number
  name: string
}

export interface TrainingContentRef {
  id: number
  title: string
}

export interface TrainingSchedule {
  id: number
  starts_at: string
  ends_at: string
}

export interface Appointment extends Timestamps {
  id: number
  user_id: string
  title: string
  kind: string
  location: string
  starts_at: string
  ends_at: string
}

export type AppointmentPayload = Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface ConversationUser {
  id: string
  username: string
  firstname: string
  lastname: string
}

export interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  users: ConversationUser[]
}

export interface ConversationMessage {
  id: number
  conversation_id: number
  user_id: string
  content: string
  created_at: string
}
