cp .babelrc-release ./client/.babelrc 
./node_modules/.bin/babel ./client/src/ --out-dir ./client/dist/
rm ./client/.babelrc
