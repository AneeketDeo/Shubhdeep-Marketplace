import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', 'razorpay_enabled')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 -> no rows (depending on Supabase version)
      return NextResponse.json({ enabled: true });
    }

    if (!data) return NextResponse.json({ enabled: true });

    // value may be stored as JSON or string
    let enabled = true;
    try {
      if (typeof data.value === 'string') {
        enabled = JSON.parse(data.value).enabled;
      } else if (typeof data.value === 'object') {
        enabled = !!data.value.enabled;
      }
    } catch (e) {
      enabled = String(data.value) === 'true';
    }

    return NextResponse.json({ enabled });
  } catch (e) {
    return NextResponse.json({ enabled: true });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const enabled = !!body.enabled;

    // verify the requester is the configured admin
    try {
      const serverSupabase = await createServerClient();
      const {
        data: { user },
      } = await serverSupabase.auth.getUser();

      const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (!user || user.email !== adminEmail) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const payload = { key: 'razorpay_enabled', value: { enabled } };

    const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'key' });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, enabled });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
