import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RedminVpc } from '../network/vpc';


export class RedminOnAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new RedminVpc(this, 'RedminVPC', {});
  }
}
