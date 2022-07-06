export function hideElement(id) {
  const element = document.getElementById(id);
  if (element.classList.contains('hidden')) return;
  element.className = (element.className + ' hidden').trim();
}

export function showElement(id) {
  const element = document.getElementById(id);
  element.className = element.className
    .split(' ')
    .filter(className => className !== 'hidden')
    .join(' ');
}

export function bindOnClick(id, onClick) {
  const element = document.getElementById(id);
  element?.addEventListener('click', onClick);
}

export function valueOf(id) {
  return document.getElementById(id)?.value;
}

export function setValue(id, text) {
  const element = document.getElementById(id);
  if (element) element.value = text;
}

export function setInnerText(id, text) {
  const element = document.getElementById(id);
  if (element) element.innerText = text;
}