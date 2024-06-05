<template>
    <div>
        <label for="date_input">Enter the date ({{ dateFormat }}):</label>
        <input
            id="date_input"
            v-model="displayDate"
            @keydown="onKeydown"
            @focus="onFocus"
            @blur="checkValidation"
            :placeholder="placeholder"
            ref="dateInput"
            :class="{'error': !fieldValid}"
        />
        <span v-if="!fieldValid" class="error_message">{{ errorMessage }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';

export default defineComponent({
    name: 'DateInput',
    props: {
        date: {
            type: String,
            required: true,
        },
        locale: {
            type: String
        }
    },
    emits: ['update:date'],
    setup(props, { emit }) {
        // init reactive variables and constants
        const dateInput = ref(null);
        const fieldValid = ref(true);
        const displayDate = ref('');
        const errorMessage = ref('');
        const dateFormats = {
            US: 'MM/DD/YYYY',
            world: 'DD/MM/YYYY'
        }
        const locale = props.locale || navigator.language === 'en_US'? 'US': 'world';

        /**
         * Function for formatting string to put it to input as a value property
         * @param value
         */
        const formatToDisplay = (value: string): string => {
            if (!value) return '';
            let [year, month, day] = value.split('-');

            if (day.length == 1) day += 'D';
            if (month.length == 1) month += 'M';
            if (year.length < 4) year += 'Y'.repeat(4 - year.length)

            if (locale == 'US') return `${month || 'MM'}/${day || 'MM'}/${year || 'YYYY'}`;

            return `${day || 'DD'}/${month || 'MM'}/${year || 'YYYY'}`;
        };

        /**
         * Function for formatting string to put it to v-model
         * @param value
         */
        const formatToModel = (value: string): string => {
            const cleaned = value.replace(/\D/g, '');
            const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);

            if (match) {
                let day, month;
                if (locale == 'US') {
                    day = match[2];
                    month = match[1];
                }
                else {
                    day = match[1];
                    month = match[2];
                }

                const year = match[3];
                if (year) return `${year}-${month || 'MM'}-${day || 'DD'}`;
                if (month) return `YYYY-${month}-${day || 'DD'}`;
                if (day) return `YYYY-MM-${day}`;
            }

            return '';
        };

        displayDate.value = formatToDisplay(props.date);

        /**
         * Getting last day of the month
         * @param month
         * @param year
         */
        const daysInMonth = (month: number, year: number):number => {
            return new Date(year, month, 0).getDate();
        }

        /**
         * Function for checking validation.
         * Validates model and input's value for correct format, months and checking a days in month (28/30/31)
         */
        const checkValidation = async() => {
            const input = dateInput.value as HTMLInputElement|null;

            if (input) {
                if (!/^(\d{2})\/(\d{2})\/(\d{4})$/.test(input.value) && /\d+/g.test(input.value)) {
                    fieldValid.value = false;
                    errorMessage.value = 'Wrong date format';
                }
                else {
                    const [year, month, day] = props.date.split('-').map(item => parseInt(item));
                    const maxDayInMonth = daysInMonth(month, year);

                    if (month && month > 12) {
                        fieldValid.value = false;
                        errorMessage.value = 'Wrong month';
                    }
                    else if (day > maxDayInMonth) {
                        fieldValid.value = false;
                        errorMessage.value = 'Wrong day';
                    }
                }
            }
        };

        onMounted(async () => {
            // Firing validation in case when v-model is not empty
            await checkValidation();
        })

        /**
         * Watcher for model changing and putting input's cursor to the last digit
         */
        watch(
            () => props.date,
            (newValue) => {
                displayDate.value = formatToDisplay(newValue);
                const input = dateInput.value as HTMLInputElement|null;

                setTimeout(() => {
                    if (input) {
                        const regex = /[A-Z]/g;
                        regex.test(input.value);

                        const cursorPosition = regex.lastIndex;
                        input.setSelectionRange(cursorPosition-1, cursorPosition-1);
                    }
                })
            }
        );

        /**
         * This function does not allow to press any key except digits and pressing Backspace key
         * @param event
         */
        const onKeydown = (event: KeyboardEvent) => {
            event.preventDefault()

            const target = event.target as HTMLInputElement;
            let cursorPosition:number|null = target.selectionStart;

            if (/^\d$/.test(event.key) && (/[A-Z]/g.test(props.date) || props.date.length < 10)) {
                const formattedValue = formatToModel(target.value + event.key);

                if (formattedValue !== props.date) {
                    fieldValid.value = true;
                    errorMessage.value = '';

                    emit('update:date', formattedValue);
                }
            }
            else if (event.key == 'Backspace' && cursorPosition) {
                let inputValue = target.value;
                let shiftedLetter;

                if (cursorPosition < 4) shiftedLetter = locale != 'US'? 'D': 'M';
                else if (cursorPosition < 8) shiftedLetter = locale != 'US'? 'M': 'D';
                else shiftedLetter = 'Y';

                if (cursorPosition - 1 && inputValue[cursorPosition - 1] == '/') {
                    cursorPosition -= 1;
                }

                inputValue = `${inputValue.substring(0, cursorPosition-1)}${shiftedLetter}${inputValue.substring(cursorPosition)}`;

                const formattedValue = formatToModel(inputValue);
                if (formattedValue !== props.date) {
                    fieldValid.value = true;
                    errorMessage.value = '';
                    emit('update:date', formattedValue);
                }
            }
        }

        /**
         * Actualizing input's cursor for focusing on input
         * @param event
         */
        const onFocus = (event: FocusEvent) => {
            event.preventDefault();
            const input = dateInput.value as HTMLInputElement|null;

            if (input) {
                const regex = /[A-Z]/g;
                regex.test(input.value);

                const cursorPosition = regex.lastIndex;
                setTimeout(() => {
                    input.setSelectionRange(cursorPosition-1, cursorPosition-1);
                })
            }
        }

        return {
            displayDate,
            dateInput,
            onKeydown,
            onFocus,
            placeholder: dateFormats[locale],
            fieldValid,
            checkValidation,
            errorMessage,
            dateFormat: dateFormats[locale]
        };
    },
});
</script>

<style scoped lang="scss">
input {
    padding: 0.5rem;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
    cursor: text;

    &:focus {
        cursor: text;
        pointer-events: none;
    }

    &.error {
        border: 1px #b00b20 solid;
        color: #b00b20;
    }
}

.error_message {
    color: #b00b20;
}
</style>
