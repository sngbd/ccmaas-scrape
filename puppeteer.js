const puppeteer = require('puppeteer-extra');
const PCR = require('puppeteer-chromium-resolver');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const option = {
  revision: '',
  detectionPath: '',
  folderName: '.chromium-browser-snapshots',
  defaultHosts: ['https://storage.googleapis.com', 'https://npm.taobao.org/mirrors'],
  hosts: [],
  cacheRevisions: 2,
  retry: 3,
  silent: false,
};

const init = async () => {
  const stats = await PCR(option);
  return await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    executablePath: stats.executablePath,
  });
};

module.exports = init;
