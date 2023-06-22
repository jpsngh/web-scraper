import puppeteer from 'puppeteer';
const { Cluster } = require('puppeteer-cluster');
async function start ()  {
    const url = "https://www.bramptonguardian.com/news/"
    const data = []
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();

  await page.goto(url);

   const names = await page.evaluate(()=>

   {
   const data = Array.from(document.querySelectorAll("section #block-2886699 article"));
      const edta =   data.map((article)=>{

        const body = article.querySelector(".card-headline h4 a").innerText
       const  url = article.querySelector(".card-headline h4 a").href
        const img = article.querySelector(".image .tnt-blurred-image img").src

       return {body,img,url}
      
       
        })
        
        return  {...edta}
      })

   console.log(names);

    await browser.close();
}
start()