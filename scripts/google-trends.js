const path = require('path');
const fs = require('fs');
const { setTimeout } = require('node:timers/promises');
const csv = require('csv-parser');

const deleteAllFilesInDirectory = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    fs.unlinkSync(filePath);
  }
};

const googleTrends = async (browser) => {
    const page = (await browser.pages())[0];
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36');
    await page.goto('https://trends.google.com/trending?geo=ID&hl=id-ID');
    await page.waitForSelector('tr[role="row"]');

    const downloadPath = path.resolve(__dirname, 'downloads');
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    } else {
        deleteAllFilesInDirectory(downloadPath);
    }

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    const exportBtn = await page.waitForSelector('xpath/html/body/c-wiz/div/div[5]/div[1]/c-wiz/div/div[1]/div[3]/div[2]/div[2]/div/div[1]/div/button/span[4]');
    await exportBtn.click();

    const exportCsv = await page.$$('li[data-action="csv"]');
    if (exportCsv.length > 1) {
        await exportCsv[1].click();
    }

    await setTimeout(1000);

    const files = fs.readdirSync(downloadPath);
    const sortedFiles = files.map(file => ({
      file,
      time: fs.statSync(path.join(downloadPath, file)).mtime.getTime()
    })).sort((a, b) => b.time - a.time);
  
    const mostRecentFile = sortedFiles.length > 0 ? sortedFiles[0].file : null;

    const csvFilePath = path.resolve(downloadPath, mostRecentFile);

    const trends = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                results.push(row['Tren']);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });

    return trends;
};

module.exports = googleTrends;
