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
              hadoop : {
                dockerfile : "./images/hadoop",
                tag : "2.6.0",
                repo : "hadoop",
                options : {
                  build : {
                    t : grunt.sensitiveConfig.docker.registry.serveraddress
                        + "/hadoop:" + "2.6.0",
                    pull : false,
                    nocache : false
                  },
                  run : {
                    create : {
                      Hostname : "hadoop",
                      ExposedPorts : {
                        "50010/tcp" : {},
                        "50020/tcp" : {},
                        "50070/tcp" : {},
                        "50075/tcp" : {},
                        "50090/tcp" : {},
                        "8020/tcp" : {},
                        "9000/tcp" : {},
                        "19888/tcp" : {},
                        "8030/tcp" : {},
                        "8031/tcp" : {},
                        "8032/tcp" : {},
                        "8033/tcp" : {},
                        "8040/tcp" : {},
                        "8042/tcp" : {},
                        "8088/tcp" : {},
                        "49707/tcp" : {},
                        "2122/tcp" : {},
                        "22/tcp" : {}
                      },
                      // TODO: I suppose all them have to be exposed
                      HostConfig : {
                        PortBindings : {
                          "8088/tcp" : [ {
                            HostPort : ""
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
              },
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
            }
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
            }
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
      });

  // Dependent tasks declarations
  require("load-grunt-tasks")(grunt, {
    config : "./package.json"
  });

  // Setups and builds the Docker images
  grunt.registerTask("build", [ "dock:build" ]);

  // Pushes the Docker images to registry
  grunt.registerTask("push", [ "dock:push" ]);

  // Utility tasks to deploy and undeploy the cluster in one go
  grunt.registerTask("deploy", [ "clouddity:createsecuritygroups", "wait",
      "clouddity:createnodes", "wait", "clouddity:updatesecuritygroups" ]);
  grunt.registerTask("undeploy", [ "clouddity:destroynodes", "wait",
      "clouddity:destroysecuritygroups" ]);

  // Pulls the Docker images from registry
  grunt.registerTask("pull", [ "clouddity:pull" ]);

  // Generate configuration and copies to the hosts
  grunt.registerTask("generate", [ "clean", "mkdir", "ejs",
      "clouddity:copytohost" ]);

  // Listing cluster components tasks
  grunt.registerTask("listsecuritygroups", [ "clouddity:listsecuritygroups" ]);
  grunt.registerTask("listnodes", [ "clouddity:listnodes" ]);
  grunt.registerTask("listcontainers", [ "clouddity:listcontainers" ]);

  // Docker containers creation
  grunt.registerTask("run", [ "clouddity:run" ]);

  // Docker containers management
  grunt.registerTask("stop", [ "clouddity:stop" ]);
  grunt.registerTask("start", [ "clouddity:start" ]);

  // Docker containers removal
  grunt
      .registerTask("remove", [ "clouddity:stop", "wait", "clouddity:remove" ]);

  // Tests the deployed containers
  grunt.registerTask("test", [ "clouddity:test" ]);
};
