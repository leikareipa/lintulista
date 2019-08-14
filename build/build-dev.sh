cp .babelrc-dev ../client/.babelrc
cd ..
./node_modules/.bin/babel ./client/src/ --out-dir ./client/dist/
rm ./client/.babelrc
cd -
