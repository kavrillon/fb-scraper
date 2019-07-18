const puppeteer = require('puppeteer');
const fs = require('fs');

const CRED = {
  user: process.env.USER,
  pass: process.env.PASSWORD
};

const ID = {
  login: '#email',
  pass: '#pass'
};

const URL = process.env.URL;
const FOLDER_OUTPUT = './dist';
const DOM_SELECTOR_GRADE = "[role='complementary'] > div:first-child > div:first-child";
const DOM_SELECTOR_COUNT = "[role='complementary'] > div:first-child > div:nth-child(3)";
const DOM_SELECTOR_REVIEWS = '.userContent';

const sleep = async (ms) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  });
}

(async () => {
  console.log('## START SCRAPING');
  fs.mkdirSync(FOLDER_OUTPUT);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 1920,
    height: 1080
  });

  let login = async () => {
    // login
    await page.goto('https://facebook.com', {
      waitUntil: 'networkidle2'
    });
    await page.waitForSelector(ID.login);
    await page.type(ID.login, CRED.user);

    await page.type(ID.pass, CRED.pass);
    await sleep(500);

    await page.click("#loginbutton")

    console.log('## LOGIN DONE');
    await page.waitForNavigation();
  }

  await login();
  await page.goto(URL, {
    waitUntil: 'networkidle2'
  });

  const html = await page.content();
  fs.writeFileSync(FOLDER_OUTPUT + '/facebook.html', html);

  await page.screenshot({
    path: FOLDER_OUTPUT + '/facebook.png'
  });

  const grade = await page.$eval(DOM_SELECTOR_GRADE, dom => dom.textContent);
  const count = await page.$eval(DOM_SELECTOR_COUNT, dom => dom.textContent.match(/\d+/));
  const reviews = await page.$$eval(DOM_SELECTOR_REVIEWS, reviews => reviews.map(r => r.textContent));
  const data = {
    grade: parseFloat(grade) || null,
    count: count !== null ? parseInt(count[0]) : null,
    reviews
  };
  console.log('## DATA SCRAPED:');
  console.log(data);
  fs.writeFileSync(FOLDER_OUTPUT + '/facebook.json', JSON.stringify(data));

  browser.close();
})();
