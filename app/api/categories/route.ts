import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, color')
      .order('name')
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[GET /api/categories]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
