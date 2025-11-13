import { NextRequest, NextResponse } from 'next/server'
import { getDashboardData } from '@/utils/dashboard/service'

// GET /api/dashboard - Get dashboard data
export async function GET(request: NextRequest) {
  try {
    const data = await getDashboardData()
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error getting dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}
