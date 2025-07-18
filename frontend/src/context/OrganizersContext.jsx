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


    // Return actions
    return {
        // API Actions
        getTags,
        getCategories
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
};

function orgReducer(state, action) {
    switch (action.type) {
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
