globalThis.process ??= {}; globalThis.process.env ??= {};
import './chunks/astro-designed-error-pages_Kf1CMvY6.mjs';
import './chunks/astro/server_By4BriKV.mjs';
import { s as sequence } from './chunks/index_DozYwpzV.mjs';

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	
	
);

export { onRequest };
