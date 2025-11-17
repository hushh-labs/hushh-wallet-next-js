"use strict";(()=>{var e={};e.id=999,e.ids=[999],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1127:(e,t,a)=>{a.r(t),a.d(t,{headerHooks:()=>b,originalPathname:()=>x,patchFetch:()=>v,requestAsyncStorage:()=>m,routeModule:()=>l,serverHooks:()=>g,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>f});var r={};a.r(r),a.d(r,{GET:()=>c,OPTIONS:()=>p});var s=a(5419),i=a(9108),n=a(9678),o=a(8070),d=a(6517);async function u(e,t,a={}){try{await d.p.from("pass_events").insert({uid:e,type:t,meta_json:a})}catch(e){console.error("Failed to log event:",e)}}async function c(e,{params:t}){try{let a=t.uid;if(!a)return o.Z.json({error:"UID parameter is required"},{status:400});let{data:r,error:s}=await d.p.from("members").select("uid, name, pass_status, created_at").eq("uid",a).single();if(s||!r)return o.Z.json({uid:a,tier:"GOLD",status:"not_found",error:"Member not found"},{status:404});if(await d.p.from("members").update({last_seen_at:new Date().toISOString()}).eq("uid",a),await u(a,"qr_scanned",{user_agent:e.headers.get("user-agent"),ip:e.headers.get("x-forwarded-for")||e.headers.get("x-real-ip")||"unknown",utm_source:e.nextUrl.searchParams.get("utm_source"),utm_medium:e.nextUrl.searchParams.get("utm_medium"),utm_campaign:e.nextUrl.searchParams.get("utm_campaign")}),(e.headers.get("accept")||"").includes("text/html")){let e=`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HUSHH Gold Pass Verification</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #75410a 0%, #d4b26f 100%);
              color: #fff;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .card {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              padding: 32px;
              text-align: center;
              max-width: 400px;
              width: 100%;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 16px;
            }
            .status-active {
              background: rgba(34, 197, 94, 0.2);
              color: #22c55e;
              border: 1px solid rgba(34, 197, 94, 0.3);
            }
            .status-voided {
              background: rgba(239, 68, 68, 0.2);
              color: #ef4444;
              border: 1px solid rgba(239, 68, 68, 0.3);
            }
            h1 {
              margin: 0 0 8px 0;
              font-size: 28px;
              font-weight: 700;
            }
            .tier {
              font-size: 18px;
              color: #d4b26f;
              margin: 0 0 24px 0;
            }
            .member-name {
              font-size: 20px;
              margin: 0 0 16px 0;
            }
            .timestamp {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.7);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="status-badge ${"active"===r.pass_status?"status-active":"status-voided"}">
              ${"active"===r.pass_status?"✓ VALID":"✗ VOIDED"}
            </div>
            <h1>HUSHH</h1>
            <div class="tier">GOLD PASS</div>
            <div class="member-name">${r.name}</div>
            <div class="timestamp">
              Member since ${new Date(r.created_at).toLocaleDateString()}
            </div>
          </div>
        </body>
        </html>
      `;return new o.Z(e,{status:200,headers:{"Content-Type":"text/html","Cache-Control":"no-cache"}})}return o.Z.json({uid:r.uid,tier:"GOLD",status:r.pass_status,memberName:r.name,verified:"active"===r.pass_status})}catch(e){return console.error("Verification error:",e),o.Z.json({uid:t.uid,tier:"GOLD",status:"error",error:"Verification failed"},{status:500})}}async function p(){return o.Z.json({},{status:200})}let l=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/u/[uid]/route",pathname:"/u/[uid]",filename:"route",bundlePath:"app/u/[uid]/route"},resolvedPagePath:"/Users/ankitkumarsingh/Desktop/hushh social card/hushh-gold-pass-mvp/src/app/u/[uid]/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:m,staticGenerationAsyncStorage:h,serverHooks:g,headerHooks:b,staticGenerationBailout:f}=l,x="/u/[uid]/route";function v(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:h})}},6517:(e,t,a)=>{a.d(t,{p:()=>s});var r=a(9224);(0,r.eI)("https://xicjnlrlbvqzlhtjzuuo.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpY2pubHJsYnZxemxodGp6dXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODg4MDIsImV4cCI6MjA3ODY2NDgwMn0.UMRHaXfrnpTPJYrvFBxOJbEoW6GgMD3bsyz0ziwnAr4");let s=(0,r.eI)("https://xicjnlrlbvqzlhtjzuuo.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[638,431],()=>a(1127));module.exports=r})();