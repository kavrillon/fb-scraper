const puppeteer = require('puppeteer');
const fs = require('fs');

const CRED = {
  user: process.env.USER,
  pass: process.env.PASSWORD
};
const URL = process.env.URL;
const FOLDER_OUTPUT = './dist';

const sleep = async (ms) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const ID = {
  login: '#email',
  pass: '#pass'
};

(async () => {
  console.log('## START SCRAPING');
  fs.mkdirSync(FOLDER_OUTPUT);

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
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
  //await page.waitForNavigation();

  const html = await page.content();
  fs.writeFileSync(FOLDER_OUTPUT + '/facebook.html', html);

  await page.screenshot({
    path: FOLDER_OUTPUT + '/facebook.png'
  });

  const reviews = await page.$$eval('.userContent', reviews => reviews.map(r => r.textContent));
  fs.writeFileSync(FOLDER_OUTPUT + '/facebook.json', JSON.stringify(reviews));

  browser.close();
})();
