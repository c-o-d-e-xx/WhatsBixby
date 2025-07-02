/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

function EncodeInput(input, options = {}) {
    const {
        trim = true,
        removeMultipleSpaces = true,
        removeSpecialChars = false,
        toLowerCase = false,
        toUpperCase = false,
        maxLength = null,
        replaceDelimiters = null,
        urlSafe = false,
    } = options;

    if (typeof input !== 'string') {
        input = String(input);
    }

    if (trim) {
        input = input.trim();
    }

    if (removeMultipleSpaces) {
        input = input.replace(/\s+/g, ' ');
    }

    if (removeSpecialChars) {
        input = input.replace(/[^\w\s-]/g, '');
    }

    if (toLowerCase) {
        input = input.toLowerCase();
    } else if (toUpperCase) {
        input = input.toUpperCase();
    }

    if (maxLength && input.length > maxLength) {
        input = input.substring(0, maxLength);
    }

    if (replaceDelimiters && typeof replaceDelimiters === 'object') {
        for (const [delimiter, replacement] of Object.entries(replaceDelimiters)) {
            input = input.split(delimiter).join(replacement);
        }
    }

    let encodedInput = encodeURIComponent(input);

    if (urlSafe) {
        encodedInput = encodedInput
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    return encodedInput;
}

module.exports = { EncodeInput };
