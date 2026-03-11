function D(){const n=document.getElementById("socialModal"),a=document.getElementById("socialModalOverlay");n?.classList.add("active"),a?.classList.add("active"),document.body.style.overflow="hidden"}function w(){const n=document.getElementById("socialModal"),a=document.getElementById("socialModalOverlay");n?.classList.remove("active"),a?.classList.remove("active"),document.body.style.overflow=""}function B(n){navigator.clipboard.writeText(n).then(()=>{const a=document.getElementById("copyToast");a&&(a.textContent=`${n} 已复制 / Copied`,a.classList.add("active"),setTimeout(()=>{a.classList.remove("active")},2e3))}).catch(a=>{console.error("Copy failed:",a)})}document.addEventListener("keydown",n=>{n.key==="Escape"&&w()});window.openSocialModal=D;window.closeSocialModal=w;window.copyEmail=B;function b(){if(typeof gsap>"u"||typeof ScrollTrigger>"u"){setTimeout(b,100);return}gsap.registerPlugin(ScrollTrigger);const n=document.querySelectorAll(".about-page section");if(n.length<=1||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const c={HIDDEN:"hidden",ACTIVE:"active"},l=Array.from(n).map(()=>({phase:c.HIDDEN,isAtTop:!0,isAtBottom:!1,wrapper:null}));l[0].phase=c.ACTIVE;let s=0,d=!1,u=0;const y=400,E=()=>window.innerWidth<=768;function A(){n.forEach(e=>{const t=e.querySelector(".section-scroll-wrapper");if(t){const i=t.querySelector(".section-scroll-content");i&&Array.from(i.children).forEach(r=>e.appendChild(r)),t.remove()}const o=e.querySelector(".blur-overlay");o&&o.remove()}),ScrollTrigger.getAll().forEach(e=>e.kill())}A(),n.forEach((e,t)=>{e.setAttribute("data-gsap","true"),e.style.cssText=`
          z-index: ${(t+1)*10};
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          opacity: 1;
          overflow: hidden;
          background-color: var(--bg-color, #050505);
        `});const g=[];n.forEach((e,t)=>{const o=Array.from(e.children),i=document.createElement("div");i.className="section-scroll-wrapper",i.style.cssText=`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow-y: ${t===0?"auto":"hidden"};
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          z-index: 1;
        `;const r=document.createElement("div");if(r.className="section-scroll-content",r.style.cssText=`
          min-height: 100vh;
          padding: ${E()?"100px 5% 80px":"100px 10% 50px 140px"};
          box-sizing: border-box;
        `,o.forEach(S=>r.appendChild(S)),i.appendChild(r),e.appendChild(i),g.push(i),l[t].wrapper=i,t===n.length-1)return;const p=document.createElement("div");p.className="blur-overlay",p.style.cssText=`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(0px);
          background: rgba(5, 5, 5, 0);
          pointer-events: none;
          z-index: 9999;
          transition: backdrop-filter 0.3s ease, background 0.3s ease;
        `,e.appendChild(p)});function v(){n.forEach((e,t)=>{const o=e.querySelector(".blur-overlay");o&&(t<s?gsap.to(o,{backdropFilter:"blur(15px)",background:"rgba(5, 5, 5, 0.6)",duration:1,ease:"power2.inOut"}):gsap.to(o,{backdropFilter:"blur(0px)",background:"rgba(5, 5, 5, 0)",duration:1,ease:"power2.inOut"}))})}g.forEach((e,t)=>{e.addEventListener("scroll",()=>{if(l[t].phase!==c.ACTIVE)return;const{scrollTop:o,scrollHeight:i,clientHeight:r}=e;l[t].isAtTop=o<=5,l[t].isAtBottom=o+r>=i-5},{passive:!0})});function f(e){if(d||e<0||e>=n.length||e===s)return;const t=e>s?"next":"prev";d=!0,u=0;const o=s;s=e,l[o].phase=t==="next"?c.HIDDEN:c.ACTIVE,l[e].phase=c.ACTIVE,g.forEach((i,r)=>{i.style.overflowY=r===e?"auto":"hidden",r===e&&t==="next"&&(i.scrollTop=0,l[r].isAtTop=!0,l[r].isAtBottom=!1)}),v(),gsap.to(window,{duration:1.2,scrollTo:{y:e*window.innerHeight,autoKill:!1},ease:"power2.inOut",onComplete:()=>{d=!1}})}function T(e){if(s===n.length-1&&l[s].isAtBottom&&e.deltaY>0){e.preventDefault();return}if(d){e.preventDefault();return}const t=l[s],o=e.deltaY,i=t.isAtTop||t.isAtBottom,r=o>0&&t.isAtBottom||o<0&&t.isAtTop;if(i&&r){if(u+=Math.abs(o),u<y){e.preventDefault();return}u=0,o>0&&s<n.length-1?(e.preventDefault(),f(s+1)):o<0&&s>0&&(e.preventDefault(),f(s-1))}else if(u=0,!t.isAtTop&&o<0||!t.isAtBottom&&o>0)return}let h=0,m=0;window.addEventListener("touchstart",e=>{h=e.touches[0].clientY,m=0},{passive:!0}),window.addEventListener("touchmove",e=>{if(d){e.preventDefault();return}const t=e.touches[0].clientY,o=h-t,i=l[s],r=30,p=i.isAtTop||i.isAtBottom;if(o>r&&i.isAtBottom||o<-r&&i.isAtTop,p&&Math.abs(o)>r){if(m+=Math.abs(o),m<y){e.preventDefault();return}m=0,o>r&&s<n.length-1?(e.preventDefault(),f(s+1),h=t):o<-r&&s>0&&(e.preventDefault(),f(s-1),h=t)}},{passive:!1}),window.addEventListener("wheel",T,{passive:!1}),document.body.style.height=`${n.length*window.innerHeight}px`,v()}function x(){const n=document.querySelectorAll(".fishbone-item"),a=document.querySelector(".fishbone-spine");typeof gsap<"u"&&typeof ScrollTrigger<"u"?(gsap.set(n,{opacity:0,y:30}),ScrollTrigger.create({trigger:".fishbone-timeline",start:"top 85%",once:!0,onEnter:()=>{a&&gsap.fromTo(a,{scaleY:0,transformOrigin:"top center"},{scaleY:1,duration:.8,ease:"power2.out"}),gsap.to(n,{opacity:1,y:0,duration:.5,stagger:.08,ease:"power2.out",delay:.2})}})):(n.forEach((c,l)=>{c.style.animationDelay=`${l*.1}s`,c.classList.add("animate-in")}),a&&a.classList.add("animate-in"))}b();x();
