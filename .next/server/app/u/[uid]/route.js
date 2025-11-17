"use strict";(()=>{var e={};e.id=999,e.ids=[999],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1127:(e,i,a)=>{a.r(i),a.d(i,{headerHooks:()=>f,originalPathname:()=>x,patchFetch:()=>h,requestAsyncStorage:()=>u,routeModule:()=>v,serverHooks:()=>g,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>b});var t={};a.r(t),a.d(t,{GET:()=>c,OPTIONS:()=>p});var r=a(5419),d=a(9108),s=a(9678),l=a(8070),o=a(6517);async function n(e,i,a={}){try{await o.p.from("pass_events").insert({uid:e,type:i,meta_json:a})}catch(e){console.error("Failed to log event:",e)}}async function c(e,{params:i}){try{let a=i.uid;if(!a)return l.Z.json({error:"UID parameter is required"},{status:400});let{data:t,error:r}=await o.p.from("members").select("*").eq("uid",a).single();if(r||!t)return l.Z.json({uid:a,tier:"GOLD",status:"not_found",error:"Member not found"},{status:404});if(await o.p.from("members").update({last_seen_at:new Date().toISOString()}).eq("uid",a),await n(a,"qr_scanned",{user_agent:e.headers.get("user-agent"),ip:e.headers.get("x-forwarded-for")||e.headers.get("x-real-ip")||"unknown",utm_source:e.nextUrl.searchParams.get("utm_source"),utm_medium:e.nextUrl.searchParams.get("utm_medium"),utm_campaign:e.nextUrl.searchParams.get("utm_campaign")}),(e.headers.get("accept")||"").includes("text/html")){t.profile_city&&t.profile_state&&t.profile_zip&&t.profile_gender&&t.profile_age;let e=Math.round([t.profile_city,t.profile_state,t.profile_zip,t.profile_gender,t.profile_age].filter(e=>e).length/5*100),i=`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HUSHH Gold Pass - ${t.name}</title>
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
              <div class="status-badge ${"active"===t.pass_status?"status-active":"status-voided"}">
                ${"active"===t.pass_status?"✓ VERIFIED ACTIVE":"✗ PASS VOIDED"}
              </div>
              <h1 class="brand-title">HUSHH</h1>
              <div class="tier-badge">GOLD PASS</div>
              <div class="member-name">${t.name}</div>
              <div class="member-since">Member since ${new Date(t.created_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
            </div>

            <!-- Contact Information -->
            <div class="card">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #d4b26f;">📋 Contact Information</h2>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Email Address</div>
                  <div class="detail-value">${t.email}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Phone Number</div>
                  <div class="detail-value">${t.phone_e164}</div>
                </div>
                <div class="detail-item full-width">
                  <div class="detail-label">Unique ID</div>
                  <div class="detail-value">${t.uid}</div>
                </div>
              </div>
            </div>

            <!-- Profile Information -->
            <div class="card profile-section">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #d4b26f;">👤 Profile Information</h2>
              
              <div class="completion-bar">
                <div class="completion-fill" style="width: ${e}%"></div>
              </div>
              <div class="completion-text">Profile ${e}% Complete</div>
              
              <div class="profile-grid">
                <div class="profile-item">
                  <div class="detail-label">City</div>
                  <div class="detail-value">${t.profile_city||"Not provided"}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">State</div>
                  <div class="detail-value">${t.profile_state||"Not provided"}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">ZIP Code</div>
                  <div class="detail-value">${t.profile_zip||"Not provided"}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">Gender</div>
                  <div class="detail-value">${t.profile_gender?t.profile_gender.charAt(0).toUpperCase()+t.profile_gender.slice(1):"Not provided"}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">Age</div>
                  <div class="detail-value">${t.profile_age||"Not provided"}</div>
                </div>
                <div class="profile-item">
                  <div class="detail-label">Last Updated</div>
                  <div class="detail-value">${t.profile_last_updated_at?new Date(t.profile_last_updated_at).toLocaleDateString():"Never"}</div>
                </div>
              </div>
            </div>

            <!-- Pass Details -->
            <div class="card tech-details">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #d4b26f;">🎫 Pass Details</h2>
              <div class="tech-item">
                <div class="detail-label">Pass Serial</div>
                <div class="detail-value">${t.pass_serial||"Not assigned"}</div>
              </div>
              <div class="tech-item">
                <div class="detail-label">Pass Status</div>
                <div class="detail-value" style="color: ${"active"===t.pass_status?"#22c55e":"#ef4444"};">
                  ${t.pass_status.toUpperCase()}
                </div>
              </div>
            </div>

            <!-- Activity Timeline -->
            <div class="card">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #d4b26f;">⏰ Activity</h2>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Created</div>
                  <div class="detail-value">${new Date(t.created_at).toLocaleString()}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Last Seen</div>
                  <div class="detail-value">${t.last_seen_at?new Date(t.last_seen_at).toLocaleString():"Just now"}</div>
                </div>
              </div>
            </div>

            <div class="timestamp-footer">
              QR Code scanned on ${new Date().toLocaleString()} • HUSHH Gold Pass MVP
            </div>
          </div>
        </body>
        </html>
      `;return new l.Z(i,{status:200,headers:{"Content-Type":"text/html","Cache-Control":"no-cache"}})}return l.Z.json({uid:t.uid,tier:"GOLD",status:t.pass_status,memberName:t.name,verified:"active"===t.pass_status})}catch(e){return console.error("Verification error:",e),l.Z.json({uid:i.uid,tier:"GOLD",status:"error",error:"Verification failed"},{status:500})}}async function p(){return l.Z.json({},{status:200})}let v=new r.AppRouteRouteModule({definition:{kind:d.x.APP_ROUTE,page:"/u/[uid]/route",pathname:"/u/[uid]",filename:"route",bundlePath:"app/u/[uid]/route"},resolvedPagePath:"/Users/ankitkumarsingh/Desktop/hushh social card/hushh-gold-pass-mvp/src/app/u/[uid]/route.ts",nextConfigOutput:"",userland:t}),{requestAsyncStorage:u,staticGenerationAsyncStorage:m,serverHooks:g,headerHooks:f,staticGenerationBailout:b}=v,x="/u/[uid]/route";function h(){return(0,s.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:m})}},6517:(e,i,a)=>{a.d(i,{p:()=>r});var t=a(9224);(0,t.eI)("https://ntwdvvzjkmabujwxlzej.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50d2R2dnpqa21hYnVqd3hsemVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MTM4NTcsImV4cCI6MjA0NzI4OTg1N30.vQCDCT-yJjOhBjCvJk7Q5mJGwpMjkKHqo7LDZgG3lBI");let r=(0,t.eI)("https://ntwdvvzjkmabujwxlzej.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})}};var i=require("../../../webpack-runtime.js");i.C(e);var a=e=>i(i.s=e),t=i.X(0,[638,206,224],()=>a(1127));module.exports=t})();