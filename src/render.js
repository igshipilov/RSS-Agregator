/* eslint-disable no-param-reassign, */

const addTitles = (titleName) => {
  const container = document.createElement('div');
  const containerForTitle = document.createElement('div');
  const title = document.createElement('h2');
  const list = document.createElement('ul');

  container.classList.add('card', 'border-0');
  containerForTitle.classList.add('card-body');

  title.classList.add('card-title', 'h4');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  title.textContent = titleName;

  containerForTitle.append(title);
  container.append(containerForTitle, list);

  return container;
};

const renderFeeds = (feeds) => {
  const list = document.querySelector('.feeds > .card > ul');

  feeds.forEach((feed) => {
    const item = document.createElement('li');
    const title = document.createElement('h3');
    const description = document.createElement('p');

    item.classList.add('list-group-item', 'border-0', 'border-end-0');
    title.classList.add('h6', 'm-0');
    description.classList.add('m-0', 'small', 'text-black-50');

    title.textContent = feed.title;
    description.textContent = feed.description;

    item.append(title, description);
    list.prepend(item);
  });
};

const renderPosts = (posts, initialState, i18nInstance) => {
  const list = document.querySelector('.posts > .card > ul');

  posts.forEach(({
    title, link, id,
  }) => {
    const item = document.createElement('li');
    const titleElement = document.createElement('a');
    const button = document.createElement('button');

    item.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    if (initialState.ui.clickedPostsIds.includes(id)) {
      titleElement.classList.add('fw-normal', 'link-secondary');
    } else {
      titleElement.classList.add('fw-bold');
    }

    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');

    titleElement.setAttribute('href', `${link}`);
    titleElement.setAttribute('data-id', `${id}`);
    titleElement.setAttribute('target', '_blank');
    titleElement.setAttribute('rel', 'noopener noreferrer');

    button.setAttribute('type', 'button');
    button.setAttribute('data-id', `${id}`);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');

    titleElement.textContent = title;
    button.textContent = i18nInstance.t('buttons.view');

    item.append(titleElement, button);
    list.prepend(item);
  });
};

const renderMessageError = (initialState, elements, i18nInstance, path) => {
  const currentProcess = path.replace('.status', '');
  const errorCode = initialState[currentProcess].error;
  elements.input.classList.add('is-invalid');
  elements.textFeedback.classList.remove('text-success');
  elements.textFeedback.classList.add('text-danger');
  elements.textFeedback.textContent = i18nInstance.t(errorCode);
};

const handleRenderContent = (elements, initialState, i18nInstance, path, value) => {
  switch (value) {
    case 'starting':
      break;

    case 'success':
      elements.content.feeds.textContent = '';
      elements.content.posts.textContent = '';
      elements.content.feeds.append(addTitles(i18nInstance.t('mainInterface.feedsTitle')));
      elements.content.posts.append(addTitles(i18nInstance.t('mainInterface.postsTitle')));

      renderFeeds(initialState.content.feeds);
      renderPosts(initialState.content.posts, initialState, i18nInstance);
      break;

    case 'uploadError':
      renderMessageError(initialState, elements, i18nInstance, path);
      break;

    default:
      throw new Error(`Unknown value: ${value}`);
  }
};

const renderMessageSuccess = (elements, i18nInstance) => {
  elements.input.classList.remove('is-invalid');
  elements.form.reset();
  elements.input.focus();
  elements.textFeedback.classList.remove('text-danger');
  elements.textFeedback.classList.add('text-success');
  elements.textFeedback.textContent = i18nInstance.t('feedback.success');
};

const toggleFormDisable = (elements) => {
  const button = elements.buttons.add;
  const { input } = elements;

  button.toggleAttribute('disabled');
  input.toggleAttribute('readonly');
};

const handleRenderMessages = (elements, initialState, i18nInstance, path, value) => {
  switch (value) {
    case 'sending':
      toggleFormDisable(elements);
      break;

    case 'sent':
      renderMessageSuccess(elements, i18nInstance);
      toggleFormDisable(elements);

      break;

    case 'validationError':
      renderMessageError(initialState, elements, i18nInstance, path);
      toggleFormDisable(elements);

      break;

    default:
      throw new Error(`Unknown value: ${value}`);
  }
};

const handleModal = (elements, initialState, value) => {
  const currentPost = document.querySelector(`[data-id="${value}"]`);
  const { posts } = initialState.content;
  const currentPostData = posts.find(({ id }) => id === value);
  const { title, description, link } = currentPostData;

  currentPost.classList.remove('fw-bold');
  currentPost.classList.add('fw-normal', 'link-secondary');

  elements.modal.title.textContent = title;
  elements.modal.body.textContent = description;
  elements.modal.fullArticle.setAttribute('href', `${link}`);
};

export default (elements, initialState, i18nInstance) => (path, value) => {
  switch (path) {
    case 'loadingProcess.status':
      handleRenderContent(elements, initialState, i18nInstance, path, value);
      break;

    case 'form.status':
      handleRenderMessages(elements, initialState, i18nInstance, path, value);
      break;

    case 'ui.activePostId':
      handleModal(elements, initialState, value);
      break;

    default:
      throw new Error(`Unknown path: ${path}`);
  }
};
