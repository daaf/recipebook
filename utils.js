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

function mapObject(object, func) {
    const outputObject = {};
    for (const property in object) {
        if (object[property] instanceof Array) {
            outputObject[property] = object[property].map((item) => func(item));
        } else if (typeof object[property] === 'string') {
            outputObject[property] = func(object[property]);
        } else {
            outputObject[property] = object[property];
        }
    }
    return outputObject;
}

function sanitizeObject(object) {
    return mapObject(object, sanitizeText);
}

function sanitizeText(input) {
    if (typeof input === 'string') {
        return DOMPurify.sanitize(input)
            .replace(/<.*?>/g, '') // Remove anything between < and >
            .replace(/[=]/g, ''); // Remove some non-alphanumeric characters
    } else {
        return input;
    }
}

function escapeAttribute(value) {
    if (typeof value !== 'string') return value;
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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

export {
    createElement,
    sanitizeObject,
    sanitizeText,
    escapeAttribute,
    getImageSrc,
};
