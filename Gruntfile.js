"use strict";

module.exports = function (grunt) {
  grunt.sensitiveConfig = grunt.file.readJSON("./sensitive.json");
  grunt.customConfig = grunt.file.readJSON("./custom-configuration.json");

  grunt.initConfig({
    pkg: grunt.file.readJSON("./package.json"),
    wait: {
      options: {
        delay: 120000
      },
      pause: {
        options: {
          before: function (options) {
            console.log("Pausing %ds", options.delay / 1000);
          },
          after: function () {
            console.log("End pause");
          }
        }
      }
    },

    dock: {
      options: {
        auth: grunt.sensitiveConfig.docker.registry.auth,
        registry: grunt.sensitiveConfig.docker.registry.serveraddress,
        // Local docker demon used to send Docker commands to the cluster
        docker: grunt.sensitiveConfig.docker.master,
        // Options for the Docker clients on the servers
        dockerclient: grunt.sensitiveConfig.docker.client,
        images: {
          clusternode: {
            dockerfile: "./images/clusternode",
            tag: "0.3.0",
            repo: "clusternode",
            options: {
              build: {
                t: grunt.sensitiveConfig.docker.registry.serveraddress
                + "/clusternode:" + "0.3.0",
                pull: false,
                nocache: false
              },
              run: {
                create: {
                  name: "clusternode",
                  ExposedPorts: {
                    "22/tcp": {}
                  },
                  HostConfig: {
                    PortBindings: {
                      "22/tcp": [{HostPort: "2022"}]
                    }
                  },
                  start: {},
                  cmd: []
                }
              }
            }
          },
          accumulo_hdfs_master: {
            dockerfile: "./images/accumulo-hdfs/master",
            tag: "0.1.0",
            repo: "accumulo_hdfs_master",
            options: {
              build: {
                t: grunt.sensitiveConfig.docker.registry.serveraddress
                + "/accumulo_hdfs_master:" + "0.1.0",
                pull: false,
                nocache: false
              },
              run: {
                create: {
                  name: "accumulo_hdfs_master",
                  HostConfig: {
                    Binds: ["/mnt/docker:/mnt"],
                    NetworkMode: "host"
                  }
                },
                start: {},
                cmd: []
              }
            }
          },
          accumulo_hdfs_slave: {
            dockerfile: "./images/accumulo-hdfs/slave",
            tag: "0.1.0",
            repo: "accumulo_hdfs_slave",
            options: {
              build: {
                t: grunt.sensitiveConfig.docker.registry.serveraddress
                + "/accumulo_hdfs_slave:" + "0.1.0",
                pull: false,
                nocache: false
              },
              run: {
                create: {
                  name: "accumulo_hdfs_slave",
                  HostConfig: {
                    Binds: ["/mnt/docker:/mnt"],
                    NetworkMode: "host"
                  }
                },
                start: {},
                cmd: []
              }
            }
          },
          sparkmaster: {
            dockerfile: "./images/spark/sparkmaster",
            tag: "2.0.0",
            repo: "sparkmaster",
            options: {
              build: {
                t: grunt.sensitiveConfig.docker.registry.serveraddress
                + "/sparkmaster:" + "2.0.0",
                pull: false,
                nocache: false
              },
              run: {
                create: {
                  name: "sparkmaster",
                  HostConfig: {
                    Binds: ["/mnt/spark:/tmp"],
                    NetworkMode: "host"
                  }
                },
                start: {},
                cmd: []
              }
            }
          },
          sparkslave: {
            dockerfile: "./images/spark/sparkslave",
            tag: "2.0.0",
            repo: "sparkslave",
            options: {
              build: {
                t: grunt.sensitiveConfig.docker.registry.serveraddress
                + "/sparkslave:" + "2.0.0",
                pull: false,
                nocache: false
              },
              run: {
                create: {
                  name: "sparkslave",
                  HostConfig: {
                    Binds: ["/mnt/spark:/tmp"],
                    NetworkMode: "host"
                  }
                },
                start: {},
                cmd: []
              }
            }
          },
          geoserver: {
            dockerfile: "./images/geoserver",
            tag: "2.9.4",
            repo: "geoserver",
            options: {
              build: {
                t: grunt.sensitiveConfig.docker.registry.serveraddress
                + "/geoserver:" + "2.9.4",
                pull: false,
                nocache: false
              },
              run: {
                create: {
                  name: "geoserver",
                  HostConfig: {
                    Binds: ["/mnt/docker/geoserver:/mnt"],
                    NetworkMode: "host"
                  }
                },
                start: {},
                cmd: []
              }
            }
          },
          kafka: {
            dockerfile: "./images/kafka",
            tag: "0.11.0",
            repo: "kafka",
            options: {
              build: {
                t: grunt.sensitiveConfig.docker.registry.serveraddress
                + "/kafka:" + "0.11.0",
                pull: false,
                nocache: false
              },
              run: {
                create: {
                  name: "kafka",
                  HostConfig: {
                    Binds: ["/mnt/docker/kafka:/mnt"],
                    NetworkMode: "host"
                  }
                },
                start: {},
                cmd: []
              }
            }
          }
        } // End images
      } // End dock-options
    }, // End dock

    clouddity: {
      pkgcloud: grunt.sensitiveConfig.pkgcloud,
      docker: grunt.sensitiveConfig.docker,
      cluster: "smash",
      nodetypes: [
        {
          name: "master",
          replication: 1,
          imageRef: "f82012f7-5042-48aa-81c2-a59684840c23",
          flavorRef: "13000ccd-6a24-4bc5-9520-743707f8c0a2",
          securitygroups: ["default", "clusterMember"],
          images: ["sparkmaster", "accumulo_hdfs_master"],
          volumes : [ "smash-vol" ],
          test: [
            {
              name: "Spark Master WebUI",
              protocol: "http",
              port: 8080,
              path: "/",
              shouldContain: "Spark Master at spark:"
            }, {
              name: "HDFS Master WebUI",
              protocol: "http",
              port: 50070,
              path: "/jmx",
              query: {
                "qry": "Hadoop:service=NameNode,name=FSNamesystemState"
              },
              shouldContain: "\"NumLiveDataNodes\" : 9"
            }, {
              name: "Spark ReST service",
              protocol: "http",
              port: 6066,
              shouldContain: "Missing protocol version"
            }
          ]
        },
        {
          name: "slave",
          replication: 7,
          imageRef: "f82012f7-5042-48aa-81c2-a59684840c23",
          flavorRef: "4",
          securitygroups: ["default", "clusterMember"],
          images: ["sparkslave", "accumulo_hdfs_slave"],
          volumes : [ "smash-vol" ],
          test: [
            {
              name: "Spark Slave WebUI",
              protocol: "http",
              port: 8081,
              path: "/",
              shouldContain: "Spark Worker at"
            },
            {
              name: "Haddop Slave RPC Jon History Server",
              protocol: "http",
              port: 50020,
              shouldContain: "It looks like you are making an HTTP request to a Hadoop IPC port"
            }
          ]
        },
        {
          name: "interface",
          replication: 1,
          imageRef: "f82012f7-5042-48aa-81c2-a59684840c23",
          flavorRef: "4",
          securitygroups: ["default", "clusterMember"],
          images: ["geoserver", "kafka"],
          test: [
            {
              name: "Geoserver WebUI",
              protocol: "http",
              port: 8080,
              path: "/",
              // TODO: fix test condition
              shouldContain: ""
            }
          ]
        }
      ], //End nodetypes
      volumetypes: [{
        name: "smash-vol",
        size: 280,
        description: "Volume for SMASH cluster",
        volumeType: grunt.sensitiveConfig.pkgcloud.volume_type,
        availability_zone: grunt.sensitiveConfig.pkgcloud.availability_zone_volume,
        mountpoint: "/mnt",
        fstype: "ext4"
      }],
      securitygroups: {
        "default": {
          description: "Opens the Docker demon and SSH ports to dev and cluster nodes",
          rules: [
            {
              direction: "ingress",
              ethertype: "IPv4",
              protocol: "tcp",
              portRangeMin: 22,
              portRangeMax: 22,
              remoteIpPrefix: "0.0.0.0/0",
            }
          ]
        },
        "clusterMember": {
          description: "Open ports to each cluster member",
          rules: [
            {
              direction: "ingress",
              ethertype: "IPv4",
              protocol: "tcp",
              portRangeMin: 1,
              portRangeMax: 65535,
              remoteIpNodePrefixes: ["master", "slave", "interface"]
            }
          ]
        }
      } //End securitygroups
    } // End clouddity
  });

  // Dependent tasks declarations
  require("load-grunt-tasks")(grunt, {
    config: "./package.json"
  });

  // Setups and builds the Docker images
  grunt.registerTask("build", ["dock:build"]);

  // Pushes the Docker images to registry
  grunt.registerTask("push", ["dock:push"]);

  // Provisions the VMs
  grunt.registerTask("launch", ["clouddity:createsecuritygroups", "wait",
    "clouddity:createnodes", "wait", "clouddity:updatesecuritygroups",
    "wait", "clouddity:addhosts"]);

  // Pulls the Docker images from registry
  grunt.registerTask("pull", ["clouddity:pull"]);

  // Listing cluster components tasks
  grunt.registerTask("listsecuritygroups", ["clouddity:listsecuritygroups"]);
  grunt.registerTask("listnodes", ["clouddity:listnodes"]);
  grunt.registerTask("listcontainers", ["clouddity:listcontainers"]);

  // Docker containers creation
  grunt.registerTask("create", ["clouddity:run"]);

  // Docker containers management
  grunt.registerTask("stop", ["clouddity:stop"]);
  grunt.registerTask("start", ["clouddity:start"]);

  // Tests the deployed containers
  grunt.registerTask("test", ["clouddity:test"]);

  // Docker containers removal
  grunt
    .registerTask("remove", ["clouddity:stop", "wait", "clouddity:remove"]);

  // Destroy the VMs
  grunt.registerTask("destroy", ["clouddity:destroynodes", "wait",
    "clouddity:destroysecuritygroups"]);

};
