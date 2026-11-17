/* Manual, read-only browser QA. Captures public homepage, no logins or secrets. */
const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
const target=process.argv[2]||'https://nordl.dev/';
if(new URL(target).origin!=='https://nordl.dev')throw Error('Only Nordl public homepage permitted');
const browser=await chromium.launch({headless:true});
fs.mkdirSync('layout-report',{recursive:true});const results=[];
try{
for(const [width,height] of [[1440,1000],[768,1024],[390,844],[320,800]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const response=await page.goto(target,{waitUntil:'load',timeout:30000});
await page.locator('h1').waitFor();await page.waitForFunction(()=>{const grid=document.querySelector('.platform-grid');return grid&&getComputedStyle(grid).display==='grid'&&[...document.styleSheets].some(s=>s.href?.includes('home-v2.css'));});await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
const report=await page.evaluate(()=>({title:document.title,heading:document.querySelector('h1')?.innerText,viewport:innerWidth,gridColumns:getComputedStyle(document.querySelector('.platform-grid')).gridTemplateColumns.split(' ').length,scrollWidth:document.documentElement.scrollWidth,platforms:[...document.querySelectorAll('.platform')].map(a=>({name:a.querySelector('h3').innerText,href:a.href,width:Math.round(a.getBoundingClientRect().width)})),overflow:[...document.querySelectorAll('main a,main section,main h1,main h2')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left< -1}).map(e=>e.tagName+':'+e.textContent.trim().slice(0,75))}));
report.status=response?.status();report.errors=errors;report.width=width;
await page.screenshot({path:'layout-report/'+width+'.png',fullPage:true});
results.push(report);await page.close();
}
}finally{await browser.close();fs.writeFileSync('layout-report/report.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2))}
if(results.some(x=>x.status!==200||x.platforms.length!==3||x.gridColumns!==(x.width>740?3:1)||x.scrollWidth>x.viewport+1||x.overflow.length||x.errors.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
