import React from 'react';
import { getData } from './services/NetworkService';

export const UserContext = React.createContext({ name: '', auth: false, permissions: [], ts: null });

const UserProvider = ({ children }) => {
    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('auth') ?? '{"name":"","auth":false}'));

    const login = (name, permissions) => {
        const userObj = {
            name: name,
            auth: true,
            permissions: permissions,
            ts: new Date()
        }
        setUser(userObj);
        localStorage.setItem('auth', JSON.stringify(userObj))
    };

    const logout = () => {
        const userObj = {
            name: '',
            auth: false,
            permissions: [],
            ts: null
        }
        setUser(userObj);
        localStorage.removeItem('auth')
        getData('logout')
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;
