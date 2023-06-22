import puppeteer from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import  fs from 'fs';

async function start(urls) {
  const data = [];

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 50, // Limit to 8 concurrent requests
    puppeteerOptions: { headless: true },
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);

    const newsArticles = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll("section #block-2886699 article"));

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
        const newPage = await cluster.worker().createPage();
      await page.goto(article.url);

      const description = await newPage.evaluate(() => {
        const desElements = Array.from(document.querySelectorAll(".asset-body p"));
        const description = desElements.map((el) => el.innerText.trim()).join(" ");
        return description;
      });

      article.description = description;
      data.push(article);
    }
  });

  for (const url of urls) {
    cluster.queue(url);
  }

  await cluster.idle();
  await cluster.close();

  fs.writeFileSync('news_data.json', JSON.stringify(data, null, 2));

  console.log("News data saved!");
  console.log(data);

 
}

const urls = [
  "https://www.bramptonguardian.com/news/",
  "https://www.mississauga.com/news/",
  "https://www.yorkregion.com/news/",
  "https://www.insidehalton.com/news/",
  "https://www.durhamregion.com/news/",
  // Add more URLs as needed
];

start(urls);
