const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');
const googleTrends = require('./google-trends.js');
const ora = require('ora-classic');

const threads = async (browser) => {
    const keywords = await googleTrends(browser);
    const page = (await browser.pages())[0];
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36');

    const allResults = [];
    const spinner = ora('Scraping Threads...').start();

    try {
        for (const keyword of keywords) {
            await page.goto(`https://www.threads.net/search?q=${keyword}`, { timeout: 60000 });

            const postsArray = await page.evaluate(async () => {
                const posts = document.querySelectorAll('#barcelona-page-layout > div > div > div > div > div > div > div > div > div > div > div');
                return Array.from(posts).map((post) => {
                    let username = post.querySelector('div > div > div > div > div:nth-child(2) > div > div > div > span:nth-child(1)');
                    if (username) {
                        username = username.innerText;
                    }
                    let datetime = post.querySelector('time');
                    if (datetime) {
                        datetime = datetime.getAttribute('datetime');
                    }
                    let content = post.querySelector('div > div > div > div > div:nth-child(3) > div > div:nth-child(1)');
                    if (content) {
                        content = content.innerText;
                    }

                    let engagement;
                    let like_count;
                    let reply_count;
                    let repost_count;
                    let share_count;

                    let attachment = post.querySelector('div > div > div > div > div:nth-child(3) > div > div:nth-child(2) img');
                    if (attachment) {
                        engagement = post.querySelectorAll('div > div > div > div > div:nth-child(3) > div > div:nth-child(3) > div > div span span');
                        const picture = attachment.querySelector('picture');
                        if (!picture) {
                            attachment = attachment.getAttribute('src');
                        } else {
                            attachment = attachment.getAttribute('srcset').split(' ')[0];
                        }
                    } else {
                        engagement = post.querySelectorAll('div > div > div > div > div:nth-child(3) > div > div:nth-child(2) > div > div span span');
                    }

                    if (engagement.length > 0 && engagement.length <= 4) {
                        like_count = engagement[0];
                        if (like_count) {
                            like_count = like_count.innerText;
                        }
                        reply_count = engagement[1];
                        if (reply_count) {
                            reply_count = reply_count.innerText;
                        }
                        repost_count = engagement[2];
                        if (repost_count) {
                            repost_count = repost_count.innerText;
                        }
                        share_count = engagement[3];
                        if (share_count) {
                            share_count = share_count.innerText;
                        }
                    }

                    return {
                        username,
                        datetime,
                        content,
                        attachment,
                        like_count,
                        reply_count,
                        repost_count,
                        share_count
                    };
                });
            });

            allResults.push(...postsArray);
        }
        const outputsFolder = path.resolve(__dirname, '../outputs');
        if (!fs.existsSync(outputsFolder)) {
            fs.mkdirSync(outputsFolder);
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(allResults);

        const csvFilePath = path.resolve(outputsFolder, 'threads.csv');
        fs.writeFileSync(csvFilePath, csv);
        spinner.succeed('Scraping completed successfully!');

        console.log('CSV file threads successfully created:', csvFilePath);
    } catch (error) {
        spinner.fail('Scraping failed.');
        console.error(error);
    }

};

module.exports = threads;
