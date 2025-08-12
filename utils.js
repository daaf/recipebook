function createElement(tag, attributes) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.entries(attributes).forEach(([attribute, value]) => {
            try {
                element.setAttribute(attribute, value);
            } catch (error) {
                console.log(
                    `Error setting attribute ${attribute} with value ${value}`
                );
            }
        });
    }

    return element;
}

function getImageSrc(image) {
    if (image instanceof Blob) {
        try {
            return URL.createObjectURL(image);
        } catch (error) {
            console.warn('Failed to create image URL from photo Blob', error);
        }
    }
    return null;
}

export { createElement, getImageSrc };
