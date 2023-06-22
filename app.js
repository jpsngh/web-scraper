import puppeteer from 'puppeteer';
import fs from 'fs';

export async function start(urls) {
  const data = [];
  const browser = await puppeteer.launch({ headless: true });

  for (const datau of urls) {
    const page = await browser.newPage();
    await page.goto(datau.url);

    const newsArticles = await page.evaluate(
      (datau) => {
        const articles = Array.from(
          document.querySelectorAll(`section #block-${+datau.block} article`)
        );

        const newsData = articles.map((article) => {
          const headlineElement = article.querySelector(".card-headline h4 a");
          const body = headlineElement.innerText;
          const url = headlineElement.href;
          const img = article.querySelector(".image .tnt-blurred-image img")?article.querySelector(".image .tnt-blurred-image img").getAttribute("src"):"alt";

          return { body, img, url };
        });

        return newsData;
      },
      datau
    );

    for (const article of newsArticles) {
      const articlePage = await browser.newPage();
      await articlePage.goto(article.url);

      const description = await articlePage.evaluate(() => {
        const desElements = Array.from(document.querySelectorAll(".asset-body p"));
        let newDes = "";
        desElements.forEach((el) => {
          newDes += el.innerText;
        });
        return newDes;
      });

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

export const urls = [
  { url: "https://www.bramptonguardian.com/news/", block: "2886699" },
  { url: "https://www.mississauga.com/news/", block: "2901984" },
  { url: "https://www.durhamregion.com/news/", block: "2891595" },{
    url:"https://www.insidehalton.com/news/",block:"2901111"
  },{
    url:"https://www.yorkregion.com/news/",block:"2858511"
  },{
    url:"https://www.toronto.com/news/",block:"1202226"
  }
  // Add more URLs as needed
];

start(urls);
