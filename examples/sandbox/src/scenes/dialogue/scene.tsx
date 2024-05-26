import { renderUI, useEngineEvent } from 'excalibur-ui'
import { createMemo, createSignal } from 'solid-js'

export default class Dialogue extends ex.Scene {
  dialogue: string[] = [
    // GPT made this up
    'Once upon a time, there was a cat named Whiskers. Whiskers was a very curious cat who loved to explore the world around him.',
    'One day, Whiskers found a mysterious door in the middle of the forest. The door was covered in ivy and looked very old.',
    'Whiskers pushed the door open and walked through. On the other side, he found a magical world full of wonder and adventure.',
    'Whiskers spent the whole day exploring the magical world, meeting new friends and having exciting adventures.',
    'When the sun began to set, Whiskers knew it was time to go home. He said goodbye to his new friends and walked back through the door.',
    'Whiskers returned to the forest, feeling happy and content. He knew that he would always have a special place in his heart for the magical world he had discovered.',
    'And so, Whiskers lived happily ever after, knowing that there was always more to explore and discover in the world around him.',
    'The end.',
  ]

  onInitialize() {
    const [currentLine, setCurrentLine] = createSignal(0)
    const [typed, setText] = useTypewriter(this.dialogue[0])

    const playNextLine = () => {
      if (typed() === this.dialogue[currentLine()]) {
        if (this.dialogue[currentLine() + 1]) {
          setCurrentLine(currentLine() + 1)
        } else {
          setCurrentLine(0)
        }
        const nextLine = this.dialogue[currentLine()]

        setText(nextLine)
      }
    }

    this.input.pointers.on('down', playNextLine)
    this.input.keyboard.on('press', playNextLine)

    renderUI(this, () => {
      return <TextBox pos={ex.vec(0, 200)} text={typed()} />
    })
  }
}

function TextBox(props: { pos: ex.Vector; text: string }) {
  return (
    <ex-rectangle
      color={ex.Color.Black}
      width={800}
      height={100}
      pos={props.pos}
      strokeColor={ex.Color.White}
      lineWidth={4}
      borderRadius={10}
    >
      <ex-text
        text={props.text}
        x={10}
        y={10}
        maxWidth={760}
        font={{
          size: 20,
          family: 'Arial',
          color: ex.Color.White,
        }}
      />
    </ex-rectangle>
  )
}

function useTypewriter(initialValue: string, charactersPerSecond = 50) {
  const [text, setText] = createSignal(initialValue)
  const [progress, setProgress] = createSignal(0)

  useEngineEvent('preupdate', ({ delta }) => {
    const characters = text().length
    setProgress((prev) =>
      Math.min(1, prev + (charactersPerSecond / characters) * (delta / 1000)),
    )
  })

  const typed = createMemo(() =>
    text().slice(0, Math.floor(progress() * text().length)),
  )

  return [
    typed,
    (newText: string) => {
      setText(newText)
      setProgress(0)
    },
  ] as const
}
