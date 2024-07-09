import * as Dialog from "@radix-ui/react-dialog" // Importando os elementos do radix em um objeto
import { X } from "lucide-react"
import { ChangeEvent, FormEvent, useState } from "react"
import { toast } from "sonner"

interface NewNoteCardProps {
    onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {

    const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)
    const [isRecording, setIsRecording] = useState(false)
    const [content, setContent] = useState("")

    function handleStartEditor() {
        setShouldShowOnBoarding(false)
    }

    function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) { // <HTMLTextAreaElement> informo que o evento vem do elemento TextArea
        setContent(event.target.value)
        if (event.target.value == "") {
            setShouldShowOnBoarding(true)
        }
    }

    function handleStartRecording() {
        setIsRecording(true)
        setShouldShowOnBoarding(false)

        const isSpeechRecognitionAPIAvailble = "SpeechRecognition" in window || "webkitSpeechRecognition" in window
        if (!isSpeechRecognitionAPIAvailble) {
            alert("Infelizmente seu navegador n possui suporte para a API.")
            return
        }

        //const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
        speechRecognition = new SpeechRecognition()

        speechRecognition.lang = "pt-BR"
        speechRecognition.continuous = true // Só vai parar quando eu mandar
        speechRecognition.maxAlternatives = 1 // Manter mais preciso o reconhecimento de fala
        speechRecognition.interimResults = true

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, "")
            setContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.log(event.error)
        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if (speechRecognition != null) {
            speechRecognition.stop()
        }
    }

    function handleSaveNote(event: FormEvent) { // Utilizar o hanlde no inicio do nome funções em que o usuario va fazer alguma modificação
        event.preventDefault()
        if (content == "") {
            return
        }
        onNoteCreated(content)
        setContent("")
        setShouldShowOnBoarding(true)
        toast.success("Nota criada com sucesso!")
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className="rounded-md bg-slate-700 p-5 flex flex-col gap-3 text-left outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
                <span className="text-sm font-medium text-slate-200">Adicionar nota</span>
                <p className="text-sm leading-6 text-slate-400">Grave uma nota em áudio que será convertida para texto automaticamente.</p>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-black/50" />
                <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none">
                    <Dialog.Close className="absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                        <X className="size-5" />
                    </Dialog.Close>
                    <form className="flex-1 flex flex-col">
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <span className="text-sm font-medium text-slate-300">Adicionar nota</span>
                            {shouldShowOnBoarding ? (
                                <p className="text-sm leading-6 text-slate-400">
                                    Comece <button type="button" className="font-medium text-lime-400 hover:underline" onClick={ handleStartRecording }>gravando uma nota</button> em áudio ou se preferir <button type="button" className="font-medium text-lime-400 hover:underline" onClick={ handleStartEditor }>utilize apenas texto</button>.
                                </p>
                            ) : (
                                <textarea autoFocus className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none" onChange={ handleContentChanged } value={ content } />
                            )}
                        </div>
                        {isRecording ? (
                            <button 
                                type="button" 
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
                                onClick={ handleStopRecording }
                            >
                                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                                Gravando! (clique p/ interromper)
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                                onClick={ handleSaveNote }
                            >
                                Salvar nota
                            </button>
                        )}
                        
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}