import { mount } from '@vue/test-utils';
import { describe, test, expect } from 'vitest';
import Callect from './callect.vue';
import callectStyle from './callect.style';

function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
}

describe('callect test', () => {
  test('component exists', () => {
    expect(Callect).toBeDefined();
  });

  test('base', () => {
    const wrapper = mount(Callect, {
      props: {
        data: [],
      },
    });

    expect(wrapper.find(`.${callectStyle.wrapper}`).exists()).toBeTruthy();
    expect(wrapper.find(`.${callectStyle.input}`).exists()).toBeTruthy();
    expect(wrapper.find(`.${callectStyle.spinner}`).exists()).toBeFalsy();
    expect(wrapper.find(`.${callectStyle.clearButton}`).exists()).toBeFalsy();
    expect(wrapper.find(`.${callectStyle.content}`).exists()).toBeTruthy();
    expect(
      wrapper.find(`.${callectStyle.contentHidden}`).exists()
    ).toBeTruthy();
  });

  test('input', async () => {
    const wrapper = mount(Callect, {
      props: {
        data: [],
        placeholder: 'Test Placeholder',
      },
    });

    const input = wrapper.find(`.${callectStyle.input}`);
    const content = wrapper.find(`.${callectStyle.content}`);

    // Placeholder
    expect(input.element.getAttribute('placeholder')).toEqual(
      'Test Placeholder'
    );

    // Disabled
    await wrapper.setProps({ disabled: true });
    expect(input.element.disabled).toBeTruthy();

    // Focus Event
    await input.element.dispatchEvent(new Event('focus'));
    expect(content.classes()).not.to.contain(callectStyle.contentHidden);

    // Input Event
    await input.element.dispatchEvent(new InputEvent('input'));
    await sleep(500);
    expect(wrapper.emitted()).toHaveProperty('search');
  });

  test('loading', async () => {
    const wrapper = mount(Callect, {
      props: {
        data: [],
        loading: true,
      },
    });

    expect(wrapper.find(`.${callectStyle.spinner}`).exists()).toBeTruthy();

    await wrapper.setProps({ loading: false });

    expect(wrapper.find(`.${callectStyle.spinner}`).exists()).toBeFalsy();
  });

  test('content', async () => {
    const wrapper = mount(Callect, {
      props: {
        data: [],
        emptyMessage: 'Empty',
      },
    });

    let list = wrapper.find(`.${callectStyle.list}`);

    // Empty
    expect(list.find(`.${callectStyle.item}`).exists()).toBeTruthy();
    expect(list.find(`.${callectStyle.item}`).text()).toEqual('Empty');

    // Set Data
    const data = [
      {
        id: 1,
        name: 'Option 1',
      },
      {
        id: 2,
        name: 'Option 2',
      },
      {
        id: 3,
        name: 'Option 3',
      },
    ];
    await wrapper.setProps({
      data,
    });

    // Update List
    list = wrapper.find(`.${callectStyle.list}`);

    // List Item
    expect(list.findAll(`.${callectStyle.item}`).length).toEqual(3);

    // First Item
    let item = list.find(`.${callectStyle.item}`);

    // First Item Name
    expect(item.text()).toEqual(data[0].name);

    // Click Item
    await item.trigger('click');
    await wrapper.setProps({ modelValue: data[0] });

    item = list.find(`.${callectStyle.item}`);

    // Search Event
    expect(wrapper.emitted()).toHaveProperty('search');
    expect(wrapper.emitted().search[0][0]).toEqual(data[0].name);

    // Input Value Change
    expect(wrapper.find(`.${callectStyle.input}`).element.value).toEqual(
      data[0].name
    );

    // Active Item
    expect(item.classes()).to.contain(callectStyle.itemActive);

    // Hide Content
    expect(wrapper.find(`.${callectStyle.content}`).classes()).to.contain(
      callectStyle.contentHidden
    );
  });
});
