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

function sanitizeText(text) {
    if (typeof text === 'string') {
        return DOMPurify.sanitize(text);
    } else {
        return text;
    }
}

function escapeQuotesInObject(object) {
    return mapObject(object, escapeQuotesInText);
}

function escapeQuotesInText(text) {
    if (typeof text === 'string') {
        const singleQuotes = [/'/g, '&apos;'];
        const doubleQuotes = [/"/g, '&quot;'];
        return text.replace(...singleQuotes).replace(...doubleQuotes);
    } else {
        return text;
    }
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
    escapeQuotesInObject,
    getImageSrc,
};
