class p{constructor(t={}){this.options={sections:t.sections||"section",sectionOrder:t.sectionOrder||[],dampingThreshold:t.dampingThreshold||400,blurAmount:t.blurAmount||15,transitionDuration:t.transitionDuration||1.2,...t},this.sections=[],this.wrappers=[],this.sectionStates=[],this.currentSectionIndex=0,this.isTransitioning=!1,this.accumulatedDelta=0,this.touchStartY=0,this.touchAccumulatedDelta=0,this.SectionPhase={HIDDEN:"hidden",ACTIVE:"active"},this.onSectionChange=t.onSectionChange||null}init(){if(typeof window>"u")return;if(typeof gsap>"u"||typeof ScrollTrigger>"u"){setTimeout(()=>this.init(),100);return}if(gsap.registerPlugin(ScrollTrigger),this.sections=Array.from(document.querySelectorAll(this.options.sections)),this.sections.length<=1)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){this.initSimpleMode();return}this.cleanup(),this.setupSections(),this.createWrappers(),this.bindEvents(),this.updateBlurStates()}cleanup(){this.sections.forEach(t=>{const i=t.querySelector(".section-scroll-wrapper");if(i){const r=i.querySelector(".section-scroll-content");r&&Array.from(r.children).forEach(o=>t.appendChild(o)),i.remove()}const e=t.querySelector(".blur-overlay");e&&e.remove(),t.querySelectorAll(".edge-arrow").forEach(r=>r.remove())}),ScrollTrigger.getAll().forEach(t=>t.kill())}setupSections(){this.sections.forEach((t,i)=>{if(t.setAttribute("data-stacking","true"),t.style.cssText=`
        z-index: ${(i+1)*10};
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        opacity: 1;
        overflow: hidden;
        background-color: var(--bg-color, #050505);
        will-change: transform;
        transform: translateZ(0);
      `,this.sectionStates[i]={phase:i===0?this.SectionPhase.ACTIVE:this.SectionPhase.HIDDEN,isAtTop:!0,isAtBottom:!1,wrapper:null},i>0){const s=document.createElement("div");s.className="edge-arrow top-arrow",s.innerHTML="↑",s.style.cssText=`
          position: absolute;
          top: 120px;
          right: 20px;
          color: rgba(255,255,255,0.5);
          font-size: 20px;
          opacity: 0;
          transition: opacity 0.15s ease;
          pointer-events: none;
          z-index: 99999;
          text-shadow: 0 0 10px rgba(0,0,0,0.8);
        `,t.appendChild(s)}const e=document.createElement("div");e.className="edge-arrow bottom-arrow",e.innerHTML="↓",e.style.cssText=`
        position: absolute;
        bottom: 80px;
        right: 20px;
        color: rgba(255,255,255,0.5);
        font-size: 20px;
        opacity: 0;
        transition: opacity 0.15s ease;
        pointer-events: none;
        z-index: 99999;
        text-shadow: 0 0 10px rgba(0,0,0,0.8);
      `,t.appendChild(e)}),document.body.style.height=`${this.sections.length*100}vh`}createWrappers(){const t=()=>window.innerWidth<=768,i=()=>window.innerHeight<=500&&window.innerWidth>window.innerHeight;this.sections.forEach((e,s)=>{const r=Array.from(e.children).filter(l=>!l.classList?.contains("edge-arrow")),o=document.createElement("div");o.className="section-scroll-wrapper",o.style.cssText=`
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: ${s===0?"auto":"hidden"};
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        z-index: 1;
        scrollbar-width: none;
        -ms-overflow-style: none;
      `;const n=document.createElement("div");n.className="section-scroll-content";const c=i(),a=t(),h=window.getComputedStyle(e),u=h.display.includes("flex");if(n.style.cssText=`
        min-height: 100vh;
        min-height: 100dvh;
        padding: ${a?"80px 5% 60px":c?"60px 5% 20px":"100px 10% 50px"};
        box-sizing: border-box;
        ${u?`
          display: ${h.display};
          flex-direction: ${h.flexDirection};
          align-items: ${h.alignItems};
          justify-content: ${h.justifyContent};
          gap: ${h.gap};
        `:""}
      `,r.forEach(l=>n.appendChild(l)),o.appendChild(n),e.appendChild(o),this.wrappers[s]=o,this.sectionStates[s].wrapper=o,s<this.sections.length-1){const l=document.createElement("div");l.className="blur-overlay",l.style.cssText=`
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
        `,e.appendChild(l)}})}bindEvents(){this.wrappers.forEach((i,e)=>{i.addEventListener("scroll",()=>{if(this.sectionStates[e].phase!==this.SectionPhase.ACTIVE)return;const{scrollTop:s,scrollHeight:r,clientHeight:o}=i;this.sectionStates[e].isAtTop=s<=5,this.sectionStates[e].isAtBottom=s+o>=r-5;const n=this.sections[e],c=n.querySelector(".top-arrow"),a=n.querySelector(".bottom-arrow"),h=50,u=s<=h;c&&e>0&&(c.style.opacity=u?"0.6":"0");const l=s+o>=r-h;a&&(a.style.opacity=l?"0.6":"0")},{passive:!0})}),window.addEventListener("wheel",this.handleWheel.bind(this),{passive:!1}),window.addEventListener("touchstart",this.handleTouchStart.bind(this),{passive:!0}),window.addEventListener("touchmove",this.handleTouchMove.bind(this),{passive:!1}),window.addEventListener("keydown",this.handleKeyDown.bind(this));let t;window.addEventListener("resize",()=>{clearTimeout(t),t=setTimeout(()=>{this.cleanup(),this.init()},300)})}getArrow(t,i){const e=this.sections[t];return i?e.querySelector(".bottom-arrow"):e.querySelector(".top-arrow")}pulseEdgeArrow(t,i){const e=this.getArrow(t,i);if(!e)return;const r=t===this.sections.length-1&&i;e.style.opacity="1",r?(e.innerHTML="−",gsap.timeline().to(e,{opacity:1,scale:1.8,color:"#ff4444",textShadow:"0 0 30px rgba(255,68,68,0.8)",duration:.1,ease:"power2.out"}).to(e,{opacity:.5,scale:1.5,duration:.1}).to(e,{opacity:1,scale:1.8,color:"#ff4444",duration:.1}).to(e,{opacity:.6,scale:1,color:"rgba(255,255,255,0.3)",textShadow:"none",duration:.5,ease:"power2.out",onComplete:()=>{e.innerHTML="↓"}})):gsap.timeline().to(e,{opacity:1,scale:1.5,color:"rgba(255,255,255,0.9)",textShadow:"0 0 20px rgba(255,255,255,0.5)",duration:.15,ease:"power2.out"}).to(e,{opacity:.8,scale:1.3,color:"rgba(255,255,255,0.6)",textShadow:"0 0 10px rgba(255,255,255,0.3)",duration:.15}).to(e,{opacity:1,scale:1.4,color:"rgba(255,255,255,0.9)",textShadow:"0 0 20px rgba(255,255,255,0.5)",duration:.15}).to(e,{opacity:.6,scale:1,color:"rgba(255,255,255,0.3)",textShadow:"none",duration:.3,ease:"power2.out"})}handleWheel(t){const i=t.deltaY;if(this.currentSectionIndex===this.sections.length-1&&this.sectionStates[this.currentSectionIndex].isAtBottom&&i>0){t.preventDefault(),this.accumulatedDelta+=Math.abs(i);const n=this.getArrow(this.currentSectionIndex,!0);if(n){const c=Math.min(this.accumulatedDelta/50,1);n.style.opacity=String(.3+c*.7)}this.accumulatedDelta>this.options.dampingThreshold*.5&&(this.pulseEdgeArrow(this.currentSectionIndex,!0),this.accumulatedDelta=0);return}if(this.isTransitioning){t.preventDefault();return}const e=this.sectionStates[this.currentSectionIndex],s=e.isAtTop||e.isAtBottom,r=i>0&&e.isAtBottom||i<0&&e.isAtTop;if(s&&r){this.accumulatedDelta+=Math.abs(i);const o=this.getArrow(this.currentSectionIndex,i>0);if(o){const n=Math.min(this.accumulatedDelta/50,1);o.style.opacity=String(.3+n*.7)}if(this.accumulatedDelta<this.options.dampingThreshold){t.preventDefault();const n=this.wrappers[this.currentSectionIndex];if(n){const c=this.accumulatedDelta/this.options.dampingThreshold,a=Math.sin(c*Math.PI)*3;n.style.transform=`translateY(${i>0?-a:a}px)`,setTimeout(()=>{n.style.transform=""},100)}this.accumulatedDelta>this.options.dampingThreshold*.7&&this.pulseEdgeArrow(this.currentSectionIndex,i>0);return}this.accumulatedDelta=0,i>0&&this.currentSectionIndex<this.sections.length-1?(t.preventDefault(),this.goToSection(this.currentSectionIndex+1)):i<0&&this.currentSectionIndex>0&&(t.preventDefault(),this.goToSection(this.currentSectionIndex-1))}else{this.accumulatedDelta=0;const o=this.getArrow(this.currentSectionIndex,!0),n=this.getArrow(this.currentSectionIndex,!1);if(o&&(o.style.opacity="0"),n&&(n.style.opacity="0"),!e.isAtTop&&i<0||!e.isAtBottom&&i>0)return}}handleTouchStart(t){this.touchStartY=t.touches[0].clientY,this.touchAccumulatedDelta=0}handleTouchMove(t){if(this.currentSectionIndex===this.sections.length-1){const c=this.sectionStates[this.currentSectionIndex],a=t.touches[0].clientY,h=this.touchStartY-a;if(c.isAtBottom&&h>0){t.preventDefault(),this.touchAccumulatedDelta+=Math.abs(h);const u=this.getArrow(this.currentSectionIndex,!0);if(u){const l=Math.min(this.touchAccumulatedDelta/50,1);u.style.opacity=String(.3+l*.7)}this.touchAccumulatedDelta>this.options.dampingThreshold*.5&&(this.pulseEdgeArrow(this.currentSectionIndex,!0),this.touchAccumulatedDelta=0);return}}if(this.isTransitioning){t.preventDefault();return}const i=t.touches[0].clientY,e=this.touchStartY-i,s=this.sectionStates[this.currentSectionIndex],r=this.wrappers[this.currentSectionIndex],o=30,n=s.isAtTop||s.isAtBottom;if(e>o&&s.isAtBottom||e<-o&&s.isAtTop,n&&Math.abs(e)>o){this.touchAccumulatedDelta+=Math.abs(e);const c=this.getArrow(this.currentSectionIndex,e>0);if(c){const a=Math.min(this.touchAccumulatedDelta/50,1);c.style.opacity=String(.3+a*.7)}if(this.touchAccumulatedDelta<this.options.dampingThreshold){if(t.preventDefault(),r){const a=this.touchAccumulatedDelta/this.options.dampingThreshold,h=Math.sin(a*Math.PI)*3;r.style.transform=`translateY(${e>0?-h:h}px)`,setTimeout(()=>{r.style.transform=""},100)}this.touchAccumulatedDelta>this.options.dampingThreshold*.7&&this.pulseEdgeArrow(this.currentSectionIndex,e>0);return}this.touchAccumulatedDelta=0,e>o&&this.currentSectionIndex<this.sections.length-1?(t.preventDefault(),this.goToSection(this.currentSectionIndex+1),this.touchStartY=i):e<-o&&this.currentSectionIndex>0&&(t.preventDefault(),this.goToSection(this.currentSectionIndex-1),this.touchStartY=i)}else{const c=this.getArrow(this.currentSectionIndex,!0),a=this.getArrow(this.currentSectionIndex,!1);if(c&&(c.style.opacity="0"),a&&(a.style.opacity="0"),e>0&&!s.isAtBottom||e<0&&!s.isAtTop)return}}handleKeyDown(t){if(this.isTransitioning)return;const i=this.sectionStates[this.currentSectionIndex];(t.key==="ArrowDown"||t.key==="PageDown")&&(t.preventDefault(),i.isAtBottom&&this.currentSectionIndex<this.sections.length-1&&(this.accumulatedDelta=this.options.dampingThreshold,this.goToSection(this.currentSectionIndex+1))),(t.key==="ArrowUp"||t.key==="PageUp")&&(t.preventDefault(),i.isAtTop&&this.currentSectionIndex>0&&(this.accumulatedDelta=this.options.dampingThreshold,this.goToSection(this.currentSectionIndex-1)))}goToSection(t){if(this.isTransitioning||t<0||t>=this.sections.length||t===this.currentSectionIndex)return;const i=t>this.currentSectionIndex?"next":"prev";this.isTransitioning=!0,this.accumulatedDelta=0;const e=this.currentSectionIndex;this.currentSectionIndex=t,this.sectionStates[e].phase=i==="next"?this.SectionPhase.HIDDEN:this.SectionPhase.ACTIVE,this.sectionStates[t].phase=this.SectionPhase.ACTIVE,this.wrappers.forEach((r,o)=>{r.style.overflowY=o===t?"auto":"hidden",o===t&&i==="next"&&(r.scrollTop=0,this.sectionStates[o].isAtTop=!0,this.sectionStates[o].isAtBottom=!1)}),this.updateBlurStates(),this.onSectionChange&&this.onSectionChange(t,this.sections[t]);const s=t*window.innerHeight;gsap.to(window,{duration:this.options.transitionDuration,scrollTo:{y:s,autoKill:!1},ease:"power2.inOut",onComplete:()=>{this.isTransitioning=!1}})}updateBlurStates(){this.sections.forEach((t,i)=>{const e=t.querySelector(".blur-overlay");e&&(i<this.currentSectionIndex?gsap.to(e,{backdropFilter:`blur(${this.options.blurAmount}px)`,background:"rgba(5, 5, 5, 0.6)",duration:this.options.transitionDuration,ease:"power2.inOut"}):gsap.to(e,{backdropFilter:"blur(0px)",background:"rgba(5, 5, 5, 0)",duration:this.options.transitionDuration,ease:"power2.inOut"}))})}initSimpleMode(){this.sections.forEach(t=>{t.style.position="relative",t.style.height="auto",t.style.minHeight="100vh",t.style.overflow="visible"}),document.body.style.height="auto"}scrollToSection(t){this.goToSection(t)}getCurrentIndex(){return this.currentSectionIndex}destroy(){ScrollTrigger.getAll().forEach(t=>t.kill()),this.cleanup()}}function f(d={}){const t=new p(d);return document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{t.init(),window.stackingCardsInstance=t}):(t.init(),window.stackingCardsInstance=t),t}export{f as i};
