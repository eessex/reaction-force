import { sendErrorToService } from "Utils/errors"

export const shouldCaptureError = (environment: string) =>
  environment === "staging" || environment === "production"

export default function createLogger(namespace = "reaction") {
  const formattedNamespace = `${namespace} |`

  return {
    log: (...messages) => {
      console.log(formattedNamespace, ...messages, "\n")
    },
    warn: (...warnings) => {
      console.warn(formattedNamespace, ...warnings, "\n")
    },
    error: (...errors) => {
      const error = errors.find(e => e instanceof Error)

      if (error && shouldCaptureError(process.env.NODE_ENV || "")) {
        sendErrorToService(error)
      }

      console.error(formattedNamespace, ...errors, "\n")
    },
  }
}
