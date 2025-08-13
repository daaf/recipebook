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

function createSanitizedProxy(target, validator = () => true) {
    return new Proxy(target, {
        set(obj, prop, value) {
            let sanitizedValue;

            if (typeof value === 'string') {
                sanitizedValue = sanitizeText(value);
            } else if (value instanceof Array) {
                sanitizedValue = sanitizeArray(value);
            } else {
                sanitizedValue = value;
            }

            if (!validator(prop, sanitizedValue)) {
                throw new Error(`Invalid value for ${prop}: ${sanitizedValue}`);
            }

            obj[prop] = sanitizedValue;
            return true;
        },
        get(obj, prop) {
            return obj[prop];
        },
    });
}

function recipeValidator(prop, value) {
    const isNotString = typeof value !== 'string';
    const isNotArrayOfStrings =
        !value instanceof Array ||
        !value.every((item) => typeof item === string);

    if (
        typeof value === 'object' &&
        !value instanceof Array &&
        prop !== 'photo'
    )
        return false;

    if (prop === 'id' && (!value || isNotString)) return false;
    if (prop === 'name' && (!value || isNotString)) return false;
    if (prop === 'description' && value && isNotString) return false;
    if (prop === 'ingredients' && value && isNotArrayOfStrings) return false;
    if (prop === 'instructions' && value && isNotArrayOfStrings) return false;
    if (
        prop === 'photo' &&
        value &&
        (!value instanceof File || !value instanceof Blob)
    ) {
        return false;
    }

    return true;
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

function sanitizeArray(input) {
    if (input instanceof Array) {
        return input.map((item) => sanitizeText(item));
    } else {
        return input;
    }
}

function encodeAttribute(value) {
    if (typeof value !== 'string') return value;
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function convertToPlainObject(input) {
    if (input === null || typeof input !== 'object') return input;
    if (input instanceof File || input instanceof Blob) return input;
    if (input instanceof Array) return input.map(convertToPlainObject);

    const object = {};
    for (const key of Object.keys(input)) {
        object[key] = convertToPlainObject(input[key]);
    }
    return object;
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
    createSanitizedProxy,
    recipeValidator,
    sanitizeText,
    encodeAttribute,
    convertToPlainObject,
    getImageSrc,
};
