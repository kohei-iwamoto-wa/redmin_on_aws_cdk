#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RedminOnAwsCdkStack } from '../lib/stacks/redmin_on_aws_cdk-stack';

const app = new cdk.App();
new RedminOnAwsCdkStack(app, 'RedminOnAwsCdkStack', {});
