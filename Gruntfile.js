"use strict";

module.exports = function(grunt) {

  grunt.sensitiveConfig = grunt.file.readJSON("./sensitive.json");
  grunt.customConfig = grunt.file.readJSON("./custom-configuration.json");

  grunt
      .initConfig({
        pkg : grunt.file.readJSON("./package.json"),
        wait : {
          options : {
            // Two minutes
            delay : 120000
          },
          pause : {
            options : {
              before : function(options) {
                console.log("Pausing %ds", options.delay / 1000);
              },
              after : function() {
                console.log("End pause");
              }
            }
          }
        },

        dock : {
          options : {
            auth : grunt.sensitiveConfig.docker.registry.auth,
            registry : grunt.sensitiveConfig.docker.registry.serveraddress,
            // Local docker demon used to send Docker commands to the cluster
            docker : grunt.sensitiveConfig.docker.master,
            // Options for the Docker clients on the servers
            dockerclient : grunt.sensitiveConfig.docker.client,

            images : {
              spark : {
                dockerfile : "./images/spark",
                tag : "1.5.1",
                repo : "spark",
                options : {
                  build : {
                    t : grunt.sensitiveConfig.docker.registry.serveraddress
                        + "/spark:" + "1.5.1",
                    pull : false,
                    nocache : false
                  },
                  run : {
                    create : {
                      Hostname : "spark",
                      ExposedPorts : {
                        "8088/tcp" : {},
                        "8042/tcp" : {}
                      },
                      HostConfig : {
                        PortBindings : {
                          "8088/tcp" : [ {
                            HostPort : "8088"
                          } ],
                          "8042/tcp" : [ {
                            HostPort : "8042"
                          } ]

                        }
                      }
                    },
                    start : {},
                    cmd : []
                  },
                }
              }
            },

            test : [
                {
                  auth : grunt.sensitiveConfig.test.auth,
                  protocol : "http",
                  port : 80,
                  path : "/wfs",
                  query : {
                    request : "GetCapabilities",
                    version : "1.1.0",
                    service : "wfs"
                  },
                  shouldStartWith : "<ows:"
                },
                {
                  auth : grunt.sensitiveConfig.test.auth,
                  protocol : "http",
                  port : 80,
                  path : "/wfs",
                  query : {
                    request : "GetFeature",
                    version : "1.1.0",
                    service : "wfs",
                    typename : "aurin:evi_AusByEVI2011_DataProfile",
                    maxfeatures : "2"
                  },
                  shouldStartWith : "<?xml version=\"1.0\" encoding=\"UTF-8\"?><wfs:FeatureCollection"
                },
                {
                  auth : grunt.sensitiveConfig.test.auth,
                  protocol : "http",
                  port : 80,
                  path : "/wps",
                  query : {
                    request : "GetCapabilities",
                    version : "1.0.0",
                    service : "wps"
                  },
                  shouldStartWith : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                },
                {
                  auth : grunt.sensitiveConfig.test.auth,
                  protocol : "http",
                  port : 80,
                  path : "/csw",
                  query : {
                    request : "GetCapabilities",
                    version : "2.0.2",
                    service : "csw"
                  },
                  shouldStartWith : "<?xml version=\"1.0\" encoding=\"UTF-8\"?><csw:Capabilities xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:gmd=\"http://www.isotc211.org/2005/gmd\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\" xmlns:ows=\"http://www.opengis.net/ows\" xmlns:csw=\"http://www.opengis.net/cat/csw/2.0.2\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"2.0.2\" xsi:schemaLocation=\"http://www.opengis.net/cat/csw/2.0.2 http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd\"><ows:ServiceIdentification><ows:ServiceType>CSW"
                } ]
          }
        },

        clouddity : {
          pkgcloud : grunt.sensitiveConfig.pkgcloud,
          docker : grunt.sensitiveConfig.docker,

          cluster : "scats",

          securitygroups : {
            "default" : {
              description : "Opens the Docker demon and SSH ports to dev and cluster nodes",
              rules : [ {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 22,
                portRangeMax : 22,
                remoteIpPrefix : grunt.customConfig.devIPs,
                remoteIpNodePrefixes : [ "master", "slave" ]
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 2375,
                portRangeMax : 2375,
                remoteIpPrefix : grunt.customConfig.devIPs
              } ]
            },
            webconsole : {
              description : "Opens the Hadoop, Spark, Accumulo web console ports to dev machines",
              rules : [ {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 8080,
                portRangeMax : 8080,
                remoteIpPrefix : grunt.customConfig.devIPs
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 8020,
                portRangeMax : 8020,
                remoteIpPrefix : grunt.customConfig.devIPs
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 50095,
                portRangeMax : 50095,
                remoteIpPrefix : grunt.customConfig.devIPs
              } ]
            },
            slave : {
              description : "Opens the Hadoop, Spark, Accumulo slave ports to the master, all other slaves, and dev machines",
              rules : [ {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 2181,
                portRangeMax : 2181,
                remoteIpPrefix : grunt.customConfig.devIPs,
                remoteIpNodePrefixes : [ "master", "slave" ]
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 2888,
                portRangeMax : 2888,
                remoteIpPrefix : grunt.customConfig.devIPs,
                remoteIpNodePrefixes : [ "master", "slave" ]
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 3888,
                portRangeMax : 3888,
                remoteIpPrefix : grunt.customConfig.devIPs,
                remoteIpNodePrefixes : [ "master", "slave" ]
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 7077,
                portRangeMax : 7077,
                remoteIpPrefix : grunt.customConfig.devIPs,
                remoteIpNodePrefixes : [ "master", "slave" ]
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 9997,
                portRangeMax : 9997,
                remoteIpPrefix : grunt.customConfig.devIPs,
                remoteIpNodePrefixes : [ "master", "slave" ]
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 50010,
                portRangeMax : 50010,
                remoteIpPrefix : grunt.customConfig.devIPs,
                remoteIpNodePrefixes : [ "master", "slave" ]
              } ]
            },

            nodetypes : [ {
              name : "slave",
              replication : 4,
              imageRef : "81f6b78f-6d51-4de9-a464-91d47543d4ba",
              flavorRef : "885227de-b7ee-42af-a209-2f1ff59bc330",
              securitygroups : [ "default", "slave" ],
              images : [ "spark" ]
            }, {
              name : "master",
              replication : 1,
              imageRef : "81f6b78f-6d51-4de9-a464-91d47543d4ba",
              flavorRef : "885227de-b7ee-42af-a209-2f1ff59bc330",
              securitygroups : [ "default", "webconsole" ],
              images : [ "spark" ]
            } ]
          }
        }
      });

  // Dependent tasks declarations
  require("load-grunt-tasks")(grunt, {
    config : "./package.json"
  });

  // Utility tasks to deploy and undeploy the cluster in one go
  grunt.registerTask("deploy", [ "clouddity:createsecuritygroups", "wait",
      "clouddity:createnodes", "wait", "clouddity:updatesecuritygroups" ]);
  grunt.registerTask("undeploy", [ "clouddity:destroynodes", "wait",
      "clouddity:destroysecuritygroups" ]);
};
