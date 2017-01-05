export S3_FILE_PATH=rest-service/`date +"%Y-%m"`
export S3_FILE_NAME=${CIRCLE_SHA1:0:7}.zip
export EB_VERSION=$CIRCLE_BRANCH-${CIRCLE_SHA1:0:7}
echo $EB_VERSION > version
zip -r -9 $S3_FILE_NAME *
aws s3 cp $S3_FILE_NAME s3://datenbank-eb-$CIRCLE_BRANCH/$S3_FILE_PATH/
aws elasticbeanstalk create-application-version --application-name datenbank \
	--version-label $EB_VERSION \
	--source-bundle S3Bucket="datenbank-eb-$CIRCLE_BRANCH",S3Key="$S3_FILE_PATH/$S3_FILE_NAME"
aws elasticbeanstalk update-environment \
	--environment-name rest-service-$CIRCLE_BRANCH --version-label $EB_VERSION