import {describe, it, expect} from 'vitest'

import {mount} from '@vue/test-utils'
import MaskedInput from '../MaskedInput.vue'

describe('MaskedInput', () => {
    const date = '2000-12-31';

    it ('renders properly', () => {
        const wrapper = mount(MaskedInput, {props: {date}})
        expect(wrapper.text()).toContain('Enter the date');
    })

    it ('default date format', () => {
        const wrapper = mount(MaskedInput, {props: {date}});
        const input = wrapper.find('#date_input').element as HTMLInputElement;
        expect(input.value).toEqual('31/12/2000')
    });

    it ('US date format', () => {
        const wrapper = mount(MaskedInput, {props: {date, locale: 'US'}});
        const input = wrapper.find('#date_input').element as HTMLInputElement;
        expect(input.value).toEqual('12/31/2000');
    });

    it ('handling wrong day', async() => {
        const wrapper = await mount(MaskedInput, {props: {date: '2000-12-32', locale: 'US'}});
        expect(wrapper.text()).toContain('Wrong day');
    });

    it ('handling wrong month', async() => {
        const wrapper = await mount(MaskedInput, {props: {date: '2000-13-30', locale: 'US'}});
        expect(wrapper.text()).toContain('Wrong month');
    });
})
