let instance;

export default class Modal {
    constructor() {
        if (instance) {
            throw new Error('Only one instance of Modal can exist at a time');
        }

        instance = this;

        this.outer = document.querySelector('.modal-outer');
        this.inner = document.querySelector('.modal-inner');
    }

    set header(text) {
        this.inner.querySelector('h2').textContent = text;
    }

    set innerHtml(html) {
        this.inner.insertAdjacentHTML('beforeend', html);
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
        const recipeElement = this.inner.querySelector('.recipe');
        if (recipeElement) {
            recipeElement.remove();
        }
    }
}
