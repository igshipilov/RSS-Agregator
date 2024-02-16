/* eslint-disable no-param-reassign, no-console, func-names  */

const handleFeedback = (elements, initialState, value) => {
  if (value === false) {
    elements.input.classList.add('is-invalid');
    elements.textFeedback.classList.remove('text-success');
    elements.textFeedback.classList.add('text-danger');
    elements.textFeedback.textContent = initialState.uiState.state;
  }
  if (value === true) {
    elements.input.classList.remove('is-invalid');
    elements.input.value = '';
    elements.input.focus();
    elements.textFeedback.classList.remove('text-danger');
    elements.textFeedback.classList.add('text-success');
    elements.textFeedback.textContent = initialState.uiState.state;;
  }
};

export default (elements, initialState) => (path, value) => {
  console.log('RENDER >> path:', path, '>> value:', value); // debug
  switch (path) {
    case 'uiState.isValid':
      handleFeedback(elements, initialState, value);
      break;

    default:
      throw new Error(`Unknown path: ${path}`);
  }
};
