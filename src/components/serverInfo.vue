<template>
  <div>
    <div slot="header" class="clearfix">
      <span>Overview</span>
    </div>
    <el-row class="row">
      <el-col :lg="6" :md="6" :sm="6" :xs="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>IPv4</span>
          </div>
          <div class="text item">
            {{ info.ipv4 }}
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :sm="6" :xs="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>IPv6</span>
          </div>
          <div class="text item">
            {{ info.ipv6 == info.ipv4 ? "None" : info.ipv6 }}
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :sm="6" :xs="12">
        <el-card class="box-card" v-loading="!info.active" element-loading-text="Waiting to be back online">
          <div slot="header" class="clearfix">
            <span>Uptime</span>
          </div>
          <div class="text item">
            {{ info.uptime }}
          </div>
        </el-card>
      </el-col>
      <el-col :lg="6" :md="6" :sm="6" :xs="12" v-loading="!info.active" element-loading-text="Waiting to be back online">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>Load</span>
          </div>
          <div class="text item">
            {{ info.load }}
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-progress :percentage="100" :status="!info.active?'exception':'success'"></el-progress>
    <el-row class="row" v-loading="!info.active" element-loading-text="Waiting to be back online">
      <el-col :lg="6" :xs="12" :sm="6" :md="6" v-for="i in Object.keys(info.status.Percent)" :key="i">
        <el-card class="box-card" shadow="hover">
          <el-progress type="circle" :percentage="parseInt(info.status.Percent[i])" :show-text="true"
                       :color="colors"></el-progress>
          <div class="text item">
            {{ i }}
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-tabs v-model="activeName" v-if="info && beforeinfo" class="row">
      <el-tab-pane label="Network" name="Network">
        <el-row class="row">
          <el-col :lg="6" :xm="8" :sm="6" :md="6" v-for="key in Object.keys(info.status.Network)" :key="key"
                  class="networkCard">
            <el-card class="box-card"
                     :shadow="((((info.status.Network[key]['ByteRecv']-beforeinfo.status.Network[key]['ByteRecv']) / 1048576/3).toFixed(2)!=0) || (((info.status.Network[key]['ByteSent']-beforeinfo.status.Network[key]['ByteSent']) / 1048576/3).toFixed(2)!=0))?'always':'hover'">
              <div slot="header" class="clearfix">
                <span>{{ key }}</span>
              </div>
              <div class="text item">
                <el-row class="row">
                  <el-popover
                      placement="right"
                      width="400"
                      trigger="hover">
                    <p v-for="addr in info.status.Network[key]['Addrs']" :key="addr" style="width: fit-content">{{
                        addr
                      }}</p>
                    <el-button slot="reference">IP ADDRESS</el-button>
                  </el-popover>
                </el-row>
                <el-row>
                  <el-col
                      v-if="((info.status.Network[key]['ByteRecv']-beforeinfo.status.Network[key]['ByteRecv']) / 1048576/3).toFixed(2)!=0"
                      :lg="12">
                    <i class="el-icon-upload2 network">{{
                        ((info.status.Network[key]['ByteRecv'] - beforeinfo.status.Network[key]['ByteRecv']) / 1048576 / 3).toFixed(2)
                      }}</i><label> MB/s</label>
                  </el-col>
                  <el-col
                      v-if="((info.status.Network[key]['ByteSent']-beforeinfo.status.Network[key]['ByteSent']) / 1048576/3).toFixed(2)!=0"
                      :lg="12">
                    <i class="el-icon-download network">{{
                        ((info.status.Network[key]['ByteSent'] - beforeinfo.status.Network[key]['ByteSent']) / 1048576 / 3).toFixed(2)
                      }}</i><label> MB/s</label>
                  </el-col>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="Docker" name="Docker">
        <itemList :table-header="tableHeaderDocker" :table-data="this.info.status.DockerInfo"
                  :option="tableDockerOption"/>
      </el-tab-pane>
      <el-tab-pane label="Process" name="Process">
        <itemList :table-header="psHeader" :table-data="psData"
                  :option="{color:false,view:false,kill:true}"/>
      </el-tab-pane>
      <el-tab-pane label="Certificate" name="Certificate">
        <item-list :table-data="certificateData" :table-header="certificateTableHeader"
                   :option="tableCertificateOption"></item-list>
      </el-tab-pane>
      <el-tab-pane label="Configuration" name="Configuration">
        <item-list :table-data="configurationData" :table-header="configurationHeader"
                   :option="tableConfigurationOption"></item-list>
      </el-tab-pane>
      <el-tab-pane label="Tasks" name="Tasks">
        <item-list :table-data="taskTableData" :table-header="taskTableHeader"
                   :option="{color:false,view:false}"></item-list>
      </el-tab-pane>
      <el-tab-pane label="Option" name="Option">
        <el-row>
          <el-col :span="24">
            <el-card>
              <div slot="header" class="clearfix">
                <span>Option</span>
              </div>
              <p>Client Version: {{ info.status.Version }}</p>
              <el-button @click="clientChange.upgrade=true;pushChange()">Upgrade</el-button>
              <el-button @click="openTerminal">Terminal</el-button>
              <el-button @click="clientChange.sync=true;pushChange()">Sync Data</el-button>
              <el-button @click="clientChange.restart=true;pushChange()" type="warning">Restart</el-button>
              <el-button type="danger" @click="secondConfirmDialog=true;clientChange.stop=true;">Stop
              </el-button>
              <el-button type="danger" @click="secondConfirmDialog=true;clientChange.removeServer=true;">Delete
              </el-button>
              <el-dialog
                  title="Dangerous operation"
                  :visible.sync="secondConfirmDialog"
                  width="30%"
                  :before-close="handleClose">
                <span>This operation is very dangerous, please confirm the operation you want to perform a second time</span>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="secondConfirmDialog=false;">cancel</el-button>
                    <el-button type="danger" @click="secondConfirmDialog=false;pushChange()">confirm</el-button>
                </span>
              </el-dialog>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import itemList from '@/components/itemList'
