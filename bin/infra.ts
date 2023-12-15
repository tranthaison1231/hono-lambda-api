#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RestApiStack } from '../lib/rest-api-stack';
import { WafStack } from '../lib/waf-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';

const app = new cdk.App();
const restApiStack = new RestApiStack(app, 'RestApiStack');
const wafStack = new WafStack(app, 'WafStack', {
  restApi: restApiStack.restApi,
});
new CloudFrontStack(app, 'CloudFrontStack', {
  restApi: restApiStack.restApi,
  wafCloudFrontAclArn: wafStack.wafCloudFrontAclArn,
  wafRestApiOriginVerifyHeader: wafStack.wafRestApiOriginVerifyHeader,
  wafRestApiOriginVerifyHeaderValue: wafStack.wafRestApiOriginVerifyHeaderValue,
});
