import { Aws, Stack, StackProps } from 'aws-cdk-lib';
import * as waf from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

const WAF_REST_API_ORIGIN_VERIFY_HEADER = 'X-Origin-Verify';
const WAF_REST_API_ORIGIN_VERIFY_HEADER_VALUE = 'protect-my-api';

type WafStackProps = StackProps & {
  restApi: apigw.LambdaRestApi;
};

export class WafStack extends Stack {
  wafCloudFrontAclArn: string;
  wafRestApiOriginVerifyHeader: string;
  wafRestApiOriginVerifyHeaderValue: string;

  constructor(scope: Construct, id: string, props: WafStackProps) {
    super(scope, id, props);

    this.wafRestApiOriginVerifyHeader = WAF_REST_API_ORIGIN_VERIFY_HEADER;
    this.wafRestApiOriginVerifyHeaderValue = WAF_REST_API_ORIGIN_VERIFY_HEADER_VALUE;

    const wafRestApi = new waf.CfnWebACL(this, 'wafRestApi', {
      scope: 'REGIONAL',
      defaultAction: {
        block: {},
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'wafRestApi-metric',
      },
      rules: [
        {
          name: 'wafRestApi-verifyHeader-rule',
          priority: 0,
          action: {
            allow: {},
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'wafRestApi-verifyHeader-rule-metric',
          },
          statement: {
            byteMatchStatement: {
              fieldToMatch: {
                singleHeader: {
                  Name: WAF_REST_API_ORIGIN_VERIFY_HEADER,
                },
              },
              positionalConstraint: 'EXACTLY',
              searchString: WAF_REST_API_ORIGIN_VERIFY_HEADER_VALUE,
              textTransformations: [{ priority: 0, type: 'NONE' }],
            },
          },
        },
      ],
    });
    new waf.CfnWebACLAssociation(this, 'wafRestApiAssociation', {
      webAclArn: wafRestApi.attrArn,
      resourceArn: `arn:aws:apigateway:${Aws.REGION}::/restapis/${props.restApi.restApiId}/stages/${props.restApi.deploymentStage.stageName}`,
    });
  }
}