import config from "@/config";
import router from "@/router";

export default {
  name: "serverInfo",
  components: {
    itemList
  },
  props: {
    info: {
      default: [{
        active: true,
        ipv4: "Loading",
        ipv6: "Loading",
        uptime: "Loading",
        load: "Loading",
        status: {DockerInfo: [], Network: {}}
      }]
    },
    beforeinfo: {
      default: [{
        active: true,
        ipv4: "Loading",
        ipv6: "Loading",
        uptime: "Loading",
        load: "Loading",
        status: {DockerInfo: [], Network: {}}
      }]
    },
    taskTableData: [],
    configurationData: [],
    certificateData: [],
    psData: []
  },
  data() {
    return {
      activeName: 'Network',
      timer: null,
      colors: [
        {color: '#5cb87a', percentage: 60},
        {color: '#e6a23c', percentage: 70},
        {color: '#f56c6c', percentage: 80}
      ],
      tableHeaderDocker: ["ID", "Image", "Name", "State", "Port"],
      certificateTableHeader: ["domain", "Issued", "Expires"],
      configurationHeader: ["ID", "Type", "Name", "Path"],
      psHeader: ["PID", "User", "State", "Pcpu", "Pmem", "Command"],
      tableDockerOption: {docker: true, start: true},
      tableCertificateOption: {certificate: true, color: false},
      tableConfigurationOption: {configuration: true, color: false},
      secondConfirmDialog: false,
      clientChange: {
        remove: false,
        stop: false,
        restart: false,
        sync: false,
        upgrade: false,
      },
      taskTableHeader: ["ID", "Type", "Code", "Info", "Active"],
      certificateDataGot: null,
      confDataGot: null,
      confOnServer: [],
      certificateOnServer: null,
      Timer: null,
    };
  },
  beforeDestroy() {
    window.clearInterval(this.Timer)
  },
  methods: {
    openTerminal: function () {
      this.$http.post(config.apiAddress + "/web/Server/" + this.$route.params.id + "/Terminal/7201", {}, {
        headers: {
          'Authorization': "Bearer " + this.$store.state.jwt,
          'Accept': 'application/json'
        }
      }).then(function (res) {
        console.log(res.body);
      }, function (res) {
        console.log(res.body);
      })
    },
    handleClose() {
      this.removeServer = false
    },
    pushChange: function () {
      let keys = Object.keys(this.clientChange);
      if (this.clientChange.removeServer) {
        this.$http.delete(config.apiAddress + "/web/Server/" + this.$route.params.id, {
          headers: {
            'Authorization': "Bearer " + this.$store.state.jwt,
            'Accept': 'application/json'
          }
        }).then(function (res) {
          if (res.body.Code != 200) {
            this.$notify({
              title: 'Server Warning',
              message: res.body.Info,
              type: 'warning'
            })
          } else {
            this.$notify({
              title: 'Success',
              message: "OK",
              type: 'success'
            })
            router.push("/Server")
          }
        }, function (res) {
          this.$notify({
            title: 'Server Warning',
            message: res.status,
            type: 'warning'
          })
        })
      } else {
        keys.forEach(key => {
          if (this.clientChange[key]) {
            this.$http.post(config.apiAddress + "/web/Server/" + this.$route.params.id + "/Server/" + config.command[key], {}, {
              headers: {
                'Authorization': "Bearer " + this.$store.state.jwt,
                'Accept': 'application/json'
              }
            }).then(function (res) {
              if (res.body.Code !== 200) {
                this.$notify({
                  title: 'Server Warning',
                  message: res.body.Info,
                  type: 'warning'
                })
              } else {
                this.$notify({
                  title: 'Success',
                  message: "Task successfully added",
                  type: 'success'
                })
              }
            }, function (res) {
              this.$notify({
                title: 'Server Warning',
                message: res.status,
                type: 'warning'
              })
            })
          }
        })
      }
    },
  }
}
</script>

<style scoped>
.box-card {
  width: 95%;
  height: 95%;
}

.text {
  font-size: 14px;
}

.networkCard {
  height: 255px;
}

.row {
  padding: 30px;
}

.network {
  font-size: x-large;
}
</style>