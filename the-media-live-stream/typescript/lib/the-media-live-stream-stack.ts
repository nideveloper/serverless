import * as cdk from '@aws-cdk/core';
import * as medialive from '@aws-cdk/aws-medialive';
import * as mediapackage from '@aws-cdk/aws-mediapackage';
import * as iam from '@aws-cdk/aws-iam';

const DEFAULT_CONF: Map<string, any> = new Map();
DEFAULT_CONF.set('id_channel', "test-channel");
DEFAULT_CONF.set('ip_sg_input', "0.0.0.0/0");
DEFAULT_CONF.set('stream_name', "test/channel");
DEFAULT_CONF.set('hls_segment_duration_seconds', 5);
DEFAULT_CONF.set('hls_playlist_window_seconds', 60);
DEFAULT_CONF.set('hls_max_video_bits_per_second', 2147483647);
DEFAULT_CONF.set('hls_min_video_bits_per_second', 0);
DEFAULT_CONF.set('hls_stream_order', "ORIGINAL");

export class TheMediaLiveStreamStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
    * First step: Create MediaPackage Channel
    */
    const channel = new mediapackage.CfnChannel(scope=this, 
                                                id="media-package-channel-"+DEFAULT_CONF.get("id_channel"), {
                                                  id: DEFAULT_CONF.get("id_channel"),
                                                  description: "Channel "+DEFAULT_CONF.get("id_channel")
                                                });
    
    /*
    * Second step: Add a HLS endpoint to MediaPackage Channel and output the URL of this endpoint
    */
    const hls_endpoint = new mediapackage.CfnOriginEndpoint(scope=this,
                                                            id="endpoint"+DEFAULT_CONF.get("id_channel"), {
                                                              channelId: DEFAULT_CONF.get("id_channel"),
                                                              id: "endpoint"+DEFAULT_CONF.get("id_channel"),
                                                              hlsPackage: {
                                                                segmentDurationSeconds: DEFAULT_CONF.get("hls_segment_duration_seconds"),
                                                                playlistWindowSeconds: DEFAULT_CONF.get("hls_playlist_window_seconds"),
                                                                streamSelection: {
                                                                  minVideoBitsPerSecond: DEFAULT_CONF.get("hls_min_video_bits_per_second"),
                                                                  maxVideoBitsPerSecond: DEFAULT_CONF.get("hls_max_video_bits_per_second"),
                                                                  streamOrder: DEFAULT_CONF.get("hls_stream_order")
                                                                }
                                                              }
                                                            });

    // Output the url stream to player
    new cdk.CfnOutput(scope=this, id="media-package-url-stream", {
      exportName: 'mediapackageurl',
      value: hls_endpoint.attrUrl
    });

    /*
    * Third step: Create MediaLive SG, MediaLive Input and MediaLive Channel
    */

    /*
    * Input Security Group
    * Allow 0.0.0.0/0 - Modify it if you want
    */
    const security_groups_input = new medialive.CfnInputSecurityGroup(scope=this, 
                                                                    id="media-live-sg-input", {
                                                                      whitelistRules: [{"cidr":DEFAULT_CONF.get("ip_sg_input")}]
                                                                    });

    /*
    * Input with destinations output
    */
    const medialive_input = new medialive.CfnInput(scope=this, 
                                                    id="meddia-input-channel",{
                                                      name: "input-" +DEFAULT_CONF.get("id_channel"),
                                                      type: "RTMP_PUSH",
                                                      inputSecurityGroups: [security_groups_input.ref],
                                                      destinations: [{streamName: DEFAULT_CONF.get("stream_name")}]
                                                    });     

    /*
    * Media Live Channel Block
    */

    // IAM Role
    let iamRole = new iam.Role(scope=this, id="medialive_role", {
                      roleName: "medialive_role",
                      assumedBy: new iam.ServicePrincipal('medialive.amazonaws.com'),
                      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElementalMediaLiveFullAccess')]
                    });

    // Channel
    var channelLive = new medialive.CfnChannel(scope=this, id="media-live-channel-"+DEFAULT_CONF.get("id_channel"),{
      channelClass: "SINGLE_PIPELINE",
      name: DEFAULT_CONF.get("id_channel"),
      inputSpecification: {
        codec: "AVC",
        maximumBitrate: "MAX_20_MBPS",
        resolution: "HD"
      },
      inputAttachments:[{
        inputId: medialive_input.ref,
        inputAttachmentName: "attach-input"
      }],
      destinations: [{
        id: "media-destination",
        mediaPackageSettings: [{
          channelId: DEFAULT_CONF.get("id_channel")
        }]
      }],
      encoderSettings: {
        timecodeConfig: {
          source: "EMBEDDED"
        },
        // Audio descriptions
        audioDescriptions: [{
          audioSelectorName: "Default",
          audioTypeControl: "FOLLOW_INPUT",
          languageCodeControl: "FOLLOW_INPUT",
          name: "audio_1",
          codecSettings: {
            aacSettings: {
              bitrate: 192000,
              codingMode: "CODING_MODE_2_0",
              inputType: "NORMAL",
              profile: "LC",
              rateControlMode: "CBR",
              rawFormat: "NONE",
              sampleRate: 48000,
              spec: "MPEG4"
            }
          }
        },
        {
          audioSelectorName: "Default",
          audioTypeControl: "FOLLOW_INPUT",
          languageCodeControl: "FOLLOW_INPUT",
          name: "audio_2",
          codecSettings: {
            aacSettings: {
              bitrate: 192000,
              codingMode: "CODING_MODE_2_0",
              inputType: "NORMAL",
              profile: "LC",
              rateControlMode: "CBR",
              rawFormat: "NONE",
              sampleRate: 48000,
              spec: "MPEG4"
            }
          }
        }],
        // Video descriptions
        videoDescriptions:[{
          codecSettings: {
            h264Settings: {
              adaptiveQuantization: "HIGH",
              afdSignaling: "NONE",
              bitrate: 5000000,
              colorMetadata: "INSERT",
              entropyEncoding: "CABAC",
              flickerAq: "ENABLED",
              framerateControl: "SPECIFIED",
              framerateDenominator: 1,
              framerateNumerator: 50,
              gopBReference: "ENABLED",
              gopClosedCadence: 1,
              gopNumBFrames: 3,
              gopSize: 60,
              gopSizeUnits: "FRAMES",
              level: "H264_LEVEL_AUTO",
              lookAheadRateControl: "HIGH",
              numRefFrames: 3,
              parControl: "SPECIFIED",
              profile: "HIGH",
              rateControlMode: "CBR",
              scanType: "PROGRESSIVE",
              sceneChangeDetect: "ENABLED",
              slices: 1,
              spatialAq: "ENABLED",
              syntax: "DEFAULT",
              temporalAq: "ENABLED",
              timecodeInsertion: "DISABLED"
            }
          },
          height: 1080,
          name: "video_1080p30",
          respondToAfd: "NONE",
          scalingBehavior: "DEFAULT",
          sharpness: 50,
          width: 1920
        },
        {
          codecSettings: {
            h264Settings: {
              adaptiveQuantization: "HIGH",
              afdSignaling: "NONE",
              bitrate: 3000000,
              colorMetadata: "INSERT",
              entropyEncoding: "CABAC",
              flickerAq: "ENABLED",
              framerateControl: "SPECIFIED",
              framerateDenominator: 1,
              framerateNumerator: 50,
              gopBReference: "ENABLED",
              gopClosedCadence: 1,
              gopNumBFrames: 3,
              gopSize: 60,
              gopSizeUnits: "FRAMES",
              level: "H264_LEVEL_AUTO",
              lookAheadRateControl: "HIGH",
              numRefFrames: 3,
              parControl: "SPECIFIED",
              profile: "HIGH",
              rateControlMode: "CBR",
              scanType: "PROGRESSIVE",
              sceneChangeDetect: "ENABLED",
              slices: 1,
              spatialAq: "ENABLED",
              syntax: "DEFAULT",
              temporalAq: "ENABLED",
              timecodeInsertion: "DISABLED"
            }
          },
          height: 720,
          name: "video_720p30",
          respondToAfd: "NONE",
          scalingBehavior: "DEFAULT",
          sharpness: 100,
          width: 1280
        }
        ],
        // Output groups
        outputGroups: [{
          name: "HD",
          outputGroupSettings: {
            mediaPackageGroupSettings: {
              destination: {
                destinationRefId: "media-destination"
              }
            }
          },
          outputs: [{
            audioDescriptionNames: ["audio_1"],
            outputName: "1080p30",
            videoDescriptionName: "video_1080p30",
            outputSettings: {
              mediaPackageOutputSettings: {}
            }
          },
          {
            audioDescriptionNames: ["audio_2"],
            outputName: "720p30",
            videoDescriptionName: "video_720p30",
            outputSettings: {
              mediaPackageOutputSettings: {}
            }
          }]
        }]
      },
      roleArn: iamRole.roleArn
    });   
    
    // We need to add dependency because CFN must wait channel creation finish before starting the endpoint creation  
    var mediadep = new cdk.ConcreteDependable();
    mediadep.add(channel);
    hls_endpoint.node.addDependency(mediadep);
    channelLive.node.addDependency(mediadep);

  }
  
}