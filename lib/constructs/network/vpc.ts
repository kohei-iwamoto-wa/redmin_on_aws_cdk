import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface RedmineVpcProps {}

export class RedmineVpc extends Construct {
  public readonly vpc: ec2.Vpc;

  public readonly s3Endpoint: ec2.GatewayVpcEndpoint;

  constructor(scope: Construct, id: string, props: RedmineVpcProps) {
    super(scope, id);

    this.vpc = this.createVpc();
    this.s3Endpoint = this.addGatewayEndpoints();
    this.addInterfaceEndpoints();
  }

  private createVpc(): ec2.Vpc {
    return new ec2.Vpc(this, 'RedmineVPC', {
      vpcName: 'RedmineVPC',
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      natGateways: 1,
      subnetConfiguration: [
        { cidrMask: 24, name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
        { cidrMask: 24, name: 'ECS', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        { cidrMask: 24, name: 'DB', subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
      maxAzs: 2,
    });
  }

  /**
   * S3などのゲートウェイ型エンドポイントを追加
   */
  private addGatewayEndpoints(): ec2.GatewayVpcEndpoint {
    return this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [
        { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      ],
    });
  }

  /**
   * SSM/ECR/Logsなどのインターフェース型エンドポイントを一括追加
   */
  private addInterfaceEndpoints(): void {
    const endpointSubnets = { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS };

    const services = [
      { id: 'SsmEndpoint', service: ec2.InterfaceVpcEndpointAwsService.SSM },
      { id: 'SsmMessagesEndpoint', service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES },
      { id: 'Ec2MessagesEndpoint', service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES },
      { id: 'EcrApiEndpoint', service: ec2.InterfaceVpcEndpointAwsService.ECR },
      { id: 'EcrDockerEndpoint', service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER },
      { id: 'SecretsManagerEndpoint', service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER },
      { id: 'CloudWatchLogsEndpoint', service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS },
    ];

    services.forEach((s) => {
      this.vpc.addInterfaceEndpoint(s.id, {
        service: s.service,
        subnets: endpointSubnets,
      });
    });
  }
}