globalThis.process ??= {}; globalThis.process.env ??= {};
import { h as decodeKey } from './chunks/astro/server_By4BriKV.mjs';
import './chunks/astro-designed-error-pages_Kf1CMvY6.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_DJC0iUF4.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///D:/Project/mysite/","cacheDir":"file:///D:/Project/mysite/node_modules/.astro/","outDir":"file:///D:/Project/mysite/dist/","srcDir":"file:///D:/Project/mysite/src/","publicDir":"file:///D:/Project/mysite/public/","buildClientDir":"file:///D:/Project/mysite/dist/","buildServerDir":"file:///D:/Project/mysite/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":true,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about/index.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"blog/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"portfolio/project-alpha/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/portfolio/project-alpha","isIndex":false,"type":"page","pattern":"^\\/portfolio\\/project-alpha\\/?$","segments":[[{"content":"portfolio","dynamic":false,"spread":false}],[{"content":"project-alpha","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/portfolio/project-alpha.astro","pathname":"/portfolio/project-alpha","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"portfolio/system-ui/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/portfolio/system-ui","isIndex":false,"type":"page","pattern":"^\\/portfolio\\/system-ui\\/?$","segments":[[{"content":"portfolio","dynamic":false,"spread":false}],[{"content":"system-ui","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/portfolio/system-ui.astro","pathname":"/portfolio/system-ui","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"portfolio/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/portfolio","isIndex":true,"type":"page","pattern":"^\\/portfolio\\/?$","segments":[[{"content":"portfolio","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/portfolio/index.astro","pathname":"/portfolio","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"share/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/share","isIndex":true,"type":"page","pattern":"^\\/share\\/?$","segments":[[{"content":"share","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/share/index.astro","pathname":"/share","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://dar1an.pages.dev","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["D:/Project/mysite/src/pages/about/index.astro",{"propagation":"none","containsHead":true}],["D:/Project/mysite/src/pages/blog/[...slug].astro",{"propagation":"none","containsHead":true}],["D:/Project/mysite/src/pages/blog/index.astro",{"propagation":"none","containsHead":true}],["D:/Project/mysite/src/pages/index.astro",{"propagation":"none","containsHead":true}],["D:/Project/mysite/src/pages/portfolio/index.astro",{"propagation":"none","containsHead":true}],["D:/Project/mysite/src/pages/portfolio/project-alpha.astro",{"propagation":"none","containsHead":true}],["D:/Project/mysite/src/pages/portfolio/system-ui.astro",{"propagation":"none","containsHead":true}],["D:/Project/mysite/src/pages/share/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/about/index@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"pages/blog.astro.mjs","\u0000@astro-page:src/pages/blog/[...slug]@_@astro":"pages/blog/_---slug_.astro.mjs","\u0000@astro-page:src/pages/portfolio/project-alpha@_@astro":"pages/portfolio/project-alpha.astro.mjs","\u0000@astro-page:src/pages/portfolio/system-ui@_@astro":"pages/portfolio/system-ui.astro.mjs","\u0000@astro-page:src/pages/portfolio/index@_@astro":"pages/portfolio.astro.mjs","\u0000@astro-page:src/pages/share/index@_@astro":"pages/share.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_C8ERJC0n.mjs","D:/Project/mysite/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","D:/Project/mysite/src/content/posts/brain-science.md":"chunks/brain-science_C42prVcp.mjs","D:/Project/mysite/src/content/posts/digital-garden.md":"chunks/digital-garden_DMiFJ0tm.mjs","D:/Project/mysite/src/content/posts/local-ai.md":"chunks/local-ai_anO00xWv.mjs","D:/Project/mysite/src/content/posts/luo-yonghao-liu-qian.md":"chunks/luo-yonghao-liu-qian_Dv_dsJd3.mjs","D:/Project/mysite/src/pages/about/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.Bl-5jRGn.js","D:/Project/mysite/src/pages/portfolio/project-alpha.astro?astro&type=script&index=0&lang.ts":"_astro/project-alpha.astro_astro_type_script_index_0_lang.b5xk3FkM.js","D:/Project/mysite/src/pages/portfolio/system-ui.astro?astro&type=script&index=0&lang.ts":"_astro/system-ui.astro_astro_type_script_index_0_lang.BOzuBUzW.js","D:/Project/mysite/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.DuvrgZHI.js","D:/Project/mysite/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts":"_astro/BaseLayout.astro_astro_type_script_index_0_lang.BUaB6IeA.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["D:/Project/mysite/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts","const s=document.getElementById(\"navbar\");window.addEventListener(\"scroll\",()=>{window.scrollY>50?s?.classList.add(\"scrolled\"):s?.classList.remove(\"scrolled\")});function i(){const n=document.getElementById(\"mobile-nav\"),t=document.getElementById(\"mobile-nav-overlay\"),e=document.getElementById(\"menu-icon-open\"),o=document.getElementById(\"menu-icon-close\"),l=document.body;n?.classList.contains(\"active\")?c():(n?.classList.add(\"active\"),t?.classList.add(\"active\"),e&&(e.style.display=\"none\"),o&&(o.style.display=\"block\"),l.style.overflow=\"hidden\")}function c(){const n=document.getElementById(\"mobile-nav\"),t=document.getElementById(\"mobile-nav-overlay\"),e=document.getElementById(\"menu-icon-open\"),o=document.getElementById(\"menu-icon-close\"),l=document.body;n?.classList.remove(\"active\"),t?.classList.remove(\"active\"),e&&(e.style.display=\"block\"),o&&(o.style.display=\"none\"),l.style.overflow=\"\"}window.toggleMobileMenu=i;window.closeMobileMenu=c;window.addEventListener(\"resize\",()=>{window.innerWidth>768&&c()});function d(){document.referrer&&document.referrer.includes(window.location.hostname)?history.back():window.location.href=\"/\"}window.goBack=d;"]],"assets":["/_astro/index.CRdvkygj.css","/_astro/index.CJl6_6aw.css","/_astro/project-alpha.BTK7ESnR.css","/_astro/system-ui.dTaN6Sng.css","/favicon.ico","/favicon.svg","/_astro/index.astro_astro_type_script_index_0_lang.Bl-5jRGn.js","/_astro/index.astro_astro_type_script_index_0_lang.DuvrgZHI.js","/_astro/project-alpha.astro_astro_type_script_index_0_lang.b5xk3FkM.js","/_astro/system-ui.astro_astro_type_script_index_0_lang.BOzuBUzW.js","/_worker.js/index.js","/_worker.js/noop-entrypoint.mjs","/_worker.js/renderers.mjs","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/chunks/astro-designed-error-pages_Kf1CMvY6.mjs","/_worker.js/chunks/astro_DyFhTZpL.mjs","/_worker.js/chunks/BaseLayout_BvBB3N2Q.mjs","/_worker.js/chunks/brain-science_C42prVcp.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/digital-garden_DMiFJ0tm.mjs","/_worker.js/chunks/index_DozYwpzV.mjs","/_worker.js/chunks/local-ai_anO00xWv.mjs","/_worker.js/chunks/luo-yonghao-liu-qian_Dv_dsJd3.mjs","/_worker.js/chunks/noop-middleware_DJC0iUF4.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_DdQTnz0z.mjs","/_worker.js/pages/about.astro.mjs","/_worker.js/pages/blog.astro.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/portfolio.astro.mjs","/_worker.js/pages/share.astro.mjs","/_worker.js/_astro/index.CJl6_6aw.css","/_worker.js/_astro/index.CRdvkygj.css","/_worker.js/_astro/project-alpha.BTK7ESnR.css","/_worker.js/_astro/system-ui.dTaN6Sng.css","/_worker.js/chunks/astro/server_By4BriKV.mjs","/_worker.js/pages/blog/_---slug_.astro.mjs","/_worker.js/pages/portfolio/project-alpha.astro.mjs","/_worker.js/pages/portfolio/system-ui.astro.mjs","/about/index.html","/blog/index.html","/portfolio/project-alpha/index.html","/portfolio/system-ui/index.html","/portfolio/index.html","/share/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"MbvDxyhl1ErFmsmaPdFOAOd161ufWauMkbHmQFXzlj8=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
