import { ref } from 'vue';

export default function useVisible(init = false) {
  const visible = ref(init);

  function show() {
    visible.value = true;
  }

  function hide() {
    visible.value = false;
  }

  function toggle() {
    visible.value = !visible.value;
  }

  return { visible, show, hide, toggle };
}