export const getErrorMessage = (error, defaultMessage) => {
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    if (error?.message) {
        return error.message;
    }
    return defaultMessage;
};

export const buildFormData = (values = {}, options = {}) => {
    const formData = new FormData();
    const jsonKeys = options.jsonKeys || [];

    Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }
        if (jsonKeys.includes(key)) {
            formData.append(key, JSON.stringify(value));
            return;
        }
        formData.append(key, value);
    });

    return formData;
};
