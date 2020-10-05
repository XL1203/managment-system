<template >
  <div>
    <button @click="clearTokenToken">退出</button>
  </div>
</template>

<script>
export default {
  methods: {
    clearTokenToken(){
      window.sessionStorage.clear();
      this.$router.push('/login')
    }
  }
}
</script>