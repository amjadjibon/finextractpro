/**
 * Individual Setting API Routes
 * 
 * Handles CRUD operations for individual settings by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SettingUpdateInput, VALIDATION_RULES, type SettingCategory } from '@/lib/types/settings'

// GET /api/settings/[id] - Get specific setting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: setting, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
      }
      console.error('Error fetching setting:', error)
      return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
    }

    return NextResponse.json({ setting })

  } catch (error) {
    console.error('Setting API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/settings/[id] - Update specific setting
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, get the existing setting to validate ownership and readonly status
    const { data: existingSetting, error: fetchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
    }

    // Check if setting is readonly
    if (existingSetting.is_readonly) {
      return NextResponse.json({ error: 'Setting is readonly and cannot be modified' }, { status: 403 })
    }

    const body = await request.json()
    const updateInput: SettingUpdateInput = body

    // Validate the new value if provided
    if (updateInput.value !== undefined) {
      const validation = validateSettingValue(
        existingSetting.category as SettingCategory,
        existingSetting.key,
        updateInput.value
      )
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (updateInput.value !== undefined) {
      updateData.value = updateInput.value
      updateData.type = inferType(updateInput.value)
    }
    if (updateInput.display_name !== undefined) {
      updateData.display_name = updateInput.display_name
    }
    if (updateInput.description !== undefined) {
      updateData.description = updateInput.description
    }
    if (updateInput.is_public !== undefined) {
      updateData.is_public = updateInput.is_public
    }
    if (updateInput.validation_rules !== undefined) {
      updateData.validation_rules = updateInput.validation_rules
    }

    // Update the setting
    const { data: setting, error: updateError } = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating setting:', updateError)
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
    }

    return NextResponse.json({ setting })

  } catch (error) {
    console.error('Setting update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/settings/[id] - Delete specific setting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if setting exists and is owned by user
    const { data: existingSetting, error: fetchError } = await supabase
      .from('user_settings')
      .select('is_readonly')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
    }

    // Check if setting is readonly
    if (existingSetting.is_readonly) {
      return NextResponse.json({ error: 'Setting is readonly and cannot be deleted' }, { status: 403 })
    }

    // Delete the setting
    const { error: deleteError } = await supabase
      .from('user_settings')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting setting:', deleteError)
      return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Setting deleted successfully' })

  } catch (error) {
    console.error('Setting delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions

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