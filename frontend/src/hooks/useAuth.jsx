import { useState, useEffect, createContext, useContext } from 'react'
import { getMe, getToken, setToken, removeToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Al montar: si hay token guardado, recuperar usuario
  useEffect(() => {
    if (getToken()) {
      getMe()
        .then(setUser)
        .catch(() => removeToken())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function login(token, profesor) {
    setToken(token)
    setUser(profesor)
  }

  function logout() {
    removeToken()
    setUser(null)
  }

  function refreshUser() {
    return getMe().then(setUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
