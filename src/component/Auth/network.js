// network.js
export const getRequest = (url, headers = {}) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Request failed with status ${xhr.status}: ${xhr.statusText}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred'));
        });

        xhr.open('GET', url);

        // Set the request headers
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });

        xhr.send();
    });
};

export const postRequest = (url, data = {}, headers = {}) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status === 200 || xhr.status === 201) {
                resolve(xhr.responseText);
            } else {
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    reject(new Error(`Request failed with status ${xhr.status}: ${errorResponse.message || xhr.statusText}`));
                } catch (parseError) {
                    reject(new Error(`Request failed with status ${xhr.status}: ${xhr.statusText || 'No additional error information available'}`));
                }
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred'));
        });

        xhr.open('POST', url);

        // Set the request headers
        Object.keys(headers).forEach(key => {
            if (key.toLowerCase() !== 'content-type' || !(data instanceof FormData)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        });

        // Only set Content-Type to application/json if data is not FormData
        if (!(data instanceof FormData)) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        } else {
            // For FormData, let the browser set the Content-Type with boundary
            xhr.send(data);
        }
    });
};

export const putRequest = (url, data = {}, headers = {}) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status === 200 || xhr.status === 204) {  // PUT often returns 204 (No Content) on success
                resolve(xhr.responseText);  // Even if empty, this allows consistent handling
            } else {
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    reject(new Error(`Request failed with status ${xhr.status}: ${errorResponse.message || xhr.statusText}`));
                } catch (parseError) {
                    reject(new Error(`Request failed with status ${xhr.status}: ${xhr.statusText || 'No additional error information available'}`));
                }
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred'));
        });

        xhr.open('PUT', url);

        // Set the request headers
        Object.keys(headers).forEach(key => {
            if (key.toLowerCase() !== 'content-type' || !(data instanceof FormData)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        });

        // Only set Content-Type to application/json if data is not FormData
        if (!(data instanceof FormData)) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        } else {
            // For FormData, let the browser set the Content-Type with boundary
            xhr.send(data);
        }
    });
};

export const deleteRequest = (url, data = {}, headers = {}) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status === 200 || xhr.status === 204) { // 204 No Content is common for delete success
                resolve(xhr.responseText);
            } else {
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    reject(new Error(`Request failed with status ${xhr.status}: ${errorResponse.message || xhr.statusText}`));
                } catch (parseError) {
                    reject(new Error(`Request failed with status ${xhr.status}: ${xhr.statusText || 'No additional error information available'}`));
                }
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred'));
        });

        xhr.open('DELETE', url);

        // Set the request headers
        Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
        });

        if (Object.keys(data).length > 0) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }
    });
};