/**
 * Settings API Routes
 * 
 * Handles CRUD operations for user settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  SettingInput, 
  SettingUpdateInput, 
  DEFAULT_SETTINGS,
  VALIDATION_RULES,
  type SettingCategory,
  type UserSetting
} from '@/lib/types/settings'

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as SettingCategory | null
    const grouped = searchParams.get('grouped') === 'true'

    let query = supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: settings, error } = await query

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // If no settings exist, create defaults
    if (!settings || settings.length === 0) {
      await createDefaultSettings(user.id, supabase)
      // Refetch after creating defaults
      const { data: newSettings } = await query
      return NextResponse.json({ 
        settings: grouped ? groupSettings(newSettings || []) : newSettings || []
      })
    }

    if (grouped) {
      return NextResponse.json({ settings: groupSettings(settings) })
    }

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/settings - Create new setting
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const settingInput: SettingInput = body

    // Validate input
    const validation = validateSetting(settingInput)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Check if setting already exists
    const { data: existing } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', user.id)
      .eq('category', settingInput.category)
      .eq('key', settingInput.key)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Setting already exists' }, { status: 409 })
    }

    // Create new setting
    const newSetting = {
      user_id: user.id,
      category: settingInput.category,
      key: settingInput.key,
      value: settingInput.value,
      type: settingInput.type || inferType(settingInput.value),
      display_name: settingInput.display_name,
      description: settingInput.description,
      is_public: settingInput.is_public || false,
      is_readonly: false,
      validation_rules: settingInput.validation_rules || {}
    }

    const { data: setting, error } = await supabase
      .from('user_settings')
      .insert(newSetting)
      .select()
      .single()

    if (error) {
      console.error('Error creating setting:', error)
      return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
    }

    return NextResponse.json({ setting }, { status: 201 })

  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/settings - Bulk update settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body as { settings: Array<{ category: string, key: string, value: any }> }

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 })
    }

    const results = []
    const errors = []

    // Process each setting update
    for (const setting of settings) {
      try {
        // Validate the setting
        const validation = validateSettingValue(setting.category as SettingCategory, setting.key, setting.value)
        if (!validation.valid) {
          errors.push({ category: setting.category, key: setting.key, error: validation.error })
          continue
        }

        // Update or create the setting
        const { data, error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            category: setting.category,
            key: setting.key,
            value: setting.value,
            type: inferType(setting.value)
          }, {
            onConflict: 'user_id,category,key'
          })
          .select()
          .single()

        if (error) {
          errors.push({ category: setting.category, key: setting.key, error: error.message })
        } else {
          results.push(data)
        }
      } catch (err) {
        errors.push({ category: setting.category, key: setting.key, error: 'Processing failed' })
      }
    }

    return NextResponse.json({ 
      updated: results.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Settings bulk update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions

async function createDefaultSettings(userId: string, supabase: any) {
  const defaultEntries = []

  // Convert DEFAULT_SETTINGS to database entries
  for (const [category, categorySettings] of Object.entries(DEFAULT_SETTINGS)) {
    for (const [key, value] of Object.entries(categorySettings)) {
      defaultEntries.push({
        user_id: userId,
        category,
        key,
        value,
        type: inferType(value),
        is_public: false,
        is_readonly: false,
        validation_rules: VALIDATION_RULES[category as SettingCategory]?.[key] || {}
      })
    }
  }

  const { error } = await supabase
    .from('user_settings')
    .insert(defaultEntries)

  if (error) {
    console.error('Error creating default settings:', error)
  }
}

function groupSettings(settings: UserSetting[]) {
  const grouped: Record<string, any> = {}

  for (const setting of settings) {
    if (!grouped[setting.category]) {
      grouped[setting.category] = {}
    }
    grouped[setting.category][setting.key] = {
      value: setting.value,
      type: setting.type,
      display_name: setting.display_name,
      description: setting.description,
      is_readonly: setting.is_readonly,
      updated_at: setting.updated_at
    }
  }

  return grouped
}

function validateSetting(input: SettingInput): { valid: boolean, error?: string } {
  if (!input.category || !input.key) {
    return { valid: false, error: 'Category and key are required' }
  }

  if (input.value === undefined || input.value === null) {
    return { valid: false, error: 'Value is required' }
  }

  return validateSettingValue(input.category, input.key, input.value)
}

function validateSettingValue(category: SettingCategory, key: string, value: any): { valid: boolean, error?: string } {
  const rules = VALIDATION_RULES[category]?.[key]
  if (!rules) return { valid: true }

  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    return { valid: false, error: `${key} is required` }
  }

  // Type check
  if (rules.type) {
    const actualType = typeof value
    if (actualType !== rules.type) {
      return { valid: false, error: `${key} must be of type ${rules.type}` }
    }
  }

  // Number validations
  if (rules.type === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return { valid: false, error: `${key} must be at least ${rules.min}` }
    }
    if (rules.max !== undefined && value > rules.max) {
      return { valid: false, error: `${key} must be at most ${rules.max}` }
    }
  }

  // String validations
  if (rules.type === 'string' || typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return { valid: false, error: `${key} must be at least ${rules.minLength} characters` }
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return { valid: false, error: `${key} must be at most ${rules.maxLength} characters` }
    }
  }

  // Enum check
  if (rules.enum && !rules.enum.includes(value)) {
    return { valid: false, error: `${key} must be one of: ${rules.enum.join(', ')}` }
  }

  return { valid: true }
}

function inferType(value: any): string {
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object' && value !== null) return 'object'
  return typeof value
}