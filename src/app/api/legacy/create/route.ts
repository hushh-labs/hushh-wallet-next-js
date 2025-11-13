import { NextRequest, NextResponse } from 'next/server'
import { getLegacyCreateData, upsertLegacyCard, validateLegacyCardPayload } from '@/utils/legacy/operations'
import { LegacyCardPayload } from '@/types/legacy'

// GET /api/legacy/create - Get legacy card creation data
export async function GET(request: NextRequest) {
  try {
    const data = await getLegacyCreateData()
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error getting legacy create data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load legacy card data' },
      { status: 500 }
    )
  }
}

// POST /api/legacy/create - Create legacy card
export async function POST(request: NextRequest) {
  try {
    const payload: LegacyCardPayload = await request.json()
    
    // Get create data for validation
    const createData = await getLegacyCreateData()
    
    // Validate payload
    const validation = validateLegacyCardPayload(payload, createData.dimensions)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }
    
    // Create/update legacy card
    const card = await upsertLegacyCard(createData.user.userId, payload)
    
    return NextResponse.json({
      success: true,
      data: { card }
    })
  } catch (error) {
    console.error('Error creating legacy card:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create legacy card' },
      { status: 500 }
    )
  }
}
