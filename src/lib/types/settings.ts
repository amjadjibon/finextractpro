/**
 * Settings Types and Interfaces
 * 
 * Defines the structure for user settings and preferences
 */

export type SettingType = 'string' | 'number' | 'boolean' | 'object' | 'array'

export type SettingCategory = 
  | 'profile' 
  | 'notifications' 
  | 'ai' 
  | 'processing' 
  | 'display' 
  | 'security' 
  | 'integrations'
  | 'advanced'

// Base setting structure
export interface UserSetting {
  id: string
  user_id: string
  category: SettingCategory
  key: string
  value: any
  type: SettingType
  display_name?: string
  description?: string
  is_public: boolean
  is_readonly: boolean
  validation_rules: Record<string, any>
  created_at: string
  updated_at: string
}

// Setting input for create/update operations
export interface SettingInput {
  category: SettingCategory
  key: string
  value: any
  type?: SettingType
  display_name?: string
  description?: string
  is_public?: boolean
  validation_rules?: Record<string, any>
}

// Setting update input (partial)
export interface SettingUpdateInput {
  value?: any
  display_name?: string
  description?: string
  is_public?: boolean
  validation_rules?: Record<string, any>
}

// Grouped settings by category
export interface SettingsGroup {
  category: SettingCategory
  settings: Record<string, {
    value: any
    type: SettingType
    display_name?: string
    description?: string
    is_readonly: boolean
    updated_at: string
  }>
}

// Setting definitions for different categories
export interface ProfileSettings {
  display_name: string
  email_notifications: boolean
  timezone: string
  language: string
  avatar_url?: string
  bio?: string
}

export interface NotificationSettings {
  email_processing_complete: boolean
  email_processing_failed: boolean
  email_weekly_summary: boolean
  push_notifications: boolean
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

export interface AISettings {
  preferred_provider: 'openai' | 'google' | 'groq'
  preferred_model?: string
  confidence_threshold: number
  auto_process_uploads: boolean
  save_processing_history: boolean
  enable_vision_processing: boolean
}

export interface ProcessingSettings {
  max_file_size_mb: number
  auto_detect_document_type: boolean
  default_template_id?: string
  keep_original_files: boolean
  processing_timeout_minutes: number
  batch_processing_enabled: boolean
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system'
  density: 'comfortable' | 'compact'
  sidebar_collapsed: boolean
  show_confidence_scores: boolean
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  number_format: 'US' | 'EU' | 'international'
}

export interface SecuritySettings {
  two_factor_enabled: boolean
  session_timeout_minutes: number
  login_notifications: boolean
  data_retention_days: number
  allow_data_export: boolean
}

export interface IntegrationSettings {
  webhook_url?: string
  api_access_enabled: boolean
  export_formats: string[]
  auto_backup_enabled: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
}

export interface AdvancedSettings {
  debug_mode: boolean
  beta_features: boolean
  telemetry_enabled: boolean
  cache_enabled: boolean
  experimental_ai_models: boolean
}

// Complete user settings interface
export interface UserSettings {
  profile: ProfileSettings
  notifications: NotificationSettings
  ai: AISettings
  processing: ProcessingSettings
  display: DisplaySettings
  security: SecuritySettings
  integrations: IntegrationSettings
  advanced: AdvancedSettings
}

// Default settings values
export const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    display_name: '',
    email_notifications: true,
    timezone: 'UTC',
    language: 'en',
    bio: ''
  },
  notifications: {
    email_processing_complete: true,
    email_processing_failed: true,
    email_weekly_summary: false,
    push_notifications: true,
    notification_frequency: 'immediate'
  },
  ai: {
    preferred_provider: 'openai',
    confidence_threshold: 85,
    auto_process_uploads: true,
    save_processing_history: true,
    enable_vision_processing: true
  },
  processing: {
    max_file_size_mb: 10,
    auto_detect_document_type: true,
    keep_original_files: true,
    processing_timeout_minutes: 5,
    batch_processing_enabled: false
  },
  display: {
    theme: 'system',
    density: 'comfortable',
    sidebar_collapsed: false,
    show_confidence_scores: true,
    date_format: 'MM/DD/YYYY',
    number_format: 'US'
  },
  security: {
    two_factor_enabled: false,
    session_timeout_minutes: 480, // 8 hours
    login_notifications: true,
    data_retention_days: 365,
    allow_data_export: true
  },
  integrations: {
    api_access_enabled: false,
    export_formats: ['json', 'csv'],
    auto_backup_enabled: false,
    backup_frequency: 'weekly'
  },
  advanced: {
    debug_mode: false,
    beta_features: false,
    telemetry_enabled: true,
    cache_enabled: true,
    experimental_ai_models: false
  }
}

