import { useState } from 'react'
import { useAuthContext} from "../context/useAuthContext";
import config from "../config";

export const useLogin = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const { dispatch } = useAuthContext()

  const login = async (values) => {
    setIsLoading(true)
    setError(null)

    const response = await fetch(config.apiUrl+'api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(values)
    })
    const json = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      setError(json.error)
      console.log(json.error)
    }
    if (response.ok) {
      // save the user to local storage
      localStorage.setItem('user', JSON.stringify(json))

      // update the auth context
      dispatch({type: 'LOGIN', payload: json})

      // update loading state
      setIsLoading(false)

      // navogaite to the dashboard
      window.location.href = '/app/dashboard'
    }
  }

  return { login, isLoading, error }
}