/* eslint-disable no-param-reassign, no-console, func-names  */

export default (elements) => (path, value) => {
  console.log('RENDER >> path:', path, '>> value:', value); // debug
  switch (path) {
    case 'uiState.isValid':
      // const input = elements.input;
      if (value === false) {
        elements.input.classList.add('is-invalid');
      }
      if (value === true) {
        elements.input.classList.remove('is-invalid');
      }
      break;

    case 'urls':
      elements.input.value = '';
      elements.input.focus();

      elements.textFeedback.classList.remove('text-danger');
      elements.textFeedback.classList.add('text-success');
      elements.textFeedback.textContent = 'RSS успешно загружен';
      break;

    case 'uiState.error':
      elements.textFeedback.classList.remove('text-success');
      elements.textFeedback.classList.add('text-danger');
      if (value === 'exists') {
        elements.textFeedback.textContent = 'RSS уже существует';
      } else if (value === 'incorrect') {
        // elements.textFeedback.textContent = i18nInstance.t('feedback.invalidUrl');
        elements.textFeedback.textContent = 'Ссылка должна быть валидным URL';
      }
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }
};
