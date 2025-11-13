import { NextRequest, NextResponse } from 'next/server'
import { getFormData, upsertFormData } from '@/utils/forms/operations'
import { getCurrentUser } from '@/utils/auth/anonymous'
import { FormKey } from '@/types/forms'

// GET /api/forms/[formKey] - Load form data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formKey: string }> }
) {
  try {
    const resolvedParams = await params
    const formKey = resolvedParams.formKey as FormKey
    
    // Get current user
    const user = await getCurrentUser()
    
    // Fetch form data
    const formData = await getFormData(formKey, user.userId)
    
    return NextResponse.json({
      success: true,
      data: {
        data: formData?.data || {},
        visibility: formData?.visibility || {},
        userId: user.userId
      }
    })
  } catch (error) {
    console.error('Error loading form data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load form data' },
      { status: 500 }
    )
  }
}

// POST /api/forms/[formKey] - Save form data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formKey: string }> }
) {
  try {
    const resolvedParams = await params
    const formKey = resolvedParams.formKey as FormKey
    const { data, visibility } = await request.json()
    
    // Get current user
    const user = await getCurrentUser()
    
    // Save form data
    await upsertFormData(formKey, user.userId, data, visibility)
    
    return NextResponse.json({
      success: true,
      message: 'Form data saved successfully'
    })
  } catch (error) {
    console.error('Error saving form data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save form data' },
      { status: 500 }
    )
  }
}
