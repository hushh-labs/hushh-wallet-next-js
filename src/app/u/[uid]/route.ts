import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Log event helper
async function logEvent(uid: string, type: string, meta: any = {}) {
  try {
    await supabaseAdmin
      .from('pass_events')
      .insert({
        uid,
        type,
        meta_json: meta
      });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const uid = params.uid;

    if (!uid) {
      return NextResponse.json(
        { error: 'UID parameter is required' },
        { status: 400 }
      );
    }

    // Get complete member data for MVP
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('uid', uid)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { 
          uid, 
          tier: 'GOLD', 
          status: 'not_found',
          error: 'Member not found'
        },
        { status: 404 }
      );
    }

    // Update last seen timestamp
    await supabaseAdmin
      .from('members')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('uid', uid);

    // Log QR scan event
    await logEvent(uid, 'qr_scanned', {
      user_agent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 'unknown',
      utm_source: request.nextUrl.searchParams.get('utm_source'),
      utm_medium: request.nextUrl.searchParams.get('utm_medium'),
      utm_campaign: request.nextUrl.searchParams.get('utm_campaign')
    });

    // Determine response based on Accept header
    const acceptHeader = request.headers.get('accept') || '';
    
    if (acceptHeader.includes('text/html')) {
      // Format profile completion status
      const profileComplete = !!(member.profile_city && member.profile_state && member.profile_zip && member.profile_gender && member.profile_age);
      const profileCompletionPercent = Math.round(
        [member.profile_city, member.profile_state, member.profile_zip, member.profile_gender, member.profile_age]
          .filter(field => field).length / 5 * 100
      );

      const formattedGender = member.profile_gender
        ? member.profile_gender.charAt(0).toUpperCase() + member.profile_gender.slice(1)
        : null;
      const locationDisplay = member.profile_city && member.profile_state
        ? `${member.profile_city}, ${member.profile_state}`
        : member.profile_city || member.profile_state || 'Awaiting city signal';
      const demographicDisplay = formattedGender && member.profile_age
        ? `${formattedGender}, ${member.profile_age}`
        : formattedGender || (member.profile_age ? `${member.profile_age} yrs` : 'Awaiting demographic signal');
      const readinessScore = Math.max(55, Math.min(97, Math.round(profileCompletionPercent * 0.65 + 45)));
      const readinessNarrative = profileCompletionPercent >= 80
        ? 'Concierge pod is fully calibrated.'
        : profileCompletionPercent >= 50
          ? 'Core verification is online; add more signals for bespoke prep.'
          : 'Limited signals on file — encourage profile completion.';
      const passStatusLabel = (member.pass_status || 'pending').toUpperCase();
      const verificationCopy = member.pass_status === 'active'
        ? 'Live Gold pass confirmed for presentation.'
        : 'Pass currently inactive. Route guest to concierge for assistance.';
      const hostGuidance = member.pass_status === 'active'
        ? 'Hosts may grant Gold privileges once this pass is scanned alongside ID verification.'
        : 'Do not grant access. Ask the guest to contact concierge for reactivation.';
      const membershipDate = new Date(member.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const lastSeenDisplay = member.last_seen_at
        ? new Date(member.last_seen_at).toLocaleString()
        : 'Just now';
      const conciergeEmailLink = `mailto:concierge@hushh.club?subject=${encodeURIComponent(`HUSHH Gold ${member.uid}`)}`;

      // Return comprehensive HTML response for MVP
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HUSHH Gold Pass - ${member.name}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
              margin: 0;
              padding: 16px;
              background: linear-gradient(135deg, #75410a 0%, #d4b26f 50%, #f4e6c9 100%);
              color: #fff;
              min-height: 100vh;
              line-height: 1.5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(15px);
              border-radius: 20px;
              padding: 24px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .header-card {
              text-align: center;
              position: relative;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 700;
              margin-bottom: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .status-active {
              background: rgba(34, 197, 94, 0.2);
              color: #22c55e;
              border: 1px solid rgba(34, 197, 94, 0.4);
            }
            .status-voided {
              background: rgba(239, 68, 68, 0.2);
              color: #ef4444;
              border: 1px solid rgba(239, 68, 68, 0.4);
            }
            .brand-title {
              margin: 0;
              font-size: 32px;
              font-weight: 800;
              background: linear-gradient(45deg, #fff, #d4b26f);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .tier-badge {
              font-size: 16px;
              color: #d4b26f;
              font-weight: 600;
              margin: 8px 0 20px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .member-name {
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 8px 0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            .member-since {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.7);
              font-weight: 500;
            }
            .aura-card {
              position: relative;
              overflow: hidden;
              background: linear-gradient(140deg, rgba(117, 65, 10, 0.35), rgba(158, 107, 35, 0.2), rgba(255, 255, 255, 0.04));
              border: 1px solid rgba(255, 255, 255, 0.25);
            }
            .aura-card::after {
              content: '';
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.25), transparent 55%);
              opacity: 0.6;
              pointer-events: none;
            }
            .aura-card > * {
              position: relative;
              z-index: 1;
            }
            .insights-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 12px;
              margin-top: 16px;
            }
            .stat-card {
              padding: 14px;
              border-radius: 16px;
              background: rgba(0, 0, 0, 0.25);
              border: 1px solid rgba(255, 255, 255, 0.15);
            }
            .stat-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.25em;
              color: rgba(255, 255, 255, 0.55);
            }
            .stat-value {
              font-size: 26px;
              font-weight: 700;
              margin: 4px 0;
            }
            .stat-hint {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.7);
            }
            .tag-row {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 18px;
            }
            .tag {
              padding: 8px 14px;
              border-radius: 999px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              font-size: 12px;
              background: rgba(0, 0, 0, 0.2);
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-top: 20px;
            }
            .detail-item {
              background: rgba(255, 255, 255, 0.05);
              padding: 16px;
              border-radius: 12px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .detail-item.full-width {
              grid-column: 1 / -1;
            }
            .detail-label {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.6);
              text-transform: uppercase;
              font-weight: 600;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .detail-subtext {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.65);
              margin-bottom: 12px;
            }
            .detail-value {
              font-size: 16px;
              font-weight: 600;
              color: #fff;
              word-break: break-all;
            }
            .profile-section {
              margin-top: 8px;
            }
            .completion-bar {
              background: rgba(255, 255, 255, 0.1);
              height: 8px;
              border-radius: 4px;
              overflow: hidden;
              margin-bottom: 12px;
            }
            .completion-fill {
              height: 100%;
              background: linear-gradient(90deg, #22c55e, #16a34a);
              transition: width 0.3s ease;
            }
            .completion-text {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.8);
              font-weight: 500;
            }
            .profile-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-top: 16px;
            }
            .profile-item {
              background: rgba(255, 255, 255, 0.03);
              padding: 12px;
              border-radius: 8px;
              border: 1px solid rgba(255, 255, 255, 0.08);
            }
            .observation-card {
              border: 1px solid rgba(255, 255, 255, 0.2);
              background: rgba(0, 0, 0, 0.25);
            }
            .observation-list {
              list-style: none;
              padding: 0;
              margin: 16px 0 0 0;
            }
            .observation-list li {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              padding: 10px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .observation-list li:last-child {
              border-bottom: none;
            }
            .observation-list .label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              color: rgba(255, 255, 255, 0.5);
            }
            .observation-list .value {
              font-weight: 600;
              color: #fff;
            }
            .tech-details {
              margin-top: 8px;
            }
            .tech-item {
              background: rgba(0, 0, 0, 0.1);
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 8px;
              font-family: 'Monaco', 'Menlo', monospace;
              font-size: 12px;
            }
            .note-card {
              border-radius: 16px;
              border: 1px dashed rgba(255, 255, 255, 0.3);
              background: rgba(255, 255, 255, 0.04);
              padding: 16px;
              margin-top: 16px;
            }
            .host-note {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.75);
            }
            .cta-row {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              margin-top: 18px;
            }
            .cta-button {
              flex: 1;
              text-align: center;
              padding: 12px 18px;
              border-radius: 12px;
              background: rgba(244, 206, 138, 0.15);
              border: 1px solid rgba(244, 206, 138, 0.4);
              color: #fff;
              font-weight: 600;
              text-decoration: none;
            }
            .cta-link {
              padding: 12px 18px;
              border-radius: 12px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: rgba(255, 255, 255, 0.9);
              text-decoration: none;
            }
            .timestamp-footer {
              text-align: center;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.5);
              margin-top: 20px;
              padding-top: 16px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            @media (max-width: 480px) {
              .details-grid, .profile-grid {
                grid-template-columns: 1fr;
              }
              .container { padding: 12px; }
              .card { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header Card -->
            <div class="card header-card">
              <div class="status-badge ${member.pass_status === 'active' ? 'status-active' : 'status-voided'}">
                ${member.pass_status === 'active' ? '✓ VERIFIED ACTIVE' : '✗ PASS VOIDED'}
              </div>
              <h1 class="brand-title">HUSHH</h1>
              <div class="tier-badge">GOLD PASS</div>
              <div class="member-name">${member.name}</div>
              <div class="member-since">Member since ${membershipDate}</div>
            </div>

            <!-- Verification Snapshot -->
            <div class="card aura-card">
              <h2 style="margin: 0; font-size: 18px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.7);">Verification Snapshot</h2>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.75);">Concierge view refreshed upon scan.</p>
              <div class="insights-grid">
                <div class="stat-card">
                  <div class="stat-label">Concierge readiness</div>
                  <div class="stat-value">${readinessScore}%</div>
                  <div class="stat-hint">${readinessNarrative}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Profile depth</div>
                  <div class="stat-value">${profileCompletionPercent}%</div>
                  <div class="stat-hint">${profileComplete ? 'All priority signals in place.' : 'Invite member to finalize remaining details.'}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Verification</div>
                  <div class="stat-value">${passStatusLabel}</div>
                  <div class="stat-hint">${verificationCopy}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Last seen</div>
                  <div class="stat-value" style="font-size:18px;">${lastSeenDisplay}</div>
                  <div class="stat-hint">Automatic audit trail from QR.</div>
                </div>
              </div>
              <p class="stat-hint">Primary locale: ${locationDisplay}. Demographic cue: ${demographicDisplay}.</p>
              <div class="tag-row">
                <div class="tag">UID ${member.uid}</div>
                <div class="tag">${profileComplete ? 'Profile locked-in' : 'Awaiting more context'}</div>
                <div class="tag">${member.pass_status === 'active' ? 'Instant entry ready' : 'Activation required'}</div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="card">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #d4b26f;">📋 Contact Information</h2>
              <p class="detail-subtext">Cross-check these details with the Apple Wallet pass before granting in-person privileges.</p>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Email Address</div>
                  <div class="detail-value">${member.email}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Phone Number</div>
                  <div class="detail-value">${member.phone_e164}</div>
                </div>
                <div class="detail-item full-width">
                  <div class="detail-label">Unique ID</div>
                  <div class="detail-value">${member.uid}</div>
                </div>
              </div>
            </div>

            <!-- Profile Information -->
            <div class="card profile-section">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #d4b26f;">👤 Profile Information</h2>
              
              <div class="completion-bar">
                <div class="completion-fill" style="width: ${profileCompletionPercent}%"></div>
              </div>
              <div class="completion-text">Profile ${profileCompletionPercent}% Complete</div>
              
              <div class="profile-grid">
                <div class="profile-item">
                  <div class="detail-label">City</div>
                  <div class="detail-value">${member.profile_city || 'Not provided'}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">State</div>
                  <div class="detail-value">${member.profile_state || 'Not provided'}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">ZIP Code</div>
                  <div class="detail-value">${member.profile_zip || 'Not provided'}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">Gender</div>
                  <div class="detail-value">${member.profile_gender ? member.profile_gender.charAt(0).toUpperCase() + member.profile_gender.slice(1) : 'Not provided'}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">Age</div>
                  <div class="detail-value">${member.profile_age || 'Not provided'}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">Last Updated</div>
                  <div class="detail-value">${member.profile_last_updated_at ? new Date(member.profile_last_updated_at).toLocaleDateString() : 'Never'}</div>
                </div>
              </div>
            </div>

            <!-- Concierge Observations -->
            <div class="card observation-card">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #d4b26f;">🪄 Concierge Observations</h2>
              <ul class="observation-list">
                <li>
                  <div class="label">Locale focus</div>
                  <div class="value">${locationDisplay}</div>
                </li>
                <li>
                  <div class="label">Demographic cue</div>
                  <div class="value">${demographicDisplay}</div>
                </li>
                <li>
                  <div class="label">Pass prep</div>
                  <div class="value">${member.pass_status === 'active' ? 'Apple Wallet • Verified' : 'Pending concierge action'}</div>
                </li>
                <li>
                  <div class="label">Signals logged</div>
                  <div class="value">${profileCompletionPercent}% coverage</div>
                </li>
              </ul>
              <div class="note-card">
                <p class="host-note">${hostGuidance}</p>
              </div>
              <div class="cta-row">
                <a href="${conciergeEmailLink}" class="cta-button">Message concierge pod</a>
                <a href="/" class="cta-link">Return to hushh.gold</a>
              </div>
            </div>

            <!-- Pass Details -->
            <div class="card tech-details">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #d4b26f;">🎫 Pass Details</h2>
              <div class="tech-item">
                <div class="detail-label">Pass Serial</div>
                <div class="detail-value">${member.pass_serial || 'Not assigned'}</div>
              </div>
              <div class="tech-item">
                <div class="detail-label">Pass Status</div>
                <div class="detail-value" style="color: ${member.pass_status === 'active' ? '#22c55e' : '#ef4444'};">
                  ${passStatusLabel}
                </div>
              </div>
              <div class="tech-item">
                <div class="detail-label">Verification copy</div>
                <div class="detail-value">${verificationCopy}</div>
              </div>
              <div class="note-card">
                <p class="host-note">Serials are minted once per member. Match the UID + serial on the pass before applying benefits.</p>
              </div>
            </div>

            <!-- Activity Timeline -->
            <div class="card">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #d4b26f;">⏰ Activity</h2>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Created</div>
                  <div class="detail-value">${new Date(member.created_at).toLocaleString()}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Last Seen</div>
                  <div class="detail-value">${lastSeenDisplay}</div>
                </div>
              </div>
            </div>

            <div class="timestamp-footer">
              QR Code scanned on ${new Date().toLocaleString()} • HUSHH Gold Pass MVP
            </div>
          </div>
        </body>
        </html>
      `;
      
      return new NextResponse(htmlResponse, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Return JSON response for API calls
    return NextResponse.json({
      uid: member.uid,
      tier: 'GOLD',
      status: member.pass_status,
      memberName: member.name,
      verified: member.pass_status === 'active'
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { 
        uid: params.uid,
        tier: 'GOLD',
        status: 'error',
        error: 'Verification failed'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
