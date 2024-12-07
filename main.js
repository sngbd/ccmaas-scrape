require('dotenv').config();
const yargs = require('yargs');
const { exec } = require('child_process');
const init = require('./puppeteer');
const twitterTrends = require('./scripts/twitter-trends');
const combineTweets = require('./scripts/combine-tweets');
const threads = require('./scripts/threads');
const ora = require('ora-classic');

const execPromise = (command) => {
    const spinner = ora('Scraping Twitter...').start();
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                spinner.fail('Scraping failed.');
                reject(`Error executing ${command}: ${error.message}`);
                return;
            }
            if (stderr) {
                spinner.fail('Scraping failed.');
                reject(`stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
            spinner.succeed('Scraping completed successfully!');
        });
    });
};

const argv = yargs
    .command('twitter', 'Scrape Twitter trends', {}, async () => {
        const browser = await init();
        try {
            await twitterTrends(browser);
            await execPromise('sh search_tweets.sh');
            await combineTweets();
        } catch (err) {
            console.error(err);
        } finally {
            await browser.close();
        }
    })
    .command('threads', 'Scrape Threads', {}, async () => {
        const browser = await init();
        try {
            await threads(browser);
        } catch (err) {
            console.error(err);
        } finally {
            await browser.close();
        }
    })
    .demandCommand(1, 'You need to specify a command to run')
    .help()
    .argv;