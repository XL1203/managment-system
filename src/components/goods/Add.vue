<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区-->
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条 -->
      <el-steps :active="activeName - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeName"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model.trim="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="cateList"
                v-model="addForm.goods_cat"
                :props="cascaderProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyList"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="subItem"
                  v-for="(subItem, index) in item.attr_vals"
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-success="handleSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="upHeader"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor class="text" v-model="addForm.goods_introduce">
            </quill-editor>
            <el-button type="primary" class="addBtn" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="imgPreviewDialogVisible"
      width="50%"
      v-if="imgPreviewDialogVisible"
      center
    >
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      //步骤条控件
      activeName: '0',
      //添加商品表单
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //选中的级联数据列表
        goods_cat: [],
        //上传图片的临时路径数组
        pics: [],
        //商品介绍
        goods_introduce: '',
        //商品参数
        attrs: [],
      },
      //表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
      //商品列表
      cateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //参数列表
      manyList: [],
      //属性列表
      onlyList: [],
      //图片上传地址
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      //图片上传请求头信息
      upHeader: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      //控制图片预览对话框是否显示
      imgPreviewDialogVisible: false,
      //预览图片路径
      previewPath: '',
    }
  },
  methods: {
    //获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$msg.error('获取商品分类列表失败！')
      this.cateList = res.data
    },
    //级联选择框改变
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.$msg.error('请选择三级列表')
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (
        (oldActiveName === '0' && this.addForm.goods_name === '') ||
        this.addForm.goods_cat.length !== 3
      ) {
        this.$msg.error('请输入商品名称和选择商品分类')
        return false
      }
    },
    //切换tabs页面触发
    async tabClick() {
      if (this.activeName === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        if (res.meta.status !== 200)
          return this.$msg.error('获取动态参数失败！')
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyList = res.data
      } else if (this.activeName === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (res.meta.status !== 200)
          return this.$msg.error('获取静态属性失败！')
        this.onlyList = res.data
      }
    },
    //图片上传成功
    handleSuccess(response) {
      const picInfo = {
        pic: response.data.tmp_path,
      }
      this.addForm.pics.push(picInfo)
    },
    //图片预览
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.imgPreviewDialogVisible = true
    },
    //图片删除
    handleRemove(file) {
      const removePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(
        (item) => item.pic === removePath
      )
      this.addForm.pics.splice(index, 1)
    },
    //添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$msg.error('请填写必填项')
        //进行商品添加业务逻辑
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        //商品的参数
        //1. 处理动态参数
        this.manyList.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(','),
          }
          this.addForm.attrs.push(newInfo)
        })
        //2. 处理静态属性
        this.onlyList.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs

        const { data: res } = await this.$http.post(`goods`, form)
        console.log(res)
        if (res.meta.status !== 201) return this.$msg.error('添加商品失败！')
        this.$msg.success('添加商品成功！')
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    },
  },
  created() {
    this.getCateList()
  },
}
</script>
<style lang="scss" scoped>
.el-steps {
  margin: 30px 0;
}
.el-checkbox {
  margin: 0 10px 0 0;
}
.previewImg {
  width: 100%;
}
.addBtn {
  margin-top: 10px;
}
</style>

