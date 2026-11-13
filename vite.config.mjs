import {defineConfig,loadEnv} from 'vite';
import {aiMiddleware} from './server/ai.mjs';
export default defineConfig(({mode})=>{const env=loadEnv(mode,process.cwd(),'OPENAI_');const middleware=()=>aiMiddleware({key:process.env.OPENAI_API_KEY||env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||env.OPENAI_MODEL||'gpt-4.1-mini'});return {base:mode==='pages'?'/focusmateai/':'/',server:{host:'127.0.0.1',port:5173},plugins:[{name:'focusmate-local-ai',configureServer(server){server.middlewares.use(middleware());},configurePreviewServer(server){server.middlewares.use(middleware());}}]};});
