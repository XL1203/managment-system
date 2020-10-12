<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-input
        placeholder="请输入内容"
        v-model="queryInfo.query"
        class="input-with-select"
        clearable
        @clear="getGoodsList"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="getGoodsList"
        ></el-button>
      </el-input>
      <el-button type="primary" @click="addGoods">添加商品</el-button>

      <el-table :data="goodsList" border stripe style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column
          prop="goods_name"
          label="商品名称"
          width="500"
        ></el-table-column>
        <el-table-column
          prop="goods_price"
          label="商品价格"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="goods_number"
          label="商品数量"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="goods_weight"
          label="商品重量"
          width="100"
        ></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.add_time | dateFormate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editGoods(row.goods_id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteGoods(row.goods_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改商品信息 -->
    <el-dialog
      title="修改商品信息"
      :visible.sync="editGoodsDialogVisible"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCommit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品列表数据
      goodsList: [],
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //数据总数
      total: 0,
      //控制修改商品对话框的显示
      editGoodsDialogVisible: false,
      //修改商品表单数据
      editForm: {},
      //表单验证规则
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) return this.$msg.error('获取商品列表失败！')
      this.goodsList = res.data.goods
      this.total = res.data.total
      this.queryInfo.query = ''
    },
    //添加商品
    addGoods() {
      this.$router.push('/goods/add')
    },
    //修改商品
    async editGoods(id) {
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status != 200) return
      this.editForm = res.data
      this.editGoodsDialogVisible = true
    },
    //提交修改
    async editCommit() {
      const {data:res} =await this.$http.put(`goods/${this.editForm.goods_id}`,this.editForm)
      if(res.meta.status!==200) return this.$msg.error('修改商品失败！')
      this.$msg.success('修改商品成功！')
      this.editGoodsDialogVisible = false
      this.getGoodsList()
    },
    // 删除商品
    async deleteGoods(id) {
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$msg.error('删除失败!')
      this.$msg.success('删除成功!')
      this.getGoodsList()
    },
    //显示条数发生变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //当前页码
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
  },
  created() {
    this.getGoodsList()
  },
}
</script>
<style lang="scss" scoped>
.input-with-select {
  width: 400px;
  margin-right: 20px;
}
</style>