// Setting validation schemas
export const VALIDATION_RULES = {
  profile: {
    display_name: { required: true, minLength: 1, maxLength: 100 },
    timezone: { required: true, enum: ['UTC', 'US/Eastern', 'US/Central', 'US/Mountain', 'US/Pacific', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'] },
    language: { required: true, enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'] }
  },
  ai: {
    preferred_provider: { required: true, enum: ['openai', 'google', 'groq'] },
    confidence_threshold: { required: true, min: 0, max: 100, type: 'number' }
  },
  processing: {
    max_file_size_mb: { required: true, min: 1, max: 100, type: 'number' },
    processing_timeout_minutes: { required: true, min: 1, max: 30, type: 'number' }
  },
  security: {
    session_timeout_minutes: { required: true, min: 15, max: 1440, type: 'number' },
    data_retention_days: { required: true, min: 30, max: 2555, type: 'number' } // max ~7 years
  }
}

// Helper functions
export function getSettingDisplayName(category: SettingCategory, key: string): string {
  const displayNames: Record<SettingCategory, Record<string, string>> = {
    profile: {
      display_name: 'Display Name',
      email_notifications: 'Email Notifications',
      timezone: 'Timezone',
      language: 'Language',
      bio: 'Bio'
    },
    notifications: {
      email_processing_complete: 'Email on Processing Complete',
      email_processing_failed: 'Email on Processing Failed',
      email_weekly_summary: 'Weekly Summary Email',
      push_notifications: 'Push Notifications',
      notification_frequency: 'Notification Frequency'
    },
    ai: {
      preferred_provider: 'Preferred AI Provider',
      preferred_model: 'Preferred Model',
      confidence_threshold: 'Confidence Threshold',
      auto_process_uploads: 'Auto-process Uploads',
      save_processing_history: 'Save Processing History',
      enable_vision_processing: 'Enable Vision Processing'
    },
    processing: {
      max_file_size_mb: 'Max File Size (MB)',
      auto_detect_document_type: 'Auto-detect Document Type',
      default_template_id: 'Default Template',
      keep_original_files: 'Keep Original Files',
      processing_timeout_minutes: 'Processing Timeout (minutes)',
      batch_processing_enabled: 'Batch Processing'
    },
    display: {
      theme: 'Theme',
      density: 'Density',
      sidebar_collapsed: 'Sidebar Collapsed',
      show_confidence_scores: 'Show Confidence Scores',
      date_format: 'Date Format',
      number_format: 'Number Format'
    },
    security: {
      two_factor_enabled: 'Two-Factor Authentication',
      session_timeout_minutes: 'Session Timeout (minutes)',
      login_notifications: 'Login Notifications',
      data_retention_days: 'Data Retention (days)',
      allow_data_export: 'Allow Data Export'
    },
    integrations: {
      webhook_url: 'Webhook URL',
      api_access_enabled: 'API Access',
      export_formats: 'Export Formats',
      auto_backup_enabled: 'Auto-backup',
      backup_frequency: 'Backup Frequency'
    },
    advanced: {
      debug_mode: 'Debug Mode',
      beta_features: 'Beta Features',
      telemetry_enabled: 'Telemetry',
      cache_enabled: 'Cache',
      experimental_ai_models: 'Experimental AI Models'
    }
  }
  
  return displayNames[category]?.[key] ?? key
}

export function getSettingDescription(category: SettingCategory, key: string): string {
  const descriptions: Record<SettingCategory, Record<string, string>> = {
    profile: {
      display_name: 'Your display name shown throughout the application',
      email_notifications: 'Receive email notifications for various events',
      timezone: 'Your preferred timezone for date/time display',
      language: 'Application language preference'
    },
    ai: {
      preferred_provider: 'Default AI provider for document processing',
      confidence_threshold: 'Minimum confidence score to accept AI extractions',
      auto_process_uploads: 'Automatically process documents upon upload',
      enable_vision_processing: 'Enable AI processing of image documents'
    },
    processing: {
      max_file_size_mb: 'Maximum allowed file size for uploads',
      processing_timeout_minutes: 'Maximum time to wait for AI processing',
      keep_original_files: 'Store original files after processing'
    },
    security: {
      session_timeout_minutes: 'Automatically log out after this period of inactivity',
      data_retention_days: 'How long to keep your processed documents'
    },
    display: {
      theme: 'Choose between light, dark, or system theme',
      show_confidence_scores: 'Display AI confidence scores in the interface'
    },
    notifications: {
      notification_frequency: 'How often to receive notification emails'
    },
    integrations: {
      webhook_url: 'URL to receive processing notifications',
      export_formats: 'Available formats for data export'
    },
    advanced: {
      debug_mode: 'Enable detailed logging and debugging features',
      beta_features: 'Access to experimental features'
    }
  }
  
  return descriptions[category]?.[key] ?? ''
}