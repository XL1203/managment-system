<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区 -->
    <el-card class="box-card">
      <!-- 头部警告区 -->
      <el-alert
        show-icon
        title="注意：只允许为第三级参数设置相关参数"
        type="warning"
        :closable="false"
      ></el-alert>

      <!-- 选择区 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类级联选择框 -->
          <el-cascader
            :options="cateList"
            :props="cascaderProps"
            v-model="seletedKeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >
            添加参数</el-button
          >
          <el-table :data="manyTableList" border stripe style="width: 100%">
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-tag
                  :key="index"
                  v-for="(item, index) in row.attr_vals"
                  closable
                  @close="handleClose(row, index)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" @click="showInput(row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button
                  icon="el-icon-edit"
                  size="mini"
                  type="primary"
                  @click="showEditDialog(row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  icon="el-icon-delete"
                  size="mini"
                  type="danger"
                  @click="deleteParams(row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <el-table :data="onlyTableList" border stripe style="width: 100%">
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-tag
                  :key="index"
                  v-for="(item, index) in row.attr_vals"
                  closable
                  @close="handleClose(row, index)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" @click="showInput(row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button
                  icon="el-icon-edit"
                  size="mini"
                  type="primary"
                  @click="showEditDialog(row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  icon="el-icon-delete"
                  size="mini"
                  type="danger"
                  @click="deleteParams(row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogVisibleClosed"
      :hide-required-asterisk="true"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogVisibleClosed"
      :hide-required-asterisk="true"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      //级联选择框的配置
      cascaderProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      //级联选择框双向绑定到的数组
      seletedKeys: [],
      //被激活页签的名称
      activeName: 'many',
      //动态参数数据
      manyTableList: [],
      //静态属性数据
      onlyTableList: [],
      //控制添加动态参数和静态属性对话框是否显示
      addDialogVisible: false,
      //添加动态参数或静态属性
      addForm: {
        attr_name: '',
      },
      //验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
        ],
      },
      //控制添加动态参数和静态属性对话框是否显示
      editDialogVisible: false,
      //修改动态参数或静态属性
      editForm: {
        attr_name: '',
      },
      //验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    //获取商品分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$msg.error('获取商品分类数据列表失败！')
      this.cateList = res.data
    },
    //级联选择框选中项变化，触发此函数
    async handleChange() {
      this.getParams()
    },
    //tab 页签点击事件的处理函数
    handleTabClick(tab, event) {
      this.getParams()
    },
    //获取参数数据
    async getParams() {
      //选中的不是三级分类
      if (this.seletedKeys.length !== 3) {
        this.seletedKeys = []
        this.manyTableList = []
        this.onlyTableList = []
        return
      }
      //是三级分类，根据所选分类的id和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      )
      if (res.meta.status !== 200) return this.$msg.error('获取参数列表失败！')

      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //控制输入框是否显示
        ;(item.inputVisible = false),
          //输入框的值
          (item.inputValue = '')
      })

      if (this.activeName === 'many') {
        this.manyTableList = res.data
      } else {
        this.onlyTableList = res.data
      }
    },
    //删除参数项
    handleClose(row, index) {
      row.attr_vals.splice(index, 1)
      this.savaData(row)
    },
    //展示输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //添加参数项，失去焦点或按 enter 触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //进行添加操作
      row.attr_vals.push(row.inputValue)
      this.savaData(row)
      row.inputValue = ''
      row.inputVisible = false
    },
    //提交到数据库
    async savaData(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200) return this.$msg.error('修改参数项失败！')
      this.$msg.success('修改参数项成功！')
    },
    //提交添加参数表单
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: '',
          }
        )
        if (res.meta.status !== 201)
          return this.$msg.error('添加动态参数失败！')
        this.getParams()
        this.addDialogVisible = false
      })
    },
    //对话框关闭,清除错误提示
    addDialogVisibleClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //展示修改对话框
    async showEditDialog(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      )
      if (res.meta.status !== 200) return this.$msg.error('获取参数信息失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //修改提交
    async editParams() {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
        {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
          attr_vals: '',
        }
      )
      if (res.meta.status !== 200) return this.$msg.error('修改失败！')
      this.$msg.success('修改成功！')
      this.editDialogVisible = false
      this.getParams()
    },
    //监听关闭事件,清除验证提示信息
    editDialogVisibleClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //删除参数
    async deleteParams(attr_id) {
      const result = await this.$confirm('是否删除?', '删除参数', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)
      if (result !== 'confirm') return this.$msg.info('已取消删除！')
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) return this.$msg.error('删除失败！')
      this.$msg.success(res.meta.msg)
      this.getParams()
    },
  },
  created() {
    this.getCateList()
  },
  computed: {
    //如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.seletedKeys.length !== 3) return true
      return false
    },
    //当前选中的三级分类的Id
    cateId() {
      if (this.seletedKeys.length === 3) return this.seletedKeys[2]
      return null
    },
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
  },
}
</script>

<style lang="scss" scoped>
.el-alert {
  margin-bottom: 20px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>