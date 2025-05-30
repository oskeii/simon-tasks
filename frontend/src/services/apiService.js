import useAxiosPrivate from '../hooks/useAxiosPrivate';

export const useApiService = () => {
    const axiosPrivate = useAxiosPrivate();

    // TASK endpoints
    const tasks = {
        getAll: async (params={}) => {
            return await axiosPrivate.get('/tasks/', { params });
        },

        getById: async (taskId) => {
            return await axiosPrivate.get(`/tasks/${taskId}/`);
        },

        subtasks: async (parentId) => {
            return await axiosPrivate.get(`/tasks/${parentId}/subtasks/`);
        },

        getTopLevel: async () => {
            return await axiosPrivate.get('/tasks/top-level/');
        },

        create: async (taskData) => {
            return await axiosPrivate.post('/tasks/', taskData);
        },

        update: async (taskId, taskData) => {
            return await axiosPrivate.patch(`/tasks/${taskId}/`, taskData);
        },

        delete: async (taskId) => {
            return await axiosPrivate.delete(`/tasks/${taskId}/`);
        }
    };

    // TAGS endpoints
    const tags = {
        get: async () => {
            return await axiosPrivate.get('/tags/');
        },

        getById: async (tagId) => {
            return await axiosPrivate.get(`/tags/${tagId}/`);
        },

        create: async (tagData) => {
            return await axiosPrivate.post('/tags/', tagData);
        },

        update: async (tagId, tagData) => {
            return axiosPrivate.patch(`/tags/${tagId}/`, tagData)
        },

        delete: async (tagId) => {
            return await axiosPrivate.delete(`/tags/${tagId}/`);
        }
    }

    const categories = {
        get: async () => {
            return await axiosPrivate.get('/categories/');
        },

        getById: async (catId) => {
            return await axiosPrivate.get(`/categories/${catId}/`);
        },

        create: async (catData) => {
            return await axiosPrivate.post('/categories/', catData);
        },

        update: async (catId, catData) => {
            return axiosPrivate.patch(`/categories/${catId}/`, catData)
        },

        delete: async (catId) => {
            return await axiosPrivate.delete(`/categories/${catId}/`);
        }
    }

    // PROFILE endpoints
    const profile = {
        get: async () => {
            return await axiosPrivate.get('/profile/');
        },

        update: async (profileData) => {
            return await axiosPrivate.patchForm('/profile/', profileData);
        }
    };


    return {
        tasks,
        tags,
        categories,
        profile
    };
};

export default useApiService;