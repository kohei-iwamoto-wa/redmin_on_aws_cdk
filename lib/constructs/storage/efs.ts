import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';

interface RedmineEfsProps {
  vpc: ec2.IVpc;
}

export class RedmineEfs extends Construct {
  public readonly fileSystem: efs.FileSystem;

  constructor(scope: Construct, id: string, props: RedmineEfsProps) {
    super(scope, id);

    this.fileSystem = this.createFileSystem(props.vpc);

    this.configureAccess(props.vpc);
  }

  /**
   * EFS本体の作成
   */
  private createFileSystem(vpc: ec2.IVpc): efs.FileSystem {
    return new efs.FileSystem(this, 'RedmineEFS', {
      vpc,
      encrypted: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      // 必要に応じてライフサイクルポリシーなどを追加
      // lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS,
    });
  }

  /**
   * 通信許可設定
   */
  private configureAccess(vpc: ec2.IVpc): void {
    this.fileSystem.connections.allowDefaultPortFrom(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      'Allow NFS access from within VPC'
    );
  }
}