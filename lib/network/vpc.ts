import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface RedminVpcProps {}

export class RedminVpc extends Construct {
  public readonly vpc: ec2.Vpc;
    public readonly s3Endpoint?: ec2.GatewayVpcEndpoint;
    public readonly ssmEndpoint?: ec2.InterfaceVpcEndpoint;
    public readonly ssmMessagesEndpoint?: ec2.InterfaceVpcEndpoint;
    public readonly ecrApiEndpoint?: ec2.InterfaceVpcEndpoint;
    public readonly ecrDockerEndpoint?: ec2.InterfaceVpcEndpoint;
    public readonly secretsManagerEndpoint?: ec2.InterfaceVpcEndpoint;
    public readonly logsEndpoint?: ec2.InterfaceVpcEndpoint;
    public readonly ec2MessagesEndpoint?: ec2.InterfaceVpcEndpoint;

  constructor(scope: Construct, id: string, props: RedminVpcProps) {
    super(scope, id);

    // --- VPC ---
    this.vpc = new ec2.Vpc(this, 'RedminVPC', {
        vpcName: 'RedminVPC',
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        natGateways: 1, 
        subnetConfiguration: [
            {
                cidrMask: 24,
                name: 'Public',
                subnetType: ec2.SubnetType.PUBLIC,
            },
            {
                cidrMask: 24,
                name: 'ECS',
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
            {
                cidrMask: 24,
                name: 'DB',
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            {
                cidrMask: 24,
                name: 'Storage',
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            }
        ],
        maxAzs: 2 // 2つのAZに展開
    });

    // --- VPC Endpoints ---
    this.s3Endpoint = this.vpc.addGatewayEndpoint('S3Endpoint', {
        service: ec2.GatewayVpcEndpointAwsService.S3,
        subnets: [
            { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        ],
    });

    const endpointSubnets = { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS };

    this.ssmEndpoint = this.vpc.addInterfaceEndpoint('SsmEndpoint', {
        service: ec2.InterfaceVpcEndpointAwsService.SSM,
        subnets: endpointSubnets,
    });

    this.ssmMessagesEndpoint = this.vpc.addInterfaceEndpoint('SsmMessagesEndpoint', {
        service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
        subnets: endpointSubnets,
    });

    this.ec2MessagesEndpoint = this.vpc.addInterfaceEndpoint('Ec2MessagesEndpoint', {
        service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
        subnets: endpointSubnets,
    });

    this.ecrApiEndpoint = this.vpc.addInterfaceEndpoint('EcrApiEndpoint', {
        service: ec2.InterfaceVpcEndpointAwsService.ECR,
        subnets: endpointSubnets,
    });

    this.ecrDockerEndpoint = this.vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
        service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
        subnets: endpointSubnets,
    });

    this.secretsManagerEndpoint = this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
        service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        subnets: endpointSubnets,
    });

    this.logsEndpoint = this.vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
        service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
        subnets: endpointSubnets,
    });
  }
}