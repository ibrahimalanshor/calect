<script setup>
import { computed, onMounted, ref } from 'vue';
import vClickOutside from 'click-outside-vue3'
import useVisible from '@/composes/visible.compose';
import debounce from '@/helpers/debounce';
import styleClasses from './callect.style'

const props = defineProps({
  modelValue: Object,
  id: {
    type: String,
    default: 'id',
  },
  data: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: 'name',
  },
  placeholder: {
    type: String,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  classes: {
    type: Object,
    default: () => {}
  },
  emptyMessage: {
    type: String,
    default: 'Empty'
  }
});
const emit = defineEmits([
  'update:modelValue',
  'infinite-scroll',
  'search',
  'change',
]);

const { visible, show, hide } = useVisible();

const contentEl = ref(null);
const search = ref();
const debounceSearch = debounce(() => emit('search', search.value));

const selectedItem = computed({
  get: function () {
    return props.modelValue;
  },
  set: function (value) {
    emit('update:modelValue', value);
    emit('change');
  },
});
const style = computed(() => {
  return {
    wrapper: [styleClasses.wrapper, props.classes.wrapper],
    input: [styleClasses.input, props.classes.input],
    spinner: [styleClasses.spinner, props.classes.spinner],
    clearButton: [styleClasses.clearButton, props.classes.clearButton],
    clearIcon: [styleClasses.clearIcon, props.classes.clearIcon],
    content: [styleClasses.content, props.classes.content],
    list: [styleClasses.list, props.classes.list],
    item: [styleClasses.item, props.classes.item],
    itemActive: [styleClasses.itemActive, props.classes.itemActive],
  }
})

function isItemActive(item) {
  return selectedItem.value
    ? selectedItem.value[props.id] === item[props.id]
    : false;
}

function setListener() {
  contentEl.value.addEventListener('scroll', handleScroll);
}
function clearListener() {
  contentEl.value.scrollTop = 0;
  contentEl.value.removeEventListener('scroll', handleScroll);
}

function handleScroll(e) {
  if (e.target.scrollTop >= e.target.scrollHeight - e.target.clientHeight) {
    emit('infinite-scroll');
  }
}
function handleClickItem(item) {
  selectedItem.value = item;
  search.value = item[props.label];

  hide();
  emit('search', search.value);
}
function handleInput() {
  debounceSearch();
}
function handleFocus() {
  show();
  setListener();
}
function handleClickOutside() {
  if (visible.value) {
    if (selectedItem.value) {
      search.value = selectedItem.value[props.label];
    }

    hide();
    emit('search', search.value);

    clearListener();
  }
}
function handleClickClear() {
  selectedItem.value = {};
  search.value = '';

  emit('search', '');
}

onMounted(() => {
  search.value = selectedItem.value ? selectedItem.value[props.label] : null;

  setListener();
});
</script>

<template>
  <div :class="style.wrapper" v-click-outside="handleClickOutside">
    <input
      type="text"
      :class="style.input"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      v-model="search"
      v-on:input="handleInput"
      v-on:focus="handleFocus"
    />
    <slot v-if="props.isLoading" name="spinner" :classes="style.spinner">
      <svg
        :class="style.spinner"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </slot>
    <button
      v-else-if="selectedItem ? !!selectedItem[props.label] : false"
      type="button"
      :class="style.clearButton"
      v-on:click="handleClickClear"
    >
      <slot name="clear" :classes="style.clearIcon">
        <svg :class="style.clearIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </slot>
    </button>
    <div
      :class="style.content"
      ref="contentEl"
    >
      <ul :class="style.list" v-if="!props.data.length">
        <li :class="style.item">
          {{ props.emptyMessage }}
        </li>
      </ul>
      <ul :class="style.list" v-else>
        <li
          v-for="item in props.data"
          :key="item[props.id]"
          :class="[style.item, isItemActive(item) ? style.itemActive : '']"
          v-on:click="handleClickItem(item)"
        >
          {{ item[props.label] }}
        </li>
      </ul>
    </div>
  </div>
</template>