import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import sqs = require('@aws-cdk/aws-sqs');
import sns = require('@aws-cdk/aws-sns');
import sns_sub = require('@aws-cdk/aws-sns-subscriptions');

export class TheSnsFlowStack extends cdk.Stack {
    snsLambda: lambda.Function;
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        /**
         * SNS Topic Creation
         * Our API Gateway posts messages directly to this
         */
        const topic = new sns.Topic(this, 'TheXRayTracerSnsTopic', {
                displayName: "The XRay Tracer CDK Pattern Topic",
        });

        // defines an AWS Lambda resource
        this.snsLambda = new lambda.Function(this, 'snsLambdaHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.asset('lambdas'),
            handler: 'sns_publish.handler',
            environment: {
                TOPIC_ARN: topic.topicArn
            },
            tracing: lambda.Tracing.ACTIVE
        });
        topic.grantPublish(this.snsLambda);

        // Have a Lambda subscribe to our topic
        let snsSubscribeLambda = new lambda.Function(this, 'snsSubscriptionLambdaHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.asset('lambdas'),
            handler: 'sns_subscribe.handler',
            tracing: lambda.Tracing.ACTIVE
        });
        topic.addSubscription(new sns_sub.LambdaSubscription(snsSubscribeLambda));
    }
}