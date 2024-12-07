const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const twitterTrends = async (browser) => {
    const page = (await browser.pages())[0];
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36');

    await page.goto('https://trends24.in/indonesia');

    await page.waitForSelector('#tab-link-table');
    await page.click('#tab-link-table');
    const trends = await page.evaluate(() => {
        const topics = document.querySelectorAll('td.topic');

        return Array.from(topics).map((topic) => {
            return {
                topic: topic.innerText
            };
        });
    });

    const outputsFolder = path.resolve(__dirname, '../outputs');
    if (!fs.existsSync(outputsFolder)) {
        fs.mkdirSync(outputsFolder);
    }

    const json2csvParser = new Parser();
    const csvData = json2csvParser.parse(trends);

    const csvFilePath = path.resolve(outputsFolder, 'twitter-trends.csv');
    fs.writeFileSync(csvFilePath, csvData);

    console.log('CSV file twitter trends successfully created:', csvFilePath);
};

module.exports = twitterTrends;
