import { useState } from "react";
import { useEffect } from "react";
import { createContext, ReactNode } from "react";
import { auth, firebase } from "../services/firebase";

type User = {
    id: string;
    name: string;
    avatar: string;
}

type AuthContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
    const [user, setUser] = useState<User>();

    // Recuperar o estado da autenticação (persistir informações)
    useEffect(() => {
        // Event listening poara verificar se já esta autenticado
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const { displayName, photoURL, uid } = user;

                if (!displayName || !photoURL) {
                    throw new Error("Missing information from Google Account.");
                }

                setUser({
                    id: uid,
                    name: displayName,
                    avatar: photoURL,
                });
            }
        });

        // Parar o event listening
        return () => {
            unsubscribe();
        };
    }, []);

    async function signInWithGoogle() {
        // Autenticação com o Google
        const provider = new firebase.auth.GoogleAuthProvider();

        // Abrir popup para fazer o login
        const result = await auth.signInWithPopup(provider);

        if (result.user) {
            const { displayName, photoURL, uid } = result.user;

            // Caso o usuário não tenha todas as informações
            if (!displayName || !photoURL) {
                throw new Error("Missing information from Google Account.");
            }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL,
            });
        }
    }
    
    return (
        <AuthContext.Provider value={{ user, signInWithGoogle }}>

        </AuthContext.Provider>
    )
}