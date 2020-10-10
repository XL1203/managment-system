<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col>
          <!-- 添加角色按钮 -->
          <el-button type="primary" @click="addUserRoleDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格列表 -->
      <el-table :data="rolesList" border stripe style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-row
              :class="['bdBottom', 'vcenter', index1 === 0 ? 'bdTop' : '']"
              v-for="(item1, index1) in row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="4">
                <el-tag closable @close="removeRightById(row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二级、三级权限 -->
              <el-col :span="20">
                <el-row
                  :class="['vcenter', index2 === 0 ? '' : 'bdTop']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template #default="{ row }">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRole(row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加用户角色对话框 -->
      <el-dialog
        title="添加用户角色"
        :visible.sync="addUserRoleDialogVisible"
        width="50%"
      >
        <el-form
          ref="addUserRoleFormRef"
          :model="addUserRoleForm"
          label-width="80px"
        >
          <el-form-item label="角色名称">
            <el-input v-model="addUserRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addUserRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addUserRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole()">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户角色对话框 -->
      <el-dialog
        title="修改用户角色"
        :visible.sync="editUserRoleDialogVisible"
        width="50%"
      >
        <el-form
          ref="editUserRoleFormRef"
          :model="editUserRoleForm"
          label-width="80px"
        >
          <el-form-item label="角色名称">
            <el-input
              v-model="editUserRoleForm.roleName"
              :disabled="true"
            ></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editUserRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editUserRoleDialogVisible = false"
            >取 消</el-button
          >
          <el-button type="primary" @click="editCommit()">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配权限对话框 -->
      <el-dialog
        title="设置权限"
        :visible.sync="rightDialogVisible"
        width="50%"
        @close="rightDialogClosed"
      >
        <el-tree
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights()">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //控制添加用户角色对话框
      addUserRoleDialogVisible: false,
      addUserRoleForm: {},
      //控制修改用户角色对话框
      editUserRoleDialogVisible: false,
      editUserRoleForm: {},
      //角色列表
      rolesList: [],
      roleName: '',
      //控制权限对话框是否显示
      rightDialogVisible: false,
      //所有权限的数据
      rightsList: [],
      //属性控件的属性绑定
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      //默认选中节点的Id值的数组
      defKeys: [],
      //当前即将分配角色的Id
      roleId: '',
    }
  },
  methods: {
    //获得角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) return this.$msg.error('获取失败')
      this.rolesList = res.data
    },
    //添加角色
    async addRole() {
      const { data: res } = await this.$http.post('roles', {
        roleName: this.addUserRoleForm.roleName,
        roleDesc: this.addUserRoleForm.roleDesc,
      })
      if (res.meta.status !== 201) return this.$msg.error(res.meta.msg)
      this.$msg.success('添加角色成功！')
      //重新获取角色列表
      this.addUserRoleDialogVisible = false
      this.getRolesList()
    },
    //修改角色
    async editRole(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return
      this.editUserRoleForm = res.data
      this.editUserRoleDialogVisible = true
    },
    //确认提交修改角色
    async editCommit() {
      const { data: res } = await this.$http.put(
        `roles/${this.editUserRoleForm.roleId}`,
        {
          roleName: this.editUserRoleForm.roleName,
          roleDesc: this.editUserRoleForm.roleDesc,
        }
      )
      if (res.meta.status !== 200) return this.$msg.error('修改用户角色失败！')
      this.$msg.success('修改用户角色成功！')
      this.editUserRoleDialogVisible = false
      //刷新数据列表
      this.getRolesList()
    },
    //删除角色
    async deleteRole(id) {
      const result = await this.$confirm('是否删除该角色?', '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)

      console.log(result)
      if (result !== 'confirm') return this.$msg.info('取消了删除！')
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$msg.error('删除失败！')
      this.$msg.success('删除成功！')
      //刷新数据列表
      this.getRolesList()
    },
    //根据 id 查询角色
    async getRoleById(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$msg.error('查询失败！')
      this.$msg.success('查询成功！')
      this.rolesList = res.data
      this.roleId = ''
    },
    //通过 id 删除权限
    async removeRightById(role, rightId) {
      const result = await this.$confirm('是否取消该权限?', '取消权限', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)

      //如果点击确认按钮,则返回 confirm 字符串
      //如果点击取消按钮,则返回 cancel 字符串
      if (result !== 'confirm') return this.$msg.info('取消了删除')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$msg.error('删除权限失败')
      role.children = res.data
    },
    //显示设置权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      this.rightsList = res.data
      //递归获取三级节点
      this.getDefKeys(role, this.defKeys)
      this.rightDialogVisible = true
    },
    //通过递归的形式，获得角色列表下所有三级权限的id,并保存在defKes数组中
    getDefKeys(node, arr) {
      //如果当前节点没有 childred 则为三家节点
      if (!node.children) return arr.push(node.id)
      node.children.forEach((item) => {
        this.getDefKeys(item, arr)
      })
    },
    //监听对话框关闭
    rightDialogClosed() {
      this.defKeys = []
    },
    //点击确定为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$msg.error('更新权限失败！')
      this.$msg.success('更新权限成功！')
      this.getRolesList()
      this.rightDialogVisible = false
    },
  },
  created() {
    this.getRolesList()
  },
}
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 10px 5px;
}

.bdBottom {
  border-bottom: 1px solid #ccc;
}
.bdTop {
  border-top: 1px solid #ccc;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>