import { createContext, useContext, useReducer } from 'react';
import useApiService from '../services/apiService';

export const OrganizersContext = createContext(null);
export const OrganizersDispatchContext = createContext(null);

/**
 * Context Provider for tags and categories
*/
export const OrganizersProvider = ({ children }) => {
    const [organizers, dispatch] = useReducer(orgReducer, initialState);

  return (
    <OrganizersContext.Provider value={organizers}>
        <OrganizersDispatchContext.Provider value={dispatch}>
            {children}
        </OrganizersDispatchContext.Provider>
    </OrganizersContext.Provider>
  );
}

export const useOrganizers = () => {
    return useContext(OrganizersContext);
}

export const useOrganizersDispatch = () => {
    return useContext(OrganizersDispatchContext);
}

export const useOrganizersManager = () => {
    const state = useOrganizers();
    const dispatch = useOrganizersDispatch();
    const apiService = useApiService();

    // Get all tags
    const getTags = async () => {
        try {
            dispatch(orgActions.setLoading(true));
            const response = await apiService.tags.get();
            console.log(response.data)
            dispatch(orgActions.setTags(response.data.data));
        } catch (err) {
            console.error('Error fetching tags:', err);
            dispatch(orgActions.setError('Failed to load tags. Please try again.'));
        }

    }
    // Get all categories
    const getCategories = async () => {
        try {
            dispatch(orgActions.setLoading(true));
            const response = await apiService.categories.get();
            console.log(response.data)
            dispatch(orgActions.setCategories(response.data.data));
        } catch (err) {
            console.error('Error fetching categories:', err);
            dispatch(orgActions.setError('Failed to load categories. Please try again.'));
        }
    }

    const addTag = async (tagData={name: 'newTag'}) => {
        dispatch(orgActions.setLoading(true))
        try {
            const response = await apiService.tags.create(tagData);
            dispatch(orgActions.addTag(response.data.data));
            return response.data.data
        } catch (err) {
            console.error('Error creating tag', err);
            dispatch(orgActions.setError('Failed to create tag. Please Try again.'));
            return null
        }
    }

    const deleteTag = async (tagId) => {
        if (window.confirm('There are N tasks in this tag\n Are you sure you want to delete this tag?')) {
            // Option: delete tag from associated tasks, or delete all tasks associated with the tag
            try {
                const response = await apiService.tags.delete(tagId);
                dispatch(orgActions.deleteTag(tagId));
            } catch (err) {
                console.error('Error deleting tag', err);
                dispatch(orgActions.setError('Failed to delete tag. Please try again.'));
            }
        }
    }



    // Return actions
    return {
        // API Actions
        getTags,
        getCategories,
        addTag
        // deleteTag,
        // handleFormSuccess, // task creation and updates

        // UI Actions
        // editTag,
        // cancelForm,
        // showNewTaskForm,
        // clearError
    }
}




// Action creators
const orgActions = {
    setLoading: (loading) => ({ type: 'SET_LOADING', loading }),
    setError: (error) => ({ type: 'SET_ERROR', error }),

    setTags: (tags) => ({ type: 'SET_TAGS', tags }),
    setCategories: (categories) => ({ type: 'SET_CATEGORIES', categories }),

    addTag: (tag) => ({ type: 'ADD_TAG', tag }),
    deleteTag: (tagId) => ({ type: 'DELETE_TAG', tagId})

};

function orgReducer(state, action) {
    const { type } = action;
    switch (type) {
        case 'SET_TAGS': {
            return {
                ...state,
                tags: action.tags,
                loading: false,
                error: ''
            }
        }

        case 'SET_CATEGORIES': {
            return {
                ...state,
                categories: action.categories,
                loading: false,
                error: ''
            }
        }

        case 'ADD_TAG': {
            return {
                ...state,
                tags: [...state.tags, action.tag],
                loading: false,
                error: ''
            }
        }

        case 'DELETE_TAG': {
            return {
                ...state,
                tags: state.tags.filter(t => t.id !== tagId),
                error: ''
            }
        }


        case 'SET_ERROR': {
            return {
                ...state,
                error: action.error,
                loading: false
            }
        }

        case 'SET_LOADING': {
            return {
                ...state,
                loading: action.loading
            }
        }
    }
}

// Initial State
const initialState = {
    tags: [],
    categories: [],
    loading: false,
    error: ''
};
