const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const readCsvFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

const combineTweets = async () => {
    const tweetsDataFolder = path.resolve(__dirname, '../tweets-data');
    const allTweets = [];
    const uniqueConversationIds = new Set();

    const files = fs.readdirSync(tweetsDataFolder);
    for (const file of files) {
        if (path.extname(file) === '.csv') {
            const match = file.match(/"([^"]+)"/);
            const keyword = match ? match[1] : path.basename(file, '.csv'); // Extract keyword from filename
            const tweets = await readCsvFile(path.join(tweetsDataFolder, file));
            for (const tweet of tweets) {
                if (!uniqueConversationIds.has(tweet.conversation_id_str)) {
                    uniqueConversationIds.add(tweet.conversation_id_str);
                    tweet.keyword = keyword; // Add the keyword column
                    allTweets.push(tweet);
                }
            }
        }
    }

    const outputsFolder = path.resolve(__dirname, '../outputs');
    if (!fs.existsSync(outputsFolder)) {
        fs.mkdirSync(outputsFolder);
    }

    const fields = ['conversation_id_str', 'created_at', 'favorite_count', 'keyword', 'full_text', 'id_str', 'image_url', 'in_reply_to_screen_name', 'lang', 'location', 'quote_count', 'reply_count', 'retweet_count', 'tweet_url', 'user_id_str', 'username'];
    const json2csvParser = new Parser({ fields });
    const combinedCsvData = json2csvParser.parse(allTweets);

    const combinedCsvFilePath = path.resolve(outputsFolder, 'tweets.csv');
    fs.writeFileSync(combinedCsvFilePath, combinedCsvData);

    console.log('Combined CSV file successfully created:', combinedCsvFilePath);
};

module.exports = combineTweets;
