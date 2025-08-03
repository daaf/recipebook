export default class OptionsMenu {
    constructor(event) {
        this.button = event.target
            ?.closest('.recipe-card')
            ?.querySelector('.see-options');
        this.optionList = event.target
            ?.closest('.recipe-card')
            ?.querySelector('.options');
    }

    #toggleOptionsButtonState() {
        this.button.classList.toggle('menu-open');
    }

    #toggleOptionsElementState() {
        this.optionList.classList.toggle('show');
    }

    toggleState() {
        this.button && this.#toggleOptionsButtonState();
        this.optionList && this.#toggleOptionsElementState();
    }
}
