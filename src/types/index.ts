// Types globaux — modèles de la documentation API Upcycle Connect.
// Les types transverses (ApiResponse, ApiError, User) vivent dans ./api.
export * from './api'

export interface Timestamps {
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Delivery Methods
// ---------------------------------------------------------------------------
export interface DeliveryMethod extends Timestamps {
  id: number
  name: string
}

export interface DeliveryMethodPayload {
  name: string
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Event Steps
// ---------------------------------------------------------------------------
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

// Forme renvoyée par GET /events/{id}/steps et GET /projects/{id}/steps
export interface StepSummary {
  id: number
  name: string
  description: string
  image_path: string
  scheduled_at: string
}

// ---------------------------------------------------------------------------
// Objects
// ---------------------------------------------------------------------------
export interface UpcycleObject extends Timestamps {
  id: string
  name: string
  description: string
  price: number
  image_path: string
  column_for_calc_the_score: string
  quantity: number
  user_id: string
  score: number
  is_ad_validated: boolean
}

export type ObjectPayload = Omit<UpcycleObject, 'created_at' | 'updated_at'>
export type ObjectUpdatePayload = Omit<ObjectPayload, 'id'>

export interface ObjectScore {
  object_id: string
  score: number
}

// Formes allégées renvoyées par les endpoints d'association
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

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export interface Project extends Timestamps {
  id: number
  name: string
  description: string
  image_path: string
  user_id: string
}

export type ProjectPayload = Omit<Project, 'id' | 'created_at' | 'updated_at'>

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export interface Order extends Timestamps {
  id: string
  street: string
  city: string
  zip_code: string
  user_id: string
}

export type OrderPayload = Omit<Order, 'id' | 'created_at' | 'updated_at'>

// ---------------------------------------------------------------------------
// Lockers
// ---------------------------------------------------------------------------
export interface Locker extends Timestamps {
  id: string
  name: string
  street: string
  city: string
  zip_code: string
}

export type LockerPayload = Omit<Locker, 'id' | 'created_at' | 'updated_at'>

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------
export interface Package extends Timestamps {
  id: string
  weight: number
  code: string
  locker_id: string
  order_id: string
}

export type PackagePayload = Omit<Package, 'id' | 'created_at' | 'updated_at'>

// ---------------------------------------------------------------------------
// Object Orders
// ---------------------------------------------------------------------------
export interface ObjectOrder extends Timestamps {
  id: number
  object_id: string
  order_id: string
  amount: number
}

export type ObjectOrderPayload = Omit<ObjectOrder, 'id' | 'created_at' | 'updated_at'>

// ---------------------------------------------------------------------------
// Order Delivery Methods
// ---------------------------------------------------------------------------
export interface OrderDeliveryMethod extends Timestamps {
  order_id: string
  delivery_method_id: number
  price: number
}

export type OrderDeliveryMethodPayload = Omit<OrderDeliveryMethod, 'created_at' | 'updated_at'>

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
export interface HealthStatus {
  status: string
}

// ---------------------------------------------------------------------------
// Backend FORUM — Users
// (GET / PUT / DELETE uniquement : pas de création depuis le backoffice)
// ---------------------------------------------------------------------------
export interface ForumUser extends Timestamps {
  id: string
  username: string
  firstname: string | null
  lastname: string | null
  email: string
}

// L'email est en lecture seule — absent du DTO de mise à jour.
export interface ForumUserUpdatePayload {
  username: string
  firstname: string
  lastname: string
}

// ---------------------------------------------------------------------------
// Backend FORUM — Categories
// ---------------------------------------------------------------------------
export interface ForumCategory extends Timestamps {
  id: number
  name: string
  description: string
}

export interface ForumCategoryPayload {
  name: string
  description: string
}

// ---------------------------------------------------------------------------
// Backend FORUM — Events
// (modèle minimal côté backend : pas de description, lieu ni statut)
// ---------------------------------------------------------------------------
export interface ForumEvent {
  id: number
  title: string
  date: string
}

export type ForumEventPayload = Omit<ForumEvent, 'id'>

// ---------------------------------------------------------------------------
// Backend FORUM — Talks
// ---------------------------------------------------------------------------
export interface Talk extends Timestamps {
  id: number
  title: string
  type: string
  status: string
  description: string
}

export type TalkCreatePayload = Omit<Talk, 'id' | 'created_at' | 'updated_at'>

// La mise à jour n'accepte que title et status.
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

// ---------------------------------------------------------------------------
// Backend TRAINING — Trainings
// (pas de created_at/updated_at exposés par l'API)
// ---------------------------------------------------------------------------
export interface Training {
  id: number
  name: string
  type: string
  mode_of_delivery: string
  duration: string
  minimum_number_of_participants: number
  maximum_number_of_participants: number
  location: string
}

// Seul `name` est obligatoire à la création.
export interface TrainingPayload {
  name: string
  type?: string
  mode_of_delivery?: string
  duration?: string
  minimum_number_of_participants?: number
  maximum_number_of_participants?: number
  location?: string
}

// Formes renvoyées par les sous-ressources de GET /trainings/{id}/*
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
