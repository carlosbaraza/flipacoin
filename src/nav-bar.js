const container = document.querySelector('.container');

const toggleClass = (el, className) => {
  if (el.classList.contains(className))
    el.classList.remove(className);
  else
    el.classList.add(className);
}

document
  .querySelector('.main-nav .fa-bars')
  .addEventListener('click', (event) => {
    toggleClass(container, 'show-menu');
  });

document
  .querySelector('.main-nav .fa-times-circle-o')
  .addEventListener('click', (event) => {
    if (container.classList.contains('show-menu'))
      container.classList.remove('show-menu');
  });
