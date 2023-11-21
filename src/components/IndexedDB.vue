<script setup>
import { ref, onMounted } from 'vue';

const dbName = "users";
const userList = ref([]);
let userDetail = {
  name: "",
  email: "",
  dob: "",
  image: "",
}

const addedData = ref(null);
const updatedData = ref(null);
const deletedData = ref(null);

const onUploadImage = async (event) => {
  const imageFile = event.target.files[0];
  const blobImage = await readFileAsBlob(imageFile);

  userDetail = {
    ...userDetail,
    image: blobImage
  }
}

const readFileAsBlob = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(new Blob([reader.result], { type: file.type }));
    };
    reader.readAsArrayBuffer(file);
  });
}

const convertImg = (imgSource) => {
  return URL.createObjectURL(imgSource)
}

const onSubmit = () => {
  let valid = true;
  Object.keys(userDetail).forEach((key) => {
    if (!userDetail[key] && key !== "image"){
      valid = false;
      const element = document.getElementById(key)
      element.classList.add("input-error")
    }
  })

  if (valid) {
    const uuid = crypto.randomUUID();
    userDetail["uuid"] = uuid;
    console.log({ userDetail })
    addData(userDetail)
  }
}

const onChangehandler = (event) => {
  const { name, value } = event.target;
  const element = document.getElementById(name);
  
  if (element) {
    element.classList.remove("input-error")
  }
  userDetail = {
    ...userDetail,
    [name]: value,
  }
  
}

const addData = (userdata) => {
  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error("Error opening database:", event.target.error);
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    const objectStore = db.createObjectStore("customers", { keyPath: "uuid" });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    const addTransaction = db.transaction("customers", "readwrite");
    const customerObjectStore = addTransaction.objectStore("customers");

    const addRequest = customerObjectStore.add(userdata);

    addRequest.onsuccess = (event) => {
      console.log("Data added successfully");
      addedData.value = "Yes";
    };

    addRequest.onerror = (event) => {
      console.error("Error adding data", event.target.error);
      addedData.value = "No";
    };

    addTransaction.oncomplete = () => {
      userDetail = {
        name: "",
        email: "",
        dob: "",
        image: "",
      }
      readData()
      db.close();
    };
  };
};

const readData = () => {
  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error("Error opening database:", event.target.error);
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    const readTransaction = db.transaction("customers", "readonly");
    const customerObjectStore = readTransaction.objectStore("customers");

    const customersCursor = customerObjectStore.openCursor();

    customersCursor.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        // customers.value.push(cursor.value);
        let key = cursor.primaryKey;
        let value = cursor.value;
        let imageURL = URL.createObjectURL(value.image);
        let existdata = false;
        userList.value.forEach((el) => {
          if (el.uuid === key) existdata = true;
        })

        if (!existdata) {
          userList.value.push(value);
        }
        cursor.continue();
      } else {
        console.log("Data read successfully");
        // customers.value.splice(0, customers.value.length);
        db.close();
      }
    };

    customersCursor.onerror = (event) => {
      console.error("Error reading data", event.target.error);
      db.close();
    };
  };
};

const updateData = (uuid) => {
  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error("Error opening database:", event.target.error);
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    const updateTransaction = db.transaction("customers", "readwrite");
    const customerObjectStore = updateTransaction.objectStore("customers");
    const updateData = userList.value.filter((el) => el.uuid === uuid);
    console.log({ updateData })

    if (updateData.length > 0) {
      updateData.at(0).name = `${updateData.at(0).name} update`
      const updateRequest = customerObjectStore.put(updateData.at(0));
    }

    updateRequest.onsuccess = (event) => {
      console.log("Data updated successfully");
      updatedData.value = "Yes";
    };

    updateRequest.onerror = (event) => {
      console.error("Error updating data", event.target.error);
      updatedData.value = "No";
    };

    updateTransaction.oncomplete = () => {
      console.log("Update transaction completed");
      db.close();
    };
  };
};

const deleteData = (uuid) => {
  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    console.error("Error opening database:", event.target.error);
  };

  request.onsuccess = (event) => {
    const db = event.target.result;

    const deleteTransaction = db.transaction("customers", "readwrite");
    const deleteObjectStore = deleteTransaction.objectStore("customers");

    const deleteRequest = deleteObjectStore.delete(uuid);

    deleteRequest.onsuccess = (event) => {
      readData()
      deletedData.value = "Yes";
    };

    deleteRequest.onerror = (event) => {
      console.error("Error deleting data", event.target.error);
      deletedData.value = "No";
    };

    deleteTransaction.oncomplete = () => {
      userList.value = userList.value.filter((el) => el.uuid != uuid)
      db.close();
    };
  };
};

onMounted(readData)
</script>

<template>
  
  <div>
    <div class="card shadow-lg">
      
      <div>
        <table class="table">
        <!-- head -->
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Tanggal Lahir</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="userList.length === 0">
            <td colspan="4" class="text-center font-bold font-gray-100">NO DATA AVAILABLE!</td>
          </tr>
          <!-- row 1 -->
          <tr v-for="(user, i) in userList" :key="i" v-else>
            <td>
              <div class="flex items-center gap-3">
                <div class="avatar">
                  <div class="mask mask-squircle w-12 h-12">
                    <img :src="convertImg(user.image)"/>
                  </div>
                </div>
                <div>
                  <div class="font-bold">{{ user.name }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="badge badge-ghost badge-sm">
                {{ user.email }}
              </span>
            </td>
            <td>{{ user.dob }}</td>
            <th>
              <div class="flex gap-2">
                <button class="btn btn-sm btn-square btn-error" @click="deleteData(user.uuid)">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-3 w-3"
                    viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2023 Fonticons, Inc. --><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>
                </button>

                <button class="btn btn-sm btn-square btn-warning" @click="updateData(user.uuid)">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-3 w-3"
                    viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2023 Fonticons, Inc. --><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>               
                   </button>
            
              </div>
            </th>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <div class="flex gap-2 mt-12">
      <input 
        id="name"
        name="name"
        type="text" 
        placeholder="Nama" 
        :value="userDetail.name"
        @input="onChangehandler"
        class="input input-bordered w-full max-w-xs mb-2" 
      />
      <input 
        id="email"
        name="email"
        type="text" 
        placeholder="Email" 
        :value="userDetail.email"
        @input="onChangehandler"
        class="input input-bordered w-full max-w-xs mb-2" />
      <input 
        id="dob"
        name="dob"
        type="date" 
        placeholder="Tanggal Lahir" 
        :value="userDetail.dob"
        @input="onChangehandler"
        class="input input-bordered w-full max-w-xs mb-2" 
      />
      <input 
        id="image"
        name="image"
        type="file"
        @change="onUploadImage"
        placeholder="Foto"
        class="input input-bordered w-full max-w-xs mb-3" 
      />

      <button 
        class="btn btn-primary"
        @click="onSubmit"
      >
        Submit
      </button>
    </div>

    
  </div>
</template>