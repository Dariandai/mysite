function A(){if(typeof gsap>"u"||typeof ScrollTrigger>"u"){setTimeout(A,100);return}gsap.registerPlugin(ScrollTrigger);const s=document.querySelectorAll("section"),a={HIDDEN:"hidden",ACTIVE:"active"},l=Array.from(s).map(()=>({phase:a.HIDDEN,isAtTop:!0,isAtBottom:!1,wrapper:null}));l[0].phase=a.ACTIVE,l[0].isAtTop=!0;let r=0,d=!1,u=0;const g=400,S=()=>window.innerWidth<=768,D=()=>window.innerHeight<=500&&window.innerWidth>window.innerHeight;window.matchMedia("(prefers-reduced-motion: reduce)").matches;function b(){s.forEach(t=>{const e=t.querySelector(".section-scroll-wrapper");if(e){const n=e.querySelector(".section-scroll-content");n&&Array.from(n.children).forEach(c=>t.appendChild(c)),e.remove()}const o=t.querySelector(".blur-overlay");o&&o.remove()}),ScrollTrigger.getAll().forEach(t=>t.kill())}b(),s.forEach((t,e)=>{const o=(e+1)*10;t.setAttribute("data-gsap","true"),t.style.zIndex=String(o),t.style.position="sticky",t.style.top="0",t.style.left="0",t.style.width="100%",t.style.height="100vh",t.style.opacity="1",t.style.overflow="hidden",t.style.backgroundColor="var(--bg-color, #050505)"});const m=[];s.forEach((t,e)=>{const o=Array.from(t.children),n=document.createElement("div");n.className="section-scroll-wrapper",n.style.cssText=`
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: ${e===0?"auto":"hidden"};
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        z-index: 1;
      `;const i=document.createElement("div");i.className="section-scroll-content";const c=D(),w=S();if(i.style.cssText=`
        min-height: 100vh;
        padding: ${w?"80px 5% 60px":c?"60px 5% 20px":"100px 10% 50px 140px"};
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        max-width: 100%;
        margin: 0;
        overflow-x: hidden;
      `,o.forEach(v=>i.appendChild(v)),n.appendChild(i),t.appendChild(n),m.push(n),l[e].wrapper=n,e===s.length-1)return;const f=document.createElement("div");f.className="blur-overlay",f.style.cssText=`
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
      `,t.appendChild(f)});function T(){s.forEach((t,e)=>{const o=t.querySelector(".blur-overlay");o&&(e<r?gsap.to(o,{backdropFilter:"blur(15px)",background:"rgba(5, 5, 5, 0.6)",duration:1,ease:"power2.inOut"}):gsap.to(o,{backdropFilter:"blur(0px)",background:"rgba(5, 5, 5, 0)",duration:1,ease:"power2.inOut"}))})}m.forEach((t,e)=>{t.addEventListener("scroll",()=>{if(l[e].phase!==a.ACTIVE)return;const{scrollTop:o,scrollHeight:n,clientHeight:i}=t;l[e].isAtTop=o<=5,l[e].isAtBottom=o+i>=n-5},{passive:!0})});function p(t){if(d||t<0||t>=s.length||t===r||t>s.length-1)return;const e=t>r?"next":"prev";d=!0,u=0;const o=r;r=t,l[o].phase=e==="next"?a.HIDDEN:a.ACTIVE,l[t].phase=a.ACTIVE,m.forEach((i,c)=>{i.style.overflowY=c===t?"auto":"hidden",c===t&&e==="next"&&(i.scrollTop=0,l[c].isAtTop=!0,l[c].isAtBottom=!1)}),T();const n=t*window.innerHeight;gsap.to(window,{duration:1.2,scrollTo:{y:n,autoKill:!1},ease:"power2.inOut",onComplete:()=>{d=!1}})}function x(t){if(r===s.length-1&&l[r].isAtBottom&&t.deltaY>0){t.preventDefault();return}if(d){t.preventDefault();return}const e=l[r],o=t.deltaY,n=e.isAtTop||e.isAtBottom,i=o>0&&e.isAtBottom||o<0&&e.isAtTop;if(n&&i){if(u+=Math.abs(o),u<g){t.preventDefault();return}if(u=0,o>0&&r<s.length-1){t.preventDefault(),p(r+1);return}if(o<0&&r>0){t.preventDefault(),p(r-1);return}}else if(u=0,!e.isAtTop&&o<0||!e.isAtBottom&&o>0)return}let h=0,y=0;function k(t){h=t.touches[0].clientY,y=0}function B(t){if(r===s.length-1){const w=l[r],f=t.touches[0].clientY,v=h-f;if(w.isAtBottom&&v>0){t.preventDefault();return}}if(d){t.preventDefault();return}const e=t.touches[0].clientY,o=h-e,n=l[r],i=30,c=n.isAtTop||n.isAtBottom;if(o>i&&n.isAtBottom||o<-i&&n.isAtTop,c&&Math.abs(o)>i){if(y+=Math.abs(o),y<g){t.preventDefault();return}if(y=0,o>i&&r<s.length-1){t.preventDefault(),p(r+1),h=e;return}if(o<-i&&r>0){t.preventDefault(),p(r-1),h=e;return}}o>0&&!n.isAtBottom||o<0&&n.isAtTop}window.addEventListener("wheel",x,{passive:!1}),window.addEventListener("touchstart",k,{passive:!0}),window.addEventListener("touchmove",B,{passive:!1}),window.addEventListener("keydown",t=>{if(d)return;const e=l[r];(t.key==="ArrowDown"||t.key==="PageDown")&&(t.preventDefault(),e.isAtBottom&&r<s.length-1&&(u=g,p(r+1))),(t.key==="ArrowUp"||t.key==="PageUp")&&(t.preventDefault(),e.isAtTop&&r>0&&(u=g,p(r-1)))});const H=s.length*window.innerHeight;document.body.style.height=`${H}px`;let E;window.addEventListener("resize",()=>{clearTimeout(E),E=setTimeout(()=>{b(),A()},300)}),T()}const C=window.matchMedia("(prefers-reduced-motion: reduce)").matches;C?Y():A();function Y(){document.querySelectorAll("section").forEach(a=>{a.style.position="relative",a.style.opacity="1",a.style.visibility="visible",a.style.transform="none",a.style.height="auto",a.style.minHeight="100vh"}),document.body.style.height="auto"}
