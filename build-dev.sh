cp .babelrc-dev ./source/client/.babelrc
./node_modules/.bin/babel ./source/client/ --out-dir ./distributable/js/
rm ./source/client/.babelrc
