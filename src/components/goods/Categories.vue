<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategories">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-row>
        <zk-table
          class="zkTable"
          :data="categoriesList"
          :columns="columns"
          border
          :show-index="true"
          index-text="#"
          :show-row-hover="false"
          :selection-type="false"
          :expand-type="false"
        >
          <template #isok="{ row }">
            <i
              class="el-icon-success"
              v-if="row.cat_deleted === false"
              style="color: lightgreen"
            ></i>
            <i class="el-icon-error" v-else style="color: red"></i>
          </template>

          <template #order="{ row }">
            <el-tag size="mini" v-if="row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="row.cat_level === 1"
              >二级</el-tag
            >
            <el-tag size="mini" type="warning" v-else>三级</el-tag>
          </template>

          <template #operate>
            <el-button icon="el-icon-edit" size="mini" type="primary"
              >编辑</el-button
            >
            <el-button icon="el-icon-delete" size="mini" type="danger"
              >删除</el-button
            >
          </template>
        </zk-table>
      </el-row>

      <!-- 分页 -->
      <el-row>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 5, 10, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-row>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <!-- options 指定数据源 -->
          <!-- v-model 指定一个数组 -->
          <el-cascader
            v-model="selectedKeys"
       :options="parentcateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateCommit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //商品分类数据列表
      categoriesList: [],
      //获取父级分类数据列表
      parentcateList: [],
      //总数据条数
      total: 0,
      //tree-table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用模板名称
          template: 'isok',
        },
        {
          label: '排序',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用模板名称
          template: 'order',
        },
        {
          label: '操作',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用模板名称
          template: 'operate',
        },
      ],
      //控制添加分类对话框是否显示
      addCateDialogVisible: false,
      //添加分类表单信息
      addCateForm: {
        //将要添加分类的名称
        cat_name: '',
        //分类父 ID
        cat_pid: 0,
        //分类层级 默认添加一级分类
        cat_level: 0,
      },
      //表单验证
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      //配置级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        //指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        //指定选项标签为选项对象的某个属性值
        label: 'cat_name',
        //指定选项的子选项为选项对象的某个属性值
        children: 'children',
        //是否严格的遵守父子节点不互相关联
        checkStrictly: 'true',
      },
      //选中父级分类的Id数组
      selectedKeys: [],
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) return this.$msg.error('获取商品分类失败！')
      this.categoriesList = res.data.result
      this.total = res.data.total
    },
    //添加分类按钮
    addCategories() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2,
        },
      })
      if (res.meta.status !== 200)
        return this.$msg.error('获取父级分类数据失败！')
      this.parentcateList = res.data
    },
    // 选择项发生变化
    parentCateChange() {
      /* 如果 selectedKeys 数组中的 lenght>0,证明选中的父级分类 
            反之，就说明没有选中任何父级分类 */
      if (this.selectedKeys.length > 0) {
        //父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCateCommit() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return

        console.log(this.addCateForm)
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) return this.$msg.error('添加分类失败！')
        this.$msg.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    //显示条数发生变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //当前页数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
  },
  created() {
    this.getCateList()
  },
}
</script>

<style lang="scss" scoped>
.zkTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>