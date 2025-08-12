import { createElement } from './utils.js';

export default class ModalView {
    constructor(contents) {
        this.element = this.create();
        this.inner = this.element.querySelector('.modal-inner');

        this.inner.append(contents);
    }

    get contents() {
        return this.inner.innerHTML;
    }

    set contents(element) {
        this.inner.innerHTML = element;
    }

    create() {
        const outer = createElement('div', { class: 'modal-outer' });
        outer.innerHTML = `
            <div class="modal-inner">
            </div>`;

        return outer;
    }

    open() {
        this.element.classList.add('open');
    }

    close() {
        this.element.classList.remove('open');
    }

    remove() {
        const imgSrc = this.element.querySelector('img')?.src;
        if (imgSrc) URL.revokeObjectURL(imgSrc);
        this.element.remove();
    }
}
