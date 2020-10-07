<template >
  <el-container class="home-container">
    <!-- 主页头部 -->
    <el-header>
      <div>
        <img src="../assets/image/logo.png" alt="" />
        <span>后台电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 主页主体部分 -->
    <el-container class="home-body">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? 64 + 'px' : 200 + 'px'">
        <div class="toggleBtn" @click="toggleCollapse">|||</div>
        <!-- 左侧菜单区域  -->
        <el-menu
          :collapse="isCollapse"
          :collapse-transition="false"
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#409efe"
          unique-opened
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="icons[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="savaNavState('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      isCollapse: false,
      icons: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      //被激活的链接地址
      activePath:''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    async getMuneList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$msg.error(res.meta.msg)
      this.menuList = res.data
    },
    savaNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath=activePath
    }
  },
  created() {
    this.getMuneList()
    this.activePath=window.sessionStorage.getItem('activePath')
  },
}
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;
  background-color: #fff;

  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #000;
    color: #fff;

    & > div {
      display: flex;
      align-items: center;
      font-size: 20px;

      img {
        width: 50px;
        height: 50px;
        margin-right: 20px;
        border-radius: 50%;
      }
    }
  }

  .home-body {
    .el-aside {
      background-color: #313743;

      .toggleBtn {
        line-height: 24px;
        text-align: center;
        color: #fff;
        letter-spacing: 2px;
        background-color: #475163;
      }

      .el-menu {
        border-right: none;
      }

      .iconfont {
        margin-right: 10px;
      }
    }
  }
}
</style>