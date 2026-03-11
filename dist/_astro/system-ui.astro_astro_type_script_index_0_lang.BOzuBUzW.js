function y(){if(typeof gsap>"u"||typeof ScrollTrigger>"u"){setTimeout(y,100);return}gsap.registerPlugin(ScrollTrigger);const i=document.querySelectorAll(".project-page section");if(i.length<=1)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){i.forEach(e=>{e.style.position="relative",e.style.height="auto",e.style.minHeight="100vh"});return}const l={HIDDEN:"hidden",ENTERING:"entering",ACTIVE:"active",EXITING:"exiting"},s=Array.from(i).map((e,t)=>({phase:t===0?l.ACTIVE:l.HIDDEN,isAtTop:!0,isAtBottom:!1,wrapper:null}));let r=0,u=0;const w=400;let d=!1;i.forEach(e=>{const t=e.querySelector(".section-scroll-wrapper");if(t){const n=t.querySelector(".section-scroll-content");n&&Array.from(n.children).forEach(a=>e.appendChild(a)),t.remove()}const o=e.querySelector(".blur-overlay");o&&o.remove()}),i.forEach((e,t)=>{e.style.cssText=`
        position: sticky;
        top: 0;
        height: 100vh;
        width: 100%;
        z-index: ${(t+1)*10};
        background: var(--bg-color, #050505);
        overflow: hidden;
        transform: ${t===0?"translateY(0)":"translateY(100%)"};
        visibility: ${t===0?"visible":"hidden"};
      `});const h=[];i.forEach((e,t)=>{const o=document.createElement("div");o.className="section-scroll-wrapper",o.style.cssText=`
        height: 100vh;
        width: 100%;
        overflow-y: ${t===0?"auto":"hidden"};
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
      `;const n=document.createElement("div");n.className="section-scroll-content";const a=window.innerWidth<=768;if(n.style.cssText=`
        min-height: 100vh;
        padding: ${a?"80px 5% 60px":"100px 10% 50px 140px"};
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
      `,Array.from(e.children).forEach(p=>{p.classList?.contains("blur-overlay")||n.appendChild(p)}),o.appendChild(n),e.appendChild(o),h.push(o),s[t].wrapper=o,t<i.length-1){const p=document.createElement("div");p.className="blur-overlay",p.style.cssText=`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(0px);
          background: rgba(5, 5, 5, 0);
          pointer-events: none;
          z-index: 9999;
        `,e.appendChild(p)}}),h.forEach((e,t)=>{e.addEventListener("scroll",()=>{if(s[t].phase!==l.ACTIVE)return;const{scrollTop:o,scrollHeight:n,clientHeight:a}=e;s[t].isAtTop=o<=5,s[t].isAtBottom=o+a>=n-5},{passive:!0})});function g(){i.forEach((e,t)=>{const o=e.querySelector(".blur-overlay");o&&(t<r-1?gsap.to(o,{backdropFilter:"blur(20px)",background:"rgba(5, 5, 5, 0.7)",duration:.3}):t===r-1?gsap.to(o,{backdropFilter:"blur(20px)",background:"rgba(5, 5, 5, 0.7)",duration:1}):gsap.to(o,{backdropFilter:"blur(0px)",background:"rgba(5, 5, 5, 0)",duration:.3}))})}function c(e,t){if(d||e<0||e>=i.length||e===r)return;d=!0,u=0;const o=r;r=e,t==="next"?s[o].phase=l.EXITING:s[o].phase=l.HIDDEN,s[e].phase=l.ENTERING,h.forEach((n,a)=>{n.style.overflowY=a===e?"auto":"hidden"}),gsap.fromTo(i[e],{y:t==="next"?"100%":"-100%",visibility:"visible"},{y:"0%",duration:1.2,ease:"power2.inOut",onComplete:()=>{s[e].phase=l.ACTIVE,s[e].isAtTop=!0,s[e].isAtBottom=!1,d=!1}}),t==="next"?gsap.to(i[o],{visibility:"hidden",duration:.1,delay:1.1}):gsap.set(i[o],{visibility:"visible"}),g()}function b(e){const t=s[r],o=t.isAtTop||t.isAtBottom,n=e.deltaY>0&&t.isAtBottom||e.deltaY<0&&t.isAtTop;if(o&&n){if(u+=Math.abs(e.deltaY),u<w){e.preventDefault();return}e.preventDefault(),e.deltaY>0&&r<i.length-1?c(r+1,"next"):e.deltaY<0&&r>0?c(r-1,"prev"):u=0}else n||(u=0)}let f=0;function m(e){f=e.touches[0].clientY}function E(e){if(d){e.preventDefault();return}const t=e.touches[0].clientY,o=f-t,n=s[r];if(o>50){if(n.phase===l.ACTIVE&&!n.isAtBottom)return;r<i.length-1&&(e.preventDefault(),c(r+1,"next"),f=t)}else if(o<-50){if(n.phase===l.ACTIVE&&!n.isAtTop)return;r>0&&(e.preventDefault(),c(r-1,"prev"),f=t)}}window.addEventListener("wheel",b,{passive:!1}),window.addEventListener("touchstart",m,{passive:!0}),window.addEventListener("touchmove",E,{passive:!1}),window.addEventListener("keydown",e=>{const t=s[r];(e.key==="ArrowDown"||e.key==="PageDown")&&(e.preventDefault(),t.isAtBottom&&r<i.length-1&&c(r+1,"next")),(e.key==="ArrowUp"||e.key==="PageUp")&&(e.preventDefault(),t.isAtTop&&r>0&&c(r-1,"prev"))}),document.body.style.height=`${i.length*window.innerHeight}px`,g();let v;window.addEventListener("resize",()=>{clearTimeout(v),v=setTimeout(()=>{document.body.style.height=`${i.length*window.innerHeight}px`;const e=window.innerWidth<=768;h.forEach(t=>{const o=t.querySelector(".section-scroll-content");o&&(o.style.padding=e?"80px 5% 60px":"100px 10% 50px 140px")})},300)})}y();
