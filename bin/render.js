/* eslint-disable no-param-reassign, no-console, func-names  */

const handleFeedback = (elements, initialState, value, i18nInstance) => {
  if (value === false) {
    elements.input.classList.add('is-invalid');
    elements.textFeedback.classList.remove('text-success');
    elements.textFeedback.classList.add('text-danger');
    elements.textFeedback.textContent = i18nInstance.t(initialState.uiState.state);
  }
  if (value === true) {
    elements.input.classList.remove('is-invalid');
    elements.input.value = '';
    elements.input.focus();
    elements.textFeedback.classList.remove('text-danger');
    elements.textFeedback.classList.add('text-success');
    elements.textFeedback.textContent = i18nInstance.t(initialState.uiState.state);
  }
};

const handleTitle = (elements, initialState, value) => {
  if (value === true) {
    const divCardBorder = document.createElement('div');
    const divCardBody = document.createElement('div');
    const h2 = document.createElement('h2');

    divCardBorder.classList.add('card', 'border-0');
    divCardBody.classList.add('card-body');
    h2.classList.add('card-title', 'h4');
    
    h2.textContent = 'Фиды'; // translate
    divCardBody.append(h2);
    divCardBorder.append(divCardBody);

    elements.content.feeds.append(divCardBorder);
    // elements.content.feeds.innerHTML =
    // `<div class="card border-0">
    //   <div class="card-body">
    //     <h2 class="card-title h4">Фиды</h2>
    //   </div>
    // </div>`;
  };
};

const handleContent = (elements, initialState, value) => {
  if (value === true) {
    const list = document.createElement('ul');
  
    const feed = document.createElement('li');
    const title = document.createElement('h3');
    const description = document.createElement('p');
  
    list.classList.add('list-group', 'border-0', 'rounded-0');
    feed.classList.add('list-group-item', 'border-0', 'border-end-0');
    title.classList.add('h6', 'm-0');
    description.classList.add('m-0', 'small', 'text-black-50');
  
    title.textContent = 'TEMP Title';
    description.textContent = 'TEMP Description';
  
    feed.append(title, description);
    list.append(feed);
    elements.content.feeds.append(feed);
  }
};


export default (elements, initialState, i18nInstance) => (path, value) => {
  // console.log('RENDER >> path:', path, '>> value:', value); // debug
  switch (path) {
    case 'uiState.isValid':
      handleFeedback(elements, initialState, value, i18nInstance);
      // FIXME -- handleTitle -- Сделать проверку на существование, чтобы рендерить только в первый раз
      // handleTitle(elements, initialState, value);
      // handleContent(elements, initialState, value);
      break;

    default:
      throw new Error(`Unknown path: ${path}`);
  }
};
