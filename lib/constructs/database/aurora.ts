import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { RemovalPolicy } from 'aws-cdk-lib';


interface RedmineAuroraProps {
    vpc: ec2.IVpc;
}
// Todo: クラスタ識別子やサブネットグループ名を固定値に変更する
export class RedmineAurora extends Construct {
  public readonly cluster: rds.DatabaseCluster;
  public readonly subnetGroup: rds.SubnetGroup;

  private static readonly DB_NAME = 'redmine';
  private static readonly CLUSTER_ID = 'redmine-db-cluster';
  private static readonly SUBNET_GROUP_NAME = 'redmine-db-subnet-group';

  constructor(scope: Construct, id: string, props: RedmineAuroraProps) {
    super(scope, id);

    this.subnetGroup = this.createSubnetGroup(props.vpc);

    this.cluster = this.createCluster(props.vpc, this.subnetGroup);
  }

  private createSubnetGroup(vpc: ec2.IVpc): rds.SubnetGroup {
    return new rds.SubnetGroup(this, 'RedmineDBSubnetGroup', {
      vpc,
      subnetGroupName: RedmineAurora.SUBNET_GROUP_NAME,
      description: 'Subnet group for Redmine Aurora DB cluster',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });
  }

  private createCluster(vpc: ec2.IVpc, subnetGroup: rds.SubnetGroup): rds.DatabaseCluster {
    return new rds.DatabaseCluster(this, 'RedmineDB', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_8,
      }),
      clusterIdentifier: RedmineAurora.CLUSTER_ID,
      defaultDatabaseName: RedmineAurora.DB_NAME,
      vpc,
      subnetGroup,
      credentials: rds.Credentials.fromGeneratedSecret('adminuser'),
      writer: rds.ClusterInstance.provisioned('writer', {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
        publiclyAccessible: false,
      }),
      readers: [
        rds.ClusterInstance.provisioned('reader', {
          instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
          applyImmediately: false,
        }),
      ],
      storageType: rds.DBClusterStorageType.AURORA,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}