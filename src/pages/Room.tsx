import { useState, useEffect, FormEvent } from 'react'
import { useParams } from 'react-router-dom'

import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'
import { Question } from '../components/Question'

import { useAuth } from '../hooks/useAuth'
import { database } from '../services/firebase'

import logoImg from '../assets/images/logo.svg'

import '../styles/room.scss'

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

type RouteParams = {
    id: string
}

export function Room() {
    const { user } = useAuth()
    const params = useParams<RouteParams>()
    const roomId = params.id
    const [newQuestion, setNewQuestion] = useState('')
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

    async function handleSendQuestion(event: FormEvent) {
        event.preventDefault()

        if (newQuestion.trim() === '') {
            return
        }

        if (!user) {
            throw new Error('You must be logged in');
        }

        const question = {
            content: newQuestion,
            author: {
                name: user.name,
                avatar: user.avatar
            },
            isHighlighted: false,
            isAnswered: false
        }

        await database.ref(`/rooms/${roomId}/questions`).push(question)

        setNewQuestion('')
    }

    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <RoomCode code={roomId}/>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>

                <form onSubmit={handleSendQuestion}>
                    <textarea 
                        placeholder="O que você quer perguntar?"
                        onChange={event => setNewQuestion(event.target.value)}
                        value={newQuestion}
                    />
                    <div className="form-footer">
                        { user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>Para enviar uma pergunta, <button>faça seu login</button></span>
                        )}
                        <Button type="submit" disabled={!user}>Enviar pergunta</Button>
                    </div>
                </form>
                <div className="question-list">
                    {questions.map(question => {
                        return (
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}
                            />
                        )
                    })}
                </div>
            </main>
        </div>
    )
}