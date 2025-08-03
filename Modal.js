export default class Modal {
    constructor() {
        this.outer = document.querySelector('.modal-outer');
        this.inner = document.querySelector('.modal-inner');
    }

    set header(text) {
        this.inner.querySelector('h2').textContent = text;
    }

    handleClick(event) {
        const isInInnerModal = event.target.closest('.modal-inner');

        if (!isInInnerModal) {
            this.close();
        }
    }

    toggleState = () => this.outer.classList.toggle('open');

    close() {
        this.outer.classList.remove('open');
    }
}
