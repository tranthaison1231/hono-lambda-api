import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

type CloudFrontStackProps = cdk.StackProps & {
  restApi: apigw.RestApi;
  wafCloudFrontAclArn: string;
  wafRestApiOriginVerifyHeader: string;
  wafRestApiOriginVerifyHeaderValue: string;
};

export class CloudFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    const domainName = props.restApi.restApiId + '.execute-api.' + this.region + '.amazonaws.com';

    const distribution = new cloudfront.Distribution(this, 'distribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(domainName, {
          customHeaders: {
            [props.wafRestApiOriginVerifyHeader]: props.wafRestApiOriginVerifyHeaderValue,
          },
          originPath: `/${props.restApi.deploymentStage.stageName}`,
        }),
      },
    });

    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: distribution.distributionDomainName,
    });
  }
}
