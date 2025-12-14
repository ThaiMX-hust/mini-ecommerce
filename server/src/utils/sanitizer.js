const sanitizeHtml = require('sanitize-html');

const cleanText = (input) => {
    if (typeof input !== 'string') return input;
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {}
    }).trim();
};

module.exports = {
    cleanText
};
