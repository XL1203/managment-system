<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="queryObj.query"
            class="input-with-select"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格信息区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="200px"
        ></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template #default="{ row }">
            <el-switch
              v-model="row.mg_state"
              @change="changeState(row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220px">
          <template #default="{ row }">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="editUser(row.id)"
            ></el-button>

            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="deleteUser(row.id)"
            ></el-button>

            <el-tooltip effect="dark" content="分配角色" placement="top-start">
              <el-button
                type="warning"
                icon="el-icon-setting"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加用户对话框区域 -->
      <el-dialog
        @close="resetAddForm"
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
      >
        <!-- 添加用户表单区域 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model.trim="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model.trim="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model.trim="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户信息对话框区域 -->
      <el-dialog
        @close="resetEditForm"
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
      >
        <!-- 修改用户信息表单 -->
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="用户名">
            <el-input
              v-model.trim="editForm.username"
              :disabled="true"
            ></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model.trim="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCommit()">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryObj.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryObj.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    //自定义手机号验证规则
    var validateMobile = (rule, value, callback) => {
      var myreg = /^[1][3,4,5,7,8][0-9]{9}$/
      if (myreg.test(value)) {
        return callback()
      } else {
        return callback(new Error('请输入正确的手机号'))
      }
    }
    return {
      userList: [],
      total: 0,
      queryObj: {
        query: '',
        // 当前页
        pagenum: 1,
        // 显示大小
        pagesize: 5,
      },
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6到 20 个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' },
        ],
      },
      //控制修改用户信息对话框的显示与隐藏
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryObj,
      })
      if (res.meta.status !== 200) return this.$msg.error('获取管理员列表失败')

      this.userList = res.data.users
      this.total = res.data.total
    },
    async changeState(user) {
      const { data: res } = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      )

      if (res.meta.status !== 200) {
        user.mg_state = !user.mg_state
        return this.$msg.error('更新用户状态失败！')
      }
      return this.$msg.success('更新用户状态成功！')
    },
    handleSizeChange(newSize) {
      this.queryObj.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryObj.pagenum = newPage
      this.getUserList()
    },
    resetAddForm() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) this.$msg.error('添加用户失败！')
        this.$msg.success('添加用户成功！')
        this.getUserList()

        //隐藏对话框
        this.addDialogVisible = false
      })
    },
    async editUser(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$msg.error('查询失败')
      this.editForm = res.data
    },
    editCommit() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        if (res.meta.status !== 200) this.$msg.error('修改用户失败！')
        //隐藏对话框
        this.editDialogVisible = false
        //提示信息
        this.$msg.success(res.meta.msg)
        //刷新数据列表
        this.getUserList()
      })
    },
    async deleteUser(id) {
      const result = await this.$confirm('是否删除该用户?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)

      //如果点击确认按钮,则返回 confirm 字符串
      //如果点击取消按钮,则返回 cancel 字符串
      if (result !== 'confirm') return this.$msg.info('已取消删除')
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$msg.error('删除失败！')
      this.$msg.success(res.meta.msg)
      this.getUserList()
    },
    resetEditForm() {
      this.$refs.editFormRef.resetFields()
    },
  },
  created() {
    this.getUserList()
  },
}
</script>

<style lang="scss" scoped>
</style>