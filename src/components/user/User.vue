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
            placeholder="请输入要查找的用户名"
            v-model.trim="queryObj.query"
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
              size="mini"
              @click="editUser(row.id)"
            ></el-button>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(row.id)"
            ></el-button>

            <el-tooltip effect="dark" content="分配角色" placement="top-start">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectRoleId" placeholder="请选择角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole()">确 定</el-button>
      </span>
    </el-dialog>
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
      //用户列表
      userList: [],
      //总条数
      total: 0,
      queryObj: {
        query: '',
        // 当前页
        pagenum: 1,
        // 显示大小
        pagesize: 5,
      },
 /*      //查询用户信息的 Id
      queryId: '', */
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
      //控制分配角色对话框显示隐藏
      setRoleDialogVisible: false,
      //需要分配角色的用户信息
      userInfo: {},
      //所有角色列表
      rolesList: [],
      //选择的角色的Id
      selectRoleId: '',
    }
  },
  methods: {
    //获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryObj,
      })
      if (res.meta.status !== 200) return this.$msg.error('获取管理员列表失败')

      this.userList = res.data.users
      this.total = res.data.total
    },
/*     //根据Id查询用户信息
    async getUserById(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$msg.error('查询失败！')
      this.$msg.success('查询成功！')
      console.log(res.data)
      this.userList = res.data
      this.queryId = ''
    }, */
    //改变用户状态
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
    //修改条数
    handleSizeChange(newSize) {
      this.queryObj.pagesize = newSize
      this.getUserList()
    },
    //改变页码
    handleCurrentChange(newPage) {
      this.queryObj.pagenum = newPage
      this.getUserList()
    },
    //重置表单
    resetAddForm() {
      this.$refs.addFormRef.resetFields()
    },
    //添加用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) this.$msg.error('添加用户失败！')
        this.$msg.success('添加用户成功！')

        //隐藏对话框
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    //编辑用户
    async editUser(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$msg.error('查询失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //编辑对话框确认按钮
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
    //通过用户Id删除用户
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
    //重置修改对话框验证
    resetEditForm() {
      this.$refs.editFormRef.resetFields()
    },
    //分配角色
    async setRole(userInfo) {
      this.userInfo = userInfo
      //分配角色之前应该获得所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$msg.error('获取角色列表失败！')

      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    //点击确认按钮保存角色
    async saveRole() {
      if (!this.selectRoleId) return this.$msg.error('请选择新角色')

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectRoleId,
        }
      )
      if (res.meta.status !== 200) this.$msg.error('更新角色失败！')
      this.$msg.success('更新角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = {}
    },
  },
  created() {
    this.getUserList()
  },
}
</script>