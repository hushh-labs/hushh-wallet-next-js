import { NextRequest, NextResponse } from 'next/server'
import { getLegacyCardData } from '@/utils/legacy/operations'

// GET /api/legacy/card - Get legacy card data for owner view
export async function GET(request: NextRequest) {
  try {
    const data = await getLegacyCardData()
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'no_card' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error getting legacy card data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load legacy card' },
      { status: 500 }
    )
  }
}
