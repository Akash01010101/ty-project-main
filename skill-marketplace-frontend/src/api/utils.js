const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const fetchApi = async (url, options = {}, isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    // Attempt to read error message from response body
    let errorMessage = 'Network response was not ok';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

const get = (url) => {
  return fetchApi(url);
};

const post = (url, data, isFormData = false) => {
  return fetchApi(url, {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
  }, isFormData);
};

const put = (url, data, isFormData = false) => {
  return fetchApi(url, {
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
  }, isFormData);
};

const del = (url) => {
  return fetchApi(url, {
    method: 'DELETE',
  });
};

export { get, post, put, del };
