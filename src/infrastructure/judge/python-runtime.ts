import { createRequire } from "node:module"
import { Worker } from "node:worker_threads"

export type PythonRunResult = {
  stdout: string
  stderr: string
  error?: string
  timedOut: boolean
}

type WorkerMessage =
  | { type: "ready" }
  | { type: "fatal"; error: string }
  | { type: "result"; stdout: string; stderr: string; error?: string }

const workerSource = `
const { parentPort, workerData } = require("node:worker_threads")
const { loadPyodide } = require(workerData.pyodidePath)

let pyodide = null
let stdout = []
let stderr = []

loadPyodide()
  .then((instance) => {
    pyodide = instance
    pyodide.setStdout({ batched: (line) => stdout.push(line) })
    pyodide.setStderr({ batched: (line) => stderr.push(line) })
    parentPort.postMessage({ type: "ready" })
  })
  .catch((error) => {
    parentPort.postMessage({ type: "fatal", error: String((error && error.stack) || error) })
  })

parentPort.on("message", (job) => {
  stdout = []
  stderr = []
  let error
  const globals = pyodide.globals.get("dict")()
  try {
    pyodide.runPython(job.source, { globals })
  } catch (caught) {
    error = caught && caught.message ? caught.message : String(caught)
  } finally {
    globals.destroy()
  }
  parentPort.postMessage({ type: "result", stdout: stdout.join("\\n"), stderr: stderr.join("\\n"), error })
})
`

export class PythonRuntime {
  private worker: Promise<Worker> | null = null
  private queue: Promise<unknown> = Promise.resolve()

  warm(): Promise<void> {
    return this.getWorker().then(
      () => undefined,
      () => undefined,
    )
  }

  run(source: string, timeoutMs: number): Promise<PythonRunResult> {
    const job = this.queue.then(() => this.execute(source, timeoutMs))
    this.queue = job.catch(() => undefined)
    return job
  }

  async dispose(): Promise<void> {
    const current = this.worker
    this.worker = null
    if (current) {
      const worker = await current.catch(() => null)
      await worker?.terminate()
    }
  }

  private getWorker(): Promise<Worker> {
    if (!this.worker) {
      this.worker = this.startWorker()
      this.worker.catch(() => {
        this.worker = null
      })
    }
    return this.worker
  }

  private startWorker(): Promise<Worker> {
    const pyodidePath = createRequire(import.meta.url).resolve("pyodide")
    const worker = new Worker(workerSource, { eval: true, workerData: { pyodidePath } })

    return new Promise((resolve, reject) => {
      const onMessage = (message: WorkerMessage) => {
        if (message.type === "ready") {
          cleanup()
          worker.unref()
          resolve(worker)
        } else if (message.type === "fatal") {
          cleanup()
          void worker.terminate()
          reject(new Error(message.error))
        }
      }
      const onError = (error: Error) => {
        cleanup()
        reject(error)
      }
      const onExit = (code: number) => {
        cleanup()
        reject(new Error(`Python runtime exited during startup (code ${code})`))
      }
      const cleanup = () => {
        worker.off("message", onMessage)
        worker.off("error", onError)
        worker.off("exit", onExit)
      }
      worker.on("message", onMessage)
      worker.on("error", onError)
      worker.on("exit", onExit)
    })
  }

  private async execute(source: string, timeoutMs: number): Promise<PythonRunResult> {
    let worker: Worker
    try {
      worker = await this.getWorker()
    } catch (error) {
      return {
        stdout: "",
        stderr: "",
        error: `Python runtime failed to start: ${error instanceof Error ? error.message : String(error)}`,
        timedOut: false,
      }
    }

    return new Promise((resolve) => {
      const finish = (result: PythonRunResult, restart: boolean) => {
        clearTimeout(timer)
        worker.off("message", onMessage)
        worker.off("error", onError)
        worker.off("exit", onExit)
        if (restart) {
          this.worker = null
          void worker.terminate()
        }
        resolve(result)
      }
      const onMessage = (message: WorkerMessage) => {
        if (message.type !== "result") return
        finish(
          { stdout: message.stdout, stderr: message.stderr, error: message.error, timedOut: false },
          false,
        )
      }
      const onError = (error: Error) => {
        finish({ stdout: "", stderr: "", error: error.message, timedOut: false }, true)
      }
      const onExit = (code: number) => {
        finish({ stdout: "", stderr: "", error: `Python runtime crashed (code ${code})`, timedOut: false }, true)
      }
      const timer = setTimeout(() => {
        finish({ stdout: "", stderr: "", timedOut: true }, true)
      }, timeoutMs)

      worker.on("message", onMessage)
      worker.on("error", onError)
      worker.on("exit", onExit)
      worker.postMessage({ source })
    })
  }
}

export const pythonRuntime = new PythonRuntime()
