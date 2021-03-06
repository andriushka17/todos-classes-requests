const callApi = async (url, params) => {
    let response = await fetch(`http://localhost:5001${url}`, params);

    if(response.ok) {
        let json = await response.json();
        return json;
    } else {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
}

const requests = {
    
    async getTodos() {
        const url = '/todos';
        const params = { method: 'GET' };
        return await callApi(url, params);
    },

    async addTodo(text) {
        const url = '/todos';
        const params = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(text)
        };

        return await callApi(url, params);
    },

    async deleteTodo(id) {
        const url = `/todos/${id}`;
        const params = { method: 'DELETE' };

        console.log('url', url);
        console.log('params', params);

        return await callApi(url, params);
    },

    async checkTodo(id) {
        const url = `/todos/${id}`;
        const params = { method: 'PATCH' };

        return await callApi(url, params);
    },

    async completeAll() {
        const url = '/todos';
        const params = { method: 'PATCH' };

        return await callApi(url, params);
    },

    async clearCompleted(idsArr) {
        const url = '/todos/clearAll';
        const params = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: idsArr
        };

        return await callApi(url, params);
    },

    async updateTextInput(text, id) {
        const url = `/todos/${id}`;
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(text, id)
        }

        return await callApi(url, params);
    }
}

export { requests };