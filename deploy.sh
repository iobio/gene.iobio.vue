#!/bin/bash

./build.sh $1

# upload to cloudfront
if [[ $1 == "prod" ]]; then
  #aws s3 cp ./deploy/  s3://static.iobio.io/vue.gene.iobio.io/ --recursive
  #aws cloudfront create-invalidation --distribution-id EPK0TTL11YUW --paths /

  echo "** Uploaded to prod s3 bucket **"
  aws s3 cp ./deploy/  s3://static.iobio.io/prod/gene.iobio.io/ --recursive
  echo "** Renew cloudfrount cache **"
  aws cloudfront create-invalidation --distribution-id E331YTF25OIVP7 --paths /\*

# upload to cloudfront
elif [[ $1 == "stage" ]]; then
  #aws s3 cp ./deploy/  s3://static.iobio.io/vue.gene.iobio.io/ --recursive
  #aws cloudfront create-invalidation --distribution-id EPK0TTL11YUW --paths /

  echo "** Uploaded to stage s3 bucket **"
  aws s3 cp ./deploy/  s3://static.iobio.io/stage/gene.iobio.io/ --recursive
  echo "** Renew cloudfrount cache **"
  aws cloudfront create-invalidation --distribution-id E1XZ0L3S5I92GN --paths /\*

# upload to cloudfront
elif [[ $1 == "stage.mygene2" ]]; then

  echo "** Uploaded to stage.mygene2 s3 bucket **"
  aws s3 cp ./deploy/  s3://static.iobio.io/stage/mygene2.iobio.io/ --recursive
  echo "** Renew cloudfrount cache **"
  aws cloudfront create-invalidation --distribution-id E2XR0DTGGE2U2U --paths /\*

# upload to cloudfront
elif [[ $1 == "learngene" ]]; then

  echo "** Uploaded to exhibit version of gene.iobio to s3 bucket **"
  aws s3 cp ./deploy/  s3://learngene.iobio.io/ --recursive
  echo "** Renew cloudfrount cache **"
  aws cloudfront create-invalidation --distribution-id E2DN3QDWY6RYL1 --paths /\*
  echo "** defaulting to original .env"
  cp .env.template .env
else
  echo "** Syncing to dev s3 bucket **"
  #aws s3 sync ./deploy/  s3://static.iobio.io/dev/gene.iobio.io/
  aws s3 cp  ./deploy/  s3://static.iobio.io/dev/gene.iobio.io/ --recursive
  echo "** Renew cloudfrount cache **"
  aws cloudfront create-invalidation --distribution-id E1RAE4AL1ULL9A --paths /\*
fi
