const isBrowser = typeof window !== `undefined`

import React, { useContext, useEffect, useReducer } from "react"
import { navigate } from "@reach/router"
import { auth } from "../firebase/firebase"
import reducer from "../state/reducers/userReducer"
import { ActionTypes } from "../state/actionTypes"

export interface initialStateType {
  email: string
  password: any
  passwordConfirm: any
  error: any
  userLoading: boolean
  loading: boolean
  currentUser: string
  message: any
}

const initialState = {
  email: "",
  password: "",
  passwordConfirm: "",
  error: "",
  userLoading: true,
  loading: false,
  currentUser: "",
  message: "",
}

interface UserStateContextProps {
  state: initialStateType
  handleResetPassword: any
  resetPassword: any
  handleSubmitSignup: any
  handleSubmitLogin: any
  handleLogout: any
  logout: any
}

const UserContext = React.createContext<UserStateContextProps>(
  {} as UserStateContextProps
)

export const UserProvider: React.FC = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const signup = (email: string, password: string) => {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  const login = (email: string, password: string) => {
    return auth.signInWithEmailAndPassword(email, password)
  }

  const logout = () => {
    return auth.signOut()
  }

  const resetPassword = (email: string) => {
    return auth.sendPasswordResetEmail(email)
  }

  // const updateEmail = (email) => {
  //   return currentUser.updateEmail(email);
  // };
  // const updatePassword = (email) => {
  //   return currentUser.updatePassword(email);
  // };

  // settting user if exists
  useEffect(() => {
    let unsubscribe: any
    if (isBrowser) {
      unsubscribe = auth.onAuthStateChanged(user => {
        dispatch({ type: ActionTypes.SET_USER, payload: user })
      })
    } else return

    return () => {
      unsubscribe()
    }
  }, [])

  // set Error timer
  useEffect(() => {
    let id: any
    if (isBrowser) {
      id = setTimeout(() => {
        dispatch({ type: ActionTypes.SET_ERROR_TIMER })
      }, 3000)
    } else return
    return () => clearTimeout(id)
  }, [state.error, state.message])

  // handles signup
  const handleSubmitSignup = async (
    e: Event,
    email: any,
    password: any,
    passwordConfirm: any
  ) => {
    e.preventDefault()

    if (password?.current.value !== passwordConfirm?.current.value) {
      return dispatch({
        type: ActionTypes.SET_SIGNUP_ERROR,
        payload: "Passwords do not match!",
      })
    }

    try {
      dispatch({ type: ActionTypes.SET_SIGNUP_BEGIN })
      await signup(email.current.value, password.current.value)

      dispatch({ type: ActionTypes.SET_SIGNUP_SUCCESS })

      navigate("/")
    } catch (err) {
      dispatch({
        type: ActionTypes.SET_SIGNUP_ERROR,
        payload: "Email Already in use, please login",
      })
    }
  }

  // handles login
  const handleSubmitLogin = async (e: Event, email: any, password: any) => {
    e.preventDefault()
    dispatch({ type: ActionTypes.SET_LOGIN_BEGIN })

    try {
      await login(email.current.value, password.current.value)
      dispatch({ type: ActionTypes.SET_LOGIN_SUCCESS })

      navigate("/cart")
    } catch (err) {
      dispatch({
        type: ActionTypes.SET_LOGIN_ERROR,
        payload: "You have entered an invalid username or password",
      })
    }
  }

  // handles logout
  const handleLogout = async () => {
    dispatch({ type: ActionTypes.SET_LOGOUT_BEGIN })

    try {
      await logout()
      dispatch({ type: ActionTypes.SET_LOGOUT_SUCCESS })
    } catch (err) {
      dispatch({
        type: ActionTypes.SET_LOGOUT_ERROR,
        payload: "Failed to logout, please try again!",
      })
    }
  }

  const handleResetPassword = async (e: Event, email: any) => {
    e.preventDefault()

    try {
      dispatch({ type: ActionTypes.SET_RESET_PASSWORD_BEGIN })
      await resetPassword(email.current.value)
      dispatch({
        type: ActionTypes.SET_RESET_PASSWORD_SUCCESS,
        payload: { message: "Check your inbox for further instructions" },
      })
      setTimeout(() => {
        navigate("/login")
      }, 4000)
    } catch (err) {
      dispatch({
        type: ActionTypes.SET_RESET_PASSWORD_ERROR,
        payload: "Failed to reset password",
      })
    }
  }
  return (
    <UserContext.Provider
      value={{
        state,
        handleResetPassword,
        resetPassword,
        handleSubmitSignup,
        handleSubmitLogin,
        handleLogout,
        logout,
      }}
    >
      {!state.userLoading && children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  return useContext(UserContext)
}
