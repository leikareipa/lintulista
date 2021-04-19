cp .babelrc-dev ./source/.babelrc
./node_modules/.bin/babel ./source/ --out-dir ./distributable/js/
rm ./source/.babelrc
