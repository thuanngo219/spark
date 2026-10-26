import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome'});
const results=[];
for (const width of [1280,390]) {
 const page=await browser.newPage({viewport:{width,height:844}});
 await page.addInitScript(()=>{
 const project={id:'86c783f4-4133-45f7-8a56-af41b3d4f442',name:'Dự án đo hiệu năng',color:'#D6A84F',isStarred:false,position:0,archivedAt:null,createdAt:new Date().toISOString()};
 localStorage.setItem('spark:data:v1',JSON.stringify({projects:[project],items:Array.from({length:60},(_,i)=>({id:crypto.randomUUID(),type:'task',title:`Việc đo hiệu năng ${i}`,description:'Nội dung ngắn',startDate:null,dueDate:null,projectId:project.id,completedAt:null,archivedAt:null,isImportant:false,isUrgent:false,createdAt:new Date().toISOString()}))}));
 });
 await page.goto(process.env.SPARK_TEST_URL ?? 'http://localhost:3014');
 await page.getByRole('region',{name:'Khởi động Spark'}).waitFor({state:'hidden'});
 await page.keyboard.press('a');
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Performance.enable');
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 for(const action of (width===1280?['header','projects','progress']:['header','progress'])) {
  if(action==='progress') await page.evaluate(()=>{const el=document.createElement('div');el.className='startup-progress';el.style.cssText='position:fixed;top:200px;left:20px;width:280px';el.innerHTML='<span style="width:10%"></span>';document.body.append(el);});
  const samples=[];
  for(let i=0;i<4;i++) {
   const before=(await cdp.send('Performance.getMetrics')).metrics;
   const frames=await page.evaluate(async ({action,i})=>{
    const frames=[];let last=performance.now();const start=last;
    return new Promise(resolve=>{
     function frame(t){frames.push(t-last);last=t;if(t-start<450)requestAnimationFrame(frame);else resolve(frames.slice(1));}
     requestAnimationFrame(frame);
     if(action==='header')window.scrollTo(0,i%2===0?200:0);
     if(action==='projects')document.querySelector('.item-project-chip').click();
     if(action==='progress')document.querySelector('.startup-progress > span').style.width=i%2===0?'90%':'10%';
    });
   },{action,i});
   const after=(await cdp.send('Performance.getMetrics')).metrics;
   const delta=n=>(after.find(m=>m.name===n)?.value??0)-(before.find(m=>m.name===n)?.value??0);
   if(i>0){const sorted=frames.toSorted((a,b)=>a-b);samples.push({layoutCount:delta('LayoutCount'),layoutMs:delta('LayoutDuration')*1000,styleMs:delta('RecalcStyleDuration')*1000,taskMs:delta('TaskDuration')*1000,frameP95Ms:sorted[Math.floor(sorted.length*.95)],frameMaxMs:Math.max(...frames),framesOver25ms:frames.filter(x=>x>25).length,frames:frames.length});}
  }
  results.push({width,action,cpuSlowdown:4,itemCount:60,samples});
 }
 await page.close();
}
await browser.close();
await writeFile(process.argv[2]??'/tmp/spark-motion-baseline.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(r=>({...r,samples:r.samples.map(s=>Object.fromEntries(Object.entries(s).map(([k,v])=>[k,Math.round(v*100)/100])))})),null,2));
