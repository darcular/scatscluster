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
              clusternode : {
                dockerfile : "./images/clusternode",
                tag : "0.1.0",
                repo : "clusternode",
                options : {
                  build : {
                    t : grunt.sensitiveConfig.docker.registry.serveraddress
                        + "/clusternode:" + "0.1.0",
                    pull : false,
                    nocache : false
                  },
                  run : {
                    create : {
                      Hostname : "clusternode",
                      ExposedPorts : {
                        "22/tcp" : {}
                      },
                      HostConfig : {
                        Binds : [],
                        PortBindings : {
                          "22/tcp" : [ {
                            HostPort : "2022"
                          } ]
                        }
                      },
                      start : {},
                      cmd : []
                    }
                  }
                }
              },
              sparkmaster : {
                dockerfile : "./images/sparkmaster",
                tag : "1.6.0",
                repo : "sparkmaster",
                options : {
                  build : {
                    t : grunt.sensitiveConfig.docker.registry.serveraddress
                        + "/sparkmaster:" + "1.6.0",
                    pull : false,
                    nocache : false
                  },
                  run : {
                    create : {
                      Hostname : "sparkmaster",
                      ExposedPorts : {
                        "22/tcp" : {},
                        "4040/tcp" : {},
                        "6066/tcp" : {},
                        "7077/tcp" : {},
                        "8080/tcp" : {},
                        "18080/tcp" : {},
                        "7079/tcp" : {},
                        "7080/tcp" : {},
                        "7081/tcp" : {},
                        "7082/tcp" : {},
                        "7083/tcp" : {},
                        "7084/tcp" : {}
                      },
                      HostConfig : {
                        NetworkMode : "host",
                        PortBindings : {
                          "4040/tcp" : [ {
                            HostPort : "4040"
                          } ],
                          "6066/tcp" : [ {
                            HostPort : "6066"
                          } ],
                          "7077/tcp" : [ {
                            HostPort : "7077"
                          } ],
                          "8080/tcp" : [ {
                            HostPort : "8080"
                          } ],
                          "18080/tcp" : [ {
                            HostPort : "18080"
                          } ],
                          "7079/tcp" : [ {
                            HostPort : "7079"
                          } ],
                          "7080/tcp" : [ {
                            HostPort : "7080"
                          } ],
                          "7081/tcp" : [ {
                            HostPort : "7081"
                          } ],
                          "7082/tcp" : [ {
                            HostPort : "7082"
                          } ],
                          "7083/tcp" : [ {
                            HostPort : "7083"
                          } ],
                          "7084/tcp" : [ {
                            HostPort : "7084"
                          } ],
                        }
                      }
                    },
                    start : {},
                    cmd : []
                  },
                }
              },
              sparkslave : {
                dockerfile : "./images/sparkslave",
                tag : "1.6.0",
                repo : "sparkslave",
                options : {
                  build : {
                    t : grunt.sensitiveConfig.docker.registry.serveraddress
                        + "/sparkslave:" + "1.6.0",
                    pull : false,
                    nocache : false
                  },
                  run : {
                    create : {
                      "clouddity:HostAliases" : [ "scats-1-master:sparkmaster" ],
                      Hostname : "sparkslave",
                      ExposedPorts : {
                        "22/tcp" : {},
                        "4040/tcp" : {},
                        "7078/tcp" : {},
                        "8081/tcp" : {},
                        "18080/tcp" : {},
                        "7079/tcp" : {},
                        "7080/tcp" : {},
                        "7081/tcp" : {},
                        "7082/tcp" : {},
                        "7083/tcp" : {},
                        "7084/tcp" : {}
                      },
                      HostConfig : {
                        NetworkMode : "host",
                        PortBindings : {
                          "4040/tcp" : [ {
                            HostPort : "4040"
                          } ],
                          "7078/tcp" : [ {
                            HostPort : "7078"
                          } ],
                          "8081/tcp" : [ {
                            HostPort : "8081"
                          } ],
                          "18080/tcp" : [ {
                            HostPort : "18080"
                          } ],
                          "7079/tcp" : [ {
                            HostPort : "7079"
                          } ],
                          "7080/tcp" : [ {
                            HostPort : "7080"
                          } ],
                          "7081/tcp" : [ {
                            HostPort : "7081"
                          } ],
                          "7082/tcp" : [ {
                            HostPort : "7082"
                          } ],
                          "7083/tcp" : [ {
                            HostPort : "7083"
                          } ],
                          "7084/tcp" : [ {
                            HostPort : "7084"
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

            masterwebconsole : {
              description : "Opens the master web console ports to dev machines",
              rules : [ {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 4040,
                portRangeMax : 4040,
                remoteIpPrefix : grunt.customConfig.devIPs
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 18080,
                portRangeMax : 18080,
                remoteIpPrefix : grunt.customConfig.devIPs
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 8080,
                portRangeMax : 8080,
                remoteIpPrefix : grunt.customConfig.devIPs
              } ]
            },

            slavewebconsole : {
              description : "Opens the slave web console ports to dev machines",
              rules : [ {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 4040,
                portRangeMax : 4040,
                remoteIpPrefix : grunt.customConfig.devIPs
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 18080,
                portRangeMax : 18080,
                remoteIpPrefix : grunt.customConfig.devIPs
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 8081,
                portRangeMax : 8081,
                remoteIpPrefix : grunt.customConfig.devIPs
              } ]
            },

            sparkmaster : {
              description : "Opens the Spark ports to dev machines and the cluster",
              rules : [ {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 6066,
                portRangeMax : 6066,
                remoteIpNodePrefixes : [ "slave" ],
                remoteIpPrefix : grunt.customConfig.devIPs
              }, {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 7077,
                portRangeMax : 7084,
                remoteIpNodePrefixes : [ "slave" ],
                remoteIpPrefix : grunt.customConfig.devIPs
              } ]
            },

            sparkslave : {
              description : "Opens the Spark to the master and dev machines",
              rules : [ {
                direction : "ingress",
                ethertype : "IPv4",
                protocol : "tcp",
                portRangeMin : 7078,
                portRangeMax : 7084,
                remoteIpNodePrefixes : [ "master", "slave" ],
                remoteIpPrefix : grunt.customConfig.devIPs
              } ]
            }
          },

          nodetypes : [ {
            name : "master",
            replication : 1,
            imageRef : "81f6b78f-6d51-4de9-a464-91d47543d4ba",
            flavorRef : "885227de-b7ee-42af-a209-2f1ff59bc330",
            securitygroups : [ "default", "masterwebconsole", "sparkmaster" ],
            images : [ "sparkmaster" ],
            test : [ {
              name : "Master WebUI",
              protocol : "http",
              port : 8080,
              path : "/",
              shouldContain : "Spark Master at spark:"
            } ]
          }, {
            name : "slave",
            replication : 3,
            imageRef : "81f6b78f-6d51-4de9-a464-91d47543d4ba",
            flavorRef : "885227de-b7ee-42af-a209-2f1ff59bc330",
            securitygroups : [ "default", "slavewebconsole", "sparkslave" ],
            images : [ "sparkslave" ],
            test : [ {
              name : "Slave WebUI",
              protocol : "http",
              port : 8081,
              path : "/",
              shouldContain : "Spark Worker at"
            } ]
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

  // Utility tasks to create and drop the cluster in one go
  grunt.registerTask("launch", [ "clouddity:createsecuritygroups", "wait",
      "clouddity:createnodes", "wait", "clouddity:updatesecuritygroups",
      "wait", "clouddity:addhosts" ]);
  grunt.registerTask("destroy", [ "clouddity:destroynodes", "wait",
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
