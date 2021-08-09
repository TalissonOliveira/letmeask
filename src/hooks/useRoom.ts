import { useEffect, useState } from "react"
import { database } from "../services/firebase"

type FirebaseQuestions = Record<string, {
    author: {
        name: string,
        avatar: string,
    }
    content: string
    isAnswered: boolean
    isHighlighted: boolean
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
}

export function useRoom(roomId: string) {
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
                    isHighlighted: value.isHighlighted
                }
            })

            setTitle(databaseRoom.title)
            setQuestions(parsedQuestions)
        })
    }, [roomId])

    return { questions, title }
}