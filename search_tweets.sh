#!/bin/zsh

eval $(dotenv -e .env)

topics=()

while IFS=, read -r first_column _; do
    if [ "$first_column" != '"topic"' ]; then
        topics+=("$first_column")
    fi
done < outputs/twitter-trends.csv

for topic in "${topics[@]}"; do
  echo "Searching for topic: $topic"
  npx --yes tweet-harvest@latest -o "$topic.csv" -s "$topic" -l 40 --token "$AUTH_TOKEN"
done