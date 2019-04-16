#!/bin/bash

rm -rf deploy
mkdir deploy
mkdir deploy/js
mkdir deploy/app
mkdir deploy/dist

# build vue app
if [[ $1 == "prod" ]]; then
  echo "** Building prod **"
  NODE_ENV=production npm run build
else
  echo "** Building dev **"
  npm run build
fi

# link to files needed for static page
ln -s ~/Documents/Code/v5_oncogene/gene.iobio.vue/server/views/index.html ~/Documents/Code/v5_oncogene/gene.iobio.vue/deploy/index.html
ln -s ~/Documents/Code/v5_oncogene/gene.iobio.vue/client/assets ~/Documents/Code/v5_oncogene/gene.iobio.vue/deploy/assets
ln -s ~/Documents/Code/v5_oncogene/gene.iobio.vue/client/js/thirdparty ~/Documents/Code/v5_oncogene/gene.iobio.vue/deploy/js/thirdparty
ln -s ~/Documents/Code/v5_oncogene/gene.iobio.vue/client/app/third-party ~/Documents/Code/v5_oncogene/gene.iobio.vue/deploy/app/third-party
ln -s ~/Documents/Code/v5_oncogene/gene.iobio.vue/client/dist/build.js ~/Documents/Code/v5_oncogene/gene.iobio.vue/deploy/dist/build.js
if [[ $1 == "prod" ]]; then
  ln -s ~/Documents/Code/v5_oncogene/gene.iobio.vue/client/dist/build.js.map ~/Documents/Code/v5_oncogene/gene.iobio.vue/deploy/dist/build.js.map
fi

# upload to cloudfront
if [[ $1 == "prod" ]]; then

  echo "** Uploaded to prod s3 bucket **"
  aws s3 cp ./deploy/  s3://static.iobio.io/prod/oncogene.iobio.io/ --recursive
  echo "** Renew cloudfrount cache **"
  aws cloudfront create-invalidation --distribution-id E3JJR7QP3DJYDS --paths /


else
  echo "** Syncing to dev s3 bucket **"
  aws s3 cp ./deploy/  s3://static.iobio.io/dev/oncogene.iobio.io/ --recursive
  echo "** Renew cloudfrount cache **"
  aws cloudfront create-invalidation --distribution-id E3JJR7QP3DJYDS --paths /

fi
