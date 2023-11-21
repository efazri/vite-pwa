<script setup>
import { onMounted, ref } from "vue";

const data = ref([]);
const fetchData = async () => {
    fetch("https://dummyjson.com/products/category/smartphones", { method: "GET"})
      .then((resp) => {
        return resp.json();
      })
      .then((res) => {
        console.log({ res })
        if (Array.isArray(res?.products) && res.products.length > 0) data.value = res.products;
      })
      .catch((err ) => {
        console.log({ err })
      })
}

</script>

<template>
    <div>
        <div v-if="data.length < 1">
            No data available!
        </div>
        <div v-else class="grid grid-cols-4 gap-4">
          <div 
            class="card w-96 bg-base-100 shadow-xl"
            v-for="(datum, i) in data"
            :key="i"  
          >
            <figure>
              <img :src="datum.images[datum.images.length - 1]" alt="Shoes" />
            </figure>
            <div class="card-body">
                <h2 class="card-title">
                Shoes!
                <div class="badge badge-secondary">NEW</div>
                </h2>
                <p>If a dog chews shoes whose shoes does he choose?</p>
                <div class="card-actions justify-end">
                <div class="badge badge-outline">Fashion</div> 
                <div class="badge badge-outline">Products</div>
                </div>
            </div>
          </div>
        </div>

    </div>
</template>