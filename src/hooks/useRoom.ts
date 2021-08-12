import { useEffect, useState } from "react"
import { database } from "../services/firebase"
import { useAuth } from "./useAuth"

type FirebaseQuestions = Record<string, {
    author: {
        name: string,
        avatar: string,
    }
    content: string
    isAnswered: boolean
    isHighlighted: boolean
    likes: Record<string, {
        authorId: string
    }>
}>

type QuestionType = {
    id: string
    author: {
        name: string,
        avatar: string,
    }
    content: string
    isAnswered: boolean
    isHighlighted: boolean
    likeCount: number
    likeId: string | undefined
}

export function useRoom(roomId: string) {
    const { user } = useAuth()
    const [questions, setQuestions] = useState<QuestionType[]>([])
    const [title, setTitle] = useState('')

    useEffect(() => {
        const roomRef = database.ref(`/rooms/${roomId}`)

        roomRef.on('value', room => {
            const databaseRoom = room.val()
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {}
            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => { // Object.entries -> transforma o objeto em um array onde a chave e o valor será outro array
                return {
                    id: key,
                    content: value.content,
                    author: value.author,
                    isAnswered: value.isAnswered,
                    isHighlighted: value.isHighlighted,
                    likeCount: Object.values(value.likes ?? {}).length,
                    likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0] // ? - se retornar algo ele pega a posição 0, caso contrário ele retorna nada
                }
            })

            setTitle(databaseRoom.title)
            setQuestions(parsedQuestions)
        })

        // Removar todos os event listener da roomRef
        return () => {
            roomRef.off('value')
        }
    }, [roomId, user?.id])

    return { questions, title }
}