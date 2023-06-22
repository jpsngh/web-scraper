import puppeteer from 'puppeteer';

import  fs from 'fs';

async function start(urls) {
  const data = [];

  const browser = await puppeteer.launch({ headless: true });

  for (const dato of urls) {
    const page = await browser.newPage();
    await page.goto(dato.url);

    const newsArticles = await page.evaluate((dato) => {
      const articles = Array.from(document.querySelectorAll(`section #block-${dato.block} article`));

      const newsData = articles.map((article) => {
        const headlineElement = article.querySelector(".card-headline h4 a");
        const body = headlineElement.innerText;
        const url = headlineElement.href;
        const img = article.querySelector(".image .tnt-blurred-image img").src;

        return { body, img, url };
      });

      return newsData;
    });

    for (const article of newsArticles) {
      const articlePage = await browser.newPage();
      await articlePage.goto(article.url);
      const description = await articlePage.evaluate(() => {
        const des = document.querySelectorAll(".asset-body p");
     let newDes = ""; 
     des.forEach((el)=>{
       return  newDes += el.innerText
     })
    return newDes;
      },dato);

      article.description = description;
      data.push(article);

      await articlePage.close();
    }

    await page.close();
  }

  fs.writeFileSync('news_data.json', JSON.stringify(data, null, 2));

  console.log("News data saved!");
  console.log(data);

  await browser.close();
}
const urls = [
    {url:"https://www.bramptonguardian.com/news/",block:"2886699"},
    {url:"https://www.mississauga.com/news/",block:"2901984"},
   
    {url:"https://www.durhamregion.com/news/",block:"2891595"}
    // Add more URLs as needed
  ];

start(urls);